import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTask, useUpdateTask, useToggleTask, useDeleteTask } from '@/hooks/useTasks';
import { toast } from 'sonner';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const { data: task, isLoading } = useTask(Number(id));
  const updateTask = useUpdateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    values: task ? {
      title: task.title,
      description: task.description || '',
    } : undefined,
  });

  const handleToggleComplete = () => {
    toggleTask.mutate(Number(id), {
      onSuccess: () => {
        toast.success(task?.completed ? 'Task marked as incomplete' : 'Task marked as complete');
      },
    });
  };

  const handleUpdateTask = async (data: TaskForm) => {
    await updateTask.mutateAsync({ id: Number(id), data });
    setIsEditOpen(false);
  };

  const handleDeleteTask = async () => {
    await deleteTask.mutateAsync(Number(id));
    toast.success('Task deleted successfully');
    navigate('/tasks');
  };

  if (isLoading || !task) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading task...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/tasks')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{task.title}</h1>
              {task.project && (
                <p className="text-muted-foreground">
                  Project: <span className="font-medium">{task.project.name}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleUpdateTask)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Task title"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Task description"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={updateTask.isPending}>
                    {updateTask.isPending ? 'Updating...' : 'Update Task'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this task? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                variant={task.completed ? "default" : "outline"}
                onClick={handleToggleComplete}
                className="flex items-center gap-2"
                disabled={toggleTask.isPending}
              >
                {task.completed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" />
                    Mark as Complete
                  </>
                )}
              </Button>
              <Badge variant={task.completed ? "default" : "secondary"}>
                {task.completed ? 'Completed' : 'Active'}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            </div>

            {task.assignee && (
              <div>
                <h3 className="font-semibold mb-2">Assignee</h3>
                <p className="text-muted-foreground">{task.assignee.email}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Created</h3>
              <p className="text-muted-foreground">
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>

            {task.completedAt && (
              <div>
                <h3 className="font-semibold mb-2">Completed</h3>
                <p className="text-muted-foreground">
                  {new Date(task.completedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
