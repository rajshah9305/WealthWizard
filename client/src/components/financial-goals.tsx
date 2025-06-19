import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertGoalSchema } from "@shared/schema";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import type { Goal } from "@shared/schema";
import { z } from "zod";

const formSchema = insertGoalSchema.extend({
  targetAmount: z.string().min(1, "Target amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Target amount must be a positive number"
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function FinancialGoals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      deadline: undefined,
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/goals", {
        ...data,
        targetAmount: parseFloat(data.targetAmount).toString(),
        deadline: data.deadline ? new Date(data.deadline) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Goal created successfully!",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, currentAmount }: { id: number; currentAmount: string }) => {
      return apiRequest("PATCH", `/api/goals/${id}/progress`, { currentAmount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const onSubmit = (data: FormData) => {
    createGoalMutation.mutate(data);
  };

  const handleAddContribution = (goalId: number, currentAmount: string) => {
    const contribution = prompt("How much would you like to add to this goal?");
    if (contribution && !isNaN(parseFloat(contribution))) {
      const newAmount = (parseFloat(currentAmount) + parseFloat(contribution)).toString();
      updateGoalMutation.mutate({ id: goalId, currentAmount: newAmount });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-20"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-t-lg">
        <CardTitle className="flex items-center">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-full mr-3 shadow-sm">
            <i className="fas fa-trophy text-purple-600"></i>
          </div>
          <div>
            <span className="text-lg font-semibold">Financial Goals</span>
            <p className="text-sm text-muted-foreground font-normal">Achieve your dreams</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {goals?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-bullseye text-muted-foreground text-2xl"></i>
            </div>
            <p className="text-muted-foreground">No goals set</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first financial goal</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals?.map((goal) => {
              const percentage = calculatePercentage(parseFloat(goal.currentAmount), parseFloat(goal.targetAmount));
              const remaining = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
              
              return (
                <div key={goal.id} className={`border rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
                  goal.isCompleted 
                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' 
                    : 'border-muted hover:border-purple-300'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-foreground">{goal.name}</h4>
                      {goal.isCompleted && <span className="text-lg">🏆</span>}
                    </div>
                    <span className="text-sm text-muted-foreground font-mono">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="relative mb-3">
                    <Progress value={percentage} className="h-4 bg-purple-50 dark:bg-purple-950/20" />
                    <div className="absolute top-0 left-0 w-full h-4 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          goal.isCompleted 
                            ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse-success' 
                            : 'bg-gradient-to-r from-purple-400 to-pink-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{formatCurrency(goal.currentAmount)}</span> saved
                    </span>
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">{formatCurrency(remaining)}</span> to go
                    </span>
                  </div>
                  {!goal.isCompleted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
                      onClick={() => handleAddContribution(goal.id, goal.currentAmount)}
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Contribution
                    </Button>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-medium animate-bounce-in">
                        <i className="fas fa-trophy mr-2"></i>
                        Goal Completed!
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4" variant="outline">
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Emergency Fund" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createGoalMutation.isPending}
                >
                  {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
