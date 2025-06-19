import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBudgetSchema } from "@shared/schema";
import { formatCurrency, calculatePercentage, EXPENSE_CATEGORIES } from "@/lib/utils";
import type { Budget } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBudgetSchema.extend({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function BudgetOverview() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      amount: "",
      period: "monthly",
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/budgets", {
        ...data,
        amount: parseFloat(data.amount).toString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Budget created successfully!",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createBudgetMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
                <div className="w-full bg-muted rounded-full h-2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 rounded-t-lg">
        <CardTitle className="flex items-center">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-full mr-3 shadow-sm">
            <i className="fas fa-bullseye text-green-600"></i>
          </div>
          <div>
            <span className="text-lg font-semibold">Budget Overview</span>
            <p className="text-sm text-muted-foreground font-normal">Track your spending limits</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {budgets?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-target text-muted-foreground text-2xl"></i>
            </div>
            <p className="text-muted-foreground">No budgets set</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first budget to track spending</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets?.map((budget) => {
              const percentage = calculatePercentage(parseFloat(budget.spent), parseFloat(budget.amount));
              const isOverBudget = percentage > 100;
              
              return (
                <div key={budget.id} className="space-y-3 p-4 rounded-lg border border-muted hover:border-green-300 transition-all duration-300 hover:shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{budget.name}</span>
                    <span className="text-sm text-muted-foreground font-mono">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-3 ${isOverBudget ? 'bg-red-100' : 'bg-green-50'}`}
                    />
                    <div className="absolute top-0 left-0 w-full h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          isOverBudget 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : percentage > 80 
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                              : 'bg-gradient-to-r from-green-400 to-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${isOverBudget ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {percentage}% used
                    </span>
                    {isOverBudget ? (
                      <span className="text-red-600 font-medium">
                        Over by {formatCurrency(parseFloat(budget.spent) - parseFloat(budget.amount))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {formatCurrency(parseFloat(budget.amount) - parseFloat(budget.spent))} remaining
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-4" variant="outline">
              Manage Budgets
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Monthly Food Budget" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
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
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createBudgetMutation.isPending}
                >
                  {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
