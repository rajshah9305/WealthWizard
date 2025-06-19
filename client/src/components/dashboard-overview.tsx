import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import { ArrowUpIcon, TrendingUpIcon, Target, PiggyBank } from "lucide-react";

export default function DashboardOverview() {
  const { data: balanceData } = useQuery({
    queryKey: ["/api/analytics/balance"],
  });

  const { data: monthlySpendingData } = useQuery({
    queryKey: ["/api/analytics/monthly-spending"],
  });

  const { data: budgets } = useQuery({
    queryKey: ["/api/budgets"],
  });

  const { data: goals } = useQuery({
    queryKey: ["/api/goals"],
  });

  const totalBalance = balanceData?.balance || 0;
  const monthlySpending = monthlySpendingData?.spending || 0;
  const totalBudget = budgets?.reduce((sum: number, budget: any) => sum + parseFloat(budget.amount), 0) || 2000;
  const budgetRemaining = totalBudget - monthlySpending;
  const primaryGoal = goals?.[0];
  const goalProgress = primaryGoal ? parseFloat(primaryGoal.currentAmount) : 0;
  const goalTarget = primaryGoal ? parseFloat(primaryGoal.targetAmount) : 5000;

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-wallet text-primary text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-secondary">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month Spent</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(monthlySpending)}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-credit-card text-accent text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>{calculatePercentage(monthlySpending, totalBudget)}% of monthly budget</span>
            </div>
          </CardContent>
        </Card>

        {/* Budget Remaining */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Remaining</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(budgetRemaining)}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-secondary">
              <i className="fas fa-check-circle mr-1"></i>
              <span>On track this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Goal */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Savings Goal</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(goalProgress)}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-secondary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${calculatePercentage(goalProgress, goalTarget)}%` }}
                ></div>
              </div>
              <span className="text-sm text-muted-foreground mt-1 block">
                {calculatePercentage(goalProgress, goalTarget)}% of {formatCurrency(goalTarget)} goal
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
