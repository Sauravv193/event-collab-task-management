import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Shield, User, CalendarPlus, CalendarCheck } from 'lucide-react';

import { changePassword } from '../services/userService';
import { getMyEvents, getAllEvents } from '../services/eventService';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';

const Profile = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { data: myEvents, isLoading: myEventsLoading } = useQuery({
      queryKey: ['my-events'],
      queryFn: getMyEvents
  });

  const { data: allEvents, isLoading: allEventsLoading } = useQuery({
      queryKey: ['events'],
      queryFn: getAllEvents
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update password.');
    },
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long.");
        return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  if (myEventsLoading || allEventsLoading) return <Loader />;

  const eventsCreated = allEvents?.filter(event => event.createdBy.username === user.username).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4 sm:p-6"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account settings and preferences.</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Section */}
        <div className="p-6 bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><User /> Profile</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2"><User size={16}/> Username</p>
                    <p className="font-semibold">{user?.username}</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2"><CalendarCheck size={16}/> Events Joined</p>
                    <p className="font-semibold">{myEvents?.length || 0}</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2"><CalendarPlus size={16}/> Events Created</p>
                    <p className="font-semibold">{eventsCreated || 0}</p>
                </div>
            </div>
        </div>

        {/* Change Password Section */}
        <div className="p-6 bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3"><Shield /> Security</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                    <label htmlFor="current-password"
                           className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Password
                    </label>
                    <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="new-password"
                           className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        New Password
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm"
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={passwordMutation.isPending}>
                        {passwordMutation.isPending ? 'Updating...' : 'Change Password'}
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;