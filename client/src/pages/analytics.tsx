import Header from "@/components/header";
import FinancialAnalytics from "@/components/financial-analytics";
import FinancialReports from "@/components/financial-reports";
import ExpenseSearch from "@/components/expense-search";
import AchievementPopup from "@/components/achievement-popup";
import { useAchievements } from "@/hooks/use-achievements";

export default function Analytics() {
  const { newAchievement, clearNewAchievement } = useAchievements();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <AchievementPopup achievement={newAchievement} onClose={clearNewAchievement} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Financial Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your financial health and spending patterns</p>
        </div>

        <div className="space-y-8">
          <FinancialAnalytics />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FinancialReports />
            <ExpenseSearch />
          </div>
        </div>
      </main>
    </div>
  );
}