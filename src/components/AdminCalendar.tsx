import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, LogOut, ShieldAlert, FileText } from 'lucide-react';
import { getAllAppointments, Appointment } from '../lib/appointments';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { AdminInsights } from './AdminInsights';

export function AdminCalendar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<'appointments' | 'insights'>('appointments');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAppointments();
      } else {
        setLoading(false);
        setAccessDenied(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setAccessDenied(false);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        setAccessDenied(true);
      } else {
        console.error("Failed to fetch appointments:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Staff Portal</h2>
          <p className="text-slate-400 mb-8">Please log in to view the internal appointment calendar.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You do not have permission to view the Staff Portal. Please log in with an authorized staff account.
          </p>
          <div className="text-sm text-slate-500 mb-8 p-3 bg-slate-800/50 rounded-lg">
            Logged in as: <span className="text-slate-300">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="w-full bg-slate-800 text-white hover:bg-slate-700 font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Staff Portal</h2>
          <p className="text-slate-400 mt-1">Manage appointments and website content.</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'appointments' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> Appointments
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'insights' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" /> Insights
        </button>
      </div>

      {activeTab === 'insights' ? (
        <AdminInsights />
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No Appointments</h3>
          <p className="text-slate-400">There are currently no appointments scheduled.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm font-medium border border-orange-500/20">
                    {apt.service}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                    apt.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-400' :
                    apt.status === 'completed' ? 'bg-slate-800 text-slate-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {apt.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>{apt.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{apt.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="truncate" title={apt.customerEmail}>{apt.customerEmail || 'No email'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:text-right border-t border-slate-800 md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                <div className="flex items-center md:justify-end gap-2 text-lg font-semibold">
                  <CalendarIcon className="w-5 h-5 text-orange-400" />
                  {format(parseISO(apt.date), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center md:justify-end gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  {apt.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
