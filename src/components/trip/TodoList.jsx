import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TodoList({ tripId, title, type = 'general' }) {
  const queryClient = useQueryClient();
  const [newItemText, setNewItemText] = useState("");

  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos', tripId, type],
    queryFn: () => api.todos.list(tripId, type),
  });

  const createMutation = useMutation({
    mutationFn: (textValue) => api.todos.create(tripId, { text: textValue, list_type: type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', tripId, type] });
      setNewItemText("");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, is_done }) => api.todos.update(tripId, id, { is_done }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', tripId, type] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.todos.delete(tripId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos', tripId, type] })
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (newItemText.trim() && !createMutation.isPending) {
      createMutation.mutate(newItemText);
    }
  };

  return (
    <Card className="border-border shadow-sm w-full">
      <CardHeader className="bg-muted/30 border-b py-4">
        <CardTitle className="text-lg flex items-center gap-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input 
            value={newItemText} 
            onChange={(e) => setNewItemText(e.target.value)} 
            placeholder="Ajouter un élément..." 
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newItemText.trim() || createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </form>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : todos.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">La liste est vide.</div>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${todo.is_done ? 'bg-secondary/50 border-secondary' : 'bg-card border-border hover:border-primary/30'}`}>
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <Checkbox 
                    checked={todo.is_done === 1 || todo.is_done === true}
                    onCheckedChange={(checked) => updateMutation.mutate({ id: todo.id, is_done: checked ? 1 : 0 })}
                  />
                  <span className={`text-sm truncate ${todo.is_done ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    {todo.text}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 ml-2 shrink-0" 
                  onClick={() => deleteMutation.mutate(todo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
