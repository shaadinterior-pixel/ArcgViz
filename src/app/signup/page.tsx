"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Mail, Lock, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { signUp, signInWithGoogle } from '@/lib/auth';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    try {
      await signUp(`${mobile}@designwalla.com`, password, name);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-1/4 w-full max-w-lg h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 glass border-white/10 shadow-2xl">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Box className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <p className="text-sm text-foreground/60">
            Join the premium Design Walla marketplace today
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {done ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto"/>
                <p className="font-semibold text-green-400">Account created!</p>
                <p className="text-sm text-foreground/60">Check your email to confirm your account, then <Link href="/login" className="text-primary underline">sign in</Link>.</p>
              </div>
            ) : (
              <>
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{error}</div>}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-foreground/50" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 bg-secondary/50 border-white/10 focus-visible:ring-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="mobile">
                Mobile Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-foreground/50" />
                <Input
                  id="mobile"
                  type="tel"
                  pattern="[0-9]{10}"
                  placeholder="9876543210"
                  className="pl-10 bg-secondary/50 border-white/10 focus-visible:ring-primary"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-foreground/50" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-secondary/50 border-white/10 focus-visible:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></span>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign up <ArrowRight className="ml-2 w-4 h-4" />
                </span>
              )}
            </Button>
              </>
            )}
          </form>

          {!done && (
            <>
              <div className="mt-6 flex items-center justify-center">
                <div className="h-px bg-border flex-1" />
                <span className="px-4 text-xs font-semibold text-foreground/40 uppercase tracking-wider">Or continue with</span>
                <div className="h-px bg-border flex-1" />
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoogleSignIn}
                className="w-full mt-6 bg-secondary/30 border-border hover:bg-secondary/50 text-foreground transition-all duration-300 h-12"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>
            </>
          )}

          
          <div className="mt-6 text-center text-xs text-foreground/50">
            By signing up, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </div>
          
          <div className="mt-8 text-center text-sm text-foreground/60 border-t border-border pt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
