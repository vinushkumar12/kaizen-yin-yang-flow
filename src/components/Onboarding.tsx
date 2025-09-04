import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { YingYangSymbol } from "@/components/YingYangSymbol";
import { FloatingDots } from "@/components/ui/floating-elements";
import { AuthManager, UserProfile } from "@/lib/auth";
import { 
  User, 
  Phone, 
  Target, 
  Clock, 
  Heart,
  Brain,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Lock
} from "lucide-react";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<{
    name: string;
    phoneNumber: string;
    goals: string[];
    experienceLevel: string;
    preferredTime: string;
    focusAreas: string[];
  }>({
    name: "",
    phoneNumber: "",
    goals: [],
    experienceLevel: "beginner",
    preferredTime: "morning",
    focusAreas: []
  });
  const [username, setUsername] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [error, setError] = useState("");

  const totalSteps = 4;

  const goalOptions = [
    { id: "stress", label: "Reduce stress and anxiety", icon: Heart },
    { id: "clarity", label: "Gain mental clarity", icon: Brain },
    { id: "growth", label: "Personal growth and development", icon: TrendingUp },
    { id: "gratitude", label: "Practice gratitude", icon: Sparkles },
    { id: "relationships", label: "Improve relationships", icon: Heart },
    { id: "productivity", label: "Increase productivity", icon: Target },
    { id: "creativity", label: "Enhance creativity", icon: Sparkles },
    { id: "self-awareness", label: "Build self-awareness", icon: Brain }
  ];

  const focusAreaOptions = [
    "Emotional well-being",
    "Career and work",
    "Relationships",
    "Health and fitness",
    "Personal development",
    "Creativity and hobbies",
    "Spirituality",
    "Financial goals"
  ];

  const handleNext = () => {
    if (step === 0) {
      if (!profile.name?.trim() || !profile.phoneNumber?.trim()) {
        setError("Please fill in both name and phone number");
        return;
      }
    } else if (step === 1) {
      if (!username.trim()) {
        setError("Please enter a username");
        return;
      }
      if (!passcode.trim()) {
        setError("Please enter a passcode");
        return;
      }
      if (passcode !== confirmPasscode) {
        setError("Passcodes do not match");
        return;
      }
      if (passcode.length < 4) {
        setError("Passcode must be at least 4 characters");
        return;
      }
    } else if (step === 2) {
      if (!profile.goals || profile.goals.length === 0) {
        setError("Please select at least one goal");
        return;
      }
    } else if (step === 3) {
      if (!profile.focusAreas || profile.focusAreas.length === 0) {
        setError("Please select at least one focus area");
        return;
      }
    }

    setError("");
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Create the account
      const fullProfile: UserProfile = {
        name: profile.name!,
        phoneNumber: profile.phoneNumber!,
        goals: profile.goals!,
        experienceLevel: profile.experienceLevel as 'beginner' | 'intermediate' | 'advanced',
        preferredTime: profile.preferredTime as 'morning' | 'afternoon' | 'evening' | 'anytime',
        focusAreas: profile.focusAreas!
      };

      console.log('Creating account with profile:', fullProfile);
      console.log('Passcode:', passcode);
      
      // Save user profile
      AuthManager.saveUserProfile(fullProfile);
      console.log('User profile saved successfully');
      console.log('Account creation completed successfully');
      setError(""); // Clear any previous errors
      onComplete(fullProfile);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals?.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...(prev.goals || []), goalId]
    }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setProfile(prev => ({
      ...prev,
      focusAreas: prev.focusAreas?.includes(area)
        ? prev.focusAreas.filter(f => f !== area)
        : [...(prev.focusAreas || []), area]
    }));
  };

  const renderStep0 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold mb-2">Tell us about yourself</h2>
        <p className="text-muted-foreground">Let's personalize your journaling experience</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name
          </Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your full name"
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            value={profile.phoneNumber}
            onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
            placeholder="Enter your phone number"
            className="text-lg"
          />
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold mb-2">Create Your Account</h2>
        <p className="text-muted-foreground">Set up your login credentials</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Username
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a unique username"
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passcode" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Passcode
          </Label>
          <Input
            id="passcode"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Create a passcode (min 4 characters)"
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPasscode" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Confirm Passcode
          </Label>
          <Input
            id="confirmPasscode"
            type="password"
            value={confirmPasscode}
            onChange={(e) => setConfirmPasscode(e.target.value)}
            placeholder="Confirm your passcode"
            className="text-lg"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold mb-2">What are your goals?</h2>
        <p className="text-muted-foreground">Select all that apply to your journaling practice</p>
      </div>

      <div className="grid gap-3">
        {goalOptions.map((goal) => {
          const Icon = goal.icon;
          return (
            <div
              key={goal.id}
              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => handleGoalToggle(goal.id)}
            >
              <Checkbox
                checked={profile.goals?.includes(goal.id) || false}
                onChange={() => handleGoalToggle(goal.id)}
              />
              <div className="flex items-center gap-3 flex-1">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{goal.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-serif font-bold mb-2">What would you like to focus on?</h2>
        <p className="text-muted-foreground">Choose areas that matter most to you</p>
      </div>

      <div className="grid gap-3">
        {focusAreaOptions.map((area) => (
          <div
            key={area}
            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => handleFocusAreaToggle(area)}
          >
            <Checkbox
              checked={profile.focusAreas?.includes(area) || false}
              onChange={() => handleFocusAreaToggle(area)}
            />
            <span className="text-sm font-medium">{area}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 0: return renderStep0();
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep0();
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <FloatingDots count={6} />
      
      <div className="w-full max-w-2xl px-4">
        <Card className="p-8 border-0 shadow-strong bg-background/80 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <YingYangSymbol size="lg" className="drop-shadow-lg" />
            </div>
            
            <h1 className="text-3xl font-serif font-bold mb-2">
              Welcome to Kaizen
            </h1>
            
            <p className="text-muted-foreground mb-4">
              Let's set up your personalized journaling experience
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Step {step + 1} of {totalSteps}
            </p>
          </div>

          {/* Step Content */}
          {getStepContent()}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button 
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 font-medium shadow-medium hover:shadow-strong transition-all duration-300 group"
            >
              {step === totalSteps - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
