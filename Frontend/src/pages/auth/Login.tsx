import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  LayoutDashboard,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clearAuthSession, loginUser, registerUser, saveAuthSession, saveDemoSession } from '@/lib/api';
import type { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

type AuthTab = 'login' | 'signup';

const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    email: 'alok@tms.com',
    password: 'demo123',
    role: 'ADMIN' as UserRole,
    title: 'Admin Console',
    description: 'Fleet ops, trips, billing',
    icon: LayoutDashboard,
    accent: 'from-blue-600 to-indigo-600',
    surface: 'border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/80 hover:border-blue-200 hover:shadow-blue-100',
  },
  {
    label: 'Driver',
    email: 'rajesh@tms.com',
    password: 'demo123',
    role: 'DRIVER' as UserRole,
    title: 'Driver Portal',
    description: 'Trips, expenses, profile',
    icon: Truck,
    accent: 'from-emerald-500 to-teal-600',
    surface: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50/80 hover:border-emerald-200 hover:shadow-emerald-100',
  },
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

  const handleSuccessfulAuth = (userRole: UserRole, welcomeMessage: string, isDemo = false) => {
    toast.success(welcomeMessage, {
      description: isDemo
        ? 'You are viewing the demo experience.'
        : 'Your session is now connected to the backend API.',
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

  const handleDemoLogin = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    saveDemoSession(account.role);
    setLoginForm({ email: account.email, password: account.password });
    handleSuccessfulAuth(account.role, `Welcome, ${account.label} demo.`, true);
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
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_32%)]" />
      <div className="pointer-events-none absolute -right-16 top-20 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-10 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[520px]"
        >
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 text-white shadow-lg shadow-blue-500/25">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-slate-950">TransitOps</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                Fleet authentication
              </p>
            </div>
          </div>

          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
              <Zap className="h-3.5 w-3.5" />
              Instant access
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Choose your workspace
            </h2>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              Open a live demo in one click, or sign in with your own credentials below.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((account, index) => {
              const Icon = account.icon;
              return (
                <motion.button
                  key={account.role}
                  type="button"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  onClick={() => handleDemoLogin(account)}
                  className={cn(
                    'group relative overflow-hidden rounded-[22px] border p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
                    account.surface,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        'rounded-2xl bg-gradient-to-br p-2.5 text-white shadow-md',
                        account.accent,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-slate-700" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                      Demo {account.label}
                    </p>
                    <p className="text-base font-bold text-slate-950">{account.title}</p>
                    <p className="text-xs leading-5 text-slate-600">{account.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Or use your account
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-7">
            <Tabs value={tab} onValueChange={(value) => setTab(value as AuthTab)} className="w-full">
              <TabsList className="grid h-11 w-full grid-cols-2 rounded-2xl bg-slate-100/90 p-1">
                <TabsTrigger
                  value="login"
                  className="rounded-xl text-xs font-bold uppercase tracking-[0.2em] text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-xl text-xs font-bold uppercase tracking-[0.2em] text-slate-500 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6 space-y-5">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Email address</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={loginForm.email}
                        onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/60 pl-11 text-slate-950 shadow-none focus-visible:border-blue-400 focus-visible:ring-blue-500/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/60 pl-11 text-slate-950 shadow-none focus-visible:border-blue-400 focus-visible:ring-blue-500/15"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md shadow-slate-900/15 hover:from-slate-800 hover:to-slate-700"
                  >
                    {activeAction === 'login' ? 'Signing in...' : 'Sign in'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6 space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Full name</label>
                    <Input
                      type="text"
                      autoComplete="name"
                      placeholder="Aarav Patel"
                      value={signupForm.name}
                      onChange={(event) => setSignupForm((current) => ({ ...current, name: event.target.value }))}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/60 text-slate-950 shadow-none focus-visible:border-blue-400 focus-visible:ring-blue-500/15"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Email address</label>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={signupForm.email}
                      onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                      className="h-11 rounded-xl border-slate-200 bg-slate-50/60 text-slate-950 shadow-none focus-visible:border-blue-400 focus-visible:ring-blue-500/15"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Create password"
                        value={signupForm.password}
                        onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/60 text-slate-950 shadow-none focus-visible:border-blue-400 focus-visible:ring-blue-500/15"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Confirm</label>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="Repeat password"
                        value={signupForm.confirmPassword}
                        onChange={(event) =>
                          setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))
                        }
                        className="h-11 rounded-xl border-slate-200 bg-slate-50/60 text-slate-950 shadow-none focus-visible:border-blue-400 focus-visible:ring-blue-500/15"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Account role</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={signupForm.role}
                        onChange={(event) =>
                          setSignupForm((current) => ({ ...current, role: event.target.value as UserRole }))
                        }
                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 px-11 text-sm font-medium text-slate-950 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
                      >
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label} — {option.hint}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500"
                  >
                    {activeAction === 'signup' ? 'Creating account...' : 'Create account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              <span>
                Public tracking?{' '}
                <Link to="/track" className="font-semibold text-blue-600 hover:text-blue-700">
                  Open portal
                </Link>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
