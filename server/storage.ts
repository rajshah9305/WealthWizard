import { 
  expenses, budgets, goals, incomes, recurringTransactions, financialReports, budgetAlerts,
  type Expense, type InsertExpense, type Budget, type InsertBudget, type Goal, type InsertGoal,
  type Income, type InsertIncome, type RecurringTransaction, type InsertRecurringTransaction,
  type FinancialReport, type InsertFinancialReport, type BudgetAlert, type InsertBudgetAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc, like, or } from "drizzle-orm";

export interface IStorage {
  // Expenses
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(): Promise<Expense[]>;
  getExpensesByCategory(category: string): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  searchExpenses(query: string): Promise<Expense[]>;
  
  // Budgets
  createBudget(budget: InsertBudget): Promise<Budget>;
  getBudgets(): Promise<Budget[]>;
  updateBudgetSpent(id: number, spent: string): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  checkBudgetAlerts(): Promise<BudgetAlert[]>;
  
  // Goals
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoals(): Promise<Goal[]>;
  updateGoalProgress(id: number, currentAmount: string): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Income
  createIncome(income: InsertIncome): Promise<Income>;
  getIncomes(): Promise<Income[]>;
  getIncomesByDateRange(startDate: Date, endDate: Date): Promise<Income[]>;
  
  // Recurring Transactions
  createRecurringTransaction(transaction: InsertRecurringTransaction): Promise<RecurringTransaction>;
  getRecurringTransactions(): Promise<RecurringTransaction[]>;
  processRecurringTransactions(): Promise<void>;
  
  // Financial Reports
  generateFinancialReport(type: string, startDate: Date, endDate: Date): Promise<FinancialReport>;
  getFinancialReports(): Promise<FinancialReport[]>;
  
  // Advanced Analytics
  getTotalBalance(): Promise<number>;
  getMonthlySpending(): Promise<number>;
  getCategorySpending(): Promise<Record<string, number>>;
  getIncomeVsExpenses(months: number): Promise<Array<{month: string, income: number, expenses: number}>>;
  getCashFlow(): Promise<{inflow: number, outflow: number, netFlow: number}>;
  getSpendingTrends(): Promise<Array<{date: string, amount: number}>>;
  getBudgetPerformance(): Promise<Array<{category: string, budgeted: number, spent: number, variance: number}>>;
  getTopExpenseCategories(limit: number): Promise<Array<{category: string, amount: number}>>;
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
    return await db.select().from(expenses).orderBy(desc(expenses.date));
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

