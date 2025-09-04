// Advanced Therapist AI System
export interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  tone: 'empathetic' | 'honest' | 'cognitive' | 'solution';
  sessionDuration: number; // minutes
  userMood: number;
  topics: string[];
  userPatterns: {
    frequentlyMentioned: string[];
    emotionalState: 'positive' | 'negative' | 'neutral' | 'mixed';
    responseLength: 'short' | 'medium' | 'long';
  };
}

// Test function to verify AI is working
export const testTherapistAI = () => {
  const testContext: ConversationContext = {
    messages: [
      {
        role: 'user',
        content: 'I am feeling sad today',
        timestamp: new Date()
      }
    ],
    tone: 'empathetic',
    sessionDuration: 5,
    userMood: 3,
    topics: ['sadness'],
    userPatterns: {
      frequentlyMentioned: ['sadness'],
      emotionalState: 'negative',
      responseLength: 'short'
    }
  };
  
  try {
    const response = TherapistAI.generateResponse(testContext);
    console.log('TherapistAI test successful:', response);
    return response;
  } catch (error) {
    console.error('TherapistAI test failed:', error);
    return null;
  }
};

export class TherapistAI {
  private static readonly RESPONSE_TEMPLATES = {
    empathetic: {
      acknowledgments: [
        "I hear you, and I want you to know that your feelings are completely valid.",
        "I can sense the weight of what you're carrying, and I'm here to support you.",
        "Thank you for trusting me with this. Your experience matters deeply.",
        "I understand how challenging this must be for you right now.",
        "Your emotions are telling us something important, and I'm listening."
      ],
      questions: [
        "What would be most helpful for you in this moment?",
        "How can I best support you through this?",
        "What do you need right now that would feel supportive?",
        "How are you taking care of yourself through this?",
        "What would it look like to give yourself permission to feel this?"
      ],
      reflections: [
        "It sounds like you're navigating some really complex emotions.",
        "I can hear the struggle in your voice, and I want you to know you're not alone.",
        "Your resilience is showing through even in this difficult time.",
        "This seems to be touching on something deeper for you.",
        "I notice how much courage it takes to share these feelings."
      ]
    },
    honest: {
      acknowledgments: [
        "I appreciate your honesty in sharing this with me.",
        "I need to be direct with you about what I'm hearing.",
        "Let me give you some straightforward feedback.",
        "I want to be completely honest about what I think is happening here.",
        "I respect that you're willing to face this head-on."
      ],
      questions: [
        "What specific steps can you take to address this?",
        "What's the hard truth you might be avoiding?",
        "What would it look like to take responsibility for your part in this?",
        "What's one thing you can do differently right now?",
        "What's the reality of the situation, not just how you wish it was?"
      ],
      reflections: [
        "I think you know deep down what needs to happen here.",
        "This pattern isn't serving you well, and I think you know that.",
        "You have more control over this situation than you're allowing yourself.",
        "The truth is, you're capable of handling this better than you think.",
        "I see some self-sabotage happening here, and I want to call that out."
      ]
    },
    cognitive: {
      acknowledgments: [
        "Let's examine the thinking patterns that are influencing your experience.",
        "I notice some cognitive patterns that might be contributing to this.",
        "Your thoughts are creating your emotional response here.",
        "Let's look at the connection between your thinking and your feelings.",
        "I see some automatic thoughts that we should explore together."
      ],
      questions: [
        "What evidence supports or contradicts your perspective?",
        "What would you tell a friend who was thinking this way?",
        "What's the worst that could happen, and how likely is that?",
        "What automatic thoughts are you having right now?",
        "How would you think about this if you were feeling calmer?"
      ],
      reflections: [
        "I'm noticing some cognitive distortions in your thinking.",
        "Your thoughts seem to be following a familiar pattern.",
        "There's a connection between your beliefs and your emotional state.",
        "Your thinking is creating a filter that's coloring your experience.",
        "Let's challenge some of these automatic thoughts together."
      ]
    },
    solution: {
      acknowledgments: [
        "I can see you're ready to move forward and find solutions.",
        "You have strengths and resources to draw on here.",
        "Let's focus on what you can control and influence.",
        "I appreciate your willingness to take action.",
        "You're showing great problem-solving energy."
      ],
      questions: [
        "What's one small step you can take right now?",
        "What would success look like for you in this situation?",
        "What resources do you have available to you?",
        "What's your next concrete action?",
        "How can you build on what's already working?"
      ],
      reflections: [
        "Instead of dwelling on the problem, let's focus on solutions.",
        "You have more options than you might think.",
        "Let's create a concrete action plan.",
        "Your strengths are your greatest resource here.",
        "This is a solvable problem with the right approach."
      ]
    }
  };

