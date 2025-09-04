// Sample data generator for demonstration purposes
export const SampleDataGenerator = {
  // Generate sample journal entries for the last 30 days
  generateSampleEntries(includeToday: boolean = true) {
    const entries = [];
    const now = new Date();
    
    // Sample content templates with more variety
    const contentTemplates = [
      "Today I felt really grateful for my morning coffee and quiet time. The sunrise was beautiful and I'm feeling optimistic about the day ahead.",
      "Work was challenging today - had a difficult meeting with the team. Feeling a bit stressed but trying to stay positive.",
      "Had a great conversation with my friend Sarah. We talked about our goals and it reminded me of what's important in life.",
      "Feeling a bit overwhelmed with all the tasks on my plate. Need to prioritize better and take things one step at a time.",
      "Amazing day! Completed a big project and received positive feedback. Feeling accomplished and motivated.",
      "Struggling with some negative thoughts today. Trying to practice self-compassion and remember that it's okay to have bad days.",
      "Spent time in nature today - went for a walk in the park. The fresh air and greenery really helped clear my mind.",
      "Had a creative breakthrough with my writing project. Ideas are flowing and I'm excited about the direction it's taking.",
      "Family dinner tonight was wonderful. Good food, good conversation, and lots of laughter. These moments are precious.",
      "Feeling anxious about an upcoming presentation. Working on my breathing exercises and positive self-talk.",
      "Made progress on my fitness goals today. Completed a challenging workout and feeling strong and energized.",
      "Had a difficult conversation with a colleague. It was uncomfortable but necessary. Learning to handle conflict better.",
      "Beautiful sunset tonight. Taking time to appreciate the small moments of beauty in everyday life.",
      "Feeling inspired after reading an interesting article about personal growth. New ideas and perspectives are always valuable.",
      "Struggling with some self-doubt today. Reminding myself of my past successes and capabilities.",
      "Had a productive day at work. Completed several important tasks and feeling good about my progress.",
      "Spent quality time with my partner today. Deep conversations and connection are so important.",
      "Feeling creative and inspired. Working on some new projects and excited about the possibilities.",
      "Had a relaxing evening with a good book and some tea. Self-care is essential for my well-being.",
      "Feeling grateful for my health and the ability to pursue my passions. Life is good.",
      "Challenging day at work but handled it well. Learning to stay calm under pressure.",
      "Had a breakthrough in my meditation practice. Feeling more centered and peaceful.",
      "Spent time with my family today. These relationships are the foundation of my happiness.",
      "Feeling motivated and focused on my goals. Making steady progress and staying committed.",
      "Had a wonderful day with friends. Laughter and good company are so healing.",
      "Feeling a bit tired but accomplished. Good to reflect on what I've achieved this week.",
      "Beautiful weather today. Spent time outdoors and feeling connected to nature.",
      "Had a meaningful conversation with my mentor. Grateful for guidance and support.",
      "Feeling optimistic about the future. New opportunities are on the horizon.",
      "Completed my wellness tasks today! The mood boost from finishing those activities really helped.",
      "Had an insightful therapy session. Working through some deep emotions and feeling lighter.",
      "Practiced gratitude journaling today. Focusing on the positive really shifts my perspective.",
      "Tried a new mindfulness technique. It's amazing how different approaches work for different days.",
      "Set new goals for the month ahead. Feeling excited about the journey of personal growth.",
      "Reflected on my emotional patterns. Understanding myself better helps me make better choices.",
      "Celebrated small wins today. Every step forward is worth acknowledging.",
      "Worked on my stress management techniques. Learning to handle pressure more gracefully.",
      "Had a breakthrough in understanding my triggers. Self-awareness is the first step to change.",
      "Practiced self-compassion today. Being kind to myself makes such a difference."
    ];

    // Generate entries for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Skip today if includeToday is false
      if (!includeToday && i === 0) continue;
      
      // Skip some days to make it realistic (not every day)
      if (Math.random() > 0.4) continue;
      
      const content = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
      const mood = Math.floor(Math.random() * 10) + 1; // 1-10 scale
      
      // Generate sentiment based on mood
      let sentiment = 0;
      if (mood >= 7) sentiment = (Math.random() * 0.3) + 0.7; // 0.7-1.0
      else if (mood >= 4) sentiment = (Math.random() * 0.4) - 0.2; // -0.2 to 0.2
      else sentiment = -(Math.random() * 0.3) - 0.7; // -0.7 to -1.0
      
      // Generate themes based on content
      const themes = this.generateThemes(content);
      
      entries.push({
        id: `sample_${i}`,
        content,
        timestamp: date,
        mood,
        sentiment: {
          score: sentiment,
          label: sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral',
          confidence: Math.abs(sentiment)
        },
        themes,
        aiPrompt: "How are you feeling today? What thoughts are flowing through your mind?"
      });
    }
    
    return entries;
  },

  generateThemes(content: string): string[] {
    const themes = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('work') || lowerContent.includes('meeting') || lowerContent.includes('project')) {
      themes.push('work stress');
    }
    if (lowerContent.includes('friend') || lowerContent.includes('family') || lowerContent.includes('partner')) {
      themes.push('relationships');
    }
    if (lowerContent.includes('grateful') || lowerContent.includes('appreciate') || lowerContent.includes('blessed')) {
      themes.push('gratitude');
    }
    if (lowerContent.includes('anxious') || lowerContent.includes('stressed') || lowerContent.includes('overwhelmed')) {
      themes.push('anxiety');
    }
    if (lowerContent.includes('creative') || lowerContent.includes('inspired') || lowerContent.includes('breakthrough')) {
      themes.push('creativity');
    }
    if (lowerContent.includes('fitness') || lowerContent.includes('workout') || lowerContent.includes('health')) {
      themes.push('health');
    }
    if (lowerContent.includes('nature') || lowerContent.includes('outdoors') || lowerContent.includes('park')) {
      themes.push('personal growth');
    }
    if (lowerContent.includes('meditation') || lowerContent.includes('peaceful') || lowerContent.includes('centered')) {
      themes.push('spirituality');
    }
    if (lowerContent.includes('wellness') || lowerContent.includes('self-care') || lowerContent.includes('mood boost')) {
      themes.push('wellness');
    }
    if (lowerContent.includes('therapy') || lowerContent.includes('emotional') || lowerContent.includes('triggers')) {
      themes.push('emotional healing');
    }
    if (lowerContent.includes('goals') || lowerContent.includes('progress') || lowerContent.includes('growth')) {
      themes.push('personal development');
    }
    if (lowerContent.includes('stress') || lowerContent.includes('pressure') || lowerContent.includes('challenging')) {
      themes.push('stress management');
    }
    
    return themes;
  },

  // Generate sample therapy sessions
  generateSampleTherapySessions() {
    const sessions = [];
    const now = new Date();
    
    const sessionTemplates = [
      {
        messages: [
          { role: 'user', content: "I've been feeling really overwhelmed with work lately. Everything seems to be piling up and I don't know how to handle it all." },
          { role: 'assistant', content: "I hear you, and that sounds really challenging. It's completely normal to feel overwhelmed when there's so much on your plate. Can you tell me more about what specifically feels most overwhelming right now?" },
          { role: 'user', content: "I think it's the deadlines. I have three major projects due this week and I keep procrastinating because I'm afraid I won't do them well enough." },
          { role: 'assistant', content: "That's a really common pattern - when we're afraid of not meeting our own high standards, we sometimes avoid starting altogether. What would it look like to break one of those projects into smaller, more manageable pieces?" }
        ],
        tone: 'empathetic' as const,
        mood: { start: 4, end: 6 }
      },
      {
        messages: [
          { role: 'user', content: "I had a really good day today! I finally completed that project I've been working on and my boss was really impressed." },
          { role: 'assistant', content: "That's wonderful! I can hear the pride and satisfaction in your voice. What was it about completing this project that felt so good for you?" },
          { role: 'user', content: "I think it's because I proved to myself that I can handle challenging work. I was doubting myself for a while, but now I feel more confident." },
          { role: 'assistant', content: "That's such a powerful realization. You've not only accomplished something important, but you've also strengthened your self-confidence. How can you carry this feeling of capability into other areas of your life?" }
        ],
        tone: 'solution' as const,
        mood: { start: 8, end: 9 }
      },
      {
        messages: [
          { role: 'user', content: "I'm struggling with some negative thoughts about myself. I keep comparing myself to others and feeling like I'm not good enough." },
          { role: 'assistant', content: "I understand how painful those negative thoughts can be. Comparison can be really damaging to our self-esteem. Can you help me understand what triggers these thoughts for you?" },
          { role: 'user', content: "Usually it happens when I see other people's achievements on social media. I start thinking I should be doing more or be further along in my career." },
          { role: 'assistant', content: "That's a very common experience in our digital age. Social media often shows us curated highlights, not the full picture. What would it feel like to focus on your own unique journey and progress instead?" }
        ],
        tone: 'cognitive' as const,
        mood: { start: 3, end: 5 }
      }
    ];

    // Generate sessions for the last 2 weeks
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Only create sessions on some days
      if (Math.random() > 0.3) continue;
      
      const template = sessionTemplates[Math.floor(Math.random() * sessionTemplates.length)];
      const sessionId = `session_${i}`;
      
      const messages = template.messages.map((msg, index) => ({
        id: `${sessionId}_msg_${index}`,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(date.getTime() + index * 60000), // 1 minute apart
        sessionId
      }));

      sessions.push({
        id: sessionId,
        startTime: date,
        endTime: new Date(date.getTime() + 30 * 60000), // 30 minutes later
        messages,
        tone: template.tone,
        mood: template.mood
      });
    }
    
    return sessions;
  },

  // Generate sample wellness tasks
  generateSampleWellnessTasks() {
    const tasks = [
      {
        id: 'task_1',
        text: 'Take a 10-minute walk outside',
        icon: 'Activity',
        category: 'physical',
        completed: true,
        moodBoost: 2,
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 'task_2',
        text: 'Practice 5 minutes of deep breathing',
        icon: 'Heart',
        category: 'mindfulness',
        completed: true,
        moodBoost: 3,
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      },
      {
        id: 'task_3',
        text: 'Write down 3 things you\'re grateful for',
        icon: 'Star',
        category: 'gratitude',
        completed: false,
        moodBoost: 2,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
      },
      {
        id: 'task_4',
        text: 'Call a friend or family member',
        icon: 'Users',
        category: 'social',
        completed: false,
        moodBoost: 4,
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        id: 'task_5',
        text: 'Try a new hobby or creative activity',
        icon: 'Sparkles',
        category: 'creativity',
        completed: false,
        moodBoost: 3,
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      }
    ];
    
    return tasks;
  },

  // Initialize comprehensive sample data
  initializeSampleData(includeToday: boolean = true) {
    const entries = this.generateSampleEntries(includeToday);
    const therapySessions = this.generateSampleTherapySessions();
    const wellnessTasks = this.generateSampleWellnessTasks();
    
    // Save journal entries
    localStorage.setItem('kaizen_journal_entries', JSON.stringify(entries));
    
    // Save therapy sessions
    localStorage.setItem('kaizen_therapy_sessions', JSON.stringify(therapySessions));
    
    // Save wellness tasks
    localStorage.setItem('kaizen_wellness_tasks', JSON.stringify(wellnessTasks));
    
    // Create comprehensive demo user profile
    const profile = {
      name: "Demo User",
      phoneNumber: "+1 (555) 123-4567",
      goals: ["stress", "growth", "gratitude", "clarity", "relationships", "creativity"],
      experienceLevel: "intermediate" as const,
      preferredTime: "evening" as const,
      focusAreas: ["Emotional well-being", "Personal development", "Relationships", "Health and fitness", "Stress management", "Mindfulness"]
    };
    
    localStorage.setItem('kaizen_profile', JSON.stringify(profile));
    
    // Create demo auth data with persistent storage
    const authData = {
      isAuthenticated: true,
      passcode: "demo123",
      lastLogin: new Date(),
      userProfile: profile
    };
    
    localStorage.setItem('kaizen_auth', JSON.stringify(authData));
    localStorage.setItem('kaizen_session', JSON.stringify(authData));
    
    // Also save to persistent storage keys
    localStorage.setItem('kaizen_persistent_auth', JSON.stringify(authData));
    localStorage.setItem('kaizen_persistent_profile', JSON.stringify(profile));
    
    // Create consistency data
    const consistencyData = {
      consistencyLevel: "intermediate",
      weeklyGoal: 5,
      monthlyGoal: 20,
      currentStreak: 3,
      longestStreak: 7,
      totalEntries: entries.length,
      reminderEnabled: true,
      reminderFrequency: "daily",
      reminderTime: "20:00"
    };
    
    localStorage.setItem('kaizen_consistency_data', JSON.stringify(consistencyData));
    
    return { entries, profile, therapySessions, wellnessTasks, consistencyData };
  },

  // Check if sample data exists
  hasSampleData(): boolean {
    const entries = localStorage.getItem('kaizen_journal_entries');
    return entries !== null && JSON.parse(entries).length > 0;
  },

  // Clear sample data
  clearSampleData() {
    localStorage.removeItem('kaizen_journal_entries');
    localStorage.removeItem('kaizen_profile');
    localStorage.removeItem('kaizen_auth');
    localStorage.removeItem('kaizen_session');
    localStorage.removeItem('kaizen_therapy_sessions');
    localStorage.removeItem('kaizen_wellness_tasks');
    localStorage.removeItem('kaizen_consistency_data');
    localStorage.removeItem('kaizen_persistent_auth');
    localStorage.removeItem('kaizen_persistent_profile');
  }
};
