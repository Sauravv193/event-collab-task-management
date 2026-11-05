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
      className="workspace-page"
    >
      <header className="mb-6">
        <p className="workspace-eyebrow">Plan ahead</p><h1 className="workspace-title mt-1">Calendar</h1>
        <p className="workspace-subtitle">See your joined events and open any event to continue collaborating.</p>
      </header>

      {error && <div className="text-red-500 p-4 bg-red-100 dark:bg-red-900/20 rounded-md">Error loading your events.</div>}

      <div className="surface-card overflow-hidden p-3 sm:p-5">
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

