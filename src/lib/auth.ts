// Local authentication utilities for Kaizen app
export interface UserProfile {
  name: string;
  phoneNumber: string;
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
  focusAreas: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  passcode: string | null;
  lastLogin: Date | null;
  userProfile?: UserProfile;
}

export class AuthManager {
  private static readonly AUTH_KEY = 'kaizen_auth';
  private static readonly SESSION_KEY = 'kaizen_session';
  private static readonly PROFILE_KEY = 'kaizen_profile';

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const session = this.getSession();
    return session && session.isAuthenticated;
  }

  // Get current session
  static getSession(): AuthState | null {
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    return {
      ...session,
      lastLogin: session.lastLogin ? new Date(session.lastLogin) : null
    };
  }

  // Check if user has set up authentication
  static hasPasscode(): boolean {
    const auth = this.getAuthData();
    return auth && auth.passcode !== null;
  }

  // Get stored auth data
  static getAuthData(): AuthState | null {
    const stored = localStorage.getItem(this.AUTH_KEY);
    if (!stored) return null;
    
    const auth = JSON.parse(stored);
    return {
      ...auth,
      lastLogin: auth.lastLogin ? new Date(auth.lastLogin) : null
    };
  }

  // Get user profile
  static getUserProfile(): UserProfile | null {
    const stored = localStorage.getItem(this.PROFILE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  }

  // Save user profile
  static saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  // Set up passcode for first-time users
  static setupPasscode(passcode: string, profile: UserProfile): void {
    const authData: AuthState = {
      isAuthenticated: true,
      passcode,
      lastLogin: new Date(),
      userProfile: profile
    };
    
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(authData));
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  // Validate passcode and login
  static login(passcode: string): boolean {
    const authData = this.getAuthData();
    
    if (!authData || authData.passcode !== passcode) {
      return false;
    }

    // Update session
    const sessionData: AuthState = {
      isAuthenticated: true,
      passcode: authData.passcode,
      lastLogin: new Date(),
      userProfile: authData.userProfile
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    
    // Update last login in auth data
    authData.lastLogin = new Date();
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
    
    return true;
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Change passcode
  static changePasscode(newPasscode: string): boolean {
    const authData = this.getAuthData();
    if (!authData) return false;

    authData.passcode = newPasscode;
    authData.lastLogin = new Date();
    
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(authData));
    
    return true;
  }

  // Clear all auth data (for reset)
  static clearAuth(): void {
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.PROFILE_KEY);
  }
}
