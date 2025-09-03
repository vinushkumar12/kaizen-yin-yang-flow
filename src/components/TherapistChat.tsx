import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Heart,
  Brain,
  Sparkles,
  Settings
} from "lucide-react";
import { YingYangSymbol } from "./YingYangSymbol";
import { LocalStorage, ChatMessage, TherapistSession } from "@/lib/storage";

interface TherapistChatProps {
  onMoodChange?: (mood: number) => void;
}

export const TherapistChat = ({ onMoodChange }: TherapistChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState<TherapistSession | null>(null);
  const [mood, setMood] = useState<number[]>([5]);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing session or create new one
    const sessions = LocalStorage.getTherapySessions();
    const latestSession = sessions[sessions.length - 1];
    
    if (latestSession && !latestSession.endTime) {
      // Continue existing session
      setCurrentSession(latestSession);
      setMessages(latestSession.messages);
    } else {
      // Start new session
      startNewSession();
    }
  }, []);

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
    const newSession: TherapistSession = {
      id: sessionId,
      startTime: new Date(),
      messages: [],
      mood: { start: mood[0] }
    };

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Hello! I'm here to listen and support you. How are you feeling today? Feel free to share whatever is on your mind.",
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
      messages: [...currentSession.messages, userMessage]
    };
    setCurrentSession(updatedSession);
    LocalStorage.saveTherapySession(updatedSession);

    setInputValue("");
    setIsTyping(true);

    try {
      // Call AI API (OpenAI example)
      const response = await callAI(userMessage.content, messages);
      
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
      console.error('AI API error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Would you like to continue writing in your journal instead? Sometimes putting thoughts on paper can be just as helpful.",
        timestamp: new Date(),
        sessionId: currentSession.id
      };
      
      setMessages(prev => [...prev, errorMessage]);
      LocalStorage.saveChatMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const callAI = async (message: string, context: ChatMessage[]): Promise<string> => {
    if (!apiKey) {
      throw new Error('API key required');
    }

    const systemPrompt = `You are a compassionate, empathetic AI therapist. Your role is to:
    - Listen actively and validate emotions
    - Ask thoughtful follow-up questions
    - Provide gentle insights and coping strategies
    - Maintain professional boundaries
    - Encourage self-reflection and personal growth
    - Be supportive but not give medical advice
    
    Keep responses conversational, warm, and under 150 words. Focus on the person's feelings and experiences.`;

    const contextMessages = context.slice(-6).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...contextMessages,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I understand. Can you tell me more about how you're feeling?";
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
            <Badge variant="secondary" className="text-xs">
              <Heart className="w-3 h-3 mr-1" />
              Empathetic
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              AI Powered
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
                <label className="text-sm font-medium text-foreground">
                  OpenAI API Key
                </label>
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1 text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your key stays local and private. Get one from openai.com
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground'
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
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <YingYangSymbol size="sm" animate />
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
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
            placeholder={apiKey ? "Share your thoughts..." : "Add API key in settings to start chatting"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={isTyping || !apiKey}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping || !apiKey}
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