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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertIncomeSchema } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Income } from "@shared/schema";
import { z } from "zod";
import { TrendingUp, DollarSign, Plus } from "lucide-react";

const formSchema = insertIncomeSchema.extend({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
});

type FormData = z.infer<typeof formSchema>;

const INCOME_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental',
  'Side Hustle',
  'Bonus',
  'Other'
];

const INCOME_FREQUENCIES = [
  'one-time',
  'weekly',
  'bi-weekly',
  'monthly',
  'quarterly',
  'yearly'
];

export default function IncomeTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incomes, isLoading } = useQuery<Income[]>({
    queryKey: ["/api/incomes"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      source: "",
      description: "",
      isRecurring: false,
      frequency: undefined,
      category: "primary",
    },
  });

  const createIncomeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/incomes", {
        ...data,
        amount: parseFloat(data.amount).toString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income added successfully!",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/cash-flow"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add income. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createIncomeMutation.mutate(data);
  };

  const totalIncome = incomes?.reduce((sum, income) => sum + parseFloat(income.amount), 0) || 0;
  const monthlyRecurring = incomes?.filter(income => income.isRecurring && income.frequency === 'monthly')
    .reduce((sum, income) => sum + parseFloat(income.amount), 0) || 0;

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Income Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-full mr-3 shadow-sm">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <span className="text-lg font-semibold">Income Tracker</span>
              <p className="text-sm text-muted-foreground font-normal">Manage your income sources</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
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
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Income Source</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select income source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INCOME_SOURCES.map((source) => (
                              <SelectItem key={source} value={source}>
                                {source}
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Recurring Income
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            This income repeats regularly
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("isRecurring") && (
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="How often?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INCOME_FREQUENCIES.map((freq) => (
                                <SelectItem key={freq} value={freq}>
                                  {freq.charAt(0).toUpperCase() + freq.slice(1).replace('-', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createIncomeMutation.isPending}
                  >
                    {createIncomeMutation.isPending ? "Adding..." : "Add Income"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Income Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(monthlyRecurring)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Income List */}
        {incomes?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No income recorded yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first income source to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomes?.slice(0, 5).map((income, index) => (
              <div
                key={income.id}
                className="flex items-center justify-between p-4 rounded-lg border border-muted hover:border-green-300 transition-all duration-300 hover:shadow-sm animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {income.description || income.source}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{income.source}</span>
                      {income.isRecurring && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">Recurring</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">
                    +{formatCurrency(income.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(income.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}