import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a custom fetch implementation that blocks WebSocket connections
const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // Convert URL to string for checking
  const url = input instanceof URL ? input.href : 
             typeof input === 'string' ? input : 
             input.url;
  
  // Block WebSocket connections
  if (url.startsWith('ws:') || url.startsWith('wss:')) {
    return Promise.reject(new Error('WebSocket connections are disabled'));
  }
  
  // Use the default fetch for regular HTTP requests
  return fetch(input, init);
};

// Create a single supabase client with realtime disabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
  },
  // Disable realtime features
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
  // Use custom fetch to block WebSocket connections
  global: {
    fetch: customFetch,
  },
});

// Monkey patch the realtime property to prevent any realtime subscriptions
Object.defineProperty(supabase, 'realtime', {
  get() {
    return {
      subscribe: () => ({
        subscribe: () => ({
          unsubscribe: () => {},
        }),
      }),
      channel: () => ({
        subscribe: () => ({
          unsubscribe: () => {},
        }),
      }),
    };
  },
});
