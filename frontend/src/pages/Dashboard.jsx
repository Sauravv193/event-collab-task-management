import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, CalendarDays, CheckCircle2, ChevronDown, Plus, Search, Sparkles, Users, X } from 'lucide-react';
import { getAllEvents } from '../services/eventService';
import EventCard from '../components/EventCard';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CreateEventForm from '../components/CreateEventForm';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) => {
  if (!value) return 'Date to be confirmed';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date to be confirmed' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  const { data: events = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['events'],
    queryFn: getAllEvents,
  });

  const safeEvents = Array.isArray(events) ? events : (events?.content ?? []);
  const categories = useMemo(() => [...new Set(safeEvents.map(event => event.category).filter(Boolean))], [safeEvents]);
  const filteredEvents = useMemo(() => safeEvents.filter(event => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query ||
      (event.name || '').toLowerCase().includes(query) ||
      (event.description || '').toLowerCase().includes(query) ||
      (event.location || '').toLowerCase().includes(query);
    return matchesSearch && (!categoryFilter || event.category === categoryFilter);
  }), [safeEvents, searchTerm, categoryFilter]);

  const upcomingEvents = safeEvents.filter(event => !event.expired);
  const completedEvents = safeEvents.filter(event => event.expired);
  const participantCount = safeEvents.reduce((sum, event) => sum + (Array.isArray(event.members) ? event.members.length : 0), 0);
  const nextEvent = [...upcomingEvents].filter(event => event.date).sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (isLoading) return <div className="workspace-page"><DashboardSkeleton /></div>;

  return (
    <div className="workspace-page">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }} className="dashboard-hero mb-7">
        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
              <Sparkles size={14} /> Your collaboration workspace
            </div>
            <p className="mb-2 text-sm font-medium text-indigo-100">Good to see you{user?.username ? ', ' + user.username : ''}</p>
            <h1 className="font-['Manrope'] text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl lg:text-[42px]">Bring your people.<br className="hidden sm:block" /> Move great work forward.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/85 sm:text-base">Plan events, organize shared tasks and keep every conversation connected to the work.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => setIsModalOpen(true)} className="!rounded-xl !border-white !bg-white !px-5 !py-3 !font-bold !text-indigo-700 !shadow-xl hover:!bg-indigo-50">
                <Plus size={17} className="mr-2" /> Create an event
              </Button>
              <a href="#your-events" className="hero-glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                Explore events <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:min-w-[290px]">
            <div className="hero-glass p-4">
              <p className="text-xs font-medium text-indigo-100">Upcoming</p>
              <p className="mt-2 font-['Manrope'] text-3xl font-extrabold">{upcomingEvents.length}</p>
              <p className="mt-1 text-[11px] text-indigo-100/75">Open events</p>
            </div>
            <div className="hero-glass p-4">
              <p className="text-xs font-medium text-indigo-100">People involved</p>
              <p className="mt-2 font-['Manrope'] text-3xl font-extrabold">{participantCount}</p>
              <p className="mt-1 text-[11px] text-indigo-100/75">Across your events</p>
            </div>
            <div className="hero-glass col-span-2 flex items-center gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15"><CalendarDays size={19} /></span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-100/75">Next on your schedule</p>
                <p className="mt-1 truncate text-sm font-bold">{nextEvent?.name || 'Nothing scheduled yet'}</p>
                <p className="mt-0.5 text-xs text-indigo-100/80">{nextEvent ? formatDate(nextEvent.date) : 'Create an event to get started'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="metric-card" style={{ '--metric-glow': 'rgba(98,88,232,.13)' }}>
          <div className="flex items-center justify-between"><span className="text-xs font-semibold muted-text">All events</span><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><CalendarDays size={17} /></span></div>
          <p className="mt-3 font-['Manrope'] text-3xl font-extrabold tracking-tight">{safeEvents.length}</p><p className="mt-1 text-xs muted-text">Events in your workspace</p>
        </div>
        <div className="metric-card" style={{ '--metric-glow': 'rgba(16,185,129,.13)' }}>
          <div className="flex items-center justify-between"><span className="text-xs font-semibold muted-text">Upcoming</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300"><Activity size={17} /></span></div>
          <p className="mt-3 font-['Manrope'] text-3xl font-extrabold tracking-tight">{upcomingEvents.length}</p><p className="mt-1 text-xs muted-text">Events still open</p>
        </div>
        <div className="metric-card" style={{ '--metric-glow': 'rgba(245,158,11,.14)' }}>
          <div className="flex items-center justify-between"><span className="text-xs font-semibold muted-text">Completed</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300"><CheckCircle2 size={17} /></span></div>
          <p className="mt-3 font-['Manrope'] text-3xl font-extrabold tracking-tight">{completedEvents.length}</p><p className="mt-1 text-xs muted-text">Past events</p>
        </div>
      </section>

      <section id="your-events" className="scroll-mt-24">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="workspace-eyebrow">Your workspace</p><h2 className="section-heading mt-1 text-2xl">Explore events</h2><p className="mt-1 text-sm muted-text">Find a team space or pick up where you left off.</p></div>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1 sm:flex-none">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 muted-text" />
              <input aria-label="Search events" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search events..." className="field-control !py-2.5 !pl-9 sm:w-64" />
              {searchTerm && <button onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 muted-text"><X size={15} /></button>}
            </div>
            <Button variant="outline" onClick={() => setShowFilters(value => !value)} className="!rounded-xl !py-2.5"><ChevronDown size={15} className="mr-1" /> Filter</Button>
          </div>
        </div>

        {showFilters && <div className="surface-card mb-5 flex flex-wrap items-center gap-3 p-4"><label htmlFor="event-category" className="text-sm font-semibold">Category</label><select id="event-category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="field-control !w-auto min-w-44 !py-2.5"><option value="">All categories</option>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select>{(categoryFilter || searchTerm) && <button onClick={() => { setCategoryFilter(''); setSearchTerm(''); }} className="inline-flex items-center gap-1 text-sm font-semibold text-rose-500"><X size={14} /> Clear filters</button>}</div>}

        {error && <div role="alert" className="surface-card mb-5 flex flex-col gap-3 border-rose-200 p-5 dark:border-rose-900 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-rose-600">We couldn't load your events.</p><p className="mt-1 text-sm muted-text">Check your connection and try again.</p></div><Button onClick={() => refetch()} variant="outline" loading={isFetching}>Try again</Button></div>}

        <div className="mb-4 flex items-center justify-between"><p className="text-sm muted-text">{filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found</p><button onClick={() => refetch()} disabled={isFetching} className="text-xs font-semibold disabled:opacity-50" style={{ color: 'var(--brand)' }}>{isFetching ? 'Refreshing…' : 'Refresh list'}</button></div>

        {filteredEvents.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredEvents.map((event, index) => <motion.div key={event.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .045, .25) }}><EventCard event={event} /></motion.div>)}</div> : <div className="surface-card flex flex-col items-center px-5 py-14 text-center"><span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><CalendarDays size={25} /></span><h3 className="text-lg font-bold">{searchTerm || categoryFilter ? 'No matching events' : 'Your workspace is ready'}</h3><p className="mt-2 max-w-md text-sm muted-text">{searchTerm || categoryFilter ? 'Try another search or clear your filters.' : 'Create your first event and invite people to plan and work together.'}</p>{searchTerm || categoryFilter ? <Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter(''); }} className="mt-5">Clear filters</Button> : <Button onClick={() => setIsModalOpen(true)} className="mt-5"><Plus size={16} className="mr-2" /> Create your first event</Button>}</div>}
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a new event"><CreateEventForm onClose={() => setIsModalOpen(false)} /></Modal>
    </div>
  );
};

export default Dashboard;