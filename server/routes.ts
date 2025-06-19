import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertBudgetSchema, insertGoalSchema } from "@shared/schema";
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

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
