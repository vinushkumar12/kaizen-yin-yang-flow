import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Heart, Brain } from "lucide-react";
import { YingYangSymbol } from "./YingYangSymbol";

interface JournalEntryProps {
  onSave?: (entry: string) => void;
  aiPrompt?: string;
}

export const JournalEntry = ({ 
  onSave,
  aiPrompt = "How are you feeling today? What thoughts are flowing through your mind?"
}: JournalEntryProps) => {
  const [entry, setEntry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSave = async () => {
    if (!entry.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      onSave?.(entry);
      setIsAnalyzing(false);
      setEntry("");
    }, 2000);
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Card className="p-6 shadow-medium border-0 bg-gradient-flow">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <YingYangSymbol size="sm" animate={isAnalyzing} />
            <div>
              <h2 className="text-xl font-serif font-medium text-foreground">
                Today's Reflection
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                <span>{today}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Private
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              AI Guided
            </Badge>
          </div>
        </div>

        {/* AI Prompt */}
        <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Gentle Prompt
              </p>
              <p className="text-sm text-muted-foreground italic">
                {aiPrompt}
              </p>
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-3">
          <Textarea
            placeholder="Let your thoughts flow freely here..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="min-h-[200px] resize-none border-0 bg-background/80 backdrop-blur-sm focus:bg-background transition-all duration-300 text-base leading-relaxed font-serif"
            disabled={isAnalyzing}
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {entry.length} characters • Your thoughts are private and secure
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={!entry.trim() || isAnalyzing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <YingYangSymbol size="sm" animate />
                  <span>Reflecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Save & Analyze</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};