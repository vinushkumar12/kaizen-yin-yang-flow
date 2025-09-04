// Consistency management for Kaizen app
export interface ConsistencyData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  averageEntriesPerDay: number;
  consistencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastEntryDate: string;
  reminderFrequency: 'daily' | 'twice_daily' | 'weekly' | 'custom';
  reminderTime: string; // HH:MM format
  reminderEnabled: boolean;
  weeklyGoal: number;
  monthlyGoal: number;
  goalProgress: {
    weekly: number;
    monthly: number;
  };
  engagementScore: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSettings {
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'custom';
  time: string; // HH:MM format
  enabled: boolean;
  customDays?: number[]; // For custom frequency
  customTimes?: string[]; // For multiple times per day
}

export class ConsistencyManager {
  private static readonly CONSISTENCY_KEY = 'kaizen_consistency_data';
  private static readonly REMINDER_KEY = 'kaizen_reminder_settings';

  // Get current account ID
  private static getCurrentAccountId(): string | null {
    return localStorage.getItem('kaizen_current_account');
  }

  // Get account-specific key
  private static getAccountKey(baseKey: string): string {
    const accountId = this.getCurrentAccountId();
    return accountId ? `${baseKey}_${accountId}` : baseKey;
  }

  // Initialize consistency data for a new user
  static initializeConsistencyData(): ConsistencyData {
    const accountId = this.getCurrentAccountId();
    if (!accountId) throw new Error('No account found');

    const defaultData: ConsistencyData = {
      userId: accountId,
      currentStreak: 0,
      longestStreak: 0,
      totalEntries: 0,
      averageEntriesPerDay: 0,
      consistencyLevel: 'beginner',
      lastEntryDate: '',
      reminderFrequency: 'daily',
      reminderTime: '09:00',
      reminderEnabled: true,
      weeklyGoal: 7,
      monthlyGoal: 30,
      goalProgress: {
        weekly: 0,
        monthly: 0
      },
      engagementScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveConsistencyData(defaultData);
    return defaultData;
  }

  // Get consistency data for current user
  static getConsistencyData(): ConsistencyData | null {
    const stored = localStorage.getItem(this.getAccountKey(this.CONSISTENCY_KEY));
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }

  // Save consistency data
  static saveConsistencyData(data: ConsistencyData): void {
    localStorage.setItem(this.getAccountKey(this.CONSISTENCY_KEY), JSON.stringify(data));
  }

  // Update consistency when new entry is added
  static updateOnNewEntry(): void {
    const data = this.getConsistencyData();
    if (!data) {
      this.initializeConsistencyData();
      return;
    }

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Update streak
    if (data.lastEntryDate === today) {
      // Already entered today, just increment total
      data.totalEntries++;
    } else if (data.lastEntryDate === yesterday) {
      // Consecutive day
      data.currentStreak++;
      data.totalEntries++;
      data.lastEntryDate = today;
    } else {
      // Break in streak
      data.currentStreak = 1;
      data.totalEntries++;
      data.lastEntryDate = today;
    }

    // Update longest streak
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    // Calculate average entries per day
    const daysSinceStart = Math.max(1, Math.ceil((Date.now() - data.createdAt.getTime()) / (24 * 60 * 60 * 1000)));
    data.averageEntriesPerDay = data.totalEntries / daysSinceStart;

    // Update consistency level
    data.consistencyLevel = this.calculateConsistencyLevel(data);

    // Update engagement score
    data.engagementScore = this.calculateEngagementScore(data);

    // Update goal progress
    data.goalProgress = this.calculateGoalProgress(data);

    data.updatedAt = new Date();
    this.saveConsistencyData(data);
  }

  // Calculate consistency level based on user data
  private static calculateConsistencyLevel(data: ConsistencyData): ConsistencyData['consistencyLevel'] {
    const { currentStreak, longestStreak, averageEntriesPerDay, totalEntries } = data;
    
    // Expert: 30+ day streak, 2+ entries per day average
    if (longestStreak >= 30 && averageEntriesPerDay >= 2) return 'expert';
    
    // Advanced: 14+ day streak, 1+ entries per day average
    if (longestStreak >= 14 && averageEntriesPerDay >= 1) return 'advanced';
    
    // Intermediate: 7+ day streak, or 50+ total entries
    if (longestStreak >= 7 || totalEntries >= 50) return 'intermediate';
    
    // Beginner: everything else
    return 'beginner';
  }

  // Calculate engagement score (0-100)
  private static calculateEngagementScore(data: ConsistencyData): number {
    const { currentStreak, longestStreak, averageEntriesPerDay, totalEntries } = data;
    
    let score = 0;
    
    // Streak contribution (40% weight)
    const streakScore = Math.min(40, (currentStreak / 30) * 40);
    score += streakScore;
    
    // Consistency contribution (30% weight)
    const consistencyScore = Math.min(30, (averageEntriesPerDay / 2) * 30);
    score += consistencyScore;
    
    // Long-term commitment (20% weight)
    const commitmentScore = Math.min(20, (totalEntries / 100) * 20);
    score += commitmentScore;
    
    // Longest streak bonus (10% weight)
    const longestStreakBonus = Math.min(10, (longestStreak / 50) * 10);
    score += longestStreakBonus;
    
    return Math.round(score);
  }

  // Calculate goal progress
  private static calculateGoalProgress(data: ConsistencyData): { weekly: number; monthly: number } {
    const today = new Date();
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get entries for current week and month
    const allEntries = JSON.parse(localStorage.getItem('kaizen_journal_entries') || '[]');
    
    const weeklyEntries = allEntries.filter(entry => 
      new Date(entry.timestamp) >= weekStart
    ).length;
    
    const monthlyEntries = allEntries.filter(entry => 
      new Date(entry.timestamp) >= monthStart
    ).length;
    
    return {
      weekly: Math.min(100, (weeklyEntries / data.weeklyGoal) * 100),
      monthly: Math.min(100, (monthlyEntries / data.monthlyGoal) * 100)
    };
  }

  // Get reminder settings
  static getReminderSettings(): ReminderSettings {
    const stored = localStorage.getItem(this.getAccountKey(this.REMINDER_KEY));
    if (!stored) {
      const defaultSettings: ReminderSettings = {
        frequency: 'daily',
        time: '09:00',
        enabled: true
      };
      this.saveReminderSettings(defaultSettings);
      return defaultSettings;
    }
    
    return JSON.parse(stored);
  }

  // Save reminder settings
  static saveReminderSettings(settings: ReminderSettings): void {
    localStorage.setItem(this.getAccountKey(this.REMINDER_KEY), JSON.stringify(settings));
  }

  // Check if reminder should be sent
  static shouldSendReminder(): boolean {
    const settings = this.getReminderSettings();
    if (!settings.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Check if it's time for reminder
    if (settings.frequency === 'daily') {
      return currentTime === settings.time;
    }
    
    if (settings.frequency === 'twice_daily') {
      const times = settings.customTimes || ['09:00', '18:00'];
      return times.includes(currentTime);
    }
    
    if (settings.frequency === 'weekly') {
      const today = now.getDay(); // 0 = Sunday
      return today === 0 && currentTime === settings.time; // Weekly on Sunday
    }
    
    if (settings.frequency === 'custom') {
      const today = now.getDay();
      const customDays = settings.customDays || [1, 3, 5]; // Mon, Wed, Fri
      return customDays.includes(today) && currentTime === settings.time;
    }
    
    return false;
  }

  // Get personalized reminder message
  static getPersonalizedReminderMessage(): string {
    const data = this.getConsistencyData();
    if (!data) return "Time for your daily reflection!";

    const { consistencyLevel, currentStreak, engagementScore } = data;
    
    const messages = {
      beginner: [
        "Ready to start your reflection journey? Take a moment to check in with yourself.",
        "Your first steps toward mindfulness await. How are you feeling today?",
        "Begin your daily practice with a gentle reflection."
      ],
      intermediate: [
        `Great job maintaining your ${currentStreak}-day streak! Keep the momentum going.`,
        "Your consistency is building. Time for today's reflection.",
        `You're on a ${currentStreak}-day streak! Don't break the chain.`
      ],
      advanced: [
        `Impressive ${currentStreak}-day streak! Your dedication is inspiring.`,
        "Your advanced practice continues. How has your day been?",
        `Maintaining excellence with ${currentStreak} days of reflection.`
      ],
      expert: [
        `Master level: ${currentStreak} days strong! Your wisdom grows daily.`,
        "Your expert practice continues. Share your insights.",
        `Legendary ${currentStreak}-day streak! Your journey inspires others.`
      ]
    };

    const levelMessages = messages[consistencyLevel];
    const randomIndex = Math.floor(Math.random() * levelMessages.length);
    return levelMessages[randomIndex];
  }

  // Get consistency insights for ML enhancement
  static getConsistencyInsights(): {
    pattern: string;
    recommendation: string;
    motivation: string;
    nextMilestone: string;
  } {
    const data = this.getConsistencyData();
    if (!data) {
      return {
        pattern: "new_user",
        recommendation: "Start with daily reflections",
        motivation: "Every journey begins with a single step",
        nextMilestone: "Complete your first entry"
      };
    }

    const { consistencyLevel, currentStreak, longestStreak, averageEntriesPerDay, engagementScore } = data;

    // Pattern analysis
    let pattern = "consistent";
    if (currentStreak === 0) pattern = "inactive";
    else if (currentStreak < 3) pattern = "starting";
    else if (currentStreak < 7) pattern = "building";
    else if (currentStreak < 14) pattern = "consistent";
    else if (currentStreak < 30) pattern = "dedicated";
    else pattern = "expert";

    // Recommendations based on level
    const recommendations = {
      beginner: "Try to write at least one entry per day",
      intermediate: "Consider adding a second daily reflection",
      advanced: "Share your insights with the community",
      expert: "Mentor others on their reflection journey"
    };

    // Motivational messages
    const motivations = {
      beginner: "You're building a powerful habit",
      intermediate: "Your consistency is creating positive change",
      advanced: "You're becoming a reflection master",
      expert: "You're inspiring others with your dedication"
    };

    // Next milestones
    const milestones = {
      beginner: currentStreak === 0 ? "Write your first entry" : `Reach ${Math.min(7, currentStreak + 3)} days`,
      intermediate: `Reach ${Math.min(14, currentStreak + 7)} days`,
      advanced: `Reach ${Math.min(30, currentStreak + 10)} days`,
      expert: `Maintain your ${currentStreak}+ day streak`
    };

    return {
      pattern,
      recommendation: recommendations[consistencyLevel],
      motivation: motivations[consistencyLevel],
      nextMilestone: milestones[consistencyLevel]
    };
  }

  // Get ML enhancement data
  static getMLEnhancementData(): {
    userProfile: {
      consistencyLevel: string;
      engagementScore: number;
      averageEntriesPerDay: number;
      currentStreak: number;
      longestStreak: number;
      totalEntries: number;
    };
    patterns: {
      entryFrequency: string;
      timeOfDay: string;
      contentLength: string;
      sentimentTrend: string;
    };
    recommendations: {
      promptStyle: string;
      reminderTiming: string;
      goalAdjustment: string;
    };
  } {
    const data = this.getConsistencyData();
    if (!data) {
      return {
        userProfile: {
          consistencyLevel: 'beginner',
          engagementScore: 0,
          averageEntriesPerDay: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalEntries: 0
        },
        patterns: {
          entryFrequency: 'new_user',
          timeOfDay: 'unknown',
          contentLength: 'unknown',
          sentimentTrend: 'unknown'
        },
        recommendations: {
          promptStyle: 'encouraging',
          reminderTiming: 'morning',
          goalAdjustment: 'start_small'
        }
      };
    }

    // Analyze entry patterns
    const allEntries = JSON.parse(localStorage.getItem('kaizen_journal_entries') || '[]');
    const todayEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    });

    // Time of day analysis
    const entryTimes = allEntries.map(entry => new Date(entry.timestamp).getHours());
    const avgHour = entryTimes.length > 0 ? entryTimes.reduce((a, b) => a + b, 0) / entryTimes.length : 12;
    let timeOfDay = 'unknown';
    if (avgHour < 12) timeOfDay = 'morning';
    else if (avgHour < 17) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    // Content length analysis
    const avgLength = allEntries.length > 0 ? 
      allEntries.reduce((sum, entry) => sum + entry.content.length, 0) / allEntries.length : 0;
    let contentLength = 'short';
    if (avgLength > 500) contentLength = 'long';
    else if (avgLength > 200) contentLength = 'medium';
    else contentLength = 'short';

    // Sentiment trend analysis
    const sentiments = allEntries.map(entry => entry.sentiment?.score || 0);
    const recentSentiments = sentiments.slice(-7); // Last 7 entries
    const avgSentiment = recentSentiments.length > 0 ? 
      recentSentiments.reduce((a, b) => a + b, 0) / recentSentiments.length : 0;
    let sentimentTrend = 'stable';
    if (avgSentiment > 0.3) sentimentTrend = 'positive';
    else if (avgSentiment < -0.3) sentimentTrend = 'negative';
    else sentimentTrend = 'neutral';

    // Entry frequency analysis
    let entryFrequency = 'daily';
    if (data.averageEntriesPerDay >= 2) entryFrequency = 'multiple_daily';
    else if (data.averageEntriesPerDay >= 0.7) entryFrequency = 'daily';
    else if (data.averageEntriesPerDay >= 0.3) entryFrequency = 'few_times_week';
    else entryFrequency = 'occasional';

    // Personalized recommendations
    let promptStyle = 'encouraging';
    if (data.consistencyLevel === 'expert') promptStyle = 'reflective';
    else if (data.consistencyLevel === 'advanced') promptStyle = 'challenging';
    else if (data.consistencyLevel === 'intermediate') promptStyle = 'supportive';
    else promptStyle = 'encouraging';

    let reminderTiming = timeOfDay;
    if (data.consistencyLevel === 'beginner') reminderTiming = 'morning';
    else if (data.consistencyLevel === 'expert') reminderTiming = 'flexible';

    let goalAdjustment = 'maintain';
    if (data.consistencyLevel === 'beginner') goalAdjustment = 'start_small';
    else if (data.consistencyLevel === 'intermediate') goalAdjustment = 'increase_gradually';
    else if (data.consistencyLevel === 'advanced') goalAdjustment = 'challenge_yourself';
    else goalAdjustment = 'maintain_excellence';

    return {
      userProfile: {
        consistencyLevel: data.consistencyLevel,
        engagementScore: data.engagementScore,
        averageEntriesPerDay: data.averageEntriesPerDay,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        totalEntries: data.totalEntries
      },
      patterns: {
        entryFrequency,
        timeOfDay,
        contentLength,
        sentimentTrend
      },
      recommendations: {
        promptStyle,
        reminderTiming,
        goalAdjustment
      }
    };
  }
}
