import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, MapPin, Users, CheckCircle2, Clock3 } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Date not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not set' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const EventCard = ({ event }) => {
  const isExpired = Boolean(event?.expired);
  const memberCount = Array.isArray(event?.members) ? event.members.length : 0;

  return (
    <motion.article whileHover={{ y: -3 }} transition={{ duration: .2 }} className="event-card">
      <div className="event-card-art">
        <span className="absolute left-5 top-4 z-10 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-white backdrop-blur-md">{event?.category || 'Team event'}</span>
        <span className="absolute bottom-4 right-5 z-10 grid h-11 w-11 place-items-center rounded-2xl border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-md"><CalendarDays size={20} /></span>
      </div>
      <div className="event-card-body">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug tracking-tight" style={{ color: 'var(--ink)' }}>{event?.name || 'Untitled event'}</h3>
          <span className={isExpired ? 'inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'inline-flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300'}>
            {isExpired ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}{isExpired ? 'Finished' : 'Upcoming'}
          </span>
        </div>
        <p className="mb-5 line-clamp-2 min-h-10 text-sm leading-5 muted-text">{event?.description || 'Open this event to see details and collaborate with your team.'}</p>
        <div className="space-y-2.5 border-t pt-4 text-xs font-medium muted-text" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2"><CalendarDays size={14} className="shrink-0" style={{ color: 'var(--brand)' }} /><span>{formatDate(event?.date)}</span></div>
          <div className="flex items-center gap-2"><MapPin size={14} className="shrink-0" style={{ color: 'var(--brand)' }} /><span className="truncate">{event?.location || 'Location not specified'}</span></div>
          <div className="flex items-center gap-2"><Users size={14} className="shrink-0" style={{ color: 'var(--brand)' }} /><span>{memberCount} {memberCount === 1 ? 'participant' : 'participants'}</span><span className="ml-auto">Host: {event?.createdBy?.username || 'Unknown'}</span></div>
        </div>
        <Link to={'/event/' + event.id} className="mt-5 inline-flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition hover:brightness-95" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>Open event <ArrowUpRight size={16} /></Link>
      </div>
    </motion.article>
  );
};

export default EventCard;