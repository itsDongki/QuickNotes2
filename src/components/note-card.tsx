import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { PencilIcon, Trash2Icon, ClockIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Note } from '@/types/note';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const colorVariants = {
  yellow: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
  blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
  green: 'bg-green-50 border-green-200 hover:border-green-300',
  red: 'bg-red-50 border-red-200 hover:border-red-300',
  purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
};

const dotColors = {
  yellow: 'bg-yellow-400',
  blue: 'bg-blue-400',
  green: 'bg-green-400',
  red: 'bg-red-400',
  purple: 'bg-purple-400',
};

export function NoteCard({ note, onEdit, onDelete, className }: NoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      className={className}
    >
      <Card 
        className={cn(
          'h-full flex flex-col transition-all duration-200 border-2',
          colorVariants[note.color],
          'hover:shadow-md hover:-translate-y-1',
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {note.title}
            </CardTitle>
            <div className={cn('w-3 h-3 rounded-full flex-shrink-0 mt-1.5', dotColors[note.color])} />
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>
              {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <p className="text-sm text-muted-foreground line-clamp-4">
            {note.content}
          </p>
        </CardContent>
        <CardFooter className="pt-2 pb-3 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            className="h-8 px-2.5 text-xs"
          >
            <PencilIcon className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            className="h-8 px-2.5 text-xs text-destructive hover:text-destructive"
          >
            <Trash2Icon className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse h-48">
      <div className="p-4 space-y-3">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
