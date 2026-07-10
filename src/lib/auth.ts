// ─── Auth helpers ─────────────────────────────────────────────────────────────
// Thin wrapper around Firebase Auth so components don't depend directly on
// the Firebase SDK's auth API surface.

export {
  signUp,
  signIn,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  getUserPlan,
  getUserProfile,
  onAuthChange,
  toggleWishlist,
  getWishlist,
  type FirebaseUser as AuthUser,
  type PlanTier,
  PLAN_LIMITS,
} from './firebase-auth';

// ── Check if user has purchased a 'Paid' product ──────────────────────────────
export { hasPurchasedProduct as hasPurchased } from './downloads';
