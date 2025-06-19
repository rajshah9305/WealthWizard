import Header from "@/components/header";
import IncomeTracker from "@/components/income-tracker";
import AchievementPopup from "@/components/achievement-popup";
import { useAchievements } from "@/hooks/use-achievements";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Calendar, Target, DollarSign } from "lucide-react";

export default function Income() {
  const { newAchievement, clearNewAchievement } = useAchievements();

  const { data: incomes } = useQuery({
    queryKey: ["/api/incomes"],
  });

  const { data: cashFlow } = useQuery({
    queryKey: ["/api/analytics/cash-flow"],
  });

  const totalIncome = incomes?.reduce((sum: number, income: any) => sum + parseFloat(income.amount), 0) || 0;
  const recurringIncome = incomes?.filter((income: any) => income.isRecurring)
    .reduce((sum: number, income: any) => sum + parseFloat(income.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <AchievementPopup achievement={newAchievement} onClose={clearNewAchievement} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Income Management</h1>
          <p className="text-muted-foreground">Track and manage all your income sources</p>
        </div>

        {/* Income Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Inflow</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(cashFlow?.inflow || 0)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recurring Income</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(recurringIncome)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/20 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
                  <p className={`text-2xl font-bold ${(cashFlow?.netFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(cashFlow?.netFlow || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/20 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <IncomeTracker />
      </main>
    </div>
  );
}