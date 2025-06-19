import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertExpenseSchema, insertBudgetSchema, insertGoalSchema, 
  insertIncomeSchema, insertRecurringTransactionSchema 
} from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Expenses routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", upload.single('receipt'), async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      
      // Add receipt URL if file was uploaded
      if (req.file) {
        expenseData.receiptUrl = `/uploads/${req.file.filename}`;
      }
      
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.get("/api/expenses/category/:category", async (req, res) => {
    try {
      const expenses = await storage.getExpensesByCategory(req.params.category);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses by category" });
    }
  });

  // Budgets routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const budgetData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      res.status(400).json({ message: "Invalid budget data" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBudget(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Budget not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { currentAmount } = req.body;
      const goal = await storage.updateGoalProgress(id, currentAmount);
      if (goal) {
        res.json(goal);
      } else {
        res.status(404).json({ message: "Goal not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal progress" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGoal(id);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Goal not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/balance", async (req, res) => {
    try {
      const balance = await storage.getTotalBalance();
      res.json({ balance });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  app.get("/api/analytics/monthly-spending", async (req, res) => {
    try {
      const spending = await storage.getMonthlySpending();
      res.json({ spending });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly spending" });
    }
  });

  app.get("/api/analytics/category-spending", async (req, res) => {
    try {
      const categorySpending = await storage.getCategorySpending();
      res.json(categorySpending);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category spending" });
    }
  });

  // Income routes
  app.get("/api/incomes", async (req, res) => {
    try {
      const incomes = await storage.getIncomes();
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incomes" });
    }
  });

  app.post("/api/incomes", async (req, res) => {
    try {
      const incomeData = insertIncomeSchema.parse(req.body);
      const income = await storage.createIncome(incomeData);
      res.json(income);
    } catch (error) {
      res.status(400).json({ message: "Invalid income data" });
    }
  });

  // Advanced Analytics routes
  app.get("/api/analytics/income-vs-expenses/:months", async (req, res) => {
    try {
      const months = parseInt(req.params.months) || 6;
      const data = await storage.getIncomeVsExpenses(months);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch income vs expenses data" });
    }
  });

  app.get("/api/analytics/cash-flow", async (req, res) => {
    try {
      const cashFlow = await storage.getCashFlow();
      res.json(cashFlow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cash flow data" });
    }
  });

  app.get("/api/analytics/spending-trends", async (req, res) => {
    try {
      const trends = await storage.getSpendingTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spending trends" });
    }
  });

  app.get("/api/analytics/budget-performance", async (req, res) => {
    try {
      const performance = await storage.getBudgetPerformance();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget performance" });
    }
  });

  app.get("/api/analytics/top-categories/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 5;
      const categories = await storage.getTopExpenseCategories(limit);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top categories" });
    }
  });

  // Financial Reports routes
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { type, startDate, endDate } = req.body;
      const report = await storage.generateFinancialReport(
        type,
        new Date(startDate),
        new Date(endDate)
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getFinancialReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Recurring Transactions routes
  app.get("/api/recurring", async (req, res) => {
    try {
      const transactions = await storage.getRecurringTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring transactions" });
    }
  });

  app.post("/api/recurring", async (req, res) => {
    try {
      const transactionData = insertRecurringTransactionSchema.parse(req.body);
      const transaction = await storage.createRecurringTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid recurring transaction data" });
    }
  });

  app.post("/api/recurring/process", async (req, res) => {
    try {
      await storage.processRecurringTransactions();
      res.json({ message: "Recurring transactions processed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process recurring transactions" });
    }
  });

  // Search route
  app.get("/api/expenses/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const expenses = await storage.searchExpenses(query);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to search expenses" });
    }
  });

  // Budget alerts
  app.get("/api/budget-alerts", async (req, res) => {
    try {
      const alerts = await storage.checkBudgetAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to check budget alerts" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
