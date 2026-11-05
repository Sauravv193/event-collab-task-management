import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CheckCircle2, LockKeyhole, Sparkles, Users } from 'lucide-react';
import { loginUser, signupUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: data => { toast.success('Welcome back!'); login(data); navigate('/'); },
    onError: error => toast.error(error.response?.data?.message || 'Login failed. Check your credentials.'),
  });
  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => { toast.success('Account created. You can sign in now.'); setIsLogin(true); setPassword(''); },
    onError: error => toast.error(error.response?.data?.message || 'Registration failed.'),
  });
  const handleSubmit = e => {
    e.preventDefault();
    if (isLogin) loginMutation.mutate({ username: username.trim(), password });
    else signupMutation.mutate({ username: username.trim(), password });
  };
  const isPending = loginMutation.isPending || signupMutation.isPending;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10" style={{ background: 'radial-gradient(circle at 15% 12%,rgba(117,103,217,.2),transparent 28%),radial-gradient(circle at 85% 85%,rgba(108,190,225,.18),transparent 30%),var(--app-bg)' }}>
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-violet-400/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 18, rotateX: 4 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: .5 }} className="relative grid w-full max-w-5xl overflow-hidden rounded-[30px] border bg-white/80 shadow-[0_35px_100px_rgba(43,48,94,.18)] backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-900/80 lg:grid-cols-[1.05fr_.95fr]" style={{ borderColor: 'var(--line)', perspective: '1200px' }}>
        <aside className="relative hidden min-h-[620px] overflow-hidden bg-gradient-to-br from-[#252c59] via-[#4b4a98] to-[#7769d9] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 top-20 h-72 w-72 rotate-45 rounded-[55px] border border-white/20 shadow-[22px_24px_0_rgba(255,255,255,.08),44px_48px_0_rgba(255,255,255,.05)]" />
          <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-violet-300/20 blur-2xl" />
          <div className="relative z-10 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/20 bg-white/15 font-extrabold shadow-lg backdrop-blur-xl">EC</span><span className="text-lg font-extrabold tracking-tight">EventCollab</span></div>
          <div className="relative z-10">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"><Sparkles size={14} /> Work better, together</span>
            <h1 className="font-['Manrope'] text-4xl font-extrabold leading-tight tracking-[-.04em]">One space for<br />every shared plan.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-indigo-100/85">Bring events, tasks and team conversations together so everyone knows what happens next.</p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl"><CalendarDays size={18} /><span className="text-sm font-medium">Keep every event organized</span></div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl"><CheckCircle2 size={18} /><span className="text-sm font-medium">Turn plans into clear tasks</span></div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl"><Users size={18} /><span className="text-sm font-medium">Keep your team in sync</span></div>
            </div>
          </div>
          <p className="relative z-10 text-xs text-indigo-100/65">Plan together. Make progress together.</p>
        </aside>

        <main className="flex items-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden"><div className="mb-5 inline-flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 font-extrabold text-white shadow-lg">EC</span><span className="font-extrabold">EventCollab</span></div></div>
            <p className="workspace-eyebrow">{isLogin ? 'Your workspace awaits' : 'Start collaborating'}</p>
            <h2 className="mt-2 font-['Manrope'] text-3xl font-extrabold tracking-[-.04em]" style={{ color: 'var(--ink)' }}>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
            <p className="mt-2 text-sm leading-6 muted-text">{isLogin ? 'Sign in to pick up where your team left off.' : 'Create an account to plan events and work with your team.'}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div><label htmlFor="username" className="mb-2 block text-sm font-semibold">Username</label><input id="username" autoComplete="username" type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={50} className="field-control" /></div>
              <div><label htmlFor="password" className="mb-2 block text-sm font-semibold">Password</label><div className="relative"><LockKeyhole size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 muted-text" /><input id="password" autoComplete={isLogin ? 'current-password' : 'new-password'} type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="field-control !pl-11" /></div></div>
              <button type="submit" disabled={isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">{isPending ? 'Please wait…' : isLogin ? 'Sign in to EventCollab' : 'Create account'}{!isPending && <ArrowRight size={16} />}</button>
            </form>
            <p className="mt-7 text-center text-sm muted-text">{isLogin ? "New to EventCollab?" : 'Already have an account?'} <button type="button" onClick={() => setIsLogin(value => !value)} className="ml-1 font-bold" style={{ color: 'var(--brand)' }}>{isLogin ? 'Create an account' : 'Sign in'}</button></p>
            <p className="mt-8 text-center text-[11px] leading-5 muted-text">By continuing, you agree to use this workspace responsibly and keep your account credentials private.</p>
          </div>
        </main>
      </motion.div>
    </div>
  );
};

export default Login;