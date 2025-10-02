"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bookmark, BookmarkPlus, MoreHorizontal, Trash2 } from "lucide-react"
import type { FilterState } from "./advanced-filters"

interface FilterPreset {
  id: string
  name: string
  filters: FilterState
}

interface FilterPresetsProps {
  currentFilters: FilterState
  onApplyPreset: (filters: FilterState) => void
}

const defaultPresets: FilterPreset[] = [
  {
    id: "today",
    name: "Due Today",
    filters: {
      search: "",
      category: "all",
      status: "pending",
      priority: "all",
      dueDateFrom: new Date(),
      dueDateTo: new Date(),
      sortBy: "dueDate",
      sortOrder: "asc",
    },
  },
  {
    id: "urgent",
    name: "Urgent Tasks",
    filters: {
      search: "",
      category: "all",
      status: "pending",
      priority: "urgent",
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  },
  {
    id: "completed-today",
    name: "Completed Today",
    filters: {
      search: "",
      category: "all",
      status: "completed",
      priority: "all",
      dueDateFrom: new Date(),
      dueDateTo: new Date(),
      sortBy: "updatedAt",
      sortOrder: "desc",
    },
  },
]

export function FilterPresets({ currentFilters, onApplyPreset }: FilterPresetsProps) {
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState("")

  const allPresets = [...defaultPresets, ...customPresets]

  const saveCurrentFilters = () => {
    if (!presetName.trim()) return

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: { ...currentFilters },
    }

    setCustomPresets([...customPresets, newPreset])
    setPresetName("")
    setIsDialogOpen(false)
  }

  const deletePreset = (presetId: string) => {
    setCustomPresets(customPresets.filter((preset) => preset.id !== presetId))
  }

  const getPresetDescription = (preset: FilterPreset) => {
    const parts = []
    if (preset.filters.status !== "all") parts.push(preset.filters.status)
    if (preset.filters.priority !== "all") parts.push(`${preset.filters.priority} priority`)
    if (preset.filters.category !== "all") parts.push(preset.filters.category)
    return parts.join(", ") || "All tasks"
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Quick filters:</span>

      {allPresets.map((preset) => (
        <div key={preset.id} className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onApplyPreset(preset.filters)} className="h-8 text-xs">
            <Bookmark className="h-3 w-3 mr-1" />
            {preset.name}
          </Button>

          {!defaultPresets.find((p) => p.id === preset.id) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => deletePreset(preset.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            <BookmarkPlus className="h-3 w-3 mr-1" />
            Save Current
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name"
              />
            </div>

            <div className="space-y-2">
              <Label>Current Filters</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="space-y-1">
                  {currentFilters.search && <div>Search: "{currentFilters.search}"</div>}
                  {currentFilters.category !== "all" && <div>Category: {currentFilters.category}</div>}
                  {currentFilters.status !== "all" && <div>Status: {currentFilters.status}</div>}
                  {currentFilters.priority !== "all" && <div>Priority: {currentFilters.priority}</div>}
                  {(currentFilters.dueDateFrom || currentFilters.dueDateTo) && (
                    <div>
                      Due Date: {currentFilters.dueDateFrom?.toDateString()} -{" "}
                      {currentFilters.dueDateTo?.toDateString()}
                    </div>
                  )}
                  <div>
                    Sort: {currentFilters.sortBy} ({currentFilters.sortOrder})
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={saveCurrentFilters} className="flex-1" disabled={!presetName.trim()}>
                Save Preset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
