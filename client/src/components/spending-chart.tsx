import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Expense } from "@shared/schema";

export default function SpendingChart() {
  const [period, setPeriod] = useState<"30" | "90" | "365">("30");
  
  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: budgets } = useQuery({
    queryKey: ["/api/budgets"],
  });

  // Calculate spending data for the last N days
  const getSpendingData = () => {
    if (!expenses) return [];
    
    const days = parseInt(period);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const filteredExpenses = expenses.filter(expense => 
      new Date(expense.date) >= startDate
    );
    
    // Group by day and calculate totals
    const dailySpending: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString();
      dailySpending[date] = (dailySpending[date] || 0) + parseFloat(expense.amount);
    });
    
    return Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount
    }));
  };

  const spendingData = getSpendingData();
  const totalBudget = budgets?.reduce((sum: number, budget: any) => sum + parseFloat(budget.amount), 0) || 2000;
  const totalSpending = spendingData.reduce((sum, day) => sum + day.amount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center animate-pulse">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-48 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-full mr-3 shadow-sm">
              <i className="fas fa-chart-line text-green-600"></i>
            </div>
            <div>
              <span className="text-lg font-semibold">Spending Trends</span>
              <p className="text-sm text-muted-foreground font-normal">Visualize your spending patterns</p>
            </div>
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={period === "30" ? "default" : "outline"}
              onClick={() => setPeriod("30")}
              className="hover:scale-105 transition-transform"
            >
              30 Days
            </Button>
            <Button
              size="sm"
              variant={period === "90" ? "default" : "outline"}
              onClick={() => setPeriod("90")}
              className="hover:scale-105 transition-transform"
            >
              90 Days
            </Button>
            <Button
              size="sm"
              variant={period === "365" ? "default" : "outline"}
              onClick={() => setPeriod("365")}
              className="hover:scale-105 transition-transform"
            >
              1 Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {spendingData.length === 0 ? (
          <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <i className="fas fa-chart-line text-4xl text-muted-foreground mb-2"></i>
              <p className="text-muted-foreground">No spending data available</p>
              <p className="text-sm text-muted-foreground mt-1">Add some expenses to see your spending trends</p>
            </div>
          </div>
        ) : (
          <>
            {/* Simple Bar Chart Visualization */}
            <div className="h-64 bg-muted/10 rounded-lg p-4 mb-4">
              <div className="h-full flex items-end justify-between space-x-1">
                {spendingData.slice(-14).map((day, index) => {
                  const maxAmount = Math.max(...spendingData.map(d => d.amount));
                  const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div
                        className="bg-gradient-to-t from-primary to-primary/60 rounded-t w-full transition-all duration-500 hover:from-primary/80 hover:to-primary/40 cursor-pointer transform hover:scale-x-110 animate-slide-up"
                        style={{ 
                          height: `${height}%`, 
                          minHeight: day.amount > 0 ? '6px' : '0',
                          animationDelay: `${index * 0.05}s`
                        }}
                        title={`${day.date}: $${day.amount.toFixed(2)}`}
                      />
                      <span className="text-xs text-muted-foreground mt-1 truncate group-hover:text-primary transition-colors">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Summary Statistics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${totalSpending.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${(totalSpending / parseInt(period)).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Daily Average</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${totalBudget.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Budget</p>
              </div>
            </div>
          </>
        )}
        
        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm mt-4 pt-4 border-t">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
            <span className="text-muted-foreground">Daily Expenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
