import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { YingYangSymbol } from "@/components/YingYangSymbol";
import { ConsistencyManager, ConsistencyData, ReminderSettings } from "@/lib/consistencyManager";
import { 
  Settings, 
  Bell, 
  Target, 
  TrendingUp, 
  Calendar,
  Clock,
  Star,
  Trophy,
  Zap,
  Heart,
  Brain,
  Activity
} from "lucide-react";

interface ConsistencySettingsProps {
  onClose?: () => void;
}

export const ConsistencySettings = ({ onClose }: ConsistencySettingsProps) => {
  const [consistencyData, setConsistencyData] = useState<ConsistencyData | null>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    frequency: 'daily',
    time: '09:00',
    enabled: true
  });
  const [weeklyGoal, setWeeklyGoal] = useState(7);
  const [monthlyGoal, setMonthlyGoal] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = ConsistencyManager.getConsistencyData();
    const settings = ConsistencyManager.getReminderSettings();
    
    if (data) {
      setConsistencyData(data);
      setWeeklyGoal(data.weeklyGoal);
      setMonthlyGoal(data.monthlyGoal);
    } else {
      // Initialize for new user
      const newData = ConsistencyManager.initializeConsistencyData();
      setConsistencyData(newData);
    }
    
    setReminderSettings(settings);
    setIsLoading(false);
  };

  const handleReminderToggle = (enabled: boolean) => {
    const newSettings = { ...reminderSettings, enabled };
    setReminderSettings(newSettings);
    ConsistencyManager.saveReminderSettings(newSettings);
  };

  const handleFrequencyChange = (frequency: ReminderSettings['frequency']) => {
    const newSettings = { ...reminderSettings, frequency };
    setReminderSettings(newSettings);
    ConsistencyManager.saveReminderSettings(newSettings);
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...reminderSettings, time };
    setReminderSettings(newSettings);
    ConsistencyManager.saveReminderSettings(newSettings);
  };

  const handleGoalChange = () => {
    if (consistencyData) {
      const updatedData = {
        ...consistencyData,
        weeklyGoal,
        monthlyGoal
      };
      ConsistencyManager.saveConsistencyData(updatedData);
      setConsistencyData(updatedData);
    }
  };

  const getConsistencyLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-green-600 bg-green-100';
      case 'beginner': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConsistencyLevelIcon = (level: string) => {
    switch (level) {
      case 'expert': return <Trophy className="w-4 h-4" />;
      case 'advanced': return <Star className="w-4 h-4" />;
      case 'intermediate': return <TrendingUp className="w-4 h-4" />;
      case 'beginner': return <Heart className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <YingYangSymbol size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-serif font-bold">Consistency Settings</h2>
      </div>

      {/* Current Status */}
      {consistencyData && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Consistency Level */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Consistency Level</h3>
              <div className="flex items-center gap-3 mb-4">
                {getConsistencyLevelIcon(consistencyData.consistencyLevel)}
                <Badge className={`${getConsistencyLevelColor(consistencyData.consistencyLevel)}`}>
                  {consistencyData.consistencyLevel.charAt(0).toUpperCase() + consistencyData.consistencyLevel.slice(1)}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <span className="font-semibold">{consistencyData.currentStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Longest Streak:</span>
                  <span className="font-semibold">{consistencyData.longestStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Entries:</span>
                  <span className="font-semibold">{consistencyData.totalEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement Score:</span>
                  <span className="font-semibold">{consistencyData.engagementScore}/100</span>
                </div>
              </div>
            </div>

            {/* Goal Progress */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weekly Goal ({consistencyData.goalProgress.weekly.toFixed(0)}%)</span>
                    <span>{Math.round(consistencyData.weeklyGoal * consistencyData.goalProgress.weekly / 100)}/{consistencyData.weeklyGoal}</span>
                  </div>
                  <Progress value={consistencyData.goalProgress.weekly} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Monthly Goal ({consistencyData.goalProgress.monthly.toFixed(0)}%)</span>
                    <span>{Math.round(consistencyData.monthlyGoal * consistencyData.goalProgress.monthly / 100)}/{consistencyData.monthlyGoal}</span>
                  </div>
                  <Progress value={consistencyData.goalProgress.monthly} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Reminder Settings */}
      <Card className="p-6 border-0 shadow-medium">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-serif font-semibold">Reminder Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Reminders */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Reminders</Label>
              <p className="text-sm text-muted-foreground">Receive notifications to journal</p>
            </div>
            <Switch
              checked={reminderSettings.enabled}
              onCheckedChange={handleReminderToggle}
            />
          </div>

          {reminderSettings.enabled && (
            <>
              {/* Reminder Frequency */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Reminder Frequency</Label>
                <Select value={reminderSettings.frequency} onValueChange={handleFrequencyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice_daily">Twice Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reminder Time */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Reminder Time</Label>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Select value={reminderSettings.time} onValueChange={handleTimeChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="18:00">6:00 PM</SelectItem>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                      <SelectItem value="21:00">9:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Goal Settings */}
      <Card className="p-6 border-0 shadow-medium">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-serif font-semibold">Goal Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Weekly Goal */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base font-medium">Weekly Goal</Label>
              <span className="text-sm text-muted-foreground">{weeklyGoal} entries</span>
            </div>
            <Slider
              value={[weeklyGoal]}
              onValueChange={(value) => setWeeklyGoal(value[0])}
              max={14}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 entry</span>
              <span>14 entries</span>
            </div>
          </div>

          {/* Monthly Goal */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base font-medium">Monthly Goal</Label>
              <span className="text-sm text-muted-foreground">{monthlyGoal} entries</span>
            </div>
            <Slider
              value={[monthlyGoal]}
              onValueChange={(value) => setMonthlyGoal(value[0])}
              max={60}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10 entries</span>
              <span>60 entries</span>
            </div>
          </div>

          <Button onClick={handleGoalChange} className="w-full">
            <Zap className="w-4 h-4 mr-2" />
            Update Goals
          </Button>
        </div>
      </Card>

      {/* ML Enhancement Info */}
      <Card className="p-6 border-0 shadow-medium bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-900">AI Enhancement</h3>
        </div>
        <p className="text-sm text-purple-700 mb-4">
          Your consistency data helps our AI provide more personalized prompts, 
          better sentiment analysis, and tailored recommendations for your journaling journey.
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-white/50 p-3 rounded">
            <div className="font-medium">Prompt Style</div>
            <div className="text-purple-600">
              {consistencyData?.consistencyLevel === 'expert' ? 'Reflective' : 
               consistencyData?.consistencyLevel === 'advanced' ? 'Challenging' : 
               consistencyData?.consistencyLevel === 'intermediate' ? 'Supportive' : 'Encouraging'}
            </div>
          </div>
          <div className="bg-white/50 p-3 rounded">
            <div className="font-medium">Analysis Depth</div>
            <div className="text-purple-600">
              {consistencyData?.consistencyLevel === 'expert' ? 'Advanced' : 
               consistencyData?.consistencyLevel === 'advanced' ? 'Detailed' : 
               consistencyData?.consistencyLevel === 'intermediate' ? 'Enhanced' : 'Basic'}
            </div>
          </div>
        </div>
      </Card>

      {/* Close Button */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close Settings
          </Button>
        </div>
      )}
    </div>
  );
};
