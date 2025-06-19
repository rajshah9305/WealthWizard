import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, PieChart, Target } from "lucide-react";
import { useState } from "react";

export default function FinancialAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState(6);

  const { data: incomeVsExpenses } = useQuery({
    queryKey: ["/api/analytics/income-vs-expenses", selectedPeriod],
  });

  const { data: cashFlow } = useQuery({
    queryKey: ["/api/analytics/cash-flow"],
  });

  const { data: budgetPerformance } = useQuery({
    queryKey: ["/api/analytics/budget-performance"],
  });

  const { data: topCategories } = useQuery({
    queryKey: ["/api/analytics/top-categories", 5],
  });

  const { data: spendingTrends } = useQuery({
    queryKey: ["/api/analytics/spending-trends"],
  });

  return (
    <div className="space-y-6">
      {/* Cash Flow Overview */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg">
          <CardTitle className="flex items-center">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-full mr-3 shadow-sm">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <span className="text-lg font-semibold">Cash Flow Analysis</span>
              <p className="text-sm text-muted-foreground font-normal">Monthly financial overview</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {cashFlow ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Money In</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(cashFlow.inflow)}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Money Out</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(cashFlow.outflow)}</p>
              </div>
              <div className={`text-center p-4 rounded-lg ${
                cashFlow.netFlow >= 0 
                  ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' 
                  : 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'
              }`}>
                <DollarSign className={`h-8 w-8 mx-auto mb-2 ${
                  cashFlow.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`} />
                <p className="text-sm text-muted-foreground">Net Flow</p>
                <p className={`text-2xl font-bold ${
                  cashFlow.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {cashFlow.netFlow >= 0 ? '+' : ''}{formatCurrency(cashFlow.netFlow)}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted/20 rounded-lg animate-pulse"></div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Income vs Expenses Chart */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 text-primary mr-3" />
              Income vs Expenses Trend
            </CardTitle>
            <div className="flex space-x-2">
              {[3, 6, 12].map(months => (
                <Button
                  key={months}
                  size="sm"
                  variant={selectedPeriod === months ? "default" : "outline"}
                  onClick={() => setSelectedPeriod(months)}
                  className="hover:scale-105 transition-transform"
                >
                  {months}M
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {incomeVsExpenses ? (
            <div className="space-y-4">
              <div className="h-64 bg-muted/10 rounded-lg p-4">
                <div className="h-full flex items-end justify-between space-x-2">
                  {incomeVsExpenses.slice(-6).map((month, index) => {
                    const maxValue = Math.max(...incomeVsExpenses.map(m => Math.max(m.income, m.expenses)));
                    const incomeHeight = maxValue > 0 ? (month.income / maxValue) * 100 : 0;
                    const expenseHeight = maxValue > 0 ? (month.expenses / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                        <div className="w-full flex space-x-1 items-end h-48">
                          <div
                            className="bg-gradient-to-t from-green-500 to-green-400 rounded-t flex-1 transition-all duration-1000 hover:opacity-80"
                            style={{ height: `${incomeHeight}%`, minHeight: month.income > 0 ? '4px' : '0' }}
                            title={`Income: ${formatCurrency(month.income)}`}
                          />
                          <div
                            className="bg-gradient-to-t from-red-500 to-red-400 rounded-t flex-1 transition-all duration-1000 hover:opacity-80"
                            style={{ height: `${expenseHeight}%`, minHeight: month.expenses > 0 ? '4px' : '0' }}
                            title={`Expenses: ${formatCurrency(month.expenses)}`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground text-center">
                          {month.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-muted-foreground">Income</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-muted-foreground">Expenses</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-muted/20 rounded-lg animate-pulse"></div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Performance */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 text-purple-600 mr-3" />
              Budget Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetPerformance && budgetPerformance.length > 0 ? (
              <div className="space-y-4">
                {budgetPerformance.map((budget, index) => {
                  const percentage = budget.budgeted > 0 ? (budget.spent / budget.budgeted) * 100 : 0;
                  const isOverBudget = percentage > 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{budget.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            isOverBudget 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : percentage > 80 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                : 'bg-gradient-to-r from-green-400 to-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className={`${isOverBudget ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {percentage.toFixed(1)}% used
                        </span>
                        <span className={`${budget.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {budget.variance >= 0 ? '+' : ''}{formatCurrency(budget.variance)} remaining
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active budgets</p>
                <p className="text-sm">Create budgets to see performance</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Spending Categories */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 text-orange-600 mr-3" />
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCategories && topCategories.length > 0 ? (
              <div className="space-y-4">
                {topCategories.map((category, index) => {
                  const maxAmount = topCategories[0]?.amount || 1;
                  const percentage = (category.amount / maxAmount) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm font-bold">{formatCurrency(category.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No spending data</p>
                <p className="text-sm">Add expenses to see top categories</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spending Trends */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
            Daily Spending Trends (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {spendingTrends ? (
            <div className="h-48 bg-muted/10 rounded-lg p-4">
              <div className="h-full flex items-end justify-between space-x-1">
                {spendingTrends.slice(-14).map((day, index) => {
                  const maxAmount = Math.max(...spendingTrends.map(d => d.amount));
                  const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div
                        className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t w-full transition-all duration-500 hover:from-blue-600 hover:to-blue-500 cursor-pointer transform hover:scale-x-110"
                        style={{ 
                          height: `${height}%`, 
                          minHeight: day.amount > 0 ? '4px' : '0'
                        }}
                        title={`${day.date}: ${formatCurrency(day.amount)}`}
                      />
                      <span className="text-xs text-muted-foreground mt-1 group-hover:text-blue-600 transition-colors">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 bg-muted/20 rounded-lg animate-pulse"></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}