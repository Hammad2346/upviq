"use client"
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  useContext,
  createContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
type AuthContextType = {
  firebaseUser: FirebaseUser | null;
  dbUser: any;
  loading: boolean;
  isAdmin: boolean;
};
const authContext = createContext<AuthContextType>({
  firebaseUser: null,
  dbUser: null,
  loading: false,
  isAdmin: false,
});
export function AuthContext({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin,setIsAdmin]=useState(false)
  const pathName = usePathname();
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (!fbUser) {
        if(pathName.startsWith("/dashboard")){

          router.replace("/login");
        }
        
      }
    });
    return ()=> unsubscribe();
  }, [pathName]);


  return (
    <authContext.Provider value={{ firebaseUser, dbUser, loading, isAdmin }}>
      {children}
    </authContext.Provider>
  );
}
export const useAuth=() => useContext(authContext)