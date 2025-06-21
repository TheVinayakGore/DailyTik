'use client';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

type Todo = {
  _id: string;
  title: string;
  desc?: string;
  date: string;
  completed: boolean;
};

type TodoListProps = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
};

export default function TodoList({ todos, setTodos }: TodoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  async function updateTodo(
    id: string,
    updates: Partial<{
      title: string;
      desc: string;
      completed: boolean;
      date: Date;
    }>
  ) {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return await response.json();
  }

  const handleToggleComplete = async (todo: Todo, checked: boolean) => {
    try {
      setTodos(prev => prev.map(t => 
        t._id === todo._id ? { ...t, completed: checked } : t
      ));
      await updateTodo(todo._id, { completed: checked });
    } catch (error) {
      toast.error('Failed to update todo' + error);
      setTodos(prev => prev.map(t => 
        t._id === todo._id ? { ...t, completed: !checked } : t
      ));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setTodos(prev => prev.filter(todo => todo._id !== id));
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    } catch (error) {
      toast.error('Failed to delete todo' + error);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDesc(todo.desc || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
  };

  const saveEdit = async (id: string) => {
    try {
      const updatedTodo = await updateTodo(id, {
        title: editTitle,
        desc: editDesc
      });
      setTodos(prev => prev.map(t => 
        t._id === id ? updatedTodo : t
      ));
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to update todo' + error);
    }
  };

  return (
    <main className="flex flex-col gap-4 w-full max-w-xl mx-auto mt-6">
      {todos.map((todo) => (
        <div
          key={todo._id}
          className={`bg-card rounded-xl shadow flex items-start gap-3 p-4 border transition-all ${
            todo.completed ? "opacity-60" : ""
          }`}
        >
          <Checkbox
            checked={todo.completed}
            onCheckedChange={(checked) => 
              handleToggleComplete(todo, checked as boolean)
            }
          />

          <div className="flex-1">
            {editingId === todo._id ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-base"
                />
                <Input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="text-sm"
                  placeholder="Add a note (optional)"
                />
              </div>
            ) : (
              <>
                <div className={`font-medium text-base ${
                  todo.completed ? "line-through text-muted-foreground" : ""
                }`}>
                  {todo.title}
                </div>
                {todo.desc && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {todo.desc}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {format(new Date(todo.date), 'MMM dd, yyyy')}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-1">
            {editingId === todo._id ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Save edit"
                  onClick={() => saveEdit(todo._id)}
                >
                  <Check className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cancel edit"
                  onClick={cancelEditing}
                >
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit todo"
                  onClick={() => startEditing(todo)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete todo"
                  onClick={() => handleDelete(todo._id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </main>
  );
}