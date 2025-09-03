import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { YingYangSymbol } from "@/components/YingYangSymbol";
import { JournalEntry } from "@/components/JournalEntry";
import { FloatingDots } from "@/components/ui/floating-elements";
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  Shield, 
  Sparkles,
  Calendar,
  BarChart3,
  Lock
} from "lucide-react";

const Index = () => {
  const [savedEntries, setSavedEntries] = useState(0);

  const handleSaveEntry = (entry: string) => {
    setSavedEntries(prev => prev + 1);
    // Here you would typically save to a database
    console.log("Entry saved:", entry);
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingDots count={8} />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <YingYangSymbol size="xl" animate className="drop-shadow-lg" />
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
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm">
                <Calendar className="w-4 h-4" />
                <span>{savedEntries} reflections saved</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Journal Entry Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <JournalEntry onSave={handleSaveEntry} aiPrompt={currentPrompt} />
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium shadow-medium hover:shadow-strong transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Your Practice Today
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
};

export default Index;