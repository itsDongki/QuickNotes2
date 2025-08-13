/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development experience
  reactStrictMode: true,
  
  // Configure images domains if needed (e.g., for external image sources)
  images: {
    domains: [
      'localhost',
      'your-supabase-project.supabase.co',
      'your-supabase-project.supabase.in',
    ],
  },
  
  // Experimental features can be added here if needed
  // Server Actions are enabled by default in Next.js 14+
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
  
  // Environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
