'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { NoteForm } from '@/components/note-form';
import { Button } from '@/components/ui/button';
import { NoteInsert } from '@/types/note';
import { noteService } from '@/lib/services/noteService';

export default function NewNotePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSubmit = async (data: { title: string; content: string; color: string }) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      // Create the note in the database
      const newNote = await noteService.createNote({
        title: data.title,
        content: data.content,
        color: data.color as NoteInsert['color'],
        user_id: user.id,
      });
      
      toast.success('Note created successfully');
      router.push(`/dashboard/${newNote.id}`);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
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
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="note-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Note'
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Note</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new note to capture your thoughts and ideas
            </p>
          </div>
          
          <NoteForm 
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            onCancel={() => router.back()}
          />
        </div>
      </main>
    </div>
  );
}
