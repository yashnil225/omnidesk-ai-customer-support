import React, { useState } from 'react';
import { Bot, Mail, Lock, Building, ArrowRight, Sparkles, X, Eye, EyeOff } from 'lucide-react';
import { signUpTenant, signInTenant, signInWithGoogle } from '../lib/supabase';
import { TenantUser } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: TenantUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const user = await signUpTenant(email, password, companyName);
        onSuccess(user);
      } else {
        const user = await signInTenant(email, password);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-zinc-800 space-y-6 text-zinc-300 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create SaaS Account' : 'Welcome to OmniDesk'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isSignUp ? 'Sign up your business to build & deploy AI support bots' : 'Sign in to manage your chatbots and live support inbox'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-900/60 text-red-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
                Company / Organization Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-widest mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 hover:bg-white text-black font-semibold uppercase tracking-wider py-2.5 rounded-xl text-xs shadow-md transition"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Business Account' : 'Sign In'}
          </button>
        </form>

        <div className="relative border-t border-zinc-800 text-center my-4">
          <span className="bg-[#0f0f0f] px-3 text-[10px] font-mono text-zinc-500 uppercase absolute -top-2 left-1/2 -translate-x-1/2">
            OR
          </span>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
          >
            <span>Continue with Google Account</span>
          </button>
        </div>

        <div className="text-center pt-2 text-xs text-zinc-400">
          {isSignUp ? 'Already have an account?' : "Don't have a tenant account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-emerald-400 font-bold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Register Company'}
          </button>
        </div>
      </div>
    </div>
  );
};
