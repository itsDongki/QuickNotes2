'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useNotes } from '@/hooks/useNotes';
import { NotesGrid } from '@/components/notes-grid';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ConnectionStatus } from '@/components/connection-status';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const {
    notes,
    loading,
    pagination,
    search,
    sort,
    createNote,
    updateNote,
    deleteNote,
    handlePageChange,
    handleSearch,
    handleSort,
  } = useNotes();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleEditNote = (note: any) => {
    router.push(`/dashboard/${note.id}/edit`);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">QuickNotes</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-foreground hover:bg-accent"
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Notes</h2>
            <p className="text-sm text-muted-foreground">
              View and manage your notes
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </Link>
        </div>

        <NotesGrid
          notes={notes}
          loading={loading}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onSort={handleSort}
          sort={sort}
        />
      </main>
      <ConnectionStatus />
    </div>
  );
}
