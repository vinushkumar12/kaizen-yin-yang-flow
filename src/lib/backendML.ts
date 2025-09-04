import { pipeline, AutoTokenizer, AutoModelForSequenceClassification } from '@huggingface/transformers';
import { HfInference } from '@huggingface/inference';

// Backend ML service using Hugging Face models
export class BackendMLService {
  private static instance: BackendMLService;
  private hf: HfInference;
  private models: {
    sentiment?: any;
    emotion?: any;
    summarization?: any;
    textGeneration?: any;
  } = {};

  private constructor() {
    // Initialize Hugging Face inference
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  static getInstance(): BackendMLService {
    if (!BackendMLService.instance) {
      BackendMLService.instance = new BackendMLService();
    }
    return BackendMLService.instance;
  }

  // Enhanced sentiment analysis with emotion detection
  async analyzeSentimentAndEmotion(text: string): Promise<{
    sentiment: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
      confidence: number;
    };
    emotions: {
      joy: number;
      sadness: number;
      anger: number;
      fear: number;
      surprise: number;
      disgust: number;
    };
    dominantEmotion: string;
  }> {
    try {
      // Use a more sophisticated sentiment analysis model
      const sentimentResult = await this.hf.textClassification({
        model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        inputs: text,
      });

      // Use emotion classification model
      const emotionResult = await this.hf.textClassification({
        model: 'j-hartmann/emotion-english-distilroberta-base',
        inputs: text,
      });

      const sentiment = sentimentResult[0];
      const emotions = emotionResult[0];

      // Map emotion labels to our format
      const emotionMap = {
        'joy': emotions.find((e: any) => e.label === 'joy')?.score || 0,
        'sadness': emotions.find((e: any) => e.label === 'sadness')?.score || 0,
        'anger': emotions.find((e: any) => e.label === 'anger')?.score || 0,
        'fear': emotions.find((e: any) => e.label === 'fear')?.score || 0,
        'surprise': emotions.find((e: any) => e.label === 'surprise')?.score || 0,
        'disgust': emotions.find((e: any) => e.label === 'disgust')?.score || 0,
      };

      const dominantEmotion = Object.entries(emotionMap).reduce((a, b) => 
        emotionMap[a[0] as keyof typeof emotionMap] > emotionMap[b[0] as keyof typeof emotionMap] ? a : b
      )[0];

      return {
        sentiment: {
          score: sentiment.label === 'POSITIVE' ? sentiment.score : -sentiment.score,
          label: sentiment.score > 0.6 ? 'positive' : sentiment.score < 0.4 ? 'negative' : 'neutral',
          confidence: sentiment.score
        },
        emotions: emotionMap,
        dominantEmotion
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        sentiment: { score: 0, label: 'neutral', confidence: 0 },
        emotions: { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, disgust: 0 },
        dominantEmotion: 'neutral'
      };
    }
  }

  // Advanced theme extraction using zero-shot classification
  async extractAdvancedThemes(text: string): Promise<{
    themes: string[];
    confidence: number[];
    categories: {
      work: number;
      relationships: number;
      health: number;
      personal: number;
      creativity: number;
      spirituality: number;
    };
  }> {
    const themeCandidates = [
      'work stress', 'career growth', 'workplace relationships',
      'family', 'romantic relationships', 'friendships', 'social interactions',
      'physical health', 'mental health', 'fitness', 'diet', 'sleep',
      'personal growth', 'self-improvement', 'learning', 'goals',
      'creativity', 'art', 'music', 'writing', 'hobbies',
      'spirituality', 'meditation', 'mindfulness', 'religion'
    ];

    try {
      const result = await this.hf.zeroShotClassification({
        model: 'facebook/bart-large-mnli',
        inputs: text,
        parameters: {
          candidate_labels: themeCandidates,
          hypothesis_template: 'This text is about {}'
        }
      });

      const themes = result.labels.slice(0, 5); // Top 5 themes
      const confidence = result.scores.slice(0, 5);

      // Categorize themes
      const categories = {
        work: 0,
        relationships: 0,
        health: 0,
        personal: 0,
        creativity: 0,
        spirituality: 0
      };

      themes.forEach((theme, index) => {
        if (theme.includes('work') || theme.includes('career')) categories.work += confidence[index];
        else if (theme.includes('relationship') || theme.includes('family') || theme.includes('friend')) categories.relationships += confidence[index];
        else if (theme.includes('health') || theme.includes('fitness') || theme.includes('diet')) categories.health += confidence[index];
        else if (theme.includes('growth') || theme.includes('learning') || theme.includes('goal')) categories.personal += confidence[index];
        else if (theme.includes('creativity') || theme.includes('art') || theme.includes('hobby')) categories.creativity += confidence[index];
        else if (theme.includes('spirituality') || theme.includes('meditation') || theme.includes('mindfulness')) categories.spirituality += confidence[index];
      });

      return { themes, confidence, categories };
    } catch (error) {
      console.error('Theme extraction error:', error);
      return {
        themes: [],
        confidence: [],
        categories: { work: 0, relationships: 0, health: 0, personal: 0, creativity: 0, spirituality: 0 }
      };
    }
  }

