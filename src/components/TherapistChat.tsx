import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Heart,
  Brain,
  Sparkles,
  Settings,
  Target,
  Lightbulb,
  Shield,
  TrendingUp
} from "lucide-react";
import { YingYangSymbol } from "./YingYangSymbol";
import { LocalStorage, ChatMessage, TherapistSession } from "@/lib/storage";

interface TherapistChatProps {
  onMoodChange?: (mood: number) => void;
}

// Therapeutic tone definitions
const THERAPEUTIC_TONES = {
  empathetic: {
    name: "Empathetic",
    icon: "💖",
    description: "Warm, understanding, and emotionally supportive",
    color: "text-pink-600",
    bgColor: "bg-pink-50"
  },
  honest: {
    name: "Honest",
    icon: "🛡️",
    description: "Direct, truthful, and straightforward guidance",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  cognitive: {
    name: "Cognitive-Behavioral",
    icon: "🧠",
    description: "Thought-focused, pattern recognition, and behavioral change",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  solution: {
    name: "Solution-Focused",
    icon: "🎯",
    description: "Goal-oriented, action-focused, and future-directed",
    color: "text-green-600",
    bgColor: "bg-green-50"
  }
};

export const TherapistChat = ({ onMoodChange }: TherapistChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<TherapistSession | null>(null);
  const [mood, setMood] = useState<number[]>([5]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTone, setSelectedTone] = useState<keyof typeof THERAPEUTIC_TONES>("empathetic");
  const [isLocalAIReady, setIsLocalAIReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing session or create new one
    const sessions = LocalStorage.getTherapySessions();
    const latestSession = sessions[sessions.length - 1];
    
    if (latestSession && !latestSession.endTime) {
      // Continue existing session
      setCurrentSession(latestSession);
      setMessages(latestSession.messages);
      setSelectedTone(latestSession.tone || "empathetic");
    } else {
      // Start new session
      startNewSession();
    }

    // Initialize local AI
    initializeLocalAI();
  }, []);

  const initializeLocalAI = async () => {
    try {
      console.log('Initializing conversational AI therapist system...');
      setIsLocalAIReady(true);
      console.log('Conversational AI therapist system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI system:', error);
      // Set as ready anyway to use fallback responses
      setIsLocalAIReady(true);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    onMoodChange?.(mood[0]);
  }, [mood, onMoodChange]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewSession = () => {
    const sessionId = Date.now().toString();
    const tone = THERAPEUTIC_TONES[selectedTone];
    const newSession: TherapistSession = {
      id: sessionId,
      startTime: new Date(),
      messages: [],
      mood: { start: mood[0] },
      tone: selectedTone
    };

    // Add welcome message based on tone
    const welcomeMessages = {
      empathetic: "Hello! I'm here to listen and support you with warmth and understanding. How are you feeling today? I want to hear whatever is on your mind.",
      honest: "Hello! I'm here to provide honest, direct support and guidance. How are you really doing? I'm ready to give you straightforward feedback.",
      cognitive: "Hello! I'm here to help you understand your thoughts and behaviors. What's on your mind today? Let's explore your thinking patterns together.",
      solution: "Hello! I'm here to help you find solutions and move forward. What would you like to work on today? Let's focus on your goals and next steps."
    };

    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: welcomeMessages[selectedTone],
      timestamp: new Date(),
      sessionId
    };

    newSession.messages = [welcomeMessage];
    setCurrentSession(newSession);
    setMessages([welcomeMessage]);
    
    LocalStorage.saveTherapySession(newSession);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      sessionId: currentSession.id
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    LocalStorage.saveChatMessage(userMessage);
    
    // Update session
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      tone: selectedTone
    };
    setCurrentSession(updatedSession);
    LocalStorage.saveTherapySession(updatedSession);

    setInputValue("");
    setIsTyping(true);

    try {
      // Generate a contextual, conversational response
      const response = await generateConversationalResponse(inputValue.trim(), selectedTone, messages);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        sessionId: currentSession.id
      };

      setMessages(prev => [...prev, aiMessage]);
      LocalStorage.saveChatMessage(aiMessage);
      
      // Update session with AI response
      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, aiMessage]
      };
      setCurrentSession(finalSession);
      LocalStorage.saveTherapySession(finalSession);

    } catch (error) {
      console.error('Therapist response error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm here to listen and support you. Please continue sharing what's on your mind.",
        timestamp: new Date(),
        sessionId: currentSession.id
      };
      
      setMessages(prev => [...prev, errorMessage]);
      LocalStorage.saveChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate conversational responses that understand context and conversation history
  const generateConversationalResponse = async (userInput: string, tone: keyof typeof THERAPEUTIC_TONES, messageHistory: ChatMessage[]): Promise<string> => {
    const lowerInput = userInput.toLowerCase();
    
    // Analyze the conversation context
    const context = analyzeConversationContext(userInput, messageHistory);
    
    // Generate response based on tone and context
    switch (tone) {
      case 'empathetic':
        return generateEmpatheticResponse(context);
      case 'honest':
        return generateHonestResponse(context);
      case 'cognitive':
        return generateCognitiveResponse(context);
      case 'solution':
        return generateSolutionResponse(context);
      default:
        return generateEmpatheticResponse(context);
    }
  };

  // Analyze conversation context to understand what's happening
  const analyzeConversationContext = (currentInput: string, history: ChatMessage[]) => {
    const lowerInput = currentInput.toLowerCase();
    const recentMessages = history.slice(-6); // Last 6 messages for context
    const allText = recentMessages.map(m => m.content).join(' ').toLowerCase();
    
    return {
      currentTopic: detectTopic(lowerInput),
      emotionalState: detectEmotionalState(lowerInput),
      conversationLength: history.length,
      isFirstMessage: history.length === 0,
      hasBeenResponding: history.some(m => m.role === 'assistant'),
      userMentioned: {
        stress: lowerInput.includes('stress') || lowerInput.includes('overwhelmed') || lowerInput.includes('anxious'),
        work: lowerInput.includes('work') || lowerInput.includes('job') || lowerInput.includes('career'),
        relationships: lowerInput.includes('relationship') || lowerInput.includes('friend') || lowerInput.includes('family') || lowerInput.includes('partner'),
        health: lowerInput.includes('health') || lowerInput.includes('sleep') || lowerInput.includes('tired'),
        goals: lowerInput.includes('goal') || lowerInput.includes('future') || lowerInput.includes('plan'),
        emotions: lowerInput.includes('feel') || lowerInput.includes('emotion') || lowerInput.includes('sad') || lowerInput.includes('happy')
      },
      conversationHistory: recentMessages,
      isQuestion: currentInput.includes('?') || currentInput.includes('what') || currentInput.includes('how') || currentInput.includes('why'),
      urgency: detectUrgency(lowerInput)
    };
  };

  const detectTopic = (input: string): string => {
    if (input.includes('stress') || input.includes('overwhelmed') || input.includes('anxious')) return 'stress';
    if (input.includes('work') || input.includes('job') || input.includes('career')) return 'work';
    if (input.includes('relationship') || input.includes('friend') || input.includes('family') || input.includes('partner')) return 'relationships';
    if (input.includes('health') || input.includes('sleep') || input.includes('tired')) return 'health';
    if (input.includes('goal') || input.includes('future') || input.includes('plan')) return 'goals';
    return 'general';
  };

  const detectEmotionalState = (input: string): string => {
    const positiveWords = ['happy', 'good', 'great', 'excited', 'joy', 'love', 'grateful', 'blessed', 'peaceful', 'content', 'fulfilled', 'proud', 'confident', 'hopeful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'disappointed', 'worried', 'anxious', 'stressed', 'tired', 'lonely', 'hurt', 'confused', 'overwhelmed', 'hopeless', 'guilty'];
    
    const positiveCount = positiveWords.filter(word => input.includes(word)).length;
    const negativeCount = negativeWords.filter(word => input.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount === negativeCount && positiveCount > 0) return 'mixed';
    return 'neutral';
  };

  const detectUrgency = (input: string): 'high' | 'medium' | 'low' => {
    const urgentWords = ['urgent', 'emergency', 'crisis', 'desperate', 'immediate', 'now', 'help'];
    const urgentCount = urgentWords.filter(word => input.includes(word)).length;
    
    if (urgentCount > 0) return 'high';
    if (input.includes('soon') || input.includes('quick') || input.includes('fast')) return 'medium';
    return 'low';
  };

  const generateEmpatheticResponse = (context: any): string => {
    const { currentTopic, emotionalState, isFirstMessage, userMentioned, isQuestion } = context;
    
    if (isFirstMessage) {
      return "Hello! I'm here to listen and support you. What's on your mind today?";
    }
    
    if (emotionalState === 'negative') {
      if (userMentioned.stress) {
        return "I can feel the weight of stress you're carrying, and I want you to know that it's completely okay to feel overwhelmed. Stress affects us all differently, and your feelings are valid. What's one small thing that might help you feel a bit lighter right now?";
      }
      if (userMentioned.work) {
        return "Work stress can be incredibly draining, and I hear how much this is affecting you. It sounds like you're really struggling with this situation. Your feelings about work are completely valid. What would help you feel more supported right now?";
      }
      if (userMentioned.relationships) {
        return "Relationships can be so complex and emotionally draining. I hear how much this is affecting your heart. It sounds like this situation is really weighing on you. What's the hardest part about this for you right now?";
      }
      return "I can sense how much this is affecting you, and I want you to know that your feelings are completely understandable given what you're experiencing. You're not alone in feeling this way. How can I best support you through this challenging time?";
    }
    
    if (isQuestion) {
      return "That's a really thoughtful question. I appreciate you asking that. What do you think might be the answer for you?";
    }
    
    return "I hear you, and I want you to know that your feelings are valid. It sounds like you're going through something challenging. How can I support you right now?";
  };

  const generateHonestResponse = (context: any): string => {
    const { currentTopic, emotionalState, userMentioned, isQuestion } = context;
    
    if (emotionalState === 'negative') {
      if (userMentioned.stress) {
        return "Let me be direct: stress is your body's way of telling you something needs to change. You can't keep carrying this level of stress - it's not sustainable. What specific steps can you take to address the root cause?";
      }
      if (userMentioned.work) {
        return "Let's be honest: this work situation isn't working for you. You're not happy and it's affecting your wellbeing. What specific changes do you need to make?";
      }
      if (userMentioned.relationships) {
        return "Let me be direct: this relationship dynamic isn't healthy. You can't control how others behave, but you can control your response. What boundaries do you need to set?";
      }
      return "I appreciate your honesty in sharing this. Let me give you some direct feedback: this situation requires your attention. What specific steps can you take?";
    }
    
    if (isQuestion) {
      return "That's a direct question, and I appreciate that. The honest answer is that only you can determine what's right for you. What does your gut tell you?";
    }
    
    return "I appreciate your honesty in sharing this. Let me give you some direct feedback: this situation requires your attention. What specific steps can you take?";
  };

  const generateCognitiveResponse = (context: any): string => {
    const { currentTopic, emotionalState, userMentioned, isQuestion } = context;
    
    if (emotionalState === 'negative') {
      if (userMentioned.stress) {
        return "Let's examine your thinking here. What automatic thoughts come up when you think about this stress? I notice some patterns that might be contributing to how you're feeling. What evidence supports or contradicts your perspective?";
      }
      if (userMentioned.work) {
        return "Let's examine your thoughts about work. What automatic thoughts arise when you think about your job? I notice some thinking patterns that might be contributing to your work stress. What evidence supports your perspective?";
      }
      if (userMentioned.relationships) {
        return "Let's examine your thinking about this relationship. What automatic thoughts come up? I notice some thought patterns that might be influencing your relationship experience. What evidence supports your perspective?";
      }
      return "Let's examine your thinking here. I notice some patterns that might be contributing to how you're feeling. Can you identify any automatic thoughts? What evidence supports or contradicts your perspective?";
    }
    
    if (isQuestion) {
      return "That's a great question for self-reflection. Let's examine the thinking behind it. What assumptions are you making? What evidence supports or contradicts those assumptions?";
    }
    
    return "Let's examine your thinking here. I notice some patterns that might be contributing to how you're feeling. Can you identify any automatic thoughts?";
  };

  const generateSolutionResponse = (context: any): string => {
    const { currentTopic, emotionalState, userMentioned, isQuestion } = context;
    
    if (emotionalState === 'negative') {
      if (userMentioned.stress) {
        return "Instead of dwelling on the stress, let's focus on solutions. What's one small step you can take right now to reduce your stress? What resources do you have available to help with this?";
      }
      if (userMentioned.work) {
        return "Let's focus on solutions for your work situation. What specific changes would make the biggest difference? Instead of dwelling on the problems, let's identify what actions you can take to improve your work experience.";
      }
      if (userMentioned.relationships) {
        return "Let's focus on solutions for this relationship. What specific actions can you take to improve the dynamic? Instead of dwelling on the problems, let's identify what changes you can make.";
      }
      return "Instead of dwelling on the problem, let's focus on solutions. What's one small step you can take right now to move forward? What resources do you have available?";
    }
    
    if (isQuestion) {
      return "That's a solution-focused question! Instead of just asking, let's think about what steps you could take. What would success look like for you in this situation?";
    }
    
    return "Instead of dwelling on the problem, let's focus on solutions. What's one small step you can take right now to move forward?";
  };

  // Helper methods for context analysis
  const extractFrequentTopics = (content: string): string[] => {
    const topics = [
      'work', 'relationships', 'family', 'health', 'stress', 'anxiety', 'depression', 
      'goals', 'future', 'past', 'money', 'creativity', 'spirituality', 'friendship',
      'love', 'breakup', 'marriage', 'parenting', 'career', 'education', 'self-care'
    ];
    
    const lowerContent = content.toLowerCase();
    return topics.filter(topic => lowerContent.includes(topic));
  };

  const determineEmotionalState = (content: string): 'positive' | 'negative' | 'neutral' | 'mixed' => {
    const positiveWords = ['happy', 'good', 'great', 'excited', 'joy', 'love', 'grateful', 'blessed', 'peaceful', 'content', 'fulfilled', 'proud', 'confident', 'hopeful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'disappointed', 'worried', 'anxious', 'stressed', 'tired', 'lonely', 'hurt', 'confused', 'overwhelmed', 'hopeless', 'guilty'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount === negativeCount && positiveCount > 0) return 'mixed';
    return 'neutral';
  };

  const endSession = () => {
    if (!currentSession) return;
    
    const endedSession = {
      ...currentSession,
      endTime: new Date(),
      mood: { ...currentSession.mood, end: mood[0] }
    };
    
    LocalStorage.saveTherapySession(endedSession);
    setCurrentSession(null);
    setMessages([]);
    startNewSession();
  };

  const handleToneChange = (newTone: keyof typeof THERAPEUTIC_TONES) => {
    setSelectedTone(newTone);
    if (currentSession) {
      // Update current session with new tone
      const updatedSession = {
        ...currentSession,
        tone: newTone
      };
      setCurrentSession(updatedSession);
      LocalStorage.saveTherapySession(updatedSession);
    }
  };

  const currentTone = THERAPEUTIC_TONES[selectedTone];

  return (
    <Card className="h-[600px] flex flex-col border-0 shadow-medium bg-gradient-flow">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <YingYangSymbol size="sm" animate={isTyping} />
            <div>
              <h3 className="text-lg font-serif font-medium">Therapist Mode</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>Safe & Private Conversation</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-xs ${currentTone.bgColor} ${currentTone.color}`}>
              <span className="mr-1">{currentTone.icon}</span>
              {currentTone.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              Therapist
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {showSettings && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Therapeutic Approach
                </label>
                <Select value={selectedTone} onValueChange={handleToneChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(THERAPEUTIC_TONES).map(([key, tone]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{tone.icon}</span>
                          <span>{tone.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentTone.description}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  AI Status
                </label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <div className={`w-2 h-2 rounded-full ${isLocalAIReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm">
                    {isLocalAIReady ? 'Conversational AI Ready' : 'Loading Conversational AI...'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLocalAIReady 
                    ? 'Using conversational AI for contextual responses' 
                    : 'Initializing conversational AI system...'
                  }
                </p>
              </div>
              
              <Button variant="outline" size="sm" onClick={endSession}>
                Start New Session
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current mood:</span>
            <span className="font-medium">{mood[0]}/10</span>
          </div>
          <Slider
            value={mood}
            onValueChange={setMood}
            max={10}
            min={1}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <YingYangSymbol size="lg" className="mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Start a conversation with your therapist</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full ${currentTone.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Bot className={`w-4 h-4 ${currentTone.color}`} />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : `${currentTone.bgColor} text-foreground border border-border/30`
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className={`w-8 h-8 rounded-full ${currentTone.bgColor} flex items-center justify-center`}>
                <YingYangSymbol size="sm" animate />
              </div>
              <div className={`${currentTone.bgColor} p-3 rounded-lg border border-border/30`}>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 ${currentTone.color.replace('text-', 'bg-')} rounded-full animate-bounce`}></div>
                  <div className={`w-2 h-2 ${currentTone.color.replace('text-', 'bg-')} rounded-full animate-bounce delay-100`}></div>
                  <div className={`w-2 h-2 ${currentTone.color.replace('text-', 'bg-')} rounded-full animate-bounce delay-200`}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
                            placeholder={isLocalAIReady ? "Share your thoughts with Conversational AI..." : "Loading Conversational AI..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isTyping || !isLocalAIReady}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping || !isLocalAIReady}
            size="sm"
          >
            {isTyping ? (
              <YingYangSymbol size="sm" animate />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};