  async searchExpenses(query: string): Promise<Expense[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    return await db.select().from(expenses).where(
      or(
        like(expenses.description, searchTerm),
        like(expenses.category, searchTerm),
        like(expenses.merchantName, searchTerm),
        like(expenses.location, searchTerm)
      )
    ).orderBy(desc(expenses.date));
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

  async checkBudgetAlerts(): Promise<BudgetAlert[]> {
    const activeBudgets = await db.select().from(budgets).where(eq(budgets.isActive, true));
    const alerts: BudgetAlert[] = [];
    
    for (const budget of activeBudgets) {
      const spentPercentage = (parseFloat(budget.spent) / parseFloat(budget.amount)) * 100;
      if (spentPercentage >= parseFloat(budget.alertThreshold)) {
        const alertType = spentPercentage >= 100 ? 'overspent' : 'threshold';
        const message = spentPercentage >= 100 
          ? `Budget "${budget.name}" has exceeded its limit by ${(spentPercentage - 100).toFixed(1)}%`
          : `Budget "${budget.name}" has reached ${spentPercentage.toFixed(1)}% of its limit`;
        
        const [alert] = await db.insert(budgetAlerts).values({
          budgetId: budget.id,
          alertType,
          message,
          isRead: false
        }).returning();
        alerts.push(alert);
      }
    }
    
    return alerts;
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

  // Income methods
  async createIncome(insertIncome: InsertIncome): Promise<Income> {
    const [income] = await db.insert(incomes).values(insertIncome).returning();
    return income;
  }

  async getIncomes(): Promise<Income[]> {
    return await db.select().from(incomes).orderBy(desc(incomes.date));
  }

  async getIncomesByDateRange(startDate: Date, endDate: Date): Promise<Income[]> {
    return await db.select().from(incomes).where(
      and(gte(incomes.date, startDate), lte(incomes.date, endDate))
    );
  }

  // Advanced analytics
  async getIncomeVsExpenses(months: number): Promise<Array<{month: string, income: number, expenses: number}>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const monthlyData = [];
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);
      
      const monthlyIncomes = await this.getIncomesByDateRange(monthStart, monthEnd);
      const monthlyExpenses = await this.getExpensesByDateRange(monthStart, monthEnd);
      
      const income = monthlyIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
      const expenses = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses
      });
    }
    
    return monthlyData;
  }

  async getCashFlow(): Promise<{inflow: number, outflow: number, netFlow: number}> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyIncomes = await this.getIncomesByDateRange(startOfMonth, now);
    const monthlyExpenses = await this.getExpensesByDateRange(startOfMonth, now);
    
    const inflow = monthlyIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
    const outflow = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    return { inflow, outflow, netFlow: inflow - outflow };
  }

  async getSpendingTrends(): Promise<Array<{date: string, amount: number}>> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = await this.getExpensesByDateRange(thirtyDaysAgo, new Date());
    const dailySpending: Record<string, number> = {};
    
    recentExpenses.forEach(expense => {
      const date = expense.date.toLocaleDateString();
      dailySpending[date] = (dailySpending[date] || 0) + parseFloat(expense.amount);
    });
    
    return Object.entries(dailySpending).map(([date, amount]) => ({ date, amount }));
  }

  async getBudgetPerformance(): Promise<Array<{category: string, budgeted: number, spent: number, variance: number}>> {
    const activeBudgets = await db.select().from(budgets).where(eq(budgets.isActive, true));
    
    return activeBudgets.map(budget => {
      const budgeted = parseFloat(budget.amount);
      const spent = parseFloat(budget.spent);
      const variance = budgeted - spent;
      
      return {
        category: budget.category,
        budgeted,
        spent,
        variance
      };
    });
  }

  async getTopExpenseCategories(limit: number): Promise<Array<{category: string, amount: number}>> {
    const categorySpending = await this.getCategorySpending();
    
    return Object.entries(categorySpending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  // Recurring transactions
  async createRecurringTransaction(transaction: InsertRecurringTransaction): Promise<RecurringTransaction> {
    const [recurring] = await db.insert(recurringTransactions).values(transaction).returning();
    return recurring;
  }

  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    return await db.select().from(recurringTransactions).where(eq(recurringTransactions.isActive, true));
  }

  async processRecurringTransactions(): Promise<void> {
    const activeRecurring = await this.getRecurringTransactions();
    const now = new Date();
    
    for (const recurring of activeRecurring) {
      if (recurring.nextDate <= now) {
        if (recurring.type === 'expense') {
          await this.createExpense({
            amount: recurring.amount,
            category: recurring.category,
            description: `${recurring.description} (Recurring)`,
            isRecurring: true
          });
        } else {
          await this.createIncome({
            amount: recurring.amount,
            source: recurring.category,
            description: `${recurring.description} (Recurring)`,
            isRecurring: true
          });
        }
        
        // Update next date based on frequency
        let nextDate = new Date(recurring.nextDate);
        switch (recurring.frequency) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }
        
        await db.update(recurringTransactions)
          .set({ nextDate })
          .where(eq(recurringTransactions.id, recurring.id));
      }
    }
  }

  // Financial reports
  async generateFinancialReport(type: string, startDate: Date, endDate: Date): Promise<FinancialReport> {
    const expensesData = await this.getExpensesByDateRange(startDate, endDate);
    const incomesData = await this.getIncomesByDateRange(startDate, endDate);
    const budgetsData = await this.getBudgets();
    
    const totalExpenses = expensesData.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const totalIncome = incomesData.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
    const netIncome = totalIncome - totalExpenses;
    
    const categoryBreakdown = await this.getCategorySpending();
    
    const reportData = {
      summary: {
        totalIncome,
        totalExpenses,
        netIncome,
        transactionCount: expensesData.length + incomesData.length
      },
      expenses: {
        total: totalExpenses,
        byCategory: categoryBreakdown,
        transactions: expensesData.length
      },
      income: {
        total: totalIncome,
        transactions: incomesData.length
      },
      budgets: budgetsData.map(b => ({
        name: b.name,
        budgeted: parseFloat(b.amount),
        spent: parseFloat(b.spent),
        remaining: parseFloat(b.amount) - parseFloat(b.spent)
      }))
    };
    
    const [report] = await db.insert(financialReports).values({
      name: `${type} Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      type,
      startDate,
      endDate,
      data: JSON.stringify(reportData)
    }).returning();
    
    return report;
  }

  async getFinancialReports(): Promise<FinancialReport[]> {
    return await db.select().from(financialReports).orderBy(desc(financialReports.createdAt));
  }
}

export const storage = new DatabaseStorage();
