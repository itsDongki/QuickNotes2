export type NoteColor = 'yellow' | 'blue' | 'green' | 'red' | 'purple';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: NoteColor;
  created_at: string;
  updated_at: string;
}

export type NoteInsert = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type NoteUpdate = Partial<Omit<Note, 'id' | 'user_id' | 'created_at'>>;
