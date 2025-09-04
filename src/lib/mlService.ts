// Frontend service to communicate with the ML backend
export class MLService {
  private static baseURL = process.env.REACT_APP_ML_BACKEND_URL || 'http://localhost:3001';

  // Enhanced sentiment and emotion analysis
  static async analyzeSentimentAndEmotion(text: string) {
    try {
      const response = await fetch(`${this.baseURL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw error;
    }
  }

  // Advanced theme extraction
  static async extractAdvancedThemes(text: string) {
    try {
      const response = await fetch(`${this.baseURL}/api/themes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Theme extraction error:', error);
      throw error;
    }
  }

  // Generate personalized prompts
  static async generatePersonalizedPrompt(
    recentEntries: string[],
    currentMood: number,
    userGoals: string[],
    dominantEmotion: string
  ) {
    try {
      const response = await fetch(`${this.baseURL}/api/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recentEntries,
          currentMood,
          userGoals,
          dominantEmotion,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Prompt generation error:', error);
      throw error;
    }
  }

  // Analyze writing patterns
  static async analyzeWritingPatterns(entries: Array<{ content: string; timestamp: Date; mood: number }>) {
    try {
      const response = await fetch(`${this.baseURL}/api/patterns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Pattern analysis error:', error);
      throw error;
    }
  }

  // Generate summaries
  static async generateSummary(entries: Array<{ content: string; timestamp: Date; mood: number; themes: string[] }>) {
    try {
      const response = await fetch(`${this.baseURL}/api/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Summary generation error:', error);
      throw error;
    }
  }

  // Batch analysis for multiple entries
  static async batchAnalyze(entries: Array<{ id: string; content: string }>) {
    try {
      const response = await fetch(`${this.baseURL}/api/batch-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Batch analysis error:', error);
      throw error;
    }
  }

  // Health check
  static async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
}
