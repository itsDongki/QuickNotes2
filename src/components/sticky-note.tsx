'use client';

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
// import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Textarea } from './ui/textarea';

type ColorOption = 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'gray';

const colorMap = {
  yellow: 'bg-yellow-100 border-yellow-300',
  blue: 'bg-blue-100 border-blue-300',
  green: 'bg-green-100 border-green-300',
  pink: 'bg-pink-100 border-pink-300',
  purple: 'bg-purple-100 border-purple-300',
  gray: 'bg-gray-100 border-gray-300',
};

interface StickyNoteProps {
  initialTitle?: string;
  initialContent?: string;
  initialColor?: ColorOption;
  onSave?: (title: string, content: string, color: ColorOption) => void;
  onDelete?: () => void;
  isNew?: boolean;
}

export function StickyNote({
  initialTitle = '',
  initialContent = '',
  initialColor = 'yellow',
  onSave,
  onDelete,
  isNew = false,
}: StickyNoteProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [color, setColor] = useState<ColorOption>(initialColor);
  const [isEditing, setIsEditing] = useState(isNew);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const noteRef = useRef<HTMLDivElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 300) {
      setContent(e.target.value);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(title, content, color);
    }
    setIsEditing(false);
    if (isNew) {
      setTitle('');
      setContent('');
      setColor('yellow');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !showColorPicker) {
      e.preventDefault();
      handleSave();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (noteRef.current && !noteRef.current.contains(event.target as Node)) {
        if (isEditing && (title.trim() || content.trim())) {
          handleSave();
        }
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [title, content, isEditing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="relative"
      ref={noteRef}
    >
      <Card 
        className={`w-64 h-64 flex flex-col ${colorMap[color]} border-2 transition-colors duration-200`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-center">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-transparent font-medium focus:outline-none"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
            ) : (
              <h3 className="font-medium truncate">{title || 'Untitled Note'}</h3>
            )}
            
            {isEditing && (
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:bg-transparent hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                >
                  <Palette className="h-4 w-4" />
                </Button>
                
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-500 hover:bg-transparent hover:text-red-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this note? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-500 hover:bg-red-600"
                          onClick={onDelete}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
          
          <AnimatePresence>
            {showColorPicker && isEditing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-10 right-2 bg-white p-2 rounded-md shadow-lg z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <ToggleGroup
                  type="single"
                  value={color}
                  onValueChange={(value: ColorOption) => {
                    setColor(value);
                    setShowColorPicker(false);
                  }}
                  className="grid grid-cols-3 gap-1"
                >
                  {Object.keys(colorMap).map((c) => (
                    <ToggleGroupItem
                      key={c}
                      value={c}
                      aria-label={`Select ${c} color`}
                      className={`w-6 h-6 rounded-full ${colorMap[c as ColorOption].split(' ')[0]} border-2 ${color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                    >
                      {color === c && <Check className="h-3 w-3 text-gray-700" />}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        
        <CardContent className="flex-1 p-3 overflow-y-auto">
          {isEditing ? (
            <Textarea
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Start typing..."
              className="h-full resize-none bg-transparent border-none focus-visible:ring-0 p-0 text-sm"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">
              {content || 'No content'}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="p-2 pt-0 text-xs text-gray-500 justify-between">
          <span>{content.length}/300</span>
          {isEditing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
            >
              Save
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
