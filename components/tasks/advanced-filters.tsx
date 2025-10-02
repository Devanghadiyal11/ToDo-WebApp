"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Filter, X, SlidersHorizontal } from "lucide-react"
import { format } from "date-fns"
import { useCategories } from "@/hooks/use-categories"

export interface FilterState {
  search: string
  category: string
  status: string
  priority: string
  dueDateFrom?: Date
  dueDateTo?: Date
  sortBy: string
  sortOrder: "asc" | "desc"
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
}

const priorities = ["low", "medium", "high", "urgent"]
const sortOptions = [
  { value: "createdAt", label: "Date Created" },
  { value: "updatedAt", label: "Last Updated" },
  { value: "dueDate", label: "Due Date" },
  { value: "title", label: "Title" },
  { value: "priority", label: "Priority" },
]

export function AdvancedFilters({ filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const { categories } = useCategories()
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.category !== "all" ||
      filters.status !== "all" ||
      filters.priority !== "all" ||
      filters.dueDateFrom ||
      filters.dueDateTo ||
      filters.sortBy !== "createdAt" ||
      filters.sortOrder !== "desc"
    )
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.category !== "all") count++
    if (filters.status !== "all") count++
    if (filters.priority !== "all") count++
    if (filters.dueDateFrom || filters.dueDateTo) count++
    if (filters.sortBy !== "createdAt" || filters.sortOrder !== "desc") count++
    return count
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </div>
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => updateFilter("search", "")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2">
        <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category: any) => (
              <SelectItem key={category._id} value={category.name}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Tasks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative bg-transparent">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              More Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {hasActiveFilters() && (
                  <Button variant="ghost" size="sm" onClick={onClearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              <Separator />

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={filters.priority} onValueChange={(value) => updateFilter("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <span className="capitalize">{priority}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date Range */}
              <div className="space-y-2">
                <Label>Due Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateFrom ? format(filters.dueDateFrom, "MMM d") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateFrom}
                        onSelect={(date) => updateFilter("dueDateFrom", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dueDateTo ? format(filters.dueDateTo, "MMM d") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dueDateTo}
                        onSelect={(date) => updateFilter("dueDateTo", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {(filters.dueDateFrom || filters.dueDateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateFilter("dueDateFrom", undefined)
                      updateFilter("dueDateTo", undefined)
                    }}
                  >
                    Clear Date Range
                  </Button>
                )}
              </div>

              <Separator />

              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value: "asc" | "desc") => updateFilter("sortOrder", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
