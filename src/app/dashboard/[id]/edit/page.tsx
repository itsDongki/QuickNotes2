'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { NoteForm } from '@/components/note-form';
import { Button } from '@/components/ui/button';
import { Note, NoteUpdate } from '@/types/note';
import { noteService } from '@/lib/services/noteService';

export default function EditNotePage() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        const fetchedNote = await noteService.getNoteById(id as string, user.id);
        
        if (!fetchedNote) {
          toast.error('Note not found');
          router.push('/dashboard');
          return;
        }
        
        setNote(fetchedNote);
      } catch (error) {
        console.error('Error fetching note:', error);
        toast.error('Failed to load note. Please try again.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, user, router]);

  const handleSubmit = async (data: { title: string; content: string; color: string }) => {
    if (!user || !note) return;

    try {
      setIsSubmitting(true);
      
      // Update the note in the database
      await noteService.updateNote(
        note.id,
        {
          title: data.title,
          content: data.content,
          color: data.color as NoteUpdate['color'],
        },
        user.id
      );
      
      toast.success('Note updated successfully');
      router.push(`/dashboard/${note.id}`);
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !user) return;
    
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      await noteService.deleteNote(note.id, user.id);
      toast.success('Note deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note. Please try again.');
    }
  };

  if (loading || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link
              href={`/dashboard/${note.id}`}
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Cancel
            </Link>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Note
              </Button>
              <Button 
                type="submit" 
                form="note-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Note</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Make changes to your note
            </p>
          </div>
          
          <NoteForm 
            initialData={{
              title: note.title,
              content: note.content,
              color: note.color as 'yellow' | 'blue' | 'green' | 'red' | 'purple',
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            onCancel={() => router.push(`/dashboard/${note.id}`)}
          />
        </div>
      </main>
    </div>
  );
}
