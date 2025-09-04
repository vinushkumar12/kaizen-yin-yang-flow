import { pipeline } from '@huggingface/transformers';

// Local AI Therapist using Hugging Face Transformers.js
export class LocalTherapist {
  private static textGenerationPipeline: any = null;
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing local AI therapist...');
      
      // Load a text generation model suitable for conversation
      // Using a smaller, faster model for local processing
      this.textGenerationPipeline = await pipeline(
        'text-generation',
        'Xenova/gpt2-small' // Smaller, faster model
      );
      
      this.initialized = true;
      console.log('Local AI therapist loaded successfully');
    } catch (error) {
      console.warn('Failed to load local AI therapist:', error);
    }
  }

  // Therapeutic tone definitions with local processing
  static readonly THERAPEUTIC_TONES = {
    empathetic: {
      name: "Empathetic",
      icon: "💖",
      description: "Warm, understanding, and emotionally supportive",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      promptTemplate: (userMessage: string, context: string) => 
        `You are a compassionate, empathetic AI therapist. Respond with warmth and understanding to: "${userMessage}". 
        Previous context: ${context}
        Provide a caring, supportive response under 100 words.`
    },
    honest: {
      name: "Honest",
      icon: "🛡️",
      description: "Direct, truthful, and straightforward guidance",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      promptTemplate: (userMessage: string, context: string) => 
        `You are a direct and honest AI therapist. Give straightforward feedback to: "${userMessage}". 
        Previous context: ${context}
        Provide honest, direct guidance under 100 words.`
    },
    cognitive: {
      name: "Cognitive-Behavioral",
      icon: "🧠",
      description: "Thought-focused, pattern recognition, and behavioral change",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      promptTemplate: (userMessage: string, context: string) => 
        `You are a cognitive-behavioral AI therapist. Help analyze thoughts and behaviors in: "${userMessage}". 
        Previous context: ${context}
        Provide structured, educational guidance under 100 words.`
    },
    solution: {
      name: "Solution-Focused",
      icon: "🎯",
      description: "Goal-oriented, action-focused, and future-directed",
      color: "text-green-600",
      bgColor: "bg-green-50",
      promptTemplate: (userMessage: string, context: string) => 
        `You are a solution-focused AI therapist. Help find solutions for: "${userMessage}". 
        Previous context: ${context}
        Provide action-oriented, goal-focused guidance under 100 words.`
    }
  };

  static async generateResponse(
    userMessage: string, 
    context: string[], 
    tone: keyof typeof LocalTherapist.THERAPEUTIC_TONES
  ): Promise<string> {
    if (!this.initialized || !this.textGenerationPipeline) {
      await this.initialize();
    }

    try {
      const toneConfig = this.THERAPEUTIC_TONES[tone];
      const contextString = context.slice(-3).join(' '); // Last 3 messages for context
      
      const prompt = toneConfig.promptTemplate(userMessage, contextString);
      
      // Generate response using local model
      const result = await this.textGenerationPipeline(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9,
        repetition_penalty: 1.1
      });

      // Extract and clean the generated response
      let response = result[0]?.generated_text || '';
      
      // Remove the original prompt from the response
      response = response.replace(prompt, '').trim();
      
      // Clean up the response
      response = this.cleanResponse(response);
      
      // Fallback if response is too short or unclear
      if (response.length < 20) {
        response = this.getFallbackResponse(tone, userMessage);
      }

      return response;
    } catch (error) {
      console.warn('Local AI generation failed:', error);
      return this.getFallbackResponse(tone, userMessage);
    }
  }

  private static cleanResponse(response: string): string {
    // Remove extra whitespace and newlines
    response = response.replace(/\s+/g, ' ').trim();
    
    // Remove any remaining prompt artifacts
    response = response.replace(/^(You are|As an AI|I am).*?\./gi, '').trim();
    
    // Ensure it ends with proper punctuation
    if (!response.endsWith('.') && !response.endsWith('!') && !response.endsWith('?')) {
      response += '.';
    }
    
    return response;
  }

  private static getFallbackResponse(tone: keyof typeof LocalTherapist.THERAPEUTIC_TONES, userMessage: string): string {
    const fallbackResponses = {
      empathetic: [
        "I hear you, and I want you to know that your feelings are valid. It sounds like you're going through something challenging. How can I support you right now?",
        "I can sense that this is really affecting you. Your emotions matter, and I'm here to listen. What would be most helpful for you in this moment?",
        "Thank you for sharing this with me. I can see how much this means to you. Let's work through this together, one step at a time."
      ],
      honest: [
        "I appreciate your honesty in sharing this. Let me give you some direct feedback: this situation requires your attention. What specific steps can you take?",
        "I need to be straightforward with you: this pattern isn't serving you well. Let's identify what needs to change and how to make it happen.",
        "Here's the truth: you have more control over this situation than you might think. What's one thing you can do differently right now?"
      ],
      cognitive: [
        "Let's examine your thinking here. I notice some patterns that might be contributing to how you're feeling. Can you identify any automatic thoughts?",
        "I see some cognitive distortions in your thinking. Let's challenge these thoughts together. What evidence supports or contradicts your perspective?",
        "Your thoughts are creating your emotional response. Let's identify the connection between what you're thinking and how you're feeling."
      ],
      solution: [
        "Instead of dwelling on the problem, let's focus on solutions. What's one small step you can take right now to move forward?",
        "You have strengths and resources to draw on. Let's identify what's working and build on that. What would success look like for you?",
        "Let's create an action plan. What specific, achievable goal can you set for yourself in the next 24 hours?"
      ]
    };

    const responses = fallbackResponses[tone];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  static getWelcomeMessage(tone: keyof typeof LocalTherapist.THERAPEUTIC_TONES): string {
    const welcomeMessages = {
      empathetic: "Hello! I'm here to listen and support you with warmth and understanding. How are you feeling today? I want to hear whatever is on your mind.",
      honest: "Hello! I'm here to provide honest, direct support and guidance. How are you really doing? I'm ready to give you straightforward feedback.",
      cognitive: "Hello! I'm here to help you understand your thoughts and behaviors. What's on your mind today? Let's explore your thinking patterns together.",
      solution: "Hello! I'm here to help you find solutions and move forward. What would you like to work on today? Let's focus on your goals and next steps."
    };

    return welcomeMessages[tone];
  }

  static isAvailable(): boolean {
    return this.initialized && this.textGenerationPipeline !== null;
  }
}