  private static readonly FOLLOW_UP_QUESTIONS = {
    empathetic: [
      "How long have you been feeling this way?",
      "What triggered these feelings for you?",
      "Who else knows about what you're going through?",
      "What would feel most supportive to you right now?",
      "How are you taking care of yourself through this?"
    ],
    honest: [
      "What's the real issue here that you might be avoiding?",
      "What would it take for you to make a change?",
      "What's stopping you from taking action?",
      "What's the cost of staying in this pattern?",
      "What would it look like to be completely honest with yourself?"
    ],
    cognitive: [
      "What's the evidence for and against this thought?",
      "What's a more balanced way to think about this?",
      "What would you think if you were feeling better?",
      "How would someone who loves you see this situation?",
      "What's the probability of your worst fear happening?"
    ],
    solution: [
      "What's your next concrete step?",
      "What would you like to accomplish in the next week?",
      "What resources do you need to make this happen?",
      "What's your timeline for this goal?",
      "How will you measure your progress?"
    ]
  };

  static generateResponse(context: ConversationContext): string {
    const { messages, tone, sessionDuration, userMood, topics, userPatterns } = context;
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    // Analyze the user's message
    const messageAnalysis = this.analyzeUserMessage(lastUserMessage, userPatterns);
    
    // Determine response type based on context
    const responseType = this.determineResponseType(context, messageAnalysis);
    
    // Generate contextual response
    let response = this.buildResponse(tone, responseType, messageAnalysis, context);
    
    // Add follow-up question if appropriate
    if (this.shouldAddFollowUp(context, responseType)) {
      response += this.addFollowUpQuestion(tone, context);
    }
    
    return response;
  }

  private static analyzeUserMessage(message: string, patterns: any) {
    const lowerMessage = message.toLowerCase();
    
    return {
      emotion: this.detectEmotion(lowerMessage),
      length: message.length < 50 ? 'short' : message.length < 200 ? 'medium' : 'long',
      containsQuestion: lowerMessage.includes('?'),
      mentionsOthers: /\b(he|she|they|him|her|them|friend|family|partner|boss|colleague)\b/i.test(message),
      urgency: this.detectUrgency(lowerMessage),
      topics: this.extractTopics(lowerMessage)
    };
  }

