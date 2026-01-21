import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

function AuthScreen({ onAuth, isOnline }) {
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        await onAuth.signUp(email, password, username);
        setMessage('Check your email to confirm your account!');
        setMode('signin');
      } else if (mode === 'signin') {
        await onAuth.signIn(email, password);
      } else if (mode === 'forgot') {
        await onAuth.resetPassword(email);
        setMessage('Password reset email sent!');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <img
            src="/CoastalKilnLogo.png"
            alt="Coastal Kiln"
            className="w-24 h-24 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Coastal Kiln</h1>
          <p className="text-text-secondary mb-8">
            Running in offline mode. Your data is stored locally on this device.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm">
              To enable cloud sync and authentication, add your Supabase credentials to the .env file.
            </p>
          </div>
          <button
            onClick={() => onAuth.continueOffline()}
            className="w-full px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors"
          >
            Continue Offline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/CoastalKilnLogo.png"
            alt="Coastal Kiln"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-text-primary">Coastal Kiln</h1>
          <p className="text-text-secondary mt-1">
            {mode === 'signin' && 'Welcome back, potter'}
            {mode === 'signup' && 'Join the studio'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error/Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              {message}
            </div>
          )}

          {/* Username (signup only) */}
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          )}

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Password (not for forgot mode) */}
          {mode !== 'forgot' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full pl-12 pr-12 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          {/* Forgot password link */}
          {mode === 'signin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-accent hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          {mode === 'signin' && (
            <p className="text-text-secondary">
              New to Coastal Kiln?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); setMessage(null); }}
                className="text-accent font-medium hover:underline"
              >
                Create an account
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p className="text-text-secondary">
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                className="text-accent font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p className="text-text-secondary">
              Remember your password?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null); setMessage(null); }}
                className="text-accent font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;
