import { supabase } from '../supabaseClient';
import { Note, NoteInsert, NoteUpdate } from '@/types/note';

export type GetNotesParams = {
  userId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
};

export type GetNotesResponse = {
  data: Note[];
  count: number;
};

const NOTE_TABLE = 'notes';
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_FIELD: 'created_at' | 'updated_at' = 'updated_at';
const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'desc';

export const noteService = {
  /**
   * Create a new note
   */
  async createNote(note: NoteInsert): Promise<Note> {
    const { data, error } = await supabase
      .from(NOTE_TABLE)
      .insert(note)
      .select()
      .single();

    if (error) throw new Error(`Failed to create note: ${error.message}`);
    return data;
  },

  /**
   * Get a single note by ID
   */
  async getNoteById(id: string, userId: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from(NOTE_TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error?.code === 'PGRST116') return null; // Not found
    if (error) throw new Error(`Failed to fetch note: ${error.message}`);

    return data;
  },

  /**
   * Get paginated notes with search and sort options
   */
  async getNotes({
    userId,
    page = DEFAULT_PAGE,
    pageSize = DEFAULT_PAGE_SIZE,
    search = '',
    sortBy = DEFAULT_SORT_FIELD,
    sortOrder = DEFAULT_SORT_ORDER,
  }: GetNotesParams): Promise<GetNotesResponse> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(NOTE_TABLE)
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw new Error(`Failed to fetch notes: ${error.message}`);

    return { 
      data: data ?? [], 
      count: count ?? 0 
    };
  },

  /**
   * Update an existing note
   */
  async updateNote(id: string, updates: NoteUpdate, userId: string): Promise<Note> {
    const { data, error } = await supabase
      .from(NOTE_TABLE)
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update note: ${error.message}`);
    return data;
  },

  /**
   * Delete a note
   */
  async deleteNote(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from(NOTE_TABLE)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete note: ${error.message}`);
  },

  // /**
  //  * Subscribe to real-time note changes
  //  */
  // subscribeToNotes(userId: string, callback: (payload: any) => void) {
  //   const subscription = supabase
  //     .channel('notes')
  //     .on(
  //       'postgres_changes',
  //       {
  //         event: '*',
  //         schema: 'public',
  //         table: NOTE_TABLE,
  //         filter: `user_id=eq.${userId}`,
  //       },
  //       (payload) => callback(payload)
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(subscription);
  //   };
  // },
};
