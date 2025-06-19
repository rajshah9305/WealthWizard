import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  points: number;
}

const ACHIEVEMENTS = [
  {
    id: "first_expense",
    title: "Getting Started!",
    description: "You've added your first expense",
    icon: "star",
    color: "border-blue-500",
    points: 10,
    condition: (data: any) => data.expenses?.length >= 1
  },
  {
    id: "budget_master",
    title: "Budget Master",
    description: "Created your first budget",
    icon: "target",
    color: "border-green-500", 
    points: 15,
    condition: (data: any) => data.budgets?.length >= 1
  },
  {
    id: "goal_setter",
    title: "Goal Setter",
    description: "Set your first financial goal",
    icon: "trophy",
    color: "border-purple-500",
    points: 20,
    condition: (data: any) => data.goals?.length >= 1
  },
  {
    id: "spender_5",
    title: "Active Tracker",
    description: "Logged 5 expenses",
    icon: "zap",
    color: "border-orange-500",
    points: 25,
    condition: (data: any) => data.expenses?.length >= 5
  },
  {
    id: "goal_completed",
    title: "Goal Crusher!",
    description: "Completed your first goal",
    icon: "trophy",
    color: "border-yellow-500",
    points: 50,
    condition: (data: any) => data.goals?.some((goal: any) => goal.isCompleted)
  }
];

export function useAchievements() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const { data: expenses } = useQuery({ queryKey: ["/api/expenses"] });
  const { data: budgets } = useQuery({ queryKey: ["/api/budgets"] });
  const { data: goals } = useQuery({ queryKey: ["/api/goals"] });

  useEffect(() => {
    const data = { expenses, budgets, goals };
    
    ACHIEVEMENTS.forEach(achievement => {
      if (achievement.condition(data) && !unlockedAchievements.includes(achievement.id)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        setNewAchievement(achievement);
      }
    });
  }, [expenses, budgets, goals, unlockedAchievements]);

  const clearNewAchievement = () => setNewAchievement(null);
  
  const totalPoints = unlockedAchievements.length * 15; // Average points per achievement
  const completionRate = Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100);

  return {
    newAchievement,
    clearNewAchievement,
    unlockedAchievements,
    totalPoints,
    completionRate,
    totalAchievements: ACHIEVEMENTS.length
  };
}