"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, LogOut, User, BarChart3 } from "lucide-react"
import { TaskForm } from "@/components/tasks/task-form"
import { TaskListView } from "@/components/tasks/task-list-view"
import { AdvancedFilters } from "@/components/tasks/advanced-filters"
import { FilterPresets } from "@/components/tasks/filter-presets"
import { CategoryManager } from "@/components/categories/category-manager"
import { useTasks } from "@/hooks/use-tasks"
import { useTaskFilters } from "@/hooks/use-task-filters"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import type { Task } from "@/lib/types"

function DashboardContent() {
  const { tasks, isLoading } = useTasks()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const { filters, filteredTasks, setFilters, clearFilters, applyFilters } = useTaskFilters(tasks)

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false)
    setEditingTask(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">TaskFlow</h1>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Welcome back, {user?.name}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/analytics")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <CategoryManager />
              <Button onClick={() => setIsTaskFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Presets */}
        <FilterPresets currentFilters={filters} onApplyPreset={applyFilters} />

        {/* Advanced Filters */}
        <AdvancedFilters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />

        {/* Task Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{tasks.length}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{tasks.filter((t: Task) => !t.isCompleted).length}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-accent">{tasks.filter((t: Task) => t.isCompleted).length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{filteredTasks.length}</div>
            <div className="text-sm text-muted-foreground">Filtered Results</div>
          </div>
        </div>

        {/* Task List */}
        <TaskListView
          tasks={filteredTasks}
          onEdit={handleEditTask}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No tasks yet. Create your first task!</div>
            <Button onClick={() => setIsTaskFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        )}
      </main>

      <TaskForm task={editingTask} isOpen={isTaskFormOpen} onClose={handleCloseTaskForm} />
    </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
