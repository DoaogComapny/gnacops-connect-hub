import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { grantSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import type { z } from 'zod';

type GrantFormData = z.infer<typeof grantSchema>;

interface GrantFormProps {
  onSubmit: (data: GrantFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<GrantFormData>;
}

export function GrantForm({ onSubmit, isLoading, initialData }: GrantFormProps) {
  const form = useForm<GrantFormData>({
    resolver: zodResolver(grantSchema),
    defaultValues: initialData || {
      title: '',
      amount: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grant Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter grant application title" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (GHS) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Grant' : 'Create Grant Application'}
        </Button>
      </form>
    </Form>
  );
}
