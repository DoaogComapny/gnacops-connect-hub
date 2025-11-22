import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { policySchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { z } from 'zod';

type PolicyFormData = z.infer<typeof policySchema>;

interface PolicyFormProps {
  onSubmit: (data: PolicyFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<PolicyFormData>;
}

export function PolicyForm({ onSubmit, isLoading, initialData }: PolicyFormProps) {
  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: initialData || {
      title: '',
      content: '',
      implementation_progress: 0,
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
              <FormLabel>Policy Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter policy title" {...field} disabled={isLoading} />
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
              <FormLabel>Policy Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter detailed policy content"
                  className="min-h-[200px]"
                  {...field}
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
              <FormLabel>Deadline (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="implementation_progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Implementation Progress (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Policy' : 'Create Policy'}
        </Button>
      </form>
    </Form>
  );
}
