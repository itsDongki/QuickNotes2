import { useForm, type SubmitHandler, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content is too long'),
  color: z.enum(['yellow', 'blue', 'green', 'red', 'purple']).default('yellow'),
});

export type NoteFormValues = {
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple';
};

type Note = {
  id?: string;
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple';
  created_at?: string;
  updated_at?: string;
  user_id?: string;
};

interface NoteFormProps {
  initialData?: Partial<Note>;
  onSubmit: (data: NoteFormValues) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function NoteForm({ initialData, onSubmit, onCancel, isLoading }: NoteFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      content: initialData?.content ?? '',
      color: (initialData?.color as Note['color']) ?? 'yellow',
    },
  });

  const colorOptions: { value: Note['color']; label: string; bg: string }[] = [
    { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-400' },
    { value: 'blue', label: 'Blue', bg: 'bg-blue-400' },
    { value: 'green', label: 'Green', bg: 'bg-green-400' },
    { value: 'red', label: 'Red', bg: 'bg-red-400' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-400' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => {
        return Promise.resolve(onSubmit(data as NoteFormValues));
      })} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a title"
                  {...field}
                  disabled={isLoading}
                  className="text-lg font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your note here..."
                  {...field}
                  disabled={isLoading}
                  className="min-h-[200px] resize-none"
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0}/5000 characters
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  {colorOptions.map((color) => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={color.value} id={color.value} className="sr-only" />
                      <label
                        htmlFor={color.value}
                        className={cn(
                          'w-8 h-8 rounded-full cursor-pointer border-2 border-transparent',
                          color.bg,
                          field.value === color.value && 'ring-2 ring-offset-2 ring-primary'
                        )}
                        title={color.label}
                      />
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Note'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
