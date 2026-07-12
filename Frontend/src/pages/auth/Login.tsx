import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clearAuthSession, loginUser, registerUser, saveAuthSession } from '@/lib/api';
import type { UserRole } from '@/lib/types';

type AuthTab = 'login' | 'signup';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'alok@tms.com', password: 'demo123', role: 'ADMIN' as UserRole },
  { label: 'Driver', email: 'rajesh@tms.com', password: 'demo123', role: 'DRIVER' as UserRole },
] as const;

const roleOptions: Array<{ value: UserRole; label: string; hint: string }> = [
  { value: 'DRIVER', label: 'Driver', hint: 'Mobile dispatch access' },
  { value: 'MANAGER', label: 'Manager', hint: 'Operations oversight' },
  { value: 'ADMIN', label: 'Admin', hint: 'Full system control' },
  { value: 'CLIENT', label: 'Client', hint: 'Public tracking access' },
];

function getLandingRoute(role: UserRole) {
  if (role === 'ADMIN' || role === 'MANAGER') return '/admin';
  if (role === 'DRIVER') return '/driver';
  return '/track';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultTab = location.pathname === '/signup' ? 'signup' : 'login';

  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DRIVER' as UserRole,
  });
  const [activeAction, setActiveAction] = useState<AuthTab | null>(null);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const desiredPath = tab === 'signup' ? '/signup' : '/login';
    if (location.pathname !== desiredPath) {
      navigate(desiredPath, { replace: true });
    }
  }, [location.pathname, navigate, tab]);

  const isLoading = activeAction !== null;

  const handleSuccessfulAuth = (userRole: UserRole, welcomeMessage: string) => {
    toast.success(welcomeMessage, {
      description: 'Your session is now connected to the backend API.',
    });
    navigate(getLandingRoute(userRole), { replace: true });
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    await performLogin(loginForm.email.trim(), loginForm.password);
  };

  const performLogin = async (email: string, password: string) => {
    setActiveAction('login');
    const loadingToast = toast.loading('Signing you in...');

    try {
      const session = await loginUser(email, password);
      saveAuthSession(session);
      toast.dismiss(loadingToast);
      handleSuccessfulAuth(session.user.role, `Welcome back, ${session.user.name}.`);
    } catch (error) {
      toast.dismiss(loadingToast);
      clearAuthSession();
      toast.error(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setActiveAction(null);
    }
  };

  const handleDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setLoginForm({ email: account.email, password: account.password });
    await performLogin(account.email, account.password);
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!signupForm.name.trim() || !signupForm.email.trim() || !signupForm.password.trim()) {
      toast.error('Please fill in name, email, and password.');
      return;
    }

    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setActiveAction('signup');
    const loadingToast = toast.loading('Creating your account...');

    try {
      const session = await registerUser({
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
        role: signupForm.role,
      });
      saveAuthSession(session);
      toast.dismiss(loadingToast);
      handleSuccessfulAuth(session.user.role, `Account created for ${session.user.name}.`);
    } catch (error) {
      toast.dismiss(loadingToast);
      clearAuthSession();
      toast.error(error instanceof Error ? error.message : 'Signup failed.');
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      <div className="relative hidden md:flex md:w-[44%] overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.32),_transparent_45%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
        <div className="absolute left-6 top-8 h-40 w-40 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute bottom-16 right-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-500/20">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight">TransitOps</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
                Logistics command bridge
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              Backend-ready auth experience
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight">
              One secure gate for your fleet, drivers, and clients.
            </h1>
            <p className="max-w-lg text-sm leading-7 text-slate-300">
              Use the same screen to sign in or create an account. Login and signup now talk directly to the backend
              auth routes, so the app can keep sessions, roles, and protected routes in sync.
            </p>

            <div className="grid max-w-md grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black">JWT</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Session token</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black">CORS</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">Frontend compatible</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Secured for local and hosted deployments</span>
            <span className="inline-flex items-center gap-2 font-semibold text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Live backend ready
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 px-5 py-10 text-slate-900 md:px-10">
        <div className="w-full max-w-[460px]">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-500/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight">TransitOps</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Fleet authentication
              </p>
            </div>
          </div>

          <div className="mb-6 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Access portal</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Sign in or create an account</h2>
            <p className="text-sm leading-6 text-slate-600">
              Choose login if you already have credentials, or signup to create a new backend-backed account.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:p-6">
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(value as AuthTab)}
              className="w-full"
            >
              <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-xl text-xs font-black uppercase tracking-[0.24em] text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-xl text-xs font-black uppercase tracking-[0.24em] text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6 space-y-5">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Email address
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={loginForm.email}
                        onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                        className="h-12 rounded-2xl border-slate-300 pl-11 text-slate-950 shadow-sm focus-visible:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                        className="h-12 rounded-2xl border-slate-300 pl-11 text-slate-950 shadow-sm focus-visible:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900">
                    <p className="font-semibold">Backend-compatible sign in</p>
                    <p className="mt-1 text-xs leading-5 text-blue-800">
                      This submits directly to `/api/v1/auth/login`, stores the access token, and routes you by role.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-900"
                  >
                    {activeAction === 'login' ? 'Signing in...' : 'Sign in'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="space-y-3">
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Quick demo access
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {DEMO_ACCOUNTS.map((account) => (
                      <Button
                        key={account.role}
                        type="button"
                        variant="outline"
                        disabled={isLoading}
                        onClick={() => handleDemoLogin(account)}
                        className="h-11 rounded-2xl border-slate-300 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
                      >
                        {activeAction === 'login' ? 'Signing in...' : `Demo ${account.label}`}
                      </Button>
                    ))}
                  </div>
                  <p className="text-center text-[11px] leading-5 text-slate-500">
                    Uses seeded demo accounts (`alok@tms.com` / `rajesh@tms.com`, password `demo123`).
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="mt-6 space-y-5">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Full name
                    </label>
                    <Input
                      type="text"
                      autoComplete="name"
                      placeholder="Aarav Patel"
                      value={signupForm.name}
                      onChange={(event) => setSignupForm((current) => ({ ...current, name: event.target.value }))}
                      className="h-12 rounded-2xl border-slate-300 text-slate-950 shadow-sm focus-visible:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Email address
                    </label>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={signupForm.email}
                      onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                      className="h-12 rounded-2xl border-slate-300 text-slate-950 shadow-sm focus-visible:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Password
                      </label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        value={signupForm.password}
                        onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                        className="h-12 rounded-2xl border-slate-300 text-slate-950 shadow-sm focus-visible:ring-blue-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Confirm password
                      </label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={signupForm.confirmPassword}
                        onChange={(event) =>
                          setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))
                        }
                        className="h-12 rounded-2xl border-slate-300 text-slate-950 shadow-sm focus-visible:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Account role
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={signupForm.role}
                        onChange={(event) =>
                          setSignupForm((current) => ({ ...current, role: event.target.value as UserRole }))
                        }
                        className="h-12 w-full appearance-none rounded-2xl border border-slate-300 bg-white px-11 text-sm font-medium text-slate-950 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      >
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} — {option.hint}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                    <p className="font-semibold">Backend-compatible signup</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                      This creates the user through `/api/v1/auth/register`, saves the token, and opens the right dashboard.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {activeAction === 'signup' ? 'Creating account...' : 'Create account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-600">
                Need the public shipment portal instead?{' '}
                <Link to="/track" className="text-blue-600 hover:text-blue-700">
                  Open tracking
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
