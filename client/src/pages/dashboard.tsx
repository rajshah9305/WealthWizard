import Header from "@/components/header";
import DashboardOverview from "@/components/dashboard-overview";
import ExpenseEntry from "@/components/expense-entry";
import RecentTransactions from "@/components/recent-transactions";
import BudgetOverview from "@/components/budget-overview";
import FinancialGoals from "@/components/financial-goals";
import SpendingChart from "@/components/spending-chart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <ExpenseEntry />
            
            {/* Quick Actions */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => {
                    // TODO: Implement export functionality
                    alert('Export functionality coming soon!');
                  }}
                >
                  <div className="flex items-center">
                    <i className="fas fa-file-export text-primary mr-3"></i>
                    <span className="font-medium">Export Data</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground"></i>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => {
                    // TODO: Navigate to reports page
                    alert('Reports page coming soon!');
                  }}
                >
                  <div className="flex items-center">
                    <i className="fas fa-chart-bar text-secondary mr-3"></i>
                    <span className="font-medium">View Reports</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground"></i>
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => {
                    // TODO: Navigate to settings page
                    alert('Settings page coming soon!');
                  }}
                >
                  <div className="flex items-center">
                    <i className="fas fa-cog text-muted-foreground mr-3"></i>
                    <span className="font-medium">Settings</span>
                  </div>
                  <i className="fas fa-chevron-right text-muted-foreground"></i>
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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all md:hidden"
        onClick={() => {
          // TODO: Open quick expense modal
          document.querySelector<HTMLInputElement>('input[type="number"]')?.focus();
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
