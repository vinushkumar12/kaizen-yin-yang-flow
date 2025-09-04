import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { YingYangSymbol } from "@/components/YingYangSymbol";
import { FloatingDots } from "@/components/ui/floating-elements";
import { Onboarding } from "./Onboarding";
import { AuthManager, UserProfile } from "@/lib/auth";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Sparkles,
  ArrowRight,
  Key,
  UserCheck
} from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingPasscode, setHasExistingPasscode] = useState(false);

  useEffect(() => {
    // Check if user has already set up a passcode
    const hasPasscode = AuthManager.hasPasscode();
    setHasExistingPasscode(hasPasscode);
    
    // If it's a first-time user, go directly to onboarding
    if (!hasPasscode) {
      setShowOnboarding(true);
    } else {
      setIsSignup(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignup) {
        // If this is the initial signup (not after onboarding), show onboarding first
        if (!AuthManager.getUserProfile()) {
          setShowOnboarding(true);
          setIsLoading(false);
          return;
        }

        // Final passcode setup after onboarding
        if (passcode.length < 4) {
          setError("Passcode must be at least 4 characters long");
          return;
        }
        
        if (passcode !== confirmPasscode) {
          setError("Passcodes do not match");
          return;
        }

        // Get the profile from onboarding
        const profile = AuthManager.getUserProfile();
        if (!profile) {
          setError("Profile data not found. Please try again.");
          return;
        }

        AuthManager.setupPasscode(passcode, profile);
        onLogin();
      } else {
        // Login flow
        if (!passcode) {
          setError("Please enter your passcode");
          return;
        }

        const success = AuthManager.login(passcode);
        if (!success) {
          setError("Incorrect passcode. Please try again.");
          return;
        }

        onLogin();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    // Save the profile and show passcode setup
    AuthManager.saveUserProfile(profile);
    setShowOnboarding(false);
    setIsSignup(true);
  };

  const handleOnboardingBack = () => {
    setShowOnboarding(false);
  };

  const handleCreateDemoAccount = () => {
    // Import SampleDataGenerator dynamically to avoid import issues
    import("@/lib/sampleData").then(({ SampleDataGenerator }) => {
      SampleDataGenerator.initializeSampleData(true); // Include today for demo
      onLogin();
    });
  };

  const handleModeToggle = () => {
    // If returning user wants to create new account, clear data and go to onboarding
    if (hasExistingPasscode) {
      if (confirm("This will clear all existing data and start fresh. Are you sure?")) {
        AuthManager.clearAuth();
        setHasExistingPasscode(false);
        setShowOnboarding(true);
        setPasscode("");
        setConfirmPasscode("");
        setError("");
      }
    } else {
      // If in signup mode, switch to login
      setIsSignup(!isSignup);
      setPasscode("");
      setConfirmPasscode("");
      setError("");
    }
  };

  const handleReset = () => {
    if (confirm("This will clear all your data. Are you sure?")) {
      AuthManager.clearAuth();
      setHasExistingPasscode(false);
      setIsSignup(false);
      setPasscode("");
      setConfirmPasscode("");
      setError("");
    }
  };

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Show passcode setup after onboarding (for first-time users)
  if (isSignup && !showOnboarding) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        <FloatingDots count={6} />
        
        <div className="w-full max-w-md px-4">
          <Card className="p-8 border-0 shadow-strong bg-background/80 backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <YingYangSymbol size="lg" className="drop-shadow-lg" />
              </div>
              
              <h1 className="text-3xl font-serif font-bold mb-2">
                Secure Your Journal
              </h1>
              
              <p className="text-muted-foreground">
                Create a passcode to protect your private reflections
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Passcode Input */}
              <div className="space-y-2">
                <Label htmlFor="passcode" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Create Passcode
                </Label>
                <div className="relative">
                  <Input
                    id="passcode"
                    type={showPassword ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter 4+ characters"
                    className="pr-10"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Passcode */}
              <div className="space-y-2">
                <Label htmlFor="confirmPasscode" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Confirm Passcode
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPasscode"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Confirm your passcode"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium shadow-medium hover:shadow-strong transition-all duration-300 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <YingYangSymbol size="sm" animate className="mr-2" />
                ) : (
                  <Lock className="w-5 h-5 mr-2" />
                )}
                Create Account
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Demo Account Button */}
              <Button 
                type="button"
                variant="outline"
                onClick={handleCreateDemoAccount}
                className="w-full py-3 text-lg font-medium border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
                disabled={isLoading}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try Demo Account
              </Button>
            </form>

            {/* Back to Onboarding */}
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setShowOnboarding(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Setup
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main login form
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <FloatingDots count={6} />
      
      <div className="w-full max-w-md px-4">
        <Card className="p-8 border-0 shadow-strong bg-background/80 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <YingYangSymbol size="lg" className="drop-shadow-lg" />
            </div>
            
            <h1 className="text-3xl font-serif font-bold mb-2">
              Welcome Back
            </h1>
            
            <p className="text-muted-foreground">
              Enter your passcode to access your journal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Passcode Input */}
            <div className="space-y-2">
              <Label htmlFor="passcode" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Enter Passcode
              </Label>
              <div className="relative">
                <Input
                  id="passcode"
                  type={showPassword ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter your passcode"
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Passcode (Signup only) */}
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="confirmPasscode" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Confirm Passcode
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPasscode"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Confirm your passcode"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-medium shadow-medium hover:shadow-strong transition-all duration-300 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <YingYangSymbol size="sm" animate className="mr-2" />
              ) : (
                <Lock className="w-5 h-5 mr-2" />
              )}
              Unlock Journal
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

                      {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={handleModeToggle}
                className="text-muted-foreground hover:text-foreground"
              >
                First time? Create account
              </Button>
            </div>

          {/* Reset Option */}
          {hasExistingPasscode && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive text-xs"
              >
                Reset all data
              </Button>
            </div>
          )}

          {/* Security Note */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Your Privacy Matters</p>
                <p>
                  Your passcode and all data are stored locally on your device. 
                  We never have access to your private reflections.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
