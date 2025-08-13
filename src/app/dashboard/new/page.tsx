'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';

type Note = {
  id?: string;
  title: string;
  content: string;
  color: string;
};

export default function NoteEditor() {
  const [note, setNote] = useState<Note>({
    title: '',
    content: '',
    color: 'yellow',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!note.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // TODO: Implement save to database
      console.log('Saving note:', note);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after save
      router.push('/dashboard');
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note.id) return;
    
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

  const colors = [
    { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
    { name: 'Green', value: 'green', bg: 'bg-green-100', text: 'text-green-800' },
    { name: 'Red', value: 'red', bg: 'bg-red-100', text: 'text-red-800' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-100', text: 'text-purple-800' },
  ];

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
                disabled={!note.id}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                  note.id
                    ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SaveIcon className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Note title"
                value={note.title}
                onChange={(e) => setNote({ ...note, title: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="mt-1">
              <textarea
                id="content"
                rows={15}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="Start writing your note here..."
                value={note.content}
                onChange={(e) => setNote({ ...note, content: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setNote({ ...note, color: color.value })}
                  className={`w-8 h-8 rounded-full ${color.bg} ${
                    note.color === color.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
