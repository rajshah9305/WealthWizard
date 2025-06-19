import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import type { Expense } from "@shared/schema";

export default function RecentTransactions() {
  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentExpenses = expenses?.slice(0, 5) || [];

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-full mr-3 shadow-sm">
              <i className="fas fa-history text-blue-600"></i>
            </div>
            <div>
              <span className="text-lg font-semibold">Recent Transactions</span>
              <p className="text-sm text-muted-foreground font-normal">Your latest spending activity</p>
            </div>
          </CardTitle>
          <Button variant="ghost" size="sm" className="hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {recentExpenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-receipt text-muted-foreground text-2xl"></i>
            </div>
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first expense to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentExpenses.map((expense, index) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 rounded-xl transition-all duration-300 transform hover:scale-[1.02] animate-slide-up border border-transparent hover:border-muted-foreground/10"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow ${
                    CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-600'
                  }`}>
                    <i className={`${CATEGORY_ICONS[expense.category] || 'fas fa-ellipsis-h'} text-lg`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-base">
                      {expense.description || expense.category}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">{expense.category}</p>
                      {expense.receiptUrl && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Receipt attached"></div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-red-600 dark:text-red-400">
                    -{formatCurrency(expense.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(expense.date)}
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
