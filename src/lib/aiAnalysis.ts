import { pipeline } from '@huggingface/transformers';
import { ConsistencyManager } from './consistencyManager';

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
      let score = isPositive ? confidence : -confidence;
      
      // Apply consistency-based enhancement
      score = this.enhanceWithConsistencyData(score, text);
      
      // More sensitive threshold for negative content
      const threshold = 0.4; // Lower threshold to catch more negative content
      
      return {
        score,
        label: confidence > threshold ? (isPositive ? 'positive' : 'negative') : 'neutral',
        confidence
      };
    } catch (error) {
      console.warn('Sentiment analysis failed:', error);
      return { score: 0, label: 'neutral', confidence: 0 };
    }
  }

  private static enhanceWithConsistencyData(baseScore: number, text: string): number {
    const mlData = ConsistencyManager.getMLEnhancementData();
    const { userProfile, patterns, recommendations } = mlData;

    let enhancedScore = baseScore;

    // Adjust based on user's consistency level
    switch (userProfile.consistencyLevel) {
      case 'expert':
        // Expert users get more nuanced analysis
        enhancedScore *= 1.1;
        break;
      case 'advanced':
        // Advanced users get slightly enhanced analysis
        enhancedScore *= 1.05;
        break;
      case 'intermediate':
        // Intermediate users get standard analysis
        break;
      case 'beginner':
        // Beginner users get simplified analysis
        enhancedScore *= 0.95;
        break;
    }

    // Adjust based on content length pattern
    if (patterns.contentLength === 'long') {
      // Longer entries get more weight
      enhancedScore *= 1.05;
    } else if (patterns.contentLength === 'short') {
      // Shorter entries get less weight
      enhancedScore *= 0.95;
    }

    // Adjust based on sentiment trend
    if (patterns.sentimentTrend === 'positive') {
      // If user has been positive lately, slightly boost positive scores
      enhancedScore *= 1.02;
    } else if (patterns.sentimentTrend === 'negative') {
      // If user has been negative lately, slightly boost negative scores
      enhancedScore *= 1.02;
    }

    // Ensure score stays within bounds
    return Math.max(-1, Math.min(1, enhancedScore));
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

  static getPersonalizedPrompt(): string {
    const mlData = ConsistencyManager.getMLEnhancementData();
    const { userProfile, patterns, recommendations } = mlData;

    const prompts = {
      encouraging: [
        "How are you feeling today? What thoughts are flowing through your mind?",
        "Take a moment to reflect on your day. What stood out to you?",
        "What's on your heart today? Share whatever feels right."
      ],
      supportive: [
        "You're building a great habit. How has your day been?",
        "Your consistency is growing. What would you like to reflect on today?",
        "You're making progress. What's been meaningful to you today?"
      ],
      challenging: [
        "What deeper insights can you discover about yourself today?",
        "Challenge yourself to explore something new in your reflection.",
        "What patterns are you noticing in your thoughts and feelings?"
      ],
      reflective: [
        "What wisdom have you gained from your experiences today?",
        "How are you evolving through your daily practice?",
        "What deeper understanding are you developing about yourself?"
      ]
    };

    const promptStyle = recommendations.promptStyle as keyof typeof prompts;
    const stylePrompts = prompts[promptStyle] || prompts.encouraging;
    
    // Add time-based personalization
    const hour = new Date().getHours();
    let timeContext = '';
    if (hour < 12) timeContext = ' (morning reflection)';
    else if (hour < 17) timeContext = ' (afternoon check-in)';
    else timeContext = ' (evening reflection)';

    const randomPrompt = stylePrompts[Math.floor(Math.random() * stylePrompts.length)];
    return randomPrompt + timeContext;
  }

  static getConsistencyInsights(): {
    message: string;
    suggestion: string;
    motivation: string;
  } {
    const insights = ConsistencyManager.getConsistencyInsights();
    const mlData = ConsistencyManager.getMLEnhancementData();

    return {
      message: insights.recommendation,
      suggestion: `Based on your ${mlData.userProfile.consistencyLevel} level, try ${mlData.recommendations.promptStyle} prompts.`,
      motivation: insights.motivation
    };
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