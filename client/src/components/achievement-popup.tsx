import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Target, Zap, X } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  points: number;
}

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 500);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const getIcon = () => {
    switch (achievement.icon) {
      case "trophy": return <Trophy className="h-8 w-8" />;
      case "star": return <Star className="h-8 w-8" />;
      case "target": return <Target className="h-8 w-8" />;
      case "zap": return <Zap className="h-8 w-8" />;
      default: return <Trophy className="h-8 w-8" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className={`w-80 border-2 ${achievement.color} shadow-2xl animate-bounce-in`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${achievement.color.replace('border-', 'bg-').replace('-500', '-100')} ${achievement.color.replace('border-', 'text-')}`}>
                {getIcon()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-yellow-600">+{achievement.points} points</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 500);
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}