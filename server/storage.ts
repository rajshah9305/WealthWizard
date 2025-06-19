import { expenses, budgets, goals, type Expense, type InsertExpense, type Budget, type InsertBudget, type Goal, type InsertGoal } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<any | undefined> {
    // User management can be added later if needed
    return undefined;
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    // User management can be added later if needed
    return undefined;
  }

  async createUser(insertUser: any): Promise<any> {
    // User management can be added later if needed
    return {};
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({
        ...insertExpense,
        description: insertExpense.description || null,
        receiptUrl: insertExpense.receiptUrl || null,
      })
      .returning();
    
    // Update budget spent amount
    const budgetList = await this.getBudgets();
    const budget = budgetList.find(b => b.category === expense.category);
    if (budget) {
      const newSpent = (parseFloat(budget.spent) + parseFloat(expense.amount)).toString();
      await this.updateBudgetSpent(budget.id, newSpent);
    }
    
    return expense;
  }

  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(expenses.date);
  }

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.category, category));
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return await db.select().from(expenses).where(
      and(
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    );
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values({
        ...insertBudget,
        period: insertBudget.period || "monthly",
      })
      .returning();
    return budget;
  }

  async getBudgets(): Promise<Budget[]> {
    return await db.select().from(budgets);
  }

  async updateBudgetSpent(id: number, spent: string): Promise<Budget | undefined> {
    const [budget] = await db
      .update(budgets)
      .set({ spent })
      .where(eq(budgets.id, id))
      .returning();
    return budget || undefined;
  }

  async deleteBudget(id: number): Promise<boolean> {
    const result = await db.delete(budgets).where(eq(budgets.id, id));
    return result.rowCount! > 0;
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values({
        ...insertGoal,
        deadline: insertGoal.deadline || null,
      })
      .returning();
    return goal;
  }

  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals);
  }

  async updateGoalProgress(id: number, currentAmount: string): Promise<Goal | undefined> {
    const [currentGoal] = await db.select().from(goals).where(eq(goals.id, id));
    if (!currentGoal) return undefined;

    const isCompleted = parseFloat(currentAmount) >= parseFloat(currentGoal.targetAmount);
    
    const [goal] = await db
      .update(goals)
      .set({ currentAmount, isCompleted })
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id));
    return result.rowCount! > 0;
  }

  async getTotalBalance(): Promise<number> {
    const allExpenses = await this.getExpenses();
    const totalExpenses = allExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
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
    const allExpenses = await this.getExpenses();
    const categorySpending: Record<string, number> = {};
    
    allExpenses.forEach(expense => {
      const category = expense.category;
      categorySpending[category] = (categorySpending[category] || 0) + parseFloat(expense.amount);
    });
    
    return categorySpending;
  }
}

export const storage = new DatabaseStorage();
