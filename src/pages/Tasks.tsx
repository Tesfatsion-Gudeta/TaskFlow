import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ListTodo, CheckCircle2, Circle, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks, useToggleTask } from '@/hooks/useTasks';

export default function Tasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const { data: tasksData } = useTasks({}, isAdmin);
  const toggleTask = useToggleTask();

  const tasks = tasksData?.data || [];
  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);

  const handleToggleTask = (id: number) => {
    toggleTask.mutate(id);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Tasks</h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'View and manage all tasks across all projects' : 'View and manage all your tasks'}
            </p>
          </div>
          {isAdmin && (
            <Badge variant="secondary" className="gap-2">
              Admin View
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border shadow-soft bg-gradient-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Circle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Active Tasks</h2>
                <Badge variant="secondary" className="ml-auto">
                  {activeTasks.length}
                </Badge>
              </div>

              {activeTasks.length > 0 ? (
                <div className="space-y-3">
                  {activeTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/5 transition-all group"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {task.project && (
                            <Badge variant="outline" className="text-xs">
                              {task.project.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No active tasks</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-soft bg-gradient-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h2 className="text-xl font-semibold">Completed Tasks</h2>
                <Badge variant="secondary" className="ml-auto bg-success/10 text-success">
                  {completedTasks.length}
                </Badge>
              </div>

              {completedTasks.length > 0 ? (
                <div className="space-y-3">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 transition-all group"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleTask(task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium line-through opacity-60">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-through opacity-60">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No completed tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
