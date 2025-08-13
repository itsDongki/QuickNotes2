'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-indigo-600 dark:text-indigo-400">QuickNotes</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            A simple, fast, and beautiful note-taking application that helps you stay organized.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/signup" passHref>
              <Button size="lg" className="px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login" passHref>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Simple & Intuitive',
                description: 'Easy-to-use interface that gets out of your way so you can focus on your thoughts.',
                icon: '✏️',
              },
              {
                title: 'Access Anywhere',
                description: 'Access your notes from any device, anytime, anywhere.',
                icon: '🌐',
              },
              {
                title: 'Secure & Private',
                description: 'Your data is encrypted and stays private.',
                icon: '🔒',
              },
            ].map((feature, index) => (
              <div key={index} className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8 h-full shadow-lg">
                  <div className="-mt-6">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
