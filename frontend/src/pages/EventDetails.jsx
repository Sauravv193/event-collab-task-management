import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, MapPin, Users, Send, UserPlus, Info, Trash2, MessageCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEventById, getChatHistory, joinEvent, deleteEvent } from '../services/eventService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import TaskList from '../components/TaskList';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stompClient } = useSocket();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [chatMessage, setChatMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({ queryKey: ['event', id], queryFn: () => getEventById(id) });
  const isMember = Boolean(event?.members?.some(member => member.username === user?.username));
  const isCreator = Boolean(event?.createdBy?.username && event.createdBy.username === user?.username);
  const isExpired = Boolean(event?.expired);
  const members = Array.isArray(event?.members) ? event.members : [];

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', id], queryFn: () => getChatHistory(id), enabled: !!event && isMember,
  });

  const joinMutation = useMutation({
    mutationFn: joinEvent,
    onSuccess: () => {
      toast.success('Successfully joined the event!');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
    onError: error => toast.error(error.response?.data?.message || 'Failed to join event.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success('Event deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/');
    },
    onError: error => toast.error(error.response?.data?.message || 'You do not have permission to delete this event.'),
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (stompClient && stompClient.connected && id && isMember) {
      const chatSubscription = stompClient.subscribe('/topic/events/' + id + '/chat', message => {
        const newMessage = JSON.parse(message.body);
        queryClient.setQueryData(['chat', id], oldData => oldData ? [...oldData, newMessage] : [newMessage]);
      });
      const taskSubscription = stompClient.subscribe('/topic/events/' + id + '/tasks', () => queryClient.invalidateQueries({ queryKey: ['tasks', id] }));
      const deletedTaskSubscription = stompClient.subscribe('/topic/tasks/deleted/' + id, () => queryClient.invalidateQueries({ queryKey: ['tasks', id] }));
      return () => { chatSubscription.unsubscribe(); taskSubscription.unsubscribe(); deletedTaskSubscription.unsubscribe(); };
    }
  }, [stompClient, id, queryClient, isMember]);

  const handleSendMessage = e => {
    e.preventDefault();
    if (!chatMessage.trim() || !stompClient?.connected || isExpired) return;
    stompClient.publish({
      destination: '/app/chat.sendMessage/' + id,
      body: JSON.stringify({ sender: user.username, content: chatMessage.trim() }),
    });
    setChatMessage('');
  };

  const handleDeleteEvent = () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) deleteMutation.mutate(id);
  };

  if (eventLoading) return <div className="workspace-page"><Loader /></div>;
  if (eventError || !event) return <div className="workspace-page"><div role="alert" className="surface-card mx-auto max-w-xl p-8 text-center"><h1 className="text-xl font-bold">We couldn't open this event</h1><p className="mt-2 text-sm muted-text">It may have been removed, or you may have lost access.</p><Button onClick={() => navigate('/')} className="mt-5"><ArrowLeft size={16} className="mr-2" /> Back to dashboard</Button></div></div>;

  if (!isMember) {
    return (
      <div className="workspace-page">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="dashboard-hero mx-auto max-w-3xl text-center">
          <div className="relative z-10">
            <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10"><Users size={25} /></span>
            <p className="workspace-eyebrow !text-indigo-200">Event invitation</p>
            <h1 className="mt-2 font-['Manrope'] text-3xl font-extrabold tracking-tight sm:text-4xl">{event.name}</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-indigo-100/85">{event.description || 'Join this event to collaborate with its members, manage tasks and take part in the conversation.'}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-indigo-100"><span className="inline-flex items-center gap-2"><CalendarDays size={15} />{event.date ? new Date(event.date).toLocaleDateString() : 'Date not set'}</span><span className="inline-flex items-center gap-2"><MapPin size={15} />{event.location || 'Location not set'}</span><span className="inline-flex items-center gap-2"><Users size={15} />{members.length} members</span></div>
            {isExpired ? <p className="mt-7 rounded-xl border border-amber-200/30 bg-amber-300/10 p-3 text-sm text-amber-100">This event has finished and is no longer open for joining.</p> : <Button onClick={() => joinMutation.mutate(id)} disabled={joinMutation.isPending} className="!mt-7 !rounded-xl !bg-white !px-6 !py-3 !font-bold !text-indigo-700 hover:!bg-indigo-50"><UserPlus size={17} className="mr-2" />{joinMutation.isPending ? 'Joining…' : 'Join event'}</Button>}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold muted-text transition hover:text-indigo-600"><ArrowLeft size={16} /> Back</button>
        {isCreator && !isExpired && <Button onClick={handleDeleteEvent} disabled={deleteMutation.isPending} variant="outline" className="!rounded-xl !border-rose-200 !text-rose-600 hover:!bg-rose-50"><Trash2 size={15} className="mr-2" />{deleteMutation.isPending ? 'Deleting…' : 'Delete event'}</Button>}
      </div>

      {isExpired && <div role="status" className="surface-card mb-5 flex items-start gap-3 border-amber-200 bg-amber-50/70 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-200"><Info size={19} className="mt-0.5 shrink-0" /><p className="text-sm leading-6">This event has finished. You can still review tasks and chat history, but new tasks and messages are disabled.</p></div>}

      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dashboard-hero mb-6">
        <div className="relative z-10">
          <div className="mb-4 flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-100">Team event</span>{isCreator && <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white"><ShieldCheck size={12} /> Organizer</span>}</div>
          <h1 className="max-w-3xl font-['Manrope'] text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">{event.name}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-indigo-100/85">{event.description || 'A shared space to coordinate tasks and keep the team connected.'}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="hero-glass inline-flex items-center gap-2 px-3 py-2 text-sm"><CalendarDays size={15} />{event.date ? new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not set'}</span>
            <span className="hero-glass inline-flex items-center gap-2 px-3 py-2 text-sm"><MapPin size={15} />{event.location || 'Location not specified'}</span>
            <span className="hero-glass inline-flex items-center gap-2 px-3 py-2 text-sm"><Users size={15} />{members.length} participants</span>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.85fr)]">
        <section className="surface-card min-w-0 p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3"><div><p className="workspace-eyebrow">Plan and deliver</p><h2 className="section-heading mt-1 text-xl">Team tasks</h2></div><span className="soft-pill">Shared task list</span></div>
          <TaskList eventId={id} isMember={isMember} isCreator={isCreator} isExpired={isExpired} />
        </section>

        <section className="surface-card flex min-h-[520px] min-w-0 flex-col overflow-hidden xl:sticky xl:top-24 xl:h-[calc(100vh-7.5rem)]">
          <div className="flex items-center justify-between border-b p-4 sm:p-5" style={{ borderColor: 'var(--line)' }}>
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><MessageCircle size={18} /></span><div><h2 className="font-bold">Team conversation</h2><p className="text-xs muted-text">Event chat</p></div></div>
            <span className="soft-pill">{stompClient?.connected ? 'Live' : 'Connecting'}</span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {messagesLoading && <div className="space-y-3"><div className="h-12 w-3/4 animate-pulse rounded-2xl" style={{ background: 'var(--surface-muted)' }} /><div className="ml-auto h-12 w-2/3 animate-pulse rounded-2xl" style={{ background: 'var(--surface-muted)' }} /></div>}
            {!messagesLoading && (!messages || messages.length === 0) && <div className="flex h-full min-h-52 flex-col items-center justify-center text-center"><span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><MessageCircle size={21} /></span><p className="font-semibold">Start the conversation</p><p className="mt-1 max-w-[220px] text-xs leading-5 muted-text">Share an update or ask the team a question.</p></div>}
            {messages?.map((msg, index) => {
              const ownMessage = msg.sender === user.username;
              return <div key={msg.id || index} className={'flex ' + (ownMessage ? 'justify-end' : 'justify-start')}><div className={'max-w-[88%] rounded-2xl px-4 py-3 ' + (ownMessage ? 'rounded-br-md bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'rounded-bl-md')} style={!ownMessage ? { background: 'var(--surface-muted)', color: 'var(--ink)' } : undefined}><p className={'mb-1 text-[10px] font-bold ' + (ownMessage ? 'text-indigo-100' : 'muted-text')}>{ownMessage ? 'You' : msg.sender}</p><p className="break-words text-sm leading-5">{msg.content}</p></div></div>;
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="border-t p-3 sm:p-4" style={{ borderColor: 'var(--line)' }}>
            <div className="flex items-center gap-2"><input aria-label="Write a message" type="text" placeholder={isExpired ? 'Chat is closed for this event' : 'Write a message…'} className="field-control !min-w-0 !py-3" value={chatMessage} onChange={e => setChatMessage(e.target.value)} disabled={isExpired} maxLength={2000} /><Button type="submit" disabled={isExpired || !chatMessage.trim() || !stompClient?.connected} className="!h-11 !w-11 !shrink-0 !rounded-xl !p-0" aria-label="Send message"><Send size={17} /></Button></div>
            {!stompClient?.connected && !isExpired && <p className="mt-2 px-1 text-[11px] text-amber-600">Reconnecting to live chat…</p>}
          </form>
        </section>
      </div>
    </div>
  );
};

export default EventDetails;