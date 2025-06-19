import { expenses, budgets, goals, type Expense, type InsertExpense, type Budget, type InsertBudget, type Goal, type InsertGoal } from "@shared/schema";

export interface IStorage {
  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;
  getExpensesByCategory(category: string): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  
  // Budgets
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgets(): Promise<Budget[]>;
  updateBudgetSpent(id: number, spent: string): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  
  // Goals
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoals(): Promise<Goal[]>;
  updateGoalProgress(id: number, currentAmount: string): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Analytics
  getTotalBalance(): Promise<number>;
  getMonthlySpending(): Promise<number>;
  getCategorySpending(): Promise<Record<string, number>>;
}

export class MemStorage implements IStorage {
  private expenses: Map<number, Expense>;
  private budgets: Map<number, Budget>;
  private goals: Map<number, Goal>;
  private currentExpenseId: number;
  private currentBudgetId: number;
  private currentGoalId: number;

  constructor() {
    this.expenses = new Map();
    this.budgets = new Map();
    this.goals = new Map();
    this.currentExpenseId = 1;
    this.currentBudgetId = 1;
    this.currentGoalId = 1;
  }

  // Expenses
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const expense: Expense = {
      ...insertExpense,
      id,
      date: new Date(),
      description: insertExpense.description || null,
      receiptUrl: insertExpense.receiptUrl || null,
    };
    this.expenses.set(id, expense);
    
    // Update budget spent amount
    const budgets = await this.getBudgets();
    const budget = budgets.find(b => b.category === expense.category);
    if (budget) {
      const newSpent = (parseFloat(budget.spent) + parseFloat(expense.amount)).toString();
      await this.updateBudgetSpent(budget.id, newSpent);
    }
    
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => expense.category === category);
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => 
      expense.date >= startDate && expense.date <= endDate
    );
  }

  // Budgets
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.currentBudgetId++;
    const budget: Budget = {
      ...insertBudget,
      id,
      spent: "0",
      period: insertBudget.period || "monthly",
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async updateBudgetSpent(id: number, spent: string): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    if (budget) {
      const updatedBudget = { ...budget, spent };
      this.budgets.set(id, updatedBudget);
      return updatedBudget;
    }
    return undefined;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Goals
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentGoalId++;
    const goal: Goal = {
      ...insertGoal,
      id,
      currentAmount: "0",
      isCompleted: false,
      deadline: insertGoal.deadline || null,
    };
    this.goals.set(id, goal);
    return goal;
  }

  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async updateGoalProgress(id: number, currentAmount: string): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (goal) {
      const isCompleted = parseFloat(currentAmount) >= parseFloat(goal.targetAmount);
      const updatedGoal = { ...goal, currentAmount, isCompleted };
      this.goals.set(id, updatedGoal);
      return updatedGoal;
    }
    return undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Analytics
  async getTotalBalance(): Promise<number> {
    // For demo purposes, assuming a base balance minus expenses
    const totalExpenses = Array.from(this.expenses.values())
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    return 10000 - totalExpenses; // Starting with $10,000 base
  }

  async getMonthlySpending(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyExpenses = await this.getExpensesByDateRange(startOfMonth, endOfMonth);
    return monthlyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  }

  async getCategorySpending(): Promise<Record<string, number>> {
    const expenses = await this.getExpenses();
    const categorySpending: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category;
      categorySpending[category] = (categorySpending[category] || 0) + parseFloat(expense.amount);
    });
    
    return categorySpending;
  }
}

export const storage = new MemStorage();
