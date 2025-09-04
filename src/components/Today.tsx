import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { YingYangSymbol } from "@/components/YingYangSymbol";
import { JournalEntry } from "@/components/JournalEntry";
import { LocalStorage, JournalEntry as JournalEntryType } from "@/lib/storage";
import { ConsistencySettings } from "@/components/ConsistencySettings";
import { ConsistencyManager } from "@/lib/consistencyManager";
import { 
  Sun, 
  Clock, 
  Calendar,
  Heart,
  Brain,
  TrendingUp,
  Sparkles,
  PenTool,
  MessageCircle,
  Activity,
  Save,
  X,
  Settings
} from "lucide-react";

interface TodayProps {
  onSaveEntry: (entry: string, mood?: number) => void;
  currentMood: number;
  onMoodChange: (mood: number) => void;
  onNavigateToJournal?: () => void;
  onNavigateToTherapist?: () => void;
  onNavigateToInsights?: () => void;
}

export const Today = ({ 
  onSaveEntry, 
  currentMood, 
  onMoodChange,
  onNavigateToJournal,
  onNavigateToTherapist,
  onNavigateToInsights
}: TodayProps) => {
  const [todayEntries, setTodayEntries] = useState<JournalEntryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState<number[]>([5]);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadTodayEntries();
  }, []);

  // Reload today's entries when they might have changed
  useEffect(() => {
    const handleStorageChange = () => {
      loadTodayEntries();
    };

    const handleEntrySaved = () => {
      loadTodayEntries();
    };

    const handleAccountSwitched = () => {
      loadTodayEntries();
    };

    const handleDailyReset = () => {
      loadTodayEntries();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('entrySaved', handleEntrySaved);
    window.addEventListener('accountSwitched', handleAccountSwitched);
    window.addEventListener('dailyReset', handleDailyReset);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('entrySaved', handleEntrySaved);
      window.removeEventListener('accountSwitched', handleAccountSwitched);
      window.removeEventListener('dailyReset', handleDailyReset);
    };
  }, []);

  const loadTodayEntries = () => {
    const entries = LocalStorage.getTodayEntries();
    setTodayEntries(entries);
    setIsLoading(false);
  };

  const handleEditEntry = (entryId: string) => {
    const entry = todayEntries.find(e => e.id === entryId);
    if (entry) {
      setEditContent(entry.content);
      setEditMood([entry.mood || 5]);
      setEditingEntryId(entryId);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingEntryId) return;
    
    try {
      // Re-analyze sentiment and themes for the updated content
      const { AIAnalyzer } = await import("@/lib/aiAnalysis");
      await AIAnalyzer.initialize();
      
      const sentiment = await AIAnalyzer.analyzeSentiment(editContent);
      const themes = AIAnalyzer.extractThemes(editContent);
      
      console.log('Sentiment analysis result:', {
        content: editContent.substring(0, 100) + '...',
        sentiment,
        themes
      });
      
      // Update in storage using the proper method with partial updates
      LocalStorage.updateJournalEntry(editingEntryId, {
        content: editContent,
        mood: editMood[0],
        timestamp: new Date().toISOString(),
        sentiment,
        themes
      });
      
      // Reload entries
      loadTodayEntries();
      
      // Reset edit state
      setIsEditing(false);
      setEditingEntryId(null);
      setEditContent("");
      setEditMood([5]);
      
      // Update parent mood state (but don't call onSaveEntry for edits)
      onMoodChange?.(editMood[0]);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('entrySaved'));
      
    } catch (error) {
      console.error('Failed to save edited entry:', error);
      // Fallback: save without analysis if AI fails
      LocalStorage.updateJournalEntry(editingEntryId, {
        content: editContent,
        mood: editMood[0],
        timestamp: new Date().toISOString(),
      });
      
      loadTodayEntries();
      setIsEditing(false);
      setEditingEntryId(null);
      setEditContent("");
      setEditMood([5]);
      
      // Update parent mood state (but don't call onSaveEntry for edits)
      onMoodChange?.(editMood[0]);
      window.dispatchEvent(new CustomEvent('entrySaved'));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEntryId(null);
    setEditContent("");
    setEditMood([5]);
  };

  const getTodayAverageSentiment = () => {
    if (todayEntries.length === 0) return 0;
    
    // Calculate weighted average based on entry length and recency
    let totalWeightedSentiment = 0;
    let totalWeight = 0;
    
    todayEntries.forEach((entry, index) => {
      // Base sentiment score
      const sentimentScore = entry.sentiment?.score || 0;
      
      // Weight factors:
      // 1. Recency weight: More recent entries get higher weight
      const recencyWeight = Math.pow(0.9, index); // Exponential decay
      
      // 2. Content length weight: Longer entries get slightly higher weight
      const contentLength = entry.content.length;
      const lengthWeight = Math.min(1.2, 1 + (contentLength / 1000)); // Cap at 1.2x
      
      // 3. Confidence weight: Higher confidence gets higher weight
      const confidenceWeight = entry.sentiment?.confidence || 0.5;
      
      // 4. Mood correlation: If mood and sentiment align, boost weight
      const moodSentimentAlignment = entry.mood ? 
        Math.abs((entry.mood / 10) - (sentimentScore + 1) / 2) < 0.3 ? 1.1 : 0.9 : 1;
      
      const finalWeight = recencyWeight * lengthWeight * confidenceWeight * moodSentimentAlignment;
      
      totalWeightedSentiment += sentimentScore * finalWeight;
      totalWeight += finalWeight;
    });
    
    const averageSentiment = totalWeight > 0 ? totalWeightedSentiment / totalWeight : 0;
    
    // Apply smoothing to avoid extreme values
    const smoothedSentiment = Math.max(-0.8, Math.min(0.8, averageSentiment));
    
    return smoothedSentiment;
  };

  const getSentimentTrend = () => {
    if (todayEntries.length < 2) return "stable";
    
    // Calculate sentiment trend throughout the day
    const sentiments = todayEntries.map(entry => entry.sentiment?.score || 0);
    const firstHalf = sentiments.slice(0, Math.ceil(sentiments.length / 2));
    const secondHalf = sentiments.slice(Math.ceil(sentiments.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (difference > 0.2) return "improving";
    if (difference < -0.2) return "declining";
    return "stable";
  };

  const getSentimentInsight = () => {
    const sentiment = getTodayAverageSentiment();
    const trend = getSentimentTrend();
    const entryCount = todayEntries.length;
    
    if (entryCount === 0) return "No reflections yet today";
    
    let insight = "";
    
    // Base insight on sentiment level
    if (sentiment > 0.5) {
      insight = "You're having a very positive day";
    } else if (sentiment > 0.2) {
      insight = "You're feeling generally positive";
    } else if (sentiment > -0.2) {
      insight = "You're feeling balanced today";
    } else if (sentiment > -0.5) {
      insight = "You're having some challenging moments";
    } else {
      insight = "You're going through a difficult time";
    }
    
    // Add trend information
    if (trend === "improving" && entryCount > 1) {
      insight += " and your mood is improving";
    } else if (trend === "declining" && entryCount > 1) {
      insight += " and you might want to take a moment to breathe";
    }
    
    // Add reflection count context
    if (entryCount > 3) {
      insight += ` - you've been very reflective today (${entryCount} entries)`;
    } else if (entryCount > 1) {
      insight += ` - you've taken time to reflect (${entryCount} entries)`;
    }
    
    return insight;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDayOfWeek = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return "😊";
    if (mood >= 6) return "🙂";
    if (mood >= 4) return "😐";
    if (mood >= 2) return "😔";
    return "😢";
  };

  const getMoodDescription = (mood: number) => {
    if (mood >= 8) return "Excellent";
    if (mood >= 6) return "Good";
    if (mood >= 4) return "Okay";
    if (mood >= 2) return "Low";
    return "Very Low";
  };

  const getSentimentColor = (sentiment: number) => {
    // More nuanced color coding
    if (sentiment > 0.6) return "text-green-700"; // Very positive
    if (sentiment > 0.3) return "text-green-600"; // Positive
    if (sentiment > 0.1) return "text-green-500"; // Slightly positive
    if (sentiment > -0.1) return "text-yellow-600"; // Neutral
    if (sentiment > -0.3) return "text-orange-500"; // Slightly negative
    if (sentiment > -0.6) return "text-red-600"; // Negative
    return "text-red-700"; // Very negative
  };

  const getSentimentDescription = (sentiment: number) => {
    // More nuanced sentiment descriptions
    if (sentiment > 0.6) return "Very Positive";
    if (sentiment > 0.3) return "Positive";
    if (sentiment > 0.1) return "Slightly Positive";
    if (sentiment > -0.1) return "Neutral";
    if (sentiment > -0.3) return "Slightly Negative";
    if (sentiment > -0.6) return "Negative";
    return "Very Negative";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <YingYangSymbol size="md" animate />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sun className="w-6 h-6 text-yellow-500" />
          <h2 className="text-3xl font-serif font-bold">Today</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          {getGreeting()}, it's {getDayOfWeek()} - {getDate()}
        </p>
      </div>

      {/* Today's Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Current Mood */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Mood</p>
              <p className="text-2xl font-bold">
                {todayEntries.length > 0 ? todayEntries[0].mood : currentMood}/10
              </p>
              <p className="text-sm text-muted-foreground">
                {todayEntries.length > 0 ? getMoodDescription(todayEntries[0].mood) : getMoodDescription(currentMood)}
              </p>
            </div>
            <div className="text-4xl">
              {todayEntries.length > 0 ? getMoodEmoji(todayEntries[0].mood) : getMoodEmoji(currentMood)}
            </div>
          </div>
        </Card>

              {/* Today's Entry Status */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Journal Status</p>
            <p className="text-2xl font-bold">
              {todayEntries.length > 0 ? `${todayEntries.length} Entry${todayEntries.length > 1 ? 's' : ''}` : "Not Started"}
            </p>
            <p className="text-sm text-muted-foreground">
              {todayEntries.length > 0 ? `${todayEntries.length} reflection${todayEntries.length > 1 ? 's' : ''} today` : "No entries yet"}
            </p>
          </div>
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <PenTool className="w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Sentiment Analysis */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Today's Sentiment</p>
            <p className={`text-2xl font-bold ${getSentimentColor(getTodayAverageSentiment())}`}>
              {getSentimentDescription(getTodayAverageSentiment())}
            </p>
            <p className="text-sm text-muted-foreground">
              {getSentimentInsight()}
            </p>
            {todayEntries.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                Trend: {getSentimentTrend()} • Based on {todayEntries.length} entries
              </p>
            )}
          </div>
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <Brain className="w-6 h-6" />
          </div>
        </div>
      </Card>
      </div>

      {/* Today's Entries */}
      <Card className="p-6 border-0 shadow-medium">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-serif font-semibold">Today's Reflections</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            {todayEntries.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllEntries(!showAllEntries)}
              >
                {showAllEntries ? "Show Latest" : `Show All (${todayEntries.length})`}
              </Button>
            )}
          </div>
        </div>

        {todayEntries.length > 0 ? (
          <div className="space-y-6">
            {(showAllEntries ? todayEntries : [todayEntries[0]]).map((entry, index) => (
              <div key={entry.id} className="space-y-4 p-4 bg-muted/20 rounded-lg border">
                {isEditing && editingEntryId === entry.id ? (
                  // Edit Form
                  <div className="space-y-4">
                    {/* Mood Slider */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Heart className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Current Mood
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {editMood[0]}/10 - How are you feeling right now?
                          </p>
                        </div>
                      </div>
                      <Slider
                        value={editMood}
                        onValueChange={setEditMood}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>1 (Low)</span>
                        <span>10 (High)</span>
                      </div>
                    </div>

                    {/* Edit Textarea */}
                    <Textarea
                      placeholder="Edit your thoughts..."
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[200px] resize-none border-0 bg-background/80 backdrop-blur-sm focus:bg-background transition-all duration-300 text-base leading-relaxed font-serif"
                    />

                    {/* Edit Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {editContent.length} characters • Your thoughts are private and secure
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        
                        <Button 
                          onClick={handleSaveEdit}
                          disabled={!editContent.trim()}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    {/* Entry Content */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-foreground leading-relaxed">{entry.content}</p>
                    </div>

                    {/* Entry Metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>Mood: {entry.mood}/10</span>
                      </div>
                      {todayEntries.length > 1 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Entry #{todayEntries.length - index}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Sentiment */}
                    {entry.sentiment && (
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground">
                          Sentiment: {getSentimentDescription(entry.sentiment.score)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(entry.sentiment.score)} bg-opacity-10`}>
                          {entry.sentiment.confidence ? `${(entry.sentiment.confidence * 100).toFixed(0)}%` : 'N/A'}
                        </span>
                      </div>
                    )}

                    {/* Themes */}
                    {entry.themes && entry.themes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.themes.map((theme, themeIndex) => (
                          <Badge key={themeIndex} variant="outline" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      onClick={() => handleEditEntry(entry.id)}
                      className="mt-4"
                    >
                      <PenTool className="w-4 h-4 mr-2" />
                      Edit Entry
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <YingYangSymbol size="lg" className="mx-auto opacity-50" />
            </div>
            <h4 className="text-lg font-medium mb-2">No entries yet today</h4>
            <p className="text-muted-foreground mb-6">
              Take a moment to reflect on your day and capture your thoughts
            </p>
            <Button 
              onClick={() => {
                onNavigateToJournal?.();
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Start Today's Entry
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 border-0 shadow-medium">
        <h3 className="text-xl font-serif font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => {
              onNavigateToJournal?.();
            }}
          >
            <PenTool className="w-5 h-5" />
            <span>Write Entry</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => {
              onNavigateToTherapist?.();
            }}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat with AI</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => {
              onNavigateToInsights?.();
            }}
          >
            <Activity className="w-5 h-5" />
            <span>View Insights</span>
          </Button>
        </div>
      </Card>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ConsistencySettings onClose={() => setShowSettings(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
