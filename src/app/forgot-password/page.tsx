"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { sendPasswordReset } from '@/lib/auth';

type Step = 'form' | 'sent';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<Step>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setStep('sent');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(
        msg
          .replace('Firebase: ', '')
          .replace(' (auth/user-not-found).', '.\nNo account found with this email.')
          .replace(' (auth/invalid-email).', '.\nPlease enter a valid email address.')
          .replace(' (auth/too-many-requests).', '.\nToo many attempts. Please try again later.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#F8FAF9] relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#24B86C]/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-[#11998E]/5 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 bg-white border border-[#E2EDE8] shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden">

        {step === 'form' ? (
          <>
            <CardHeader className="space-y-3 pb-6 text-center pt-10 px-8">
              {/* Icon */}
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#24B86C] to-[#11998E] flex items-center justify-center shadow-lg shadow-[#24B86C]/30">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-black text-[#111111]">Forgot your password?</CardTitle>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                No worries! Enter your registered email address and we'll send you a secure link to reset your password.
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-10">

              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 whitespace-pre-line font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#111111] uppercase tracking-widest" htmlFor="reset-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-11 h-12 bg-[#F8FAF9] border-[#E2EDE8] focus:border-[#24B86C] focus:ring-2 focus:ring-[#24B86C]/10 rounded-xl font-medium"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#111111] hover:bg-[#24B86C] text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-[#24B86C]/30 hover:-translate-y-0.5"
                >
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending reset link...</>
                    : <>Send Reset Link <ArrowRight className="ml-2 w-4 h-4" /></>
                  }
                </Button>
              </form>

              {/* Security note */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-[#F8FAF9] border border-[#E2EDE8] rounded-2xl">
                <ShieldCheck className="w-4 h-4 text-[#24B86C] mt-0.5 shrink-0" />
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  The reset link is valid for <strong>1 hour</strong> and can only be used once. Firebase sends it directly to your inbox — we never see your password.
                </p>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-500 hover:text-[#24B86C] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </CardContent>
          </>
        ) : (
          /* ── SUCCESS STATE ── */
          <>
            <CardHeader className="space-y-3 pb-6 text-center pt-10 px-8">
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#E8F5F1] flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9 text-[#24B86C]" />
                  </div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-[#24B86C]/30 animate-ping" />
                </div>
              </div>
              <CardTitle className="text-2xl font-black text-[#111111]">Check your inbox!</CardTitle>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                We've sent a password reset link to
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8F5F1] border border-[#24B86C]/20 rounded-full">
                <Mail className="w-4 h-4 text-[#24B86C]" />
                <span className="text-sm font-bold text-[#111]">{email}</span>
              </div>
            </CardHeader>

            <CardContent className="px-8 pb-10 space-y-4">
              {/* Steps */}
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Open the email from Design Walla' },
                  { step: '2', text: 'Click the "Reset Password" button' },
                  { step: '3', text: 'Create your new secure password' },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3 p-3.5 bg-[#F8FAF9] rounded-2xl border border-[#E2EDE8]">
                    <div className="w-7 h-7 rounded-full bg-[#24B86C] text-white text-xs font-black flex items-center justify-center shrink-0">
                      {item.step}
                    </div>
                    <span className="text-sm font-medium text-[#111]">{item.text}</span>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-zinc-400 font-medium pt-2">
                Didn't receive it? Check spam, or{' '}
                <button
                  type="button"
                  onClick={() => { setStep('form'); setEmail(''); }}
                  className="text-[#24B86C] font-bold hover:underline"
                >
                  try again
                </button>
                .
              </p>

              <Link href="/login">
                <Button className="w-full h-12 bg-[#111111] hover:bg-[#24B86C] text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-md mt-2">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
