// Local storage utilities for Kaizen journal app with multi-account support
export interface JournalEntry {
  id: string;
  content: string;
  aiPrompt?: string;
  timestamp: Date;
  sentiment?: {
    score: number; // -1 to 1
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  themes?: string[];
  mood?: number; // 1-10 scale
  accountId?: string; // Account-specific data
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId: string;
  accountId?: string; // Account-specific data
}

export interface TherapistSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messages: ChatMessage[];
  mood?: {
    start: number;
    end?: number;
  };
  tone?: 'empathetic' | 'honest' | 'cognitive' | 'solution';
  accountId?: string; // Account-specific data
}

export class LocalStorage {
  private static readonly JOURNAL_KEY = 'kaizen_journal_entries';
  private static readonly CHAT_KEY = 'kaizen_chat_history';
  private static readonly SESSIONS_KEY = 'kaizen_therapy_sessions';
  private static readonly SETTINGS_KEY = 'kaizen_settings';

  // Get current account ID
  private static getCurrentAccountId(): string | null {
    return localStorage.getItem('kaizen_current_account');
  }

  // Get account-specific key
  private static getAccountKey(baseKey: string): string {
    const accountId = this.getCurrentAccountId();
    return accountId ? `${baseKey}_${accountId}` : baseKey;
  }

  // Journal entries
  static getJournalEntries(): JournalEntry[] {
    const stored = localStorage.getItem(this.getAccountKey(this.JOURNAL_KEY));
    if (!stored) return [];
    
    const entries = JSON.parse(stored);
    return entries.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));
  }

  static saveJournalEntry(entry: JournalEntry): void {
    const entries = this.getJournalEntries();
    const entryWithAccount: JournalEntry = {
      ...entry,
      accountId: this.getCurrentAccountId() || undefined
    };
    entries.push(entryWithAccount);
    localStorage.setItem(this.getAccountKey(this.JOURNAL_KEY), JSON.stringify(entries));
  }

  static updateJournalEntry(id: string, updates: Partial<JournalEntry>): void {
    const entries = this.getJournalEntries();
    const index = entries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updates };
      localStorage.setItem(this.getAccountKey(this.JOURNAL_KEY), JSON.stringify(entries));
    }
  }

  // Chat messages
  static getChatMessages(sessionId?: string): ChatMessage[] {
    const stored = localStorage.getItem(this.getAccountKey(this.CHAT_KEY));
    if (!stored) return [];
    
    const messages = JSON.parse(stored).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    return sessionId ? messages.filter(msg => msg.sessionId === sessionId) : messages;
  }

  static saveChatMessage(message: ChatMessage): void {
    const messages = this.getChatMessages();
    const messageWithAccount: ChatMessage = {
      ...message,
      accountId: this.getCurrentAccountId() || undefined
    };
    messages.push(messageWithAccount);
    localStorage.setItem(this.getAccountKey(this.CHAT_KEY), JSON.stringify(messages));
  }

  // Therapy sessions
  static getTherapySessions(): TherapistSession[] {
    const stored = localStorage.getItem(this.getAccountKey(this.SESSIONS_KEY));
    if (!stored) return [];
    
    return JSON.parse(stored).map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  }

  static saveTherapySession(session: TherapistSession): void {
    const sessions = this.getTherapySessions();
    const sessionWithAccount: TherapistSession = {
      ...session,
      accountId: this.getCurrentAccountId() || undefined
    };
    
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex !== -1) {
      sessions[existingIndex] = sessionWithAccount;
    } else {
      sessions.push(sessionWithAccount);
    }
    
    localStorage.setItem(this.getAccountKey(this.SESSIONS_KEY), JSON.stringify(sessions));
  }

  // Get today's entries (multiple entries allowed per day)
  static getTodayEntries(): JournalEntry[] {
    const entries = this.getJournalEntries();
    const today = new Date();
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.toDateString() === today.toDateString();
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Most recent first
  }

  // Get today's first entry (for backward compatibility)
  static getTodayEntry(): JournalEntry | null {
    const todayEntries = this.getTodayEntries();
    return todayEntries.length > 0 ? todayEntries[0] : null;
  }

  // Check if today has any entries
  static hasTodayEntries(): boolean {
    return this.getTodayEntries().length > 0;
  }

  // Get entry count for today
  static getTodayEntryCount(): number {
    return this.getTodayEntries().length;
  }

  // Analytics helpers
  static getEntriesInDateRange(startDate: Date, endDate: Date): JournalEntry[] {
    const entries = this.getJournalEntries();
    return entries.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }

  static getEmotionalTrends(days: number = 30): Array<{
    date: string;
    sentiment: number;
    mood: number | null;
    entryCount: number;
  }> {
    const entries = this.getJournalEntries();
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const dateMap = new Map<string, {
      sentiments: number[];
      moods: number[];
      count: number;
    }>();

    entries
      .filter(entry => entry.timestamp >= startDate && entry.timestamp <= endDate)
      .forEach(entry => {
        const dateKey = entry.timestamp.toISOString().split('T')[0];
        
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { sentiments: [], moods: [], count: 0 });
        }
        
        const dayData = dateMap.get(dateKey)!;
        dayData.count++;
        
        if (entry.sentiment) {
          dayData.sentiments.push(entry.sentiment.score);
        }
        
        if (entry.mood) {
          dayData.moods.push(entry.mood);
        }
      });

    const result: Array<{
      date: string;
      sentiment: number;
      mood: number | null;
      entryCount: number;
    }> = [];

    // Fill in all dates in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dayData = dateMap.get(dateKey);
      
      result.push({
        date: dateKey,
        sentiment: dayData ? 
          dayData.sentiments.reduce((a, b) => a + b, 0) / dayData.sentiments.length : 0,
        mood: dayData && dayData.moods.length > 0 ? 
          dayData.moods.reduce((a, b) => a + b, 0) / dayData.moods.length : null,
        entryCount: dayData ? dayData.count : 0
      });
    }

    return result;
  }

  static getThemeFrequency(): Array<{ theme: string; count: number }> {
    const entries = this.getJournalEntries();
    const themeMap = new Map<string, number>();

    entries.forEach(entry => {
      entry.themes?.forEach(theme => {
        themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
      });
    });

    return Array.from(themeMap.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Settings
  static getSettings(): any {
    const stored = localStorage.getItem(this.getAccountKey(this.SETTINGS_KEY));
    return stored ? JSON.parse(stored) : {};
  }

  static saveSettings(settings: any): void {
    localStorage.setItem(this.getAccountKey(this.SETTINGS_KEY), JSON.stringify(settings));
  }

  // Clear all data for current account
  static clearAccountData(): void {
    const accountId = this.getCurrentAccountId();
    if (accountId) {
      localStorage.removeItem(`${this.JOURNAL_KEY}_${accountId}`);
      localStorage.removeItem(`${this.CHAT_KEY}_${accountId}`);
      localStorage.removeItem(`${this.SESSIONS_KEY}_${accountId}`);
      localStorage.removeItem(`${this.SETTINGS_KEY}_${accountId}`);
    }
  }
}