  private static detectEmotion(message: string): 'positive' | 'negative' | 'neutral' | 'mixed' {
    const positiveWords = ['happy', 'good', 'great', 'excited', 'joy', 'love', 'grateful', 'blessed', 'peaceful', 'content', 'fulfilled', 'proud', 'confident', 'hopeful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'disappointed', 'worried', 'anxious', 'stressed', 'tired', 'lonely', 'hurt', 'confused', 'overwhelmed', 'hopeless', 'guilty'];
    
    const positiveCount = positiveWords.filter(word => message.includes(word)).length;
    const negativeCount = negativeWords.filter(word => message.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount === negativeCount && positiveCount > 0) return 'mixed';
    return 'neutral';
  }

  private static detectUrgency(message: string): 'high' | 'medium' | 'low' {
    const urgentWords = ['urgent', 'emergency', 'crisis', 'immediate', 'now', 'desperate', 'panic', 'terrible', 'awful'];
    const urgentCount = urgentWords.filter(word => message.includes(word)).length;
    
    if (urgentCount >= 2) return 'high';
    if (urgentCount === 1) return 'medium';
    return 'low';
  }

  private static extractTopics(message: string): string[] {
    const topics = [
      'work', 'relationships', 'family', 'health', 'stress', 'anxiety', 'depression', 
      'goals', 'future', 'past', 'money', 'creativity', 'spirituality', 'friendship',
      'love', 'breakup', 'marriage', 'parenting', 'career', 'education', 'self-care'
    ];
    
    return topics.filter(topic => message.includes(topic));
  }

  private static determineResponseType(context: ConversationContext, analysis: any): 'acknowledgment' | 'question' | 'reflection' {
    const { messages, sessionDuration, userMood } = context;
    
    // Early in session: focus on acknowledgment and building rapport
    if (sessionDuration < 5) {
      return 'acknowledgment';
    }
    
    // User seems distressed: prioritize acknowledgment
    if (analysis.emotion === 'negative' || analysis.urgency === 'high') {
      return 'acknowledgment';
    }
    
    // User asked a question: ask a question to deepen exploration
    if (analysis.containsQuestion) {
      return 'question';
    }
    
    // User shared a lot: ask a question to deepen exploration
    if (analysis.length === 'long') {
      return 'question';
    }
    
    // Default: reflection to show understanding
    return 'reflection';
  }

  private static buildResponse(tone: string, type: string, analysis: any, context: ConversationContext): string {
    const templates = this.RESPONSE_TEMPLATES[tone as keyof typeof this.RESPONSE_TEMPLATES];
    const responses = templates[type as keyof typeof templates];
    
    // Select a response that hasn't been used recently
    const recentMessages = context.messages.slice(-5);
    const usedResponses = recentMessages
      .filter(m => m.role === 'assistant')
      .map(m => m.content);
    
    let availableResponses = responses.filter(response => 
      !usedResponses.some(used => this.similarity(response, used) > 0.7)
    );
    
    if (availableResponses.length === 0) {
      availableResponses = responses;
    }
    
    const selectedResponse = availableResponses[Math.floor(Math.random() * availableResponses.length)];
    
    // Personalize the response based on analysis
    return this.personalizeResponse(selectedResponse, analysis, context);
  }

  private static personalizeResponse(response: string, analysis: any, context: ConversationContext): string {
    let personalized = response;
    
    // Add emotion-specific language
    if (analysis.emotion === 'negative') {
      personalized = personalized.replace(/challenging/g, 'really difficult');
      personalized = personalized.replace(/situation/g, 'what you\'re going through');
    }
    
    // Add urgency-specific language
    if (analysis.urgency === 'high') {
      personalized = personalized.replace(/this/g, 'this urgent situation');
    }
    
    // Add topic-specific references
    if (analysis.topics.length > 0) {
      const topic = analysis.topics[0];
      if (topic === 'work' && !personalized.includes('work')) {
        personalized += ` This work situation seems to be really affecting you.`;
      }
      if (topic === 'relationships' && !personalized.includes('relationship')) {
        personalized += ` Your relationships are clearly important to you.`;
      }
    }
    
    return personalized;
  }

  private static shouldAddFollowUp(context: ConversationContext, responseType: string): boolean {
    const { messages, sessionDuration } = context;
    
    // Don't add follow-up if we just asked a question
    if (responseType === 'question') return false;
    
    // Don't add follow-up too early in session
    if (sessionDuration < 3) return false;
    
    // Add follow-up about 70% of the time
    return Math.random() < 0.7;
  }

  private static addFollowUpQuestion(tone: string, context: ConversationContext): string {
    const questions = this.FOLLOW_UP_QUESTIONS[tone as keyof typeof this.FOLLOW_UP_QUESTIONS];
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    return ` ${question}`;
  }

  private static similarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}
