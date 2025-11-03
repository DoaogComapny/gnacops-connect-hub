import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface FormCategory {
  id: string;
  name: string;
  type: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface FormQuestion {
  id: string;
  category_id: string;
  question_text: string;
  question_type: string;
  options: any;
  is_required: boolean;
  position: number;
  repeatable_config: any;
}

const QUESTION_TYPES = [
  { value: 'short_text', label: 'Short Text' },
  { value: 'long_text', label: 'Long Text' },
  { value: 'boolean', label: 'True / False' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'file', label: 'File Upload' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'repeatable', label: 'Repeatable Field' },
];

const AdminFormBuilder = () => {
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'short_text',
    options: '',
    is_required: true,
    repeatable_config: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchQuestions(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('form_categories')
      .select('*')
      .order('position');
    
    if (error) {
      toast.error('Failed to load categories');
      return;
    }
    
    setCategories(data || []);
  };

  const fetchQuestions = async (categoryId: string) => {
    const { data, error } = await supabase
      .from('form_questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('position');
    
    if (error) {
      toast.error('Failed to load questions');
      return;
    }
    
    setQuestions(data || []);
  };

  const addQuestion = async () => {
    if (!selectedCategory || !newQuestion.question_text) {
      toast.error('Please select a category and enter question text');
      return;
    }

    let optionsData = null;
    let repeatableConfigData = null;

    if (['multiple_choice', 'dropdown'].includes(newQuestion.question_type)) {
      try {
        optionsData = newQuestion.options.split('\n').filter(o => o.trim());
      } catch (e) {
        toast.error('Invalid options format');
        return;
      }
    }

    if (newQuestion.question_type === 'repeatable' && newQuestion.repeatable_config) {
      try {
        repeatableConfigData = JSON.parse(newQuestion.repeatable_config);
      } catch (e) {
        toast.error('Invalid repeatable config JSON');
        return;
      }
    }

    const { error } = await supabase
      .from('form_questions')
      .insert({
        category_id: selectedCategory,
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type,
        options: optionsData,
        is_required: newQuestion.is_required,
        position: questions.length,
        repeatable_config: repeatableConfigData,
      });

    if (error) {
      toast.error('Failed to add question');
      return;
    }

    toast.success('Question added successfully');
    setNewQuestion({
      question_text: '',
      question_type: 'short_text',
      options: '',
      is_required: true,
      repeatable_config: '',
    });
    fetchQuestions(selectedCategory);
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase
      .from('form_questions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete question');
      return;
    }

    toast.success('Question deleted');
    fetchQuestions(selectedCategory);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Form Builder</h1>
        <p className="text-muted-foreground">Create and manage dynamic forms for membership applications</p>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList>
          <TabsTrigger value="builder">Question Builder</TabsTrigger>
          <TabsTrigger value="categories">Manage Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Form Category</CardTitle>
              <CardDescription>Choose which form you want to edit</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedCategory && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Add New Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Input
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      placeholder="Enter your question"
                    />
                  </div>

                  <div>
                    <Label>Question Type</Label>
                    <Select
                      value={newQuestion.question_type}
                      onValueChange={(value) => setNewQuestion({ ...newQuestion, question_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QUESTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {['multiple_choice', 'dropdown'].includes(newQuestion.question_type) && (
                    <div>
                      <Label>Options (one per line)</Label>
                      <Textarea
                        value={newQuestion.options}
                        onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        rows={4}
                      />
                    </div>
                  )}

                  {newQuestion.question_type === 'repeatable' && (
                    <div>
                      <Label>Repeatable Config (JSON)</Label>
                      <Textarea
                        value={newQuestion.repeatable_config}
                        onChange={(e) => setNewQuestion({ ...newQuestion, repeatable_config: e.target.value })}
                        placeholder='{"fields": [{"name": "child_name", "type": "text", "label": "Child Name"}]}'
                        rows={4}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newQuestion.is_required}
                      onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, is_required: checked })}
                    />
                    <Label>Required</Label>
                  </div>

                  <Button onClick={addQuestion} variant="cta">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Form Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {questions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No questions added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{idx + 1}. {q.question_text}</p>
                            <p className="text-sm text-muted-foreground">
                              Type: {QUESTION_TYPES.find(t => t.value === q.question_type)?.label}
                              {q.is_required && ' • Required'}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteQuestion(q.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Form Categories</CardTitle>
              <CardDescription>Manage form categories, pricing, and descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{cat.name}</h3>
                      <Badge variant="outline">{cat.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                    <p className="text-sm font-medium">Price: GH₵{cat.price}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFormBuilder;
