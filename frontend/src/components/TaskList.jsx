import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Circle, Clock3, Plus } from 'lucide-react';
import { getTasksByEvent } from '../services/taskService';
import TaskItem from './TaskItem';
import Button from './ui/Button';
import CreateTaskForm from './CreateTaskForm';

const columns = [
  { id: 'TO_DO', label: 'To do', icon: Circle, tone: 'text-slate-500 bg-slate-100 dark:bg-slate-700/60' },
  { id: 'IN_PROGRESS', label: 'In progress', icon: Clock3, tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-400/10 dark:text-indigo-300' },
  { id: 'DONE', label: 'Done', icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-400/10 dark:text-emerald-300' },
];

const TaskList = ({ eventId, isMember, isCreator, isExpired }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', eventId],
    queryFn: () => getTasksByEvent(eventId),
    enabled: isMember,
  });
  const tasks = Array.isArray(data) ? data : (data?.content ?? []);

  const groupedTasks = useMemo(() => columns.reduce((groups, column) => {
    groups[column.id] = tasks.filter(task => task.status === column.id);
    return groups;
  }, {}), [tasks]);

  if (isLoading) return <div className="grid gap-3 md:grid-cols-3">{columns.map(column => <div key={column.id} className="rounded-2xl p-4" style={{ background: 'var(--surface-muted)' }}><div className="mb-4 h-4 w-24 animate-pulse rounded" style={{ background: 'var(--line)' }} /><div className="h-20 animate-pulse rounded-xl" style={{ background: 'var(--line)' }} /><div className="mt-3 h-20 animate-pulse rounded-xl" style={{ background: 'var(--line)' }} /></div>)}</div>;
  if (error) return <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-500/10 dark:text-rose-200">Could not load tasks. Refresh the page and try again.</div>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm muted-text">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} across this event</p>
        {!showCreateForm && !isExpired && <Button onClick={() => setShowCreateForm(true)} className="!rounded-xl"><Plus size={16} className="mr-2" /> Add task</Button>}
      </div>
      {showCreateForm && <div className="surface-card mb-5 p-4"><CreateTaskForm eventId={eventId} onComplete={() => setShowCreateForm(false)} /></div>}
      {tasks.length === 0 && !showCreateForm ? <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: 'var(--line)' }}><span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}><CheckCircle2 size={20} /></span><p className="font-semibold">No tasks yet</p><p className="mt-1 text-sm muted-text">{isExpired ? 'There are no tasks in this event.' : 'Add the first task to give your team a clear next step.'}</p></div> : (
        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
          {columns.map(column => {
            const Icon = column.icon;
            const items = groupedTasks[column.id] || [];
            return <section key={column.id} className="min-w-0 rounded-2xl p-3 sm:p-4" style={{ background: 'var(--surface-muted)' }}>
              <div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={'grid h-7 w-7 place-items-center rounded-lg ' + column.tone}><Icon size={15} /></span><h3 className="text-sm font-bold">{column.label}</h3></div><span className="rounded-full px-2 py-0.5 text-[11px] font-bold muted-text" style={{ background: 'var(--surface-solid)' }}>{items.length}</span></div>
              <div className="space-y-3">{items.length ? items.map(task => <TaskItem key={task.id} task={task} eventId={eventId} isCreator={isCreator} />) : <div className="rounded-xl border border-dashed px-3 py-5 text-center text-xs muted-text" style={{ borderColor: 'var(--line)' }}>Nothing here yet</div>}</div>
            </section>;
          })}
        </div>
      )}
    </div>
  );
};

export default TaskList;