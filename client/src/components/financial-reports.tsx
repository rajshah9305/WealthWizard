import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FinancialReport } from "@shared/schema";
import { z } from "zod";
import { FileText, Download, Calendar, TrendingUp, Plus, Eye } from "lucide-react";

const reportSchema = z.object({
  type: z.string().min(1, "Report type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type ReportFormData = z.infer<typeof reportSchema>;

const REPORT_TYPES = [
  { value: "monthly", label: "Monthly Report" },
  { value: "quarterly", label: "Quarterly Report" },
  { value: "yearly", label: "Yearly Report" },
  { value: "custom", label: "Custom Period" },
];

export default function FinancialReports() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery<FinancialReport[]>({
    queryKey: ["/api/reports"],
  });

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: "",
      startDate: "",
      endDate: "",
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      return apiRequest("POST", "/api/reports/generate", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Financial report generated successfully!",
      });
      form.reset();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReportFormData) => {
    generateReportMutation.mutate(data);
  };

  const handleViewReport = (report: FinancialReport) => {
    setSelectedReport(report);
    setIsViewDialogOpen(true);
  };

  const handleDownloadReport = (report: FinancialReport) => {
    const reportData = JSON.parse(report.data);
    const csvContent = generateCSV(reportData, report);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${report.name}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const generateCSV = (data: any, report: FinancialReport) => {
    let csv = `Financial Report: ${report.name}\n`;
    csv += `Period: ${formatDate(report.startDate)} to ${formatDate(report.endDate)}\n\n`;
    
    csv += "SUMMARY\n";
    csv += `Total Income,${data.summary?.totalIncome || 0}\n`;
    csv += `Total Expenses,${data.summary?.totalExpenses || 0}\n`;
    csv += `Net Income,${data.summary?.netIncome || 0}\n`;
    csv += `Transaction Count,${data.summary?.transactionCount || 0}\n\n`;
    
    if (data.expenses?.byCategory) {
      csv += "EXPENSES BY CATEGORY\n";
      Object.entries(data.expenses.byCategory).forEach(([category, amount]) => {
        csv += `${category},${amount}\n`;
      });
    }
    
    return csv;
  };

  const getQuickReportDates = (type: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (type) {
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    form.setValue("startDate", startDate.toISOString().split('T')[0]);
    form.setValue("endDate", endDate.toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-full mr-3 shadow-sm">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <span className="text-lg font-semibold">Financial Reports</span>
                <p className="text-sm text-muted-foreground font-normal">Generate comprehensive financial insights</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Financial Report</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Report Type</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            getQuickReportDates(value);
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REPORT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={generateReportMutation.isPending}
                    >
                      {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {reports?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No reports generated yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first financial report to get insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports?.map((report, index) => {
                const reportData = JSON.parse(report.data);
                return (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-muted hover:border-purple-300 transition-all duration-300 hover:shadow-sm animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/20 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{report.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(report.startDate)} - {formatDate(report.endDate)}
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Net: {formatCurrency(reportData.summary?.netIncome || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report)}
                        className="hover:bg-purple-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                        className="hover:bg-green-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Viewer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.name}</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {(() => {
                const data = JSON.parse(selectedReport.data);
                return (
                  <>
                    {/* Summary Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Total Income</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(data.summary?.totalIncome || 0)}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(data.summary?.totalExpenses || 0)}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Net Income</p>
                        <p className={`text-xl font-bold ${(data.summary?.netIncome || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrency(data.summary?.netIncome || 0)}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Transactions</p>
                        <p className="text-xl font-bold text-purple-600">{data.summary?.transactionCount || 0}</p>
                      </div>
                    </div>

                    {/* Expenses by Category */}
                    {data.expenses?.byCategory && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
                        <div className="space-y-3">
                          {Object.entries(data.expenses.byCategory).map(([category, amount]) => (
                            <div key={category} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                              <span className="font-medium">{category}</span>
                              <span className="font-bold text-red-600">{formatCurrency(amount as number)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Budget Analysis */}
                    {data.budgets && data.budgets.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Budget Analysis</h3>
                        <div className="space-y-3">
                          {data.budgets.map((budget: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                              <span className="font-medium">{budget.name}</span>
                              <div className="text-right">
                                <p className="font-bold">{formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}</p>
                                <p className={`text-sm ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {budget.remaining >= 0 ? 'Under' : 'Over'} by {formatCurrency(Math.abs(budget.remaining))}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}