import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Send, UserPlus, Info, Trash2 } from 'lucide-react';
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

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
  });

  const isMember = event?.members.some(member => member.username === user.username);
  const isCreator = event?.createdBy.username === user.username;
  const isExpired = event?.expired;

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat', id],
    queryFn: () => getChatHistory(id),
    enabled: !!event && isMember, 
  });

  const joinMutation = useMutation({
    mutationFn: joinEvent,
    onSuccess: () => {
      toast.success("Successfully joined the event!");
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to join event.");
    }
  });

  // *** NEW: Mutation for deleting an event ***
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success("Event deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "You do not have permission to delete this event.");
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (stompClient && stompClient.connected && id && isMember) {
      const chatSubscription = stompClient.subscribe(`/topic/chat/${id}`, (message) => {
        const newMessage = JSON.parse(message.body);
        // FIX: Update query data correctly to show new messages
        queryClient.setQueryData(['chat', id], (oldData) => {
            const data = oldData ? [...oldData, newMessage] : [newMessage];
            return data;
        });
      });

      const taskSubscription = stompClient.subscribe(`/topic/tasks/${id}`, () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      });

      const deletedTaskSubscription = stompClient.subscribe(`/topic/tasks/deleted/${id}`, () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      });

      return () => {
        chatSubscription.unsubscribe();
        taskSubscription.unsubscribe();
        deletedTaskSubscription.unsubscribe();
      };
    }
  }, [stompClient, id, queryClient, isMember]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim() && stompClient?.connected && !isExpired) {
      const payload = { sender: user.username, content: chatMessage };
      stompClient.publish({
        destination: `/app/chat.sendMessage/${id}`,
        body: JSON.stringify(payload),
      });
      setChatMessage('');
    }
  };

  const handleDeleteEvent = () => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (eventLoading) return <Loader />;
  if (eventError) return <div className="text-center text-red-500 p-8">Could not load event. It may have been deleted.</div>;

  // View for non-members
  if (!isMember) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="flex items-center justify-center py-20">
          <div className="w-full max-w-2xl p-8 bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg rounded-2xl text-center">
            <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
            {isExpired ? (
              <p className="text-lg text-yellow-400 mb-6">This event has already finished and is no longer open for joining.</p>
            ) : (
              <>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">You must join this event to see the full details and participate.</p>
                <Button onClick={() => joinMutation.mutate(id)} disabled={joinMutation.isPending} className="mx-auto">
                  <UserPlus className="w-5 h-5 mr-2" />
                  {joinMutation.isPending ? 'Joining...' : 'Join Event'}
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Main view for members
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="container mx-auto p-4">
      {isExpired && (
        <div className="flex items-center gap-4 bg-yellow-500/10 text-yellow-400 p-4 rounded-lg mb-6">
          <Info size={20} />
          <p>This event has finished. You can view the tasks and chat history, but you cannot create new tasks or send messages.</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg rounded-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{event.description}</p>
              </div>
              {isCreator && !isExpired && (
                <Button onClick={handleDeleteEvent} disabled={deleteMutation.isPending} variant="outline" className="text-red-500 hover:bg-red-500/10 border-red-500/50">
                  <Trash2 size={16} className="mr-2" />
                  Delete Event
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-4">
              <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400" /> {new Date(event.date).toLocaleDateString()}</div>
              <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-400" /> {event.location}</div>
              <div className="flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> {event.members.length} participants</div>
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">Tasks</h2>
            <TaskList eventId={id} isMember={isMember} isCreator={isCreator} isExpired={isExpired} />
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col h-[80vh] bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg rounded-2xl">
          <h2 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-white/20">Event Chat</h2>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading && <p className="text-center">Loading messages...</p>}
            {messages?.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === user.username ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${msg.sender === user.username ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <p className="font-bold text-sm">{msg.sender}</p>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {/* FIX: Show a message when the chat history is empty */}
            {messages && messages.length === 0 && (
                <p className="text-center text-gray-400 pt-4">No messages yet. Say hello!</p>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-white/20 flex gap-2">
            <input type="text" placeholder={isExpired ? "Chat is closed for this event" : "Type a message..."} className="flex-1 w-full px-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} disabled={isExpired} />
            <Button type="submit" className="p-2" disabled={isExpired}><Send className="w-5 h-5" /></Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetails;