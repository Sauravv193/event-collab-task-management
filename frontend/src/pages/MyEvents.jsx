import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarDays, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyEvents } from '../services/eventService';
import EventCard from '../components/EventCard';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const MyEvents = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['my-events'],
    queryFn: getMyEvents,
  });
  const events = Array.isArray(data) ? data : (data?.content ?? []);

  if (isLoading) return <div className="workspace-page"><Loader /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="workspace-page">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="workspace-eyebrow">Your community</p><h1 className="workspace-title mt-1">My events</h1><p className="workspace-subtitle">The spaces you've joined and the people you're working with.</p></div>
        <div className="flex items-center gap-2"><span className="soft-pill">{events.length} joined</span><Button variant="outline" onClick={() => refetch()} loading={isFetching}>Refresh</Button></div>
      </header>
      {error && <div role="alert" className="surface-card mb-5 flex items-center justify-between gap-3 border-rose-200 p-4 dark:border-rose-900"><p className="text-sm text-rose-600">We couldn't load your events.</p><Button variant="outline" onClick={() => refetch()}>Try again</Button></div>}
      {events.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{events.map((event, index) => <motion.div key={event.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * .04, .2) }}><EventCard event={event} /></motion.div>)}</div> : <div className="surface-card flex flex-col items-center px-5 py-14 text-center"><span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><CalendarDays size={25} /></span><h2 className="text-lg font-bold">No joined events yet</h2><p className="mt-2 max-w-sm text-sm muted-text">When you join or create an event, it will appear here so you can quickly return to your team.</p><Button onClick={() => navigate('/')} className="mt-5"><Plus size={16} className="mr-2" /> Explore events</Button></div>}
    </motion.div>
  );
};

export default MyEvents;