  // Generate personalized journaling prompts
  async generatePersonalizedPrompt(
    recentEntries: string[],
    currentMood: number,
    userGoals: string[],
    dominantEmotion: string
  ): Promise<{
    prompt: string;
    reasoning: string;
    category: string;
  }> {
    try {
      const context = `
        User's recent mood: ${currentMood}/10
        Dominant emotion: ${dominantEmotion}
        User goals: ${userGoals.join(', ')}
        Recent entries: ${recentEntries.slice(-3).join(' ')}
      `;

      const promptTemplates = {
        positive: [
          "What made today particularly wonderful? How can you build on this positive energy?",
          "What are you grateful for right now? How does this gratitude feel in your body?",
          "What accomplishment are you proud of today? How did it make you feel?"
        ],
        neutral: [
          "How are you feeling in this moment? What thoughts are present?",
          "What would bring you more peace or joy right now?",
          "What small step could improve your day?"
        ],
        negative: [
          "What's weighing on your heart today? How can you show yourself compassion?",
          "What support do you need in this moment? How can you ask for it?",
          "What would help you feel more grounded and centered?"
        ]
      };

      let category = 'neutral';
      if (currentMood >= 7) category = 'positive';
      else if (currentMood <= 4) category = 'negative';

      const templates = promptTemplates[category as keyof typeof promptTemplates];
      const prompt = templates[Math.floor(Math.random() * templates.length)];

      const reasoning = `Generated based on your current mood (${currentMood}/10) and ${dominantEmotion} emotional state.`;

      return { prompt, reasoning, category };
    } catch (error) {
      console.error('Prompt generation error:', error);
      return {
        prompt: "How are you feeling today? What thoughts are flowing through your mind?",
        reasoning: "Default prompt due to generation error",
        category: "neutral"
      };
    }
  }

  // Analyze writing patterns and provide insights
  async analyzeWritingPatterns(entries: Array<{ content: string; timestamp: Date; mood: number }>): Promise<{
    patterns: {
      wordCount: number;
      complexity: number;
      positivity: number;
      consistency: number;
    };
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const analysis = {
        patterns: {
          wordCount: 0,
          complexity: 0,
          positivity: 0,
          consistency: 0
        },
        insights: [] as string[],
        recommendations: [] as string[]
      };

      if (entries.length === 0) return analysis;

      // Calculate average word count
      const wordCounts = entries.map(entry => entry.content.split(' ').length);
      analysis.patterns.wordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;

      // Analyze mood consistency
      const moods = entries.map(entry => entry.mood);
      const moodVariance = this.calculateVariance(moods);
      analysis.patterns.consistency = 1 - (moodVariance / 100); // Higher consistency = lower variance

      // Generate insights
      if (analysis.patterns.wordCount < 50) {
        analysis.insights.push("You tend to write shorter entries. Consider exploring your thoughts more deeply.");
        analysis.recommendations.push("Try setting aside more time for reflection or using prompts to expand your thoughts.");
      }

      if (analysis.patterns.consistency < 0.5) {
        analysis.insights.push("Your mood shows significant variation, which is normal and healthy.");
        analysis.recommendations.push("Consider tracking what influences your mood changes to better understand your patterns.");
      }

      if (analysis.patterns.consistency > 0.8) {
        analysis.insights.push("Your mood is quite stable, showing emotional resilience.");
        analysis.recommendations.push("This stability can be a foundation for setting and achieving long-term goals.");
      }

      return analysis;
    } catch (error) {
      console.error('Pattern analysis error:', error);
      return {
        patterns: { wordCount: 0, complexity: 0, positivity: 0, consistency: 0 },
        insights: [],
        recommendations: []
      };
    }
  }

  // Generate weekly/monthly summaries
  async generateSummary(entries: Array<{ content: string; timestamp: Date; mood: number; themes: string[] }>): Promise<{
    summary: string;
    highlights: string[];
    trends: string[];
    nextSteps: string[];
  }> {
    try {
      const recentEntries = entries.slice(-7); // Last 7 entries
      const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
      
      const allThemes = recentEntries.flatMap(entry => entry.themes || []);
      const themeFrequency = this.countFrequency(allThemes);
      const topThemes = Object.entries(themeFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([theme]) => theme);

      const summary = `This week, your average mood was ${avgMood.toFixed(1)}/10. You've been focusing on ${topThemes.join(', ')}.`;

      const highlights = [
        `Your most positive day had a mood score of ${Math.max(...recentEntries.map(e => e.mood))}/10`,
        `You journaled ${recentEntries.length} times this week`,
        `Your most common themes were: ${topThemes.join(', ')}`
      ];

      const trends = [];
      if (avgMood > 7) trends.push("You've been experiencing positive emotions consistently");
      if (avgMood < 5) trends.push("You've been going through some challenging times");
      if (recentEntries.length >= 5) trends.push("You're maintaining a regular journaling practice");

      const nextSteps = [
        "Continue your regular journaling practice",
        "Consider exploring new themes or topics",
        "Reflect on what's contributing to your current emotional state"
      ];

      return { summary, highlights, trends, nextSteps };
    } catch (error) {
      console.error('Summary generation error:', error);
      return {
        summary: "Unable to generate summary at this time.",
        highlights: [],
        trends: [],
        nextSteps: []
      };
    }
  }

  // Helper methods
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private countFrequency(items: string[]): Record<string, number> {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}
