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
  firebaseUser: FirebaseUser | null;
  dbUser: any;
  dbProfile: any;
  dbAiAnalysis: any;
  loading: boolean;
};

const authContext = createContext<AuthContextType>({
  firebaseUser: null,
  dbUser: null,
  dbProfile: null,
  dbAiAnalysis: null,
  loading: true,
});

export function AuthContext({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const [dbUser, setDbUser] = useState<any>(null);

  const [dbProfile, setDbProfile] = useState<any>(null);

  const [dbAiAnalysis, setDbAiAnalysis] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const router = useRouter();

  async function loadUserData(fbUser: FirebaseUser) {
    try {
      const userRes = await axios.get(`/api/users?email=${fbUser.email}`);

      const user = userRes.data;

      setDbUser(user);

      try {
        const profileRes = await axios.get(`/api/profiles/${user.id}`);

        const profile = profileRes.data;

        setDbProfile(profile);

        try {
          const analysis = await getAnalysis(profile.id, profile.user_id);

          setDbAiAnalysis(analysis);
        } catch {
          setDbAiAnalysis(null);
        }
      } catch {
        setDbProfile(null);
        setDbAiAnalysis(null);
      }
    } catch {
      clearUserState();
    }
  }

  function clearUserState() {
    setDbUser(null);
    setDbProfile(null);
    setDbAiAnalysis(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);

      setFirebaseUser(fbUser);

      if (fbUser) {
        await loadUserData(fbUser);
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
      }}
    >
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () => useContext(authContext);
