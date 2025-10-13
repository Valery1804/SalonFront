"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  login as loginRequest,
  getProfile,
  logout as logoutService,
  type AuthResponse,
  type User,
} from "@/service/authService";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  initializing: boolean;
  authenticating: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<User | null>;
  setSession: (session: AuthResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  const setSession = useCallback((session: AuthResponse) => {
    localStorage.setItem("token", session.accessToken);
    localStorage.setItem("user", JSON.stringify(session.user));
    setUser(session.user);
    setToken(session.accessToken);
  }, []);

  const clearSession = useCallback(() => {
    logoutService();
    setUser(null);
    setToken(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      return profile;
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes("no autorizado")) {
        clearSession();
      }
      return null;
    }
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuthenticating(true);
      try {
        const session = await loginRequest(email, password);
        setSession(session);
        return session;
      } finally {
        setAuthenticating(false);
      }
    },
    [setSession]
  );

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        return;
      }

      if (!active) return;
      setToken(storedToken);

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser) as User;
          if (active) {
            setUser(parsed);
          }
        } catch {
          // ignore invalid JSON
        }
      }

      await refreshProfile();
    };

    void bootstrap().finally(() => {
      if (active) {
        setInitializing(false);
      }
    });

    return () => {
      active = false;
    };
  }, [refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      authenticating,
      login,
      logout: clearSession,
      refreshProfile,
      setSession,
    }),
    [user, token, initializing, authenticating, login, clearSession, refreshProfile, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
