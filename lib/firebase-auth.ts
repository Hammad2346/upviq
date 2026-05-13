import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  FirebaseError,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

function getErrorMessage(error: FirebaseError): string {
  switch (error.code) {
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password. Please try again."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password must be at least 6 characters."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later."
    case "auth/invalid-credential":
      return "Invalid email or password."
    default:
      return "Something went wrong. Please try again."
  }
}


export async function loginUser(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error) {
    return { user: null, error: getErrorMessage(error as FirebaseError) }
  }
}

export async function signupUser(name: string, email: string, password: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user = result.user

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: user.uid,
        name,
        email,
      }),
    })

    if (!res.ok) {

      console.error("Failed to save user to database")
    }

    return { user, error: null }
  } catch (error) {
    return { user: null, error: getErrorMessage(error as FirebaseError) }
  }
}


export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email)
    return { error: null }
  } catch (error) {
    return { error: getErrorMessage(error as FirebaseError) }
  }
}

export async function logoutUser() {
  try {
    await signOut(auth)
    return { error: null }
  } catch (error) {
    return { error: getErrorMessage(error as FirebaseError) }
  }
}