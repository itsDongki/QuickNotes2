import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Note } from '@/types/note';
import { NoteCard, NoteCardSkeleton } from './note-card';
import { ArrowUpDown, Search } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';

interface NotesGridProps {
  notes: Note[];
  loading: boolean;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onSort: (field: 'created_at' | 'updated_at') => void;
  sort: {
    field: 'created_at' | 'updated_at';
    order: 'asc' | 'desc';
  };
}

export function NotesGrid({
  notes,
  loading,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onSearch,
  onSort,
  sort,
}: NotesGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleSort = useCallback((field: 'created_at' | 'updated_at') => {
    onSort(field);
  }, [onSort]);

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (pagination.page > 1) onPageChange(pagination.page - 1);
              }}
              className={pagination.page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <PaginationItem>
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
              >
                1
              </PaginationLink>
            </PaginationItem>
          )}
          
          {startPage > 2 && (
            <PaginationItem>
              <span className="px-3 py-2">...</span>
            </PaginationItem>
          )}
          
          {pageNumbers.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNum);
                }}
                isActive={pageNum === pagination.page}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {endPage < totalPages - 1 && (
            <PaginationItem>
              <span className="px-3 py-2">...</span>
            </PaginationItem>
          )}
          
          {endPage < totalPages && (
            <PaginationItem>
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(totalPages);
                }}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (pagination.page < totalPages) onPageChange(pagination.page + 1);
              }}
              className={pagination.page === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
          <Select
            value={sort.field}
            onValueChange={(value: 'created_at' | 'updated_at') => handleSort(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">Last Updated</SelectItem>
              <SelectItem value="created_at">Date Created</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSort(sort.field)}
          >
            <ArrowUpDown className={`h-4 w-4 transition-transform ${sort.order === 'asc' ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && pagination.page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No notes found</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery ? 'Try a different search term' : 'Create a new note to get started'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence initial={false}>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
}
