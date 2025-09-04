import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Brain,
  Heart,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  Tag
} from "lucide-react";
import { YingYangSymbol } from "./YingYangSymbol";
import { LocalStorage, JournalEntry } from "@/lib/storage";
import { AIAnalyzer } from "@/lib/aiAnalysis";

export const Dashboard = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [emotionalTrends, setEmotionalTrends] = useState<any[]>([]);
  const [themeData, setThemeData] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setIsAnalyzing(true);
    
    try {
      // Load and analyze entries
      const allEntries = LocalStorage.getJournalEntries();
      setEntries(allEntries);

      // Analyze entries that don't have sentiment data
      await analyzeUnprocessedEntries(allEntries);

      // Load trends
      const trends = LocalStorage.getEmotionalTrends(parseInt(timeRange));
      setEmotionalTrends(trends);

      // Load theme data
      const themes = LocalStorage.getThemeFrequency();
      const themeChartData = themes.slice(0, 8).map((theme, index) => ({
        ...theme,
        color: `hsl(${(index * 45) % 360}, 70%, 50%)`
      }));
      setThemeData(themeChartData);

    } catch (error) {
      console.error('Dashboard data loading error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeUnprocessedEntries = async (entries: JournalEntry[]) => {
    const unprocessed = entries.filter(entry => !entry.sentiment || !entry.themes);
    
    if (unprocessed.length === 0) return;

    await AIAnalyzer.initialize();

    for (const entry of unprocessed) {
      try {
        const updates: Partial<JournalEntry> = {};

        if (!entry.sentiment) {
          updates.sentiment = await AIAnalyzer.analyzeSentiment(entry.content);
        }

        if (!entry.themes) {
          updates.themes = AIAnalyzer.extractThemes(entry.content);
        }

        if (Object.keys(updates).length > 0) {
          LocalStorage.updateJournalEntry(entry.id, updates);
        }
      } catch (error) {
        console.warn(`Failed to analyze entry ${entry.id}:`, error);
      }
    }
  };

  const getAverageSentiment = () => {
    const sentiments = entries
      .filter(entry => entry.sentiment)
      .map(entry => entry.sentiment!.score);
    
    if (sentiments.length === 0) return 0;
    return sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
  };

  const getAverageMood = () => {
    const moods = entries
      .filter(entry => entry.mood)
      .map(entry => entry.mood!);
    
    if (moods.length === 0) return 0;
    return moods.reduce((a, b) => a + b, 0) / moods.length;
  };

  const getSentimentTrend = () => {
    if (emotionalTrends.length < 2) return 0;
    
    const recent = emotionalTrends.slice(-7).filter(d => d.sentiment !== 0);
    const older = emotionalTrends.slice(-14, -7).filter(d => d.sentiment !== 0);
    
    if (recent.length === 0 || older.length === 0) return 0;
    
    const recentAvg = recent.reduce((a, b) => a + b.sentiment, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b.sentiment, 0) / older.length;
    
    return recentAvg - olderAvg;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const sentimentTrend = getSentimentTrend();
  const avgSentiment = getAverageSentiment();
  const avgMood = getAverageMood();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <YingYangSymbol size="md" animate={isAnalyzing} />
          <h2 className="text-3xl font-serif font-bold">Emotional Insights</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Your personal growth patterns analyzed with complete privacy
        </p>
        
        <div className="flex justify-center gap-2">
          {['7', '30', '90'].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(days as '7' | '30' | '90')}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Sentiment</p>
              <p className="text-2xl font-bold">
                {avgSentiment > 0 ? '+' : ''}{(avgSentiment * 100).toFixed(0)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${avgSentiment >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            {sentimentTrend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : sentimentTrend < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            ) : null}
            <span className="text-muted-foreground">
              {sentimentTrend > 0 ? 'Improving' : sentimentTrend < 0 ? 'Declining' : 'Stable'}
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Mood</p>
              <p className="text-2xl font-bold">{avgMood.toFixed(1)}/10</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Brain className="w-6 h-6" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {entries.filter(e => e.mood).length} mood entries
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/15 to-accent/5 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Entries</p>
              <p className="text-2xl font-bold">{entries.length}</p>
            </div>
            <div className="p-3 rounded-full bg-accent/10 text-accent">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            {entries.filter(e => e.timestamp > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Emotional Trends
          </TabsTrigger>
          <TabsTrigger value="themes" className="flex items-center gap-2">
            <PieIcon className="w-4 h-4" />
            Recurring Themes
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card className="p-6 border-0 shadow-medium">
            <h3 className="text-lg font-serif font-semibold mb-4">
              Emotional Journey Over Time
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={emotionalTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="sentiment"
                    domain={[-1, 1]}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="mood"
                    orientation="right"
                    domain={[1, 10]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value: number, name: string) => [
                      name === 'sentiment' ? `${(value * 100).toFixed(0)}%` : value.toFixed(1),
                      name === 'sentiment' ? 'Sentiment' : 'Mood'
                    ]}
                  />
                  <Area 
                    yAxisId="sentiment"
                    type="monotone" 
                    dataKey="sentiment" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  {emotionalTrends.some(d => d.mood !== null) && (
                    <Line 
                      yAxisId="mood"
                      type="monotone" 
                      dataKey="mood" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="themes">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-medium">
              <h3 className="text-lg font-serif font-semibold mb-4">
                Theme Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={themeData}
                      dataKey="count"
                      nameKey="theme"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                    >
                      {themeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-medium">
              <h3 className="text-lg font-serif font-semibold mb-4">
                Top Themes
              </h3>
              <div className="space-y-3">
                {themeData.slice(0, 6).map((theme, index) => (
                  <div key={theme.theme} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: theme.color, color: theme.color }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {theme.theme}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{theme.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns">
          <Card className="p-6 border-0 shadow-medium">
            <h3 className="text-lg font-serif font-semibold mb-4">
              Daily Entry Patterns
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionalTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Bar 
                    dataKey="entryCount" 
                    fill="hsl(var(--primary))" 
                    opacity={0.7}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{entries.length}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">
                  {(entries.length / parseInt(timeRange)).toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Avg/Day</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {Math.max(...emotionalTrends.map(d => d.entryCount))}
                </p>
                <p className="text-sm text-muted-foreground">Best Day</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">
                  {new Set(entries.flatMap(e => e.themes || [])).size}
                </p>
                <p className="text-sm text-muted-foreground">Unique Themes</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {isAnalyzing && (
        <Card className="p-4 border-0 bg-muted/30">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <YingYangSymbol size="sm" />
            <span>Analyzing your entries with on-device AI...</span>
          </div>
        </Card>
      )}
    </div>
  );
};