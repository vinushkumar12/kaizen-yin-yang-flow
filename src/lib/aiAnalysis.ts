import { pipeline } from '@huggingface/transformers';

// On-device AI analysis using Hugging Face Transformers.js
export class AIAnalyzer {
  private static sentimentPipeline: any = null;
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing on-device AI models...');
      
      // Load lightweight sentiment analysis model
      this.sentimentPipeline = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      
      this.initialized = true;
      console.log('AI models loaded successfully');
    } catch (error) {
      console.warn('Failed to load AI models:', error);
    }
  }

  static async analyzeSentiment(text: string): Promise<{
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }> {
    if (!this.initialized || !this.sentimentPipeline) {
      await this.initialize();
    }

    try {
      const result = await this.sentimentPipeline(text);
      const sentiment = result[0];
      
      // Convert to our format
      const isPositive = sentiment.label === 'POSITIVE';
      const confidence = sentiment.score;
      
      // Convert to -1 to 1 scale
      const score = isPositive ? confidence : -confidence;
      
      return {
        score,
        label: confidence > 0.6 ? (isPositive ? 'positive' : 'negative') : 'neutral',
        confidence
      };
    } catch (error) {
      console.warn('Sentiment analysis failed:', error);
      return { score: 0, label: 'neutral', confidence: 0 };
    }
  }

  static extractThemes(text: string): string[] {
    const themes = [];
    const lowerText = text.toLowerCase();

    // Basic theme detection using keywords
    const themePatterns = {
      'work stress': ['work', 'job', 'boss', 'deadline', 'meeting', 'project', 'office', 'stress', 'burnout'],
      'family relationships': ['family', 'mom', 'dad', 'parent', 'child', 'sibling', 'brother', 'sister', 'relative'],
      'romantic relationships': ['partner', 'boyfriend', 'girlfriend', 'husband', 'wife', 'relationship', 'love', 'romance'],
      'health': ['health', 'doctor', 'medicine', 'sick', 'pain', 'exercise', 'diet', 'sleep'],
      'anxiety': ['anxious', 'anxiety', 'worry', 'nervous', 'panic', 'fear', 'scared'],
      'depression': ['depressed', 'sad', 'down', 'empty', 'hopeless', 'lonely'],
      'personal growth': ['growth', 'learn', 'improve', 'develop', 'change', 'progress', 'goal'],
      'social interactions': ['friends', 'social', 'party', 'gathering', 'conversation', 'people'],
      'finances': ['money', 'financial', 'budget', 'bills', 'debt', 'savings', 'income'],
      'creativity': ['create', 'art', 'music', 'write', 'creative', 'inspiration', 'project']
    };

    for (const [theme, keywords] of Object.entries(themePatterns)) {
      const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (matchCount >= 1) {
        themes.push(theme);
      }
    }

    return themes;
  }

  static suggestPrompt(recentEntries: string[], currentMood?: number): string {
    const prompts = {
      positive: [
        "What brought you the most joy today?",
        "What are you feeling grateful for right now?",
        "How can you build on this positive momentum?",
        "What accomplishment are you proud of today?"
      ],
      neutral: [
        "How are you feeling in this moment?",
        "What's occupying your thoughts today?",
        "What would bring you more peace right now?",
        "What small step could improve your day?"
      ],
      negative: [
        "What's weighing on your heart today?",
        "How can you show yourself compassion right now?",
        "What support do you need in this moment?",
        "What would help you feel more grounded?"
      ]
    };

    let category: 'positive' | 'neutral' | 'negative' = 'neutral';
    
    if (currentMood !== undefined) {
      if (currentMood >= 7) category = 'positive';
      else if (currentMood <= 4) category = 'negative';
    }

    const categoryPrompts = prompts[category];
    return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
  }
}