import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/utils";
import type { Expense } from "@shared/schema";
import { Search, Filter, X } from "lucide-react";

export default function ExpenseSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const { data: searchResults, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses/search", activeSearch],
    enabled: activeSearch.length > 0,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-t-lg">
        <CardTitle className="flex items-center">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-full mr-3 shadow-sm">
            <Search className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <span className="text-lg font-semibold">Smart Search</span>
            <p className="text-sm text-muted-foreground font-normal">Find expenses by description or merchant</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
            Search
          </Button>
          {activeSearch && (
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {activeSearch && (
          <div className="mb-4 p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                Searching for: "<span className="font-medium">{activeSearch}</span>"
              </p>
              <span className="text-xs text-cyan-600 dark:text-cyan-400">
                {searchResults?.length || 0} results
              </span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse"></div>
            ))}
          </div>
        )}

        {searchResults && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No expenses found</p>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </div>
        )}

        {searchResults && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((expense, index) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 rounded-lg border border-muted hover:border-cyan-300 transition-all duration-300 hover:shadow-sm animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
                    CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-600'
                  }`}>
                    <i className={`${CATEGORY_ICONS[expense.category] || 'fas fa-ellipsis-h'} text-lg`}></i>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {expense.description || expense.category}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{expense.category}</span>
                      {expense.merchantName && (
                        <>
                          <span>•</span>
                          <span>{expense.merchantName}</span>
                        </>
                      )}
                      {expense.location && (
                        <>
                          <span>•</span>
                          <span>{expense.location}</span>
                        </>
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

        {!activeSearch && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Start typing to search expenses</p>
            <p className="text-sm text-muted-foreground">Search by description, merchant, or location</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}