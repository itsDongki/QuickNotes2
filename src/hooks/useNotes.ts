import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { noteService, type GetNotesParams } from '@/lib/services/noteService';
import type { Note, NoteInsert, NoteUpdate } from '@/types/note';
import { toast } from 'sonner';

type SortField = 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

type UseNotesReturn = {
  // State
  notes: Note[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  search: string;
  sort: {
    field: SortField;
    order: SortOrder;
  };
  
  // Actions
  createNote: (noteData: Omit<NoteInsert, 'user_id'>) => Promise<Note | null>;
  updateNote: (id: string, updates: NoteUpdate) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  handlePageChange: (page: number) => void;
  handleSearch: (query: string) => void;
  handleSort: (field: SortField) => void;
  refetch: () => Promise<void>;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_FIELD: SortField = 'updated_at';
const DEFAULT_SORT_ORDER: SortOrder = 'desc';

export const useNotes = (): UseNotesReturn => {
  const { user } = useAuth();
  const router = useRouter();
  const isMounted = useRef(true);

  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({ 
    field: DEFAULT_SORT_FIELD, 
    order: DEFAULT_SORT_ORDER 
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch notes with error handling and loading states
  const fetchNotes = useCallback(async ({
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    searchQuery = search,
    sortConfig = sort
  } = {}) => {
    console.log('fetchNotes called with:', { page, pageSize, searchQuery, sortConfig });
    if (!user) {
      console.log('No user, returning early');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Calling noteService.getNotes with:', {
        userId: user.id,
        page,
        pageSize,
        search: searchQuery,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
      });
      
      const { data, count } = await noteService.getNotes({
        userId: user.id,
        page,
        pageSize,
        search: searchQuery,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order,
      });
      
      console.log('Received data from noteService:', { data, count });
      
      if (isMounted.current) {
        setNotes(data);
        setPagination(prev => ({
          ...prev,
          page,
          pageSize,
          total: count
        }));
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notes';
      
      if (isMounted.current) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user, search, sort]);

  // Handle real-time updates
  useEffect(() => {
    if (!user) return;

    const handleRealtimeUpdate = (payload: any) => {
      setNotes(prev => {
        switch (payload.eventType) {
          case 'INSERT':
            return [payload.new as Note, ...prev];
          case 'UPDATE':
            return prev.map(note => 
              note.id === payload.new.id ? { ...note, ...payload.new } : note
            );
          case 'DELETE':
            return prev.filter(note => note.id !== payload.old.id);
          default:
            return prev;
        }
      });
    };

    // Temporarily disabled real-time updates
    // const unsubscribe = noteService.subscribeToNotes(user.id, handleRealtimeUpdate);
    // return () => {
    //   if (unsubscribe) unsubscribe();
    // };
    return;
  }, [user?.id]);

  // Track previous search and sort values to prevent unnecessary re-fetches
  const prevSearchRef = useRef(search);
  const prevSortRef = useRef(sort);

  // Initial fetch and refetch when search or sort changes
  useEffect(() => {
    // Only fetch if search or sort has actually changed
    const searchChanged = prevSearchRef.current !== search;
    const sortChanged = 
      prevSortRef.current.field !== sort.field || 
      prevSortRef.current.order !== sort.order;
    
    if (searchChanged || sortChanged) {
      console.log('Search or sort changed, fetching notes...', { search, sort });
      
      const debounceTimer = setTimeout(() => {
        fetchNotes({ searchQuery: search, sortConfig: sort })
          .then(() => console.log('Notes fetched successfully'))
          .catch(err => console.error('Error fetching notes:', err));
          
        // Update refs after successful fetch
        prevSearchRef.current = search;
        prevSortRef.current = sort;
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [fetchNotes, search, sort]);
  
  // Initial fetch on mount
  useEffect(() => {
    console.log('Initial fetch');
    fetchNotes({})
      .then(() => console.log('Initial notes fetched'))
      .catch(err => console.error('Error in initial fetch:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this only runs once on mount

  // Note CRUD operations
  const createNote = useCallback(async (noteData: Omit<NoteInsert, 'user_id'>) => {
    if (!user) {
      router.push('/auth/login');
      return null;
    }

    try {
      const newNote = await noteService.createNote({
        ...noteData,
        user_id: user.id,
      });
      toast.success('Note created successfully');
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
      toast.error(errorMessage);
      throw err;
    }
  }, [user, router]);

  const updateNote = useCallback(async (id: string, updates: NoteUpdate) => {
    if (!user) {
      router.push('/auth/login');
      return null;
    }

    try {
      const updatedNote = await noteService.updateNote(id, updates, user.id);
      toast.success('Note updated successfully');
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
      toast.error(errorMessage);
      throw err;
    }
  }, [user, router]);

  const deleteNote = useCallback(async (id: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      await noteService.deleteNote(id, user.id);
      toast.success('Note deleted successfully');
    } catch (err) {
      console.error('Error deleting note:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
      toast.error(errorMessage);
      throw err;
    }
  }, [user, router]);

  // Event handlers
  const handlePageChange = useCallback((page: number) => {
    fetchNotes({ page });
  }, [fetchNotes]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    // Don't call fetchNotes here - it will be triggered by the useEffect
  }, []);

  const handleSort = useCallback((field: SortField) => {
    setSort(prev => {
      // Only update if the field is different or we're changing the order
      if (prev.field !== field || prev.order === 'asc') {
        return { field, order: 'desc' };
      }
      return { field, order: 'asc' };
    });
  }, []);

  return {
    // State
    notes,
    loading,
    error,
    pagination,
    search,
    sort,
    
    // Actions
    createNote,
    updateNote,
    deleteNote,
    handlePageChange,
    handleSearch,
    handleSort,
    refetch: () => fetchNotes({ page: pagination.page, pageSize: pagination.pageSize }),
  };
};
