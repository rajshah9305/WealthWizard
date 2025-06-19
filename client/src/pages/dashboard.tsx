import Header from "@/components/header";
import DashboardOverview from "@/components/dashboard-overview";
import ExpenseEntry from "@/components/expense-entry";
import RecentTransactions from "@/components/recent-transactions";
import BudgetOverview from "@/components/budget-overview";
import FinancialGoals from "@/components/financial-goals";
import SpendingChart from "@/components/spending-chart";
import AchievementPopup from "@/components/achievement-popup";
import { Button } from "@/components/ui/button";
import { Plus, Star } from "lucide-react";
import { useAchievements } from "@/hooks/use-achievements";

export default function Dashboard() {
  const { newAchievement, clearNewAchievement, totalPoints, completionRate } = useAchievements();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Achievement popup */}
      <AchievementPopup achievement={newAchievement} onClose={clearNewAchievement} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Achievement Progress Bar */}
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-400 rounded-full">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Achievement Progress</h3>
                <p className="text-sm text-muted-foreground">{totalPoints} points earned • {completionRate}% complete</p>
              </div>
            </div>
            <div className="text-right">
              <div className="w-32 bg-yellow-200 dark:bg-yellow-800 rounded-full h-2 mb-1">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground">{completionRate}% unlocked</span>
            </div>
          </div>
        </div>
        
        <DashboardOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <ExpenseEntry />
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-card to-card/80 rounded-xl shadow-sm border border-border p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full mr-2"></div>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 transform hover:scale-[1.02] group"
                  onClick={() => {
                    alert('Export functionality coming soon!');
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                      <i className="fas fa-file-export text-primary"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-medium block">Export Data</span>
                      <span className="text-xs text-muted-foreground">Download your financial data</span>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground group-hover:text-primary transition-colors"></i>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto hover:bg-gradient-to-r hover:from-secondary/10 hover:to-secondary/5 transition-all duration-300 transform hover:scale-[1.02] group"
                  onClick={() => {
                    alert('Reports page coming soon!');
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center mr-3 group-hover:bg-secondary/20 transition-colors">
                      <i className="fas fa-chart-bar text-secondary"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-medium block">View Reports</span>
                      <span className="text-xs text-muted-foreground">Detailed spending analysis</span>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground group-hover:text-secondary transition-colors"></i>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-4 h-auto hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/20 transition-all duration-300 transform hover:scale-[1.02] group"
                  onClick={() => {
                    alert('Settings page coming soon!');
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center mr-3 group-hover:bg-muted transition-colors">
                      <i className="fas fa-cog text-muted-foreground group-hover:text-foreground transition-colors"></i>
                    </div>
                    <div className="text-left">
                      <span className="font-medium block">Settings</span>
                      <span className="text-xs text-muted-foreground">Customize your experience</span>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground group-hover:text-foreground transition-colors"></i>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <SpendingChart />
            <RecentTransactions />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BudgetOverview />
              <FinancialGoals />
            </div>
          </div>
        </div>
      </main>
      
      {/* Floating Action Button for mobile */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all md:hidden bg-gradient-to-r from-primary to-secondary animate-pulse-success z-50"
        onClick={() => {
          document.querySelector<HTMLInputElement>('input[type="number"]')?.focus();
        }}
      >
        <Plus className="h-7 w-7 animate-bounce" />
      </Button>
    </div>
  );
}
