import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Star, 
  Trophy, 
  Heart, 
  Brain, 
  Target, 
  Sparkles,
  Users,
  Activity,
  BookOpen,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Gift,
  Calendar,
  BarChart3,
  PieIcon,
  Target as TargetIcon
} from "lucide-react";

interface DemoShowcaseProps {
  onStartDemo: () => void;
}

export const DemoShowcase = ({ onStartDemo }: DemoShowcaseProps) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "AI-Powered Journaling",
      description: "Intelligent sentiment analysis and emotional tracking with contextual insights",
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      highlights: ["Real-time mood tracking", "Emotional pattern recognition", "Personalized insights"]
    },
    {
      title: "Conversational AI Therapist",
      description: "Multiple therapeutic approaches with adaptive, contextual responses",
      icon: Heart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      highlights: ["4 therapeutic tones", "Context-aware responses", "Emotional progression tracking"]
    },
    {
      title: "Wellness Task System",
      description: "Gamified wellness activities with mood-boosting rewards",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      highlights: ["Actionable suggestions", "Mood boost rewards", "Progress tracking"]
    },
    {
      title: "Comprehensive Analytics",
      description: "Deep insights into emotional patterns and personal growth",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      highlights: ["Emotional trends", "Theme analysis", "Growth metrics"]
    },
    {
      title: "Persistent Data Protection",
      description: "Multi-layer storage ensuring your data survives cache clearing",
      icon: Shield,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      highlights: ["IndexedDB backup", "Automatic recovery", "Secure storage"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-serif font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Experience Kaizen Demo
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the power of intelligent journaling with our comprehensive demo account. 
            Explore all features with pre-populated data showcasing real-world usage.
          </p>
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`p-6 border-0 shadow-strong bg-background/80 backdrop-blur-sm hover:shadow-stronger transition-all duration-300 cursor-pointer ${
                activeFeature === index ? 'ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setActiveFeature(index)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{feature.description}</p>
                  <div className="space-y-1">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Demo Data Preview */}
        <Card className="p-8 border-0 shadow-strong bg-background/80 backdrop-blur-sm mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold mb-2">Demo Data Preview</h2>
            <p className="text-muted-foreground">Your demo account will include:</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-muted-foreground">Journal Entries</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-muted-foreground">Therapy Sessions</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-muted-foreground">Wellness Tasks</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">30</div>
              <div className="text-sm text-muted-foreground">Days of Data</div>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            onClick={onStartDemo}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Demo Experience
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Demo passcode: <code className="bg-muted px-2 py-1 rounded text-primary">demo123</code>
          </p>
        </div>
      </div>
    </div>
  );
};
