import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { getMyEvents } from '../services/eventService';
import Loader from '../components/ui/Loader';
import { useTheme } from '../context/ThemeContext';

const CalendarView = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Fetches events the user is a member of
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['my-events-calendar'],
    queryFn: getMyEvents,
  });

  if (isLoading) return <Loader />;

  // Formats the event data for FullCalendar
  const calendarEvents = events?.map(event => ({
    id: event.id,
    title: event.name,
    date: event.date,
  })) || [];
  
  // Handles clicking on an event in the calendar
  const handleEventClick = (clickInfo) => {
    navigate(`/event/${clickInfo.event.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4"
    >
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Calendar View</h1>
        <p className="text-gray-500 dark:text-gray-400">Your personal event schedule.</p>
      </header>

      {error && <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/20 rounded-md">Error loading your events.</div>}

      <div className={`p-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl ${theme}`}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
          }}
          height="auto"
          eventBackgroundColor="#4f46e5"
          eventBorderColor="#4f46e5"
          eventTextColor="#ffffff"
          eventClassNames="cursor-pointer"
        />
      </div>
    </motion.div>
  );
};

export default CalendarView;

