import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Other'
];

export const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': 'fas fa-utensils',
  'Transportation': 'fas fa-car',
  'Shopping': 'fas fa-shopping-bag',
  'Entertainment': 'fas fa-film',
  'Bills & Utilities': 'fas fa-bolt',
  'Healthcare': 'fas fa-heartbeat',
  'Travel': 'fas fa-plane',
  'Education': 'fas fa-graduation-cap',
  'Other': 'fas fa-ellipsis-h'
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'bg-red-100 text-red-600',
  'Transportation': 'bg-blue-100 text-blue-600',
  'Shopping': 'bg-purple-100 text-purple-600',
  'Entertainment': 'bg-pink-100 text-pink-600',
  'Bills & Utilities': 'bg-yellow-100 text-yellow-600',
  'Healthcare': 'bg-green-100 text-green-600',
  'Travel': 'bg-indigo-100 text-indigo-600',
  'Education': 'bg-orange-100 text-orange-600',
  'Other': 'bg-gray-100 text-gray-600'
};
