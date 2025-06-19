import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" || path === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location === path;
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "fas fa-home" },
    { path: "/income", label: "Income", icon: "fas fa-arrow-up" },
    { path: "/analytics", label: "Analytics", icon: "fas fa-chart-line" },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  FinanceFlow Pro
                </h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                      isActive(item.path)
                        ? "text-primary font-medium border-b-2 border-primary pb-2"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <i className={`${item.icon} text-sm`}></i>
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative hover:bg-primary/10">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                <span className="text-white font-medium text-sm">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden bg-card border-b border-border">
        <div className="px-4 py-2">
          <div className="flex space-x-4 overflow-x-auto">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-2 whitespace-nowrap transition-colors ${
                  isActive(item.path)
                    ? "text-primary font-medium border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                }`}
              >
                <i className={`${item.icon} text-xs`}></i>
                <span className="text-sm">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
