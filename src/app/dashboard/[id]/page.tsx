'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftIcon, EditIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';

type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
  updatedAt: string;
};

export default function NoteDetailPage() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchNote = async () => {
      try {
        setLoading(true);
        // TODO: Fetch note from database
        // This is mock data for now
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock note data
        const mockNote: Note = {
          id: id as string,
          title: 'Sample Note',
          content: 'This is a sample note. In a real application, this would be fetched from the database.',
          color: 'yellow',
          updatedAt: new Date().toISOString(),
        };
        
        setNote(mockNote);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to load note. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNote();
    }
  }, [id, user, router]);

  const handleDelete = async () => {
    if (!note?.id) return;
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement delete from database
      console.log('Deleting note:', note.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to dashboard after delete
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Note not found</h2>
          <p className="text-gray-500 mb-6">The requested note could not be found or you don't have permission to view it.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to notes
            </Link>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete
              </button>
              <Link
                href={`/dashboard/${note.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <EditIcon className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">{note.title}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                colorClasses[note.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'
              }`}>
                {note.color.charAt(0).toUpperCase() + note.color.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Last updated on{' '}
              {new Date(note.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="prose max-w-none">
              {note.content.split('\n').map((paragraph, i) => (
                <p key={i} className="text-gray-700">
                  {paragraph || <br />}
                </p>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
