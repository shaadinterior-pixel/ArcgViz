// ─── Firebase Auth Helpers ────────────────────────────────────────────────────
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export type FirebaseUser = User;

// Plan types
export type PlanTier = 'Free' | 'Plus' | 'Pro';

// ── Download limits per plan ──────────────────────────────────────────────────
export const PLAN_LIMITS: Record<PlanTier, number> = {
  Free: 10,
  Plus: 50,
  Pro:  100,
};

// ── Create Firestore user document on first sign up ───────────────────────────
async function createUserDoc(user: User, name?: string) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name:       name || user.displayName || user.email?.split('@')[0] || 'User',
      email:      user.email,
      plan:       'Free' as PlanTier,
      joinDate:   serverTimestamp(),
      monthlyDownloads: {},
    });
  }
}

// ── Sign Up ───────────────────────────────────────────────────────────────────
export async function signUp(email: string, password: string, fullName?: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (fullName) {
    await updateProfile(cred.user, { displayName: fullName });
  }
  await createUserDoc(cred.user, fullName);
  return cred.user;
}

// ── Sign In ───────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // Ensure user doc exists (in case they were created externally)
  await createUserDoc(cred.user);
  return cred.user;
}

// ── Google Sign In ────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  await createUserDoc(cred.user);
  return cred.user;
}

// ── Sign Out ──────────────────────────────────────────────────────────────────
export async function signOut() {
  await firebaseSignOut(auth);
}

// ── Get Current User (sync) ───────────────────────────────────────────────────
export function getCurrentUserSync(): FirebaseUser | null {
  return auth.currentUser;
}

// ── Get Current User (async, waits for auth ready) ───────────────────────────
export function getCurrentUser(): Promise<FirebaseUser | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

// ── Get user plan from Firestore ──────────────────────────────────────────────
export async function getUserPlan(userId: string): Promise<PlanTier> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return 'Free';
  return (snap.data().plan as PlanTier) || 'Free';
}

// ── Get full user profile ─────────────────────────────────────────────────────
export async function getUserProfile(userId: string) {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return snap.data();
}

// ── Auth state change listener ────────────────────────────────────────────────
export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ── Wishlist ──────────────────────────────────────────────────────────────────
import { arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';

export async function toggleWishlist(userId: string, productId: string, isAdding: boolean) {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    wishlist: isAdding ? arrayUnion(productId) : arrayRemove(productId)
  });
}

export async function getWishlist(userId: string): Promise<string[]> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return [];
  return snap.data().wishlist || [];
}
