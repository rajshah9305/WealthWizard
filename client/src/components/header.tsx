import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <>
      {/* Desktop Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">FinanceFlow</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#dashboard" className="text-primary font-medium border-b-2 border-primary pb-2">
                  Dashboard
                </a>
                <a href="#expenses" className="text-muted-foreground hover:text-primary transition-colors">
                  Expenses
                </a>
                <a href="#budgets" className="text-muted-foreground hover:text-primary transition-colors">
                  Budgets
                </a>
                <a href="#goals" className="text-muted-foreground hover:text-primary transition-colors">
                  Goals
                </a>
                <a href="#analytics" className="text-muted-foreground hover:text-primary transition-colors">
                  Analytics
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden bg-card border-b border-border">
        <div className="px-4 py-2">
          <div className="flex space-x-4 overflow-x-auto">
            <a href="#dashboard" className="text-primary font-medium whitespace-nowrap border-b-2 border-primary pb-1">
              Dashboard
            </a>
            <a href="#expenses" className="text-muted-foreground whitespace-nowrap">
              Expenses
            </a>
            <a href="#budgets" className="text-muted-foreground whitespace-nowrap">
              Budgets
            </a>
            <a href="#goals" className="text-muted-foreground whitespace-nowrap">
              Goals
            </a>
            <a href="#analytics" className="text-muted-foreground whitespace-nowrap">
              Analytics
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
