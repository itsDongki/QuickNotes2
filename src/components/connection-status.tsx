'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Database, CheckCircle, AlertCircle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionStatus() {
  const { user } = useAuth();
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Check database connection status
  const checkDbConnection = async () => {
    setDbStatus('checking');
    try {
      const { data, error } = await supabase.rpc('test_connection');
      
      if (error) throw error;
      setDbStatus('connected');
    } catch (error) {
      console.error('Database connection error:', error);
      setDbStatus('disconnected');
    } finally {
      setLastChecked(new Date());
    }
  };

  // Initial check and set up polling
  useEffect(() => {
    checkDbConnection();
    const interval = setInterval(checkDbConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Status indicator styles
  const statusConfig = {
    connected: {
      icon: CheckCircle,
      text: 'Connected to database',
      className: 'text-green-500',
    },
    disconnected: {
      icon: WifiOff,
      text: 'Database disconnected',
      className: 'text-red-500',
    },
    checking: {
      icon: Loader2,
      text: 'Checking connection...',
      className: 'text-yellow-500 animate-spin',
    },
  };

  const { icon: StatusIcon, text: statusText, className: statusClassName } = statusConfig[dbStatus];

  return (
    <div className="fixed bottom-4 right-4 bg-card p-3 rounded-lg shadow-md border border-border text-sm flex items-center space-x-2 z-50">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <Database className="h-4 w-4 text-muted-foreground" />
          <StatusIcon className={cn('h-2.5 w-2.5 absolute -top-1 -right-1', statusClassName)} />
        </div>
        <span className="text-muted-foreground">
          {user ? 'Authenticated' : 'Not authenticated'}
          {' • '}
          {statusText}
        </span>
      </div>
      {lastChecked && (
        <button 
          onClick={checkDbConnection}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          title="Last checked"
        >
          {lastChecked.toLocaleTimeString()}
        </button>
      )}
    </div>
  );
}
