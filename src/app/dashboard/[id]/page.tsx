'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftIcon, EditIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Note } from '@/types/note';
import { noteService } from '@/lib/services/noteService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function NoteDetailPage() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await noteService.getNoteById(id as string, user.id);
        
        if (!data) {
          setNote(null);
          return;
        }
        
        setNote(data);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to load note. Please try again.');
        toast.error('Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, user, router]);

  const handleDelete = async () => {
    if (!note?.id || !user) return;
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await noteService.deleteNote(note.id, user.id);
      toast.success('Note deleted successfully');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
      toast.error('Failed to delete note');
    } finally {
      setDeleting(false);
    }
  };

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <div className="flex space-x-3">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="px-4 py-5 sm:p-6">
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-5/6 mb-3" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Note not found</h2>
          <p className="text-gray-500 mb-6">The requested note could not be found or you don't have permission to view it.</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to notes
            </Link>
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
              <Link href={`/dashboard/${note.id}/edit`}>
                <Button size="sm">
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit
                </Button>
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
              <span 
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  colorClasses[note.color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {note.color.charAt(0).toUpperCase() + note.color.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Last updated on{' '}
              {new Date(note.updated_at).toLocaleDateString('en-US', {
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
