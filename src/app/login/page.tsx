"use client";

import React, { Suspense, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, Phone, ChevronDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { signIn, signInWithGoogle, setupRecaptcha, sendPhoneOtp, confirmPhoneOtp, type ConfirmationResult } from '@/lib/auth';

const COUNTRIES = [
  { name: 'Afghanistan', code: '+93', iso: 'AF' }, { name: 'Albania', code: '+355', iso: 'AL' },
  { name: 'Algeria', code: '+213', iso: 'DZ' }, { name: 'Argentina', code: '+54', iso: 'AR' },
  { name: 'Australia', code: '+61', iso: 'AU' }, { name: 'Austria', code: '+43', iso: 'AT' },
  { name: 'Bangladesh', code: '+880', iso: 'BD' }, { name: 'Belgium', code: '+32', iso: 'BE' },
  { name: 'Brazil', code: '+55', iso: 'BR' }, { name: 'Canada', code: '+1', iso: 'CA' },
  { name: 'Chile', code: '+56', iso: 'CL' }, { name: 'China', code: '+86', iso: 'CN' },
  { name: 'Colombia', code: '+57', iso: 'CO' }, { name: 'Croatia', code: '+385', iso: 'HR' },
  { name: 'Czech Republic', code: '+420', iso: 'CZ' }, { name: 'Denmark', code: '+45', iso: 'DK' },
  { name: 'Egypt', code: '+20', iso: 'EG' }, { name: 'Ethiopia', code: '+251', iso: 'ET' },
  { name: 'Finland', code: '+358', iso: 'FI' }, { name: 'France', code: '+33', iso: 'FR' },
  { name: 'Germany', code: '+49', iso: 'DE' }, { name: 'Ghana', code: '+233', iso: 'GH' },
  { name: 'Greece', code: '+30', iso: 'GR' }, { name: 'Hong Kong', code: '+852', iso: 'HK' },
  { name: 'Hungary', code: '+36', iso: 'HU' }, { name: 'India', code: '+91', iso: 'IN' },
  { name: 'Indonesia', code: '+62', iso: 'ID' }, { name: 'Iran', code: '+98', iso: 'IR' },
  { name: 'Iraq', code: '+964', iso: 'IQ' }, { name: 'Ireland', code: '+353', iso: 'IE' },
  { name: 'Israel', code: '+972', iso: 'IL' }, { name: 'Italy', code: '+39', iso: 'IT' },
  { name: 'Japan', code: '+81', iso: 'JP' }, { name: 'Jordan', code: '+962', iso: 'JO' },
  { name: 'Kenya', code: '+254', iso: 'KE' }, { name: 'Kuwait', code: '+965', iso: 'KW' },
  { name: 'Lebanon', code: '+961', iso: 'LB' }, { name: 'Libya', code: '+218', iso: 'LY' },
  { name: 'Malaysia', code: '+60', iso: 'MY' }, { name: 'Mexico', code: '+52', iso: 'MX' },
  { name: 'Morocco', code: '+212', iso: 'MA' }, { name: 'Nepal', code: '+977', iso: 'NP' },
  { name: 'Netherlands', code: '+31', iso: 'NL' }, { name: 'New Zealand', code: '+64', iso: 'NZ' },
  { name: 'Nigeria', code: '+234', iso: 'NG' }, { name: 'Norway', code: '+47', iso: 'NO' },
  { name: 'Oman', code: '+968', iso: 'OM' }, { name: 'Pakistan', code: '+92', iso: 'PK' },
  { name: 'Palestine', code: '+970', iso: 'PS' }, { name: 'Peru', code: '+51', iso: 'PE' },
  { name: 'Philippines', code: '+63', iso: 'PH' }, { name: 'Poland', code: '+48', iso: 'PL' },
  { name: 'Portugal', code: '+351', iso: 'PT' }, { name: 'Qatar', code: '+974', iso: 'QA' },
  { name: 'Romania', code: '+40', iso: 'RO' }, { name: 'Russia', code: '+7', iso: 'RU' },
  { name: 'Saudi Arabia', code: '+966', iso: 'SA' }, { name: 'Serbia', code: '+381', iso: 'RS' },
  { name: 'Singapore', code: '+65', iso: 'SG' }, { name: 'South Africa', code: '+27', iso: 'ZA' },
  { name: 'South Korea', code: '+82', iso: 'KR' }, { name: 'Spain', code: '+34', iso: 'ES' },
  { name: 'Sri Lanka', code: '+94', iso: 'LK' }, { name: 'Sweden', code: '+46', iso: 'SE' },
  { name: 'Switzerland', code: '+41', iso: 'CH' }, { name: 'Syria', code: '+963', iso: 'SY' },
  { name: 'Taiwan', code: '+886', iso: 'TW' }, { name: 'Tanzania', code: '+255', iso: 'TZ' },
  { name: 'Thailand', code: '+66', iso: 'TH' }, { name: 'Tunisia', code: '+216', iso: 'TN' },
  { name: 'Turkey', code: '+90', iso: 'TR' }, { name: 'UAE', code: '+971', iso: 'AE' },
  { name: 'Uganda', code: '+256', iso: 'UG' }, { name: 'Ukraine', code: '+380', iso: 'UA' },
  { name: 'United Kingdom', code: '+44', iso: 'GB' }, { name: 'United States', code: '+1', iso: 'US' },
  { name: 'Venezuela', code: '+58', iso: 'VE' }, { name: 'Vietnam', code: '+84', iso: 'VN' },
  { name: 'Yemen', code: '+967', iso: 'YE' }, { name: 'Zimbabwe', code: '+263', iso: 'ZW' },
];

function CountrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[25]; // India default

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 h-12 px-3 bg-[#F8FAF9] border border-[#E2EDE8] rounded-xl text-sm font-bold text-[#111] hover:border-[#24B86C] transition-colors whitespace-nowrap"
      >
        <span className="text-base">{selected.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-[#E2EDE8] rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-[#E2EDE8]">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-2 text-sm bg-[#F8FAF9] rounded-xl border border-[#E2EDE8] focus:outline-none focus:border-[#24B86C]"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map(c => (
              <button
                key={`${c.iso}-${c.code}`}
                type="button"
                onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#F8FAF9] transition-colors ${value === c.code && c.iso === selected.iso ? 'bg-[#E8F5F1] text-[#24B86C] font-bold' : 'text-[#111]'}`}
              >
                <span>{c.name}</span>
                <span className="text-zinc-400 font-semibold">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/profile';

  // Mode: 'email' | 'phone'
  const [mode, setMode] = useState<'email' | 'phone'>('email');

  // Email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Phone state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [error, setError] = useState('');

  useEffect(() => {
    import('@/lib/auth').then(({ getCurrentUser }) => {
      getCurrentUser().then(u => { if (u) router.push(redirectTo); });
    });
  }, [router, redirectTo]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // reCAPTCHA is initialized fresh on each OTP send — not on mount
  // This prevents the 'already rendered' error on React hot reloads

  const cleanError = (msg: string) => msg
    .replace('Firebase: ', '')
    .replace(' (auth/invalid-credential).', '.\nDouble-check your email and password.')
    .replace(' (auth/user-not-found).', '.\nNo account found with this email.')
    .replace(' (auth/wrong-password).', '.\nIncorrect password.')
    .replace(' (auth/too-many-requests).', '.\nToo many attempts. Try again later.')
    .replace(' (auth/invalid-phone-number).', '.\nEnter a valid phone number.')
    .replace(' (auth/invalid-verification-code).', '.\nInvalid OTP. Please try again.')
    .replace(' (auth/operation-not-allowed).', '.\nPhone sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(cleanError(err instanceof Error ? err.message : 'Sign in failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push(redirectTo);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      if (!msg.includes('popup-closed')) setError(cleanError(msg));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError('');
    const fullPhone = `${countryCode}${phoneNumber.replace(/^0/, '')}`;
    if (phoneNumber.length < 5) { setError('Please enter a valid phone number.'); return; }
    setPhoneLoading(true);
    try {
      // Always set up a fresh reCAPTCHA before each send to avoid 'already rendered' errors
      setupRecaptcha('recaptcha-container');
      const result = await sendPhoneOtp(fullPhone);
      setConfirmation(result);
      setOtpSent(true);
      setResendTimer(30);
    } catch (err: unknown) {
      setError(cleanError(err instanceof Error ? err.message : 'Failed to send OTP.'));
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    setError('');
    setOtpLoading(true);
    try {
      await confirmPhoneOtp(confirmation, otp);
      router.push(redirectTo);
    } catch (err: unknown) {
      setError(cleanError(err instanceof Error ? err.message : 'OTP verification failed.'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp('');
    setOtpSent(false);
    setConfirmation(null);
    try { setupRecaptcha('recaptcha-container'); } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#F8FAF9] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#24B86C]/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Invisible reCAPTCHA anchor */}
      <div id="recaptcha-container" />

      <Card className="w-full max-w-md relative z-10 bg-white border border-[#E2EDE8] shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden">
        <CardHeader className="space-y-3 pb-6 text-center pt-10 px-8">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#24B86C] to-[#11998E] flex items-center justify-center shadow-lg shadow-[#24B86C]/30">
              <span className="text-white font-black text-xl">DW</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-black text-[#111111]">Welcome back</CardTitle>
          <p className="text-sm text-zinc-500 font-medium">Sign in to access your Design Walla account</p>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-[#F8FAF9] rounded-xl border border-[#E2EDE8] mt-4">
            <button
              type="button"
              onClick={() => { setMode('email'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'email' ? 'bg-white shadow-sm text-[#111] border border-[#E2EDE8]' : 'text-zinc-500 hover:text-[#111]'}`}
            >
              <Mail className="w-4 h-4" /> Email
            </button>
            <button
              type="button"
              onClick={() => { setMode('phone'); setError(''); setOtpSent(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'phone' ? 'bg-white shadow-sm text-[#111] border border-[#E2EDE8]' : 'text-zinc-500 hover:text-[#111]'}`}
            >
              <Phone className="w-4 h-4" /> Phone
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 whitespace-pre-line font-medium">{error}</div>
          )}

          {/* ── EMAIL MODE ── */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#111111] uppercase tracking-widest" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input id="email" type="email" placeholder="you@example.com"
                    className="pl-11 h-12 bg-[#F8FAF9] border-[#E2EDE8] focus:border-[#24B86C] focus:ring-2 focus:ring-[#24B86C]/10 rounded-xl font-medium"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111111] uppercase tracking-widest" htmlFor="password">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#24B86C] hover:underline font-semibold">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input id="password" type="password" placeholder="••••••••"
                    className="pl-11 h-12 bg-[#F8FAF9] border-[#E2EDE8] focus:border-[#24B86C] focus:ring-2 focus:ring-[#24B86C]/10 rounded-xl font-medium"
                    value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" disabled={isLoading}
                className="w-full mt-2 h-12 bg-[#111111] hover:bg-[#24B86C] text-white font-bold rounded-xl text-sm transition-all shadow-md">
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : <>Sign in <ArrowRight className="ml-2 w-4 h-4" /></>}
              </Button>
            </form>
          )}

          {/* ── PHONE MODE ── */}
          {mode === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111111] uppercase tracking-widest">Phone Number</label>
                    <div className="flex gap-2">
                      <CountrySelect value={countryCode} onChange={setCountryCode} />
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input type="tel" placeholder="9876543210"
                          className="pl-10 h-12 bg-[#F8FAF9] border-[#E2EDE8] focus:border-[#24B86C] focus:ring-2 focus:ring-[#24B86C]/10 rounded-xl font-medium"
                          value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium pl-1">We'll send a 6-digit OTP to verify your number.</p>
                  </div>
                  <Button type="button" onClick={handleSendOtp} disabled={phoneLoading || !phoneNumber}
                    className="w-full h-12 bg-[#111111] hover:bg-[#24B86C] text-white font-bold rounded-xl text-sm transition-all shadow-md">
                    {phoneLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending OTP...</> : <>Send OTP <ArrowRight className="ml-2 w-4 h-4" /></>}
                  </Button>
                </>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#E8F5F1] border border-[#24B86C]/20 rounded-2xl">
                    <ShieldCheck className="w-5 h-5 text-[#24B86C] shrink-0" />
                    <p className="text-sm text-[#111] font-medium">OTP sent to <strong>{countryCode} {phoneNumber}</strong></p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111111] uppercase tracking-widest">Enter 6-digit OTP</label>
                    <Input type="text" inputMode="numeric" maxLength={6} placeholder="● ● ● ● ● ●"
                      className="h-14 text-center text-2xl font-black tracking-[0.5em] bg-[#F8FAF9] border-[#E2EDE8] focus:border-[#24B86C] focus:ring-2 focus:ring-[#24B86C]/10 rounded-xl"
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
                  </div>
                  <Button type="submit" disabled={otpLoading || otp.length < 6}
                    className="w-full h-12 bg-[#111111] hover:bg-[#24B86C] text-white font-bold rounded-xl text-sm transition-all shadow-md">
                    {otpLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : <>Verify & Sign In <ShieldCheck className="ml-2 w-4 h-4" /></>}
                  </Button>
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-xs text-zinc-400 font-medium">Resend OTP in <strong>{resendTimer}s</strong></p>
                    ) : (
                      <button type="button" onClick={handleResend} className="text-xs text-[#24B86C] hover:underline font-semibold">Didn't receive? Resend OTP</button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-[#E2EDE8] flex-1" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">or</span>
            <div className="h-px bg-[#E2EDE8] flex-1" />
          </div>

          <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={googleLoading}
            className="w-full h-12 bg-white border-[#E2EDE8] hover:border-[#24B86C] hover:bg-[#F8FAF9] text-[#111111] font-bold rounded-xl transition-all">
            {googleLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </Button>

          <p className="mt-8 text-center text-sm text-zinc-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-[#24B86C] hover:underline">Sign up free</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <div className="w-8 h-8 border-4 border-[#24B86C] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
