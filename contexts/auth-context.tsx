"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "@/lib/firebase";

import {
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import axios from "axios";

import { getAnalysis } from "@/lib/api";

type AuthContextType = {
  firebaseUser: FirebaseUser | null;

  dbUser: any;

  dbProfile: any;

  dbAiAnalysis: any;

  loading: boolean;

  refreshProfile: () => Promise<void>;

  refreshAnalysis: () => Promise<void>;

  refreshAll: () => Promise<void>;
};

const authContext = createContext<AuthContextType>({
  firebaseUser: null,

  dbUser: null,

  dbProfile: null,

  dbAiAnalysis: null,

  loading: true,

  refreshProfile: async () => {},

  refreshAnalysis: async () => {},

  refreshAll: async () => {},
});

export function AuthContext({
  children,
}: {
  children: ReactNode;
}) {
  const [firebaseUser, setFirebaseUser] =
    useState<FirebaseUser | null>(null);

  const [dbUser, setDbUser] = useState<any>(null);

  const [dbProfile, setDbProfile] =
    useState<any>(null);

  const [dbAiAnalysis, setDbAiAnalysis] =
    useState<any>(null);

  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  const router = useRouter();

  async function fetchDbUser(email: string) {
    try {
      const res = await axios.get(
        `/api/users?email=${email}`
      );

      setDbUser(res.data);

      return res.data;
    } catch {
      setDbUser(null);

      return null;
    }
  }

  async function refreshProfile() {
    if (!dbUser?.id) {
      setDbProfile(null);

      return;
    }

    try {
      const res = await axios.get(
        `/api/profiles/${dbUser.id}`
      );

      setDbProfile(res.data);
    } catch {
      setDbProfile(null);
    }
  }

  async function refreshAnalysis() {
    if (!dbProfile?.id || !dbProfile?.user_id) {
      setDbAiAnalysis(null);

      return;
    }

    try {
      const analysis = await getAnalysis(
        dbProfile.id,
        dbProfile.user_id
      );

      setDbAiAnalysis(analysis);
    } catch {
      setDbAiAnalysis(null);
    }
  }

  async function refreshAll() {
    await refreshProfile();
  }

  function clearUserState() {
    setDbUser(null);
    setDbProfile(null);
    setDbAiAnalysis(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser) => {
        setLoading(true);

        setFirebaseUser(fbUser);

        if (fbUser) {
          const user = await fetchDbUser(
            fbUser.email || ""
          );

          if (user) {
            try {
              const profileRes = await axios.get(
                `/api/profiles/${user.id}`
              );

              const profile = profileRes.data;

              setDbProfile(profile);

              try {
                const analysis = await getAnalysis(
                  profile.id,
                  profile.user_id
                );

                setDbAiAnalysis(analysis);
              } catch {
                setDbAiAnalysis(null);
              }
            } catch {
              setDbProfile(null);

              setDbAiAnalysis(null);
            }
          }
        } else {
          clearUserState();
        }

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (
      !loading &&
      !firebaseUser &&
      pathname.startsWith("/dashboard")
    ) {
      router.replace("/login");
    }
  }, [loading, firebaseUser, pathname, router]);

  useEffect(() => {
    refreshAnalysis();
  }, [dbProfile]);

  return (
    <authContext.Provider
      value={{
        firebaseUser,

        dbUser,

        dbProfile,

        dbAiAnalysis,

        loading,

        refreshProfile,

        refreshAnalysis,

        refreshAll,
      }}
    >
      {children}
    </authContext.Provider>
  );
}

export const useAuth = () =>
  useContext(authContext);