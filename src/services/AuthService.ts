export interface UserSession {
  name: string;
  email: string;
  profilePhoto: string;
  fullName?: string;
  salary?: number;
  activeProfileId?: string;
}

export interface AuthService {
  getCurrentUser(): UserSession | null;
  setCurrentUser(user: UserSession | null): void;
  isAuthenticated(): boolean;
  logout(): Promise<void>;
}

export class GuestAuthService implements AuthService {
  private defaultGuest: UserSession = {
    name: "Guest",
    fullName: "Guest User",
    email: "guest@paisablueprint.in",
    profilePhoto: "🧑‍💼",
    salary: 75000,
    activeProfileId: "profile-main"
  };

  getCurrentUser(): UserSession | null {
    if (typeof window === "undefined") return this.defaultGuest;
    const saved = localStorage.getItem("paisa_active_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch (e) {
        console.warn("AuthService: failed to parse active session", e);
      }
    }
    // Automatically initialize guest user in localStorage
    localStorage.setItem("paisa_active_session", JSON.stringify(this.defaultGuest));
    return this.defaultGuest;
  }

  setCurrentUser(user: UserSession | null): void {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("paisa_active_session", JSON.stringify(user));
    } else {
      localStorage.setItem("paisa_active_session", JSON.stringify(this.defaultGuest));
    }
  }

  isAuthenticated(): boolean {
    return true; // Guests are always authenticated in guest-first mode
  }

  async logout(): Promise<void> {
    if (typeof window === "undefined") return;
    // In guest mode, logging out resets to the default guest user session
    localStorage.setItem("paisa_active_session", JSON.stringify(this.defaultGuest));
  }
}

export const authService = new GuestAuthService();
