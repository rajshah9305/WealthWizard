import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, calculatePercentage } from "@/lib/utils";
import { ArrowUpIcon, TrendingUpIcon, Target, PiggyBank, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardOverview() {
  const [animatedBalance, setAnimatedBalance] = useState(0);
  const [animatedSpending, setAnimatedSpending] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

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

  // Animate numbers when they change
  useEffect(() => {
    const animateValue = (start: number, end: number, setter: (value: number) => void) => {
      const duration = 1000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * progress;
        setter(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    };

    animateValue(animatedBalance, totalBalance, setAnimatedBalance);
    animateValue(animatedSpending, monthlySpending, setAnimatedSpending);
  }, [totalBalance, monthlySpending]);

  // Show celebration when goals are completed
  useEffect(() => {
    if (primaryGoal?.isCompleted && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [primaryGoal?.isCompleted]);

  const getBalanceTrend = () => {
    const trend = totalBalance > 5000 ? "up" : totalBalance < 2000 ? "down" : "stable";
    return {
      up: { color: "text-green-600", icon: "↗️", text: "+12.5% from last month" },
      down: { color: "text-red-600", icon: "↘️", text: "-8.2% from last month" },
      stable: { color: "text-blue-600", icon: "→", text: "Steady this month" }
    }[trend];
  };

  const balanceTrend = getBalanceTrend();

  return (
    <section className="mb-8 relative">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="animate-bounce-in bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6" />
              <span className="text-lg font-bold">Goal Completed!</span>
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Balance */}
        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-slide-up border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground animate-counter">{formatCurrency(animatedBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center hover:rotate-12 transition-transform">
                <i className="fas fa-wallet text-primary text-xl"></i>
              </div>
            </div>
            <div className={`mt-4 flex items-center text-sm ${balanceTrend.color}`}>
              <span className="mr-1">{balanceTrend.icon}</span>
              <span>{balanceTrend.text}</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Spending */}
        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-slide-up border-l-4 border-l-orange-400" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month Spent</p>
                <p className="text-2xl font-bold text-foreground animate-counter">{formatCurrency(animatedSpending)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400/20 to-orange-400/10 rounded-xl flex items-center justify-center hover:rotate-12 transition-transform">
                <i className="fas fa-credit-card text-orange-500 text-xl"></i>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>{calculatePercentage(monthlySpending, totalBudget)}% of monthly budget</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Remaining */}
        <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-slide-up border-l-4 border-l-green-500" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget Remaining</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(budgetRemaining)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center hover:rotate-12 transition-transform">
                <Target className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <i className="fas fa-check-circle mr-1 animate-pulse"></i>
              <span>{budgetRemaining > 0 ? "On track this month" : "Over budget!"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Goal */}
        <Card className={`hover:shadow-lg hover:scale-105 transition-all duration-300 animate-slide-up border-l-4 ${primaryGoal?.isCompleted ? 'border-l-yellow-400 animate-pulse-success' : 'border-l-purple-500'}`} style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {primaryGoal?.name || "Savings Goal"}
                  {primaryGoal?.isCompleted && <span className="ml-2">🎉</span>}
                </p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(goalProgress)}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${primaryGoal?.isCompleted ? 'from-yellow-400/20 to-yellow-400/10' : 'from-purple-500/20 to-purple-500/10'} rounded-xl flex items-center justify-center hover:rotate-12 transition-transform`}>
                {primaryGoal?.isCompleted ? (
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                ) : (
                  <PiggyBank className="h-6 w-6 text-purple-500" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${primaryGoal?.isCompleted ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                  style={{ width: `${Math.min(calculatePercentage(goalProgress, goalTarget), 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {calculatePercentage(goalProgress, goalTarget)}% complete
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(goalTarget)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
