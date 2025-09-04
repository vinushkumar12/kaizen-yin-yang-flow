import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { YingYangSymbol } from "@/components/YingYangSymbol";
import { JournalEntry } from "@/components/JournalEntry";
import { TherapistChat } from "@/components/TherapistChat";
import { Dashboard } from "@/components/Dashboard";
import { Today } from "@/components/Today";
import { FloatingDots } from "@/components/ui/floating-elements";
import { LocalStorage } from "@/lib/storage";
import { ConsistencyManager } from "@/lib/consistencyManager";
import { AIAnalyzer } from "@/lib/aiAnalysis";
import { AuthManager } from "@/lib/auth";
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Shield, 
  Sparkles,
  Calendar,
  BarChart3,
  Lock,
  MessageCircle,
  PenTool,
  Activity,
  ArrowRight,
  Play,
  Sun,
  Clock,
  Users,
  LogOut
} from "lucide-react";

interface IndexProps {
  onLogout: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  const [savedEntries, setSavedEntries] = useState(0);
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [showMainApp, setShowMainApp] = useState(true); // Changed to true to show main app immediately
  const [activeTab, setActiveTab] = useState("today");
  const [lastResetDate, setLastResetDate] = useState<string>("");

  // Load data on component mount
  useEffect(() => {
    // Check for daily reset
    checkDailyReset();
  }, []);

  // Check if we need to reset for a new day
  const checkDailyReset = () => {
    const today = new Date().toDateString();
    const storedLastReset = localStorage.getItem('kaizen_last_reset_date');
    
    if (storedLastReset !== today) {
      // New day - reset the entry counter
      setSavedEntries(0);
      setLastResetDate(today);
      localStorage.setItem('kaizen_last_reset_date', today);
      
      // Dispatch event to notify components of daily reset
      window.dispatchEvent(new CustomEvent('dailyReset'));
    } else {
      setLastResetDate(storedLastReset);
      // Load today's entry count
      const todayEntries = LocalStorage.getTodayEntries();
      setSavedEntries(todayEntries.length);
    }
  };

  const handleSaveEntry = async (entry: string, mood?: number) => {
    // Increment the entry counter
    setSavedEntries(prev => prev + 1);
    
    // Update consistency tracking
    ConsistencyManager.updateOnNewEntry();
    
    // Save to local storage with AI analysis
    const journalEntry = {
      id: Date.now().toString(),
      content: entry,
      timestamp: new Date(),
      mood: mood || currentMood,
      aiPrompt: currentPrompt
    };

    // Analyze and save
    try {
      await AIAnalyzer.initialize();
      const sentiment = await AIAnalyzer.analyzeSentiment(entry);
      const themes = AIAnalyzer.extractThemes(entry);
      
      LocalStorage.saveJournalEntry({
        ...journalEntry,
        sentiment,
        themes
      });

      // Dispatch custom event to notify Today component
      window.dispatchEvent(new CustomEvent('entrySaved'));
    } catch (error) {
      console.warn('Analysis failed:', error);
      LocalStorage.saveJournalEntry(journalEntry);
      
      // Still dispatch event even if analysis fails
      window.dispatchEvent(new CustomEvent('entrySaved'));
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Empathetic AI Guidance",
      description: "Thoughtful, context-aware prompts that adapt to your emotional state and recent entries.",
      gradient: "from-primary/10 to-accent/10"
    },
    {
      icon: BarChart3,
      title: "Private Sentiment Analysis",
      description: "Discover patterns in your emotions and thoughts with completely private, on-device analysis.",
      gradient: "from-accent/10 to-primary/10"
    },
    {
      icon: Sparkles,
      title: "Insightful Reflections",
      description: "Weekly summaries that help you connect the dots in your personal growth journey.",
      gradient: "from-primary/15 to-accent/5"
    },
    {
      icon: Shield,
      title: "Complete Privacy",
      description: "Your thoughts stay yours. All analysis happens on your device with end-to-end encryption.",
      gradient: "from-accent/5 to-primary/15"
    }
  ];

  const aiPrompts = [
    "How are you feeling today? What thoughts are flowing through your mind?",
    "What moment today brought you the most peace or joy?",
    "What challenges are you facing, and how might you approach them with balance?",
    "What are you grateful for in this moment?",
    "How did you grow or learn something new today?"
  ];

  const currentPrompt = aiPrompts[Math.floor(Math.random() * aiPrompts.length)];

  const handleStartPractice = () => {
    setShowMainApp(true);
    // Smooth scroll to main app section
    setTimeout(() => {
      document.getElementById('main-app')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleNavigateToJournal = () => {
    setActiveTab("journal");
  };

  const handleNavigateToTherapist = () => {
    setActiveTab("chat");
  };

  const handleNavigateToInsights = () => {
    setActiveTab("insights");
  };

  const handleLogout = () => {
    AuthManager.logout();
    onLogout();
  };

  // If user hasn't started practice yet, show introduction
  if (!showMainApp) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <FloatingDots count={8} />
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-8">
                <YingYangSymbol size="xl" className="drop-shadow-lg" />
              </div>
              
              <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 gradient-text">
                Kaizen
              </h1>
              
              <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
                Your intelligent journaling companion for continuous self-improvement
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <Badge variant="outline" className="text-sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Empathetic AI
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Private & Secure
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Personal Growth
                </Badge>
              </div>

              {savedEntries > 0 && (
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-8">
                  <Calendar className="w-4 h-4" />
                  <span>{savedEntries} reflections saved</span>
                </div>
              )}

              <Button 
                size="lg" 
                onClick={handleStartPractice}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium shadow-medium hover:shadow-strong transition-all duration-300 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                Start Your Practice Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-flow">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Transform Your Self-Reflection
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the perfect balance of AI intelligence and human insight in your daily journaling practice.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`p-8 border-0 shadow-soft bg-gradient-to-br ${feature.gradient} hover:shadow-medium transition-all duration-500 group`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-background/80 backdrop-blur-sm group-hover:bg-background transition-colors duration-300">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-semibold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <YingYangSymbol size="md" className="mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                Begin Your Journey of Balance
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands who have discovered the power of mindful reflection with AI guidance.
              </p>
              <Button 
                size="lg" 
                onClick={handleStartPractice}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium shadow-medium hover:shadow-strong transition-all duration-300 group"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Practice Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border/50 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <YingYangSymbol size="sm" />
              <span>Kaizen - Continuous Improvement Through Reflection</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Main app section (shown after clicking "Start Your Practice Today")
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingDots count={8} />
      
      {/* Header with back button */}
      <section className="pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <YingYangSymbol size="md" />
              <h1 className="text-2xl font-serif font-bold">Kaizen</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMainApp(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Intro
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main App Section */}
      <section id="main-app" className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 mx-auto max-w-md">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Today
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Journal
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Therapist
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="max-w-4xl mx-auto">
              <Today 
                onSaveEntry={handleSaveEntry} 
                currentMood={currentMood}
                onMoodChange={setCurrentMood}
                onNavigateToJournal={handleNavigateToJournal}
                onNavigateToTherapist={handleNavigateToTherapist}
                onNavigateToInsights={handleNavigateToInsights}
              />
            </TabsContent>

            <TabsContent value="journal" className="max-w-4xl mx-auto">
              <JournalEntry 
                onSave={handleSaveEntry} 
                aiPrompt={currentPrompt}
                currentMood={currentMood}
                onMoodChange={setCurrentMood}
              />
            </TabsContent>

            <TabsContent value="chat">
              <TherapistChat onMoodChange={setCurrentMood} />
            </TabsContent>

            <TabsContent value="insights">
              <Dashboard />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;