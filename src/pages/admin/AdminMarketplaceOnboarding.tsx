import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash } from 'lucide-react';
import { useState } from 'react';

export default function AdminMarketplaceOnboarding() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'text',
    is_required: true,
    is_active: true,
    options: [] as string[],
    position: 0,
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['onboarding-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_onboarding_questions')
        .select('*')
        .order('position');
      if (error) throw error;
      return data;
    },
  });

  const createQuestion = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('marketplace_onboarding_questions')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-questions'] });
      toast.success('Question added successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateQuestion = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from('marketplace_onboarding_questions')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-questions'] });
      toast.success('Question updated successfully');
      setIsDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
    },
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('marketplace_onboarding_questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-questions'] });
      toast.success('Question deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'text',
      is_required: true,
      is_active: true,
      options: [],
      position: 0,
    });
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      is_required: question.is_required,
      is_active: question.is_active,
      options: question.options || [],
      position: question.position,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      updateQuestion.mutate({ id: editingQuestion.id, ...formData });
    } else {
      createQuestion.mutate(formData);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendor Onboarding Questions</h1>
          <p className="text-muted-foreground">
            Configure questions that vendors must answer during signup
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question_text">Question Text *</Label>
                <Input
                  id="question_text"
                  required
                  value={formData.question_text}
                  onChange={(e) =>
                    setFormData({ ...formData, question_text: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question_type">Question Type *</Label>
                <Select
                  value={formData.question_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, question_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Input</SelectItem>
                    <SelectItem value="textarea">Text Area</SelectItem>
                    <SelectItem value="select">Dropdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_required: checked })
                  }
                />
                <Label htmlFor="is_required">Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createQuestion.isPending || updateQuestion.isPending}
                >
                  {editingQuestion ? 'Update' : 'Create'} Question
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingQuestion(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions?.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>{question.position}</TableCell>
                    <TableCell>{question.question_text}</TableCell>
                    <TableCell className="capitalize">{question.question_type}</TableCell>
                    <TableCell>{question.is_required ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{question.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteQuestion.mutate(question.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!questions || questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No onboarding questions configured yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
