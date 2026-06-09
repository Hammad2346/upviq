"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { getAnalysis } from "@/lib/api";

type AuthContextType = {
  firebaseUser:      FirebaseUser | null;
  dbUser:            any;
  dbProfile:         any;
  dbAiAnalysis:      any;
  loading:           boolean;
  upworkConnected:   boolean;
  refreshProfile:    () => Promise<void>;
  refreshAnalysis:   () => Promise<void>;
  refreshAll:        () => Promise<void>;
  refreshUpworkStatus: () => Promise<void>;
};

const authContext = createContext<AuthContextType>({
  firebaseUser:      null,
  dbUser:            null,
  dbProfile:         null,
  dbAiAnalysis:      null,
  loading:           true,
  upworkConnected:   false,
  refreshProfile:    async () => {},
  refreshAnalysis:   async () => {},
  refreshAll:        async () => {},
  refreshUpworkStatus: async () => {},
});

export function AuthContext({ children }: { children: ReactNode }) {
  const [firebaseUser,    setFirebaseUser]    = useState<FirebaseUser | null>(null);
  const [dbUser,          setDbUser]          = useState<any>(null);
  const [dbProfile,       setDbProfile]       = useState<any>(null);
  const [dbAiAnalysis,    setDbAiAnalysis]    = useState<any>(null);
  const [loading,         setLoading]         = useState(true);
  const [upworkConnected, setUpworkConnected] = useState(false);

  const pathname = usePathname();
  const router   = useRouter();

  async function fetchDbUser(email: string) {
    try {
      const res = await axios.get(`/api/users?email=${email}`);
      setDbUser(res.data);
      return res.data;
    } catch {
      setDbUser(null);
      return null;
    }
  }

  async function fetchProfile(userId: number) {
    try {
      const res = await axios.get(`/api/profiles/${userId}`);
      setDbProfile(res.data);
      return res.data;
    } catch {
      setDbProfile(null);
      return null;
    }
  }

  async function fetchAnalysis(profile: any) {
    if (!profile?.id || !profile?.user_id) {
      setDbAiAnalysis(null);
      return;
    }
    try {
      const analysis = await getAnalysis(profile.id, profile.user_id);
      setDbAiAnalysis(analysis);
    } catch {
      setDbAiAnalysis(null);
    }
  }

  async function fetchUpworkStatus(userId: number) {
    try {
      const res = await axios.get(`/api/users/upwork-status?user_id=${userId}`)
      setUpworkConnected(res.data.connected === true)
    } catch {
      setUpworkConnected(false)
    }
  }

  async function refreshProfile() {
    if (!dbUser?.id) {
      setDbProfile(null);
      return;
    }
    await fetchProfile(dbUser.id);
  }

  async function refreshAnalysis() {
    await fetchAnalysis(dbProfile);
  }

  async function refreshAll() {
    if (!dbUser?.id) return;
    const freshProfile = await fetchProfile(dbUser.id);
    await fetchAnalysis(freshProfile);
  }

  async function refreshUpworkStatus() {
    if (!dbUser?.id) return
    await fetchUpworkStatus(dbUser.id)
  }

  function clearUserState() {
    setDbUser(null);
    setDbProfile(null);
    setDbAiAnalysis(null);
    setUpworkConnected(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      setFirebaseUser(fbUser);

      if (fbUser) {
        const user = await fetchDbUser(fbUser.email || "");
        if (user) {
          const profile = await fetchProfile(user.id);
          if (profile) {
            await fetchAnalysis(profile);
          }
          await fetchUpworkStatus(user.id)
        }
      } else {
        clearUserState();
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading && !firebaseUser && pathname.startsWith("/dashboard")) {
      router.replace("/login");
    }
  }, [loading, firebaseUser, pathname, router]);

  return (
    <authContext.Provider
      value={{
        firebaseUser,
        dbUser,
        dbProfile,
        dbAiAnalysis,
        loading,
        upworkConnected,
        refreshProfile,
        refreshAnalysis,
        refreshAll,
        refreshUpworkStatus,
      }}
    >
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () => useContext(authContext);