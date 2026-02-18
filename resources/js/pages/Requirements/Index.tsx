import { useMemo, useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { ServerDataTable } from '@/components/server-data-table'
import { DataTableColumnHeader } from '@/components/server-data-table-column-header'
import {
  DataTableFacetedFilter,
  type FacetedFilterOption,
} from '@/components/server-data-table-faceted-filter'
import {
  DataTableSelectFilter,
  type SelectOption,
} from '@/components/server-data-table-select-filter'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Key,
  BookOpen,
  Layers,
  SignalHigh,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Archive,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  Tag,
  RefreshCw,
  AlertCircle,
  GripVertical,
  ListFilter,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PaginatedData } from '@/types'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DroppableProvided,
  type DroppableStateSnapshot,
  type DraggableProvided,
  type DraggableStateSnapshot,
} from '@hello-pangea/dnd'

interface Requirement {
  id: number
  code: string
  title: string
  description?: string | null
  type: string
  status: string
  priority: string
  frequency: string
  framework?: { code: string; name: string } | null
  process?: { name: string } | null
  tags?: string[]
  deadline?: string | null
  completion_date?: string | null
  compliance_level: string
  attachments?: string | null
  created_at: string
  updated_at: string
}

interface RequirementsIndexProps {
  requirements: PaginatedData<Requirement>
}

type GroupBy = 'status' | 'priority'

export default function RequirementsIndex({ requirements }: RequirementsIndexProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<Requirement | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [groupBy, setGroupBy] = useState<GroupBy>('status')

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const response = await fetch(`/requirements/export?${params.toString()}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `requirements-${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExportLoading(false)
    }
  }

  // Statistiques (sur la page courante)
  const stats = useMemo(() => {
    const data = requirements.data
    const total = data.length
    const lowCount = data.filter(r => r.priority?.toLowerCase() === 'low').length
    const mediumCount = data.filter(r => r.priority?.toLowerCase() === 'medium').length
    const highCount = data.filter(r => r.priority?.toLowerCase() === 'high').length

    return {
      total,
      lowCount,
      mediumCount,
      highCount,
      lowPercent: total > 0 ? Math.round((lowCount / total) * 100) : 0,
      mediumPercent: total > 0 ? Math.round((mediumCount / total) * 100) : 0,
      highPercent: total > 0 ? Math.round((highCount / total) * 100) : 0,
    }
  }, [requirements.data])

  // Groupement dynamique pour Kanban
  const groupedData = useMemo(() => {
    return requirements.data.reduce((acc, req) => {
      const key = (req[groupBy] || 'unknown').toLowerCase()
      acc[key] = acc[key] || []
      acc[key].push(req)
      return acc
    }, {} as Record<string, Requirement[]>)
  }, [requirements.data, groupBy])

  const groupOrder = groupBy === 'status'
    ? ['active',  'draft', 'archived']
    : ['low', 'medium', 'high']

  const statusOptions: FacetedFilterOption[] = [
    { label: 'Active', value: 'active', icon: CheckCircle2 },
    { label: 'Draft', value: 'draft', icon: FileText },
    { label: 'Archived', value: 'archived', icon: Archive },
  ]

  const priorityOptions: SelectOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ]

  const columns: ColumnDef<Requirement>[] = [
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Key className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Code" />
        </div>
      ),
      cell: ({ row }) => <div className="font-mono font-medium">{row.getValue('code')}</div>,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Title" />
        </div>
      ),
      cell: ({ row }) => (
        <Link href={`/requirements/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue('title')}
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Type" />
        </div>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue('type')}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <SignalHigh className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Status" />
        </div>
      ),
      cell: ({ row }) => {
        const status = (row.getValue('status') as string)?.toLowerCase() || ''
        const variants: Record<string, string> = {
          active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30',
          inactive: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50',
          draft: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30',
          archived: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/50',
        }
        return (
          <Badge
            variant="outline"
            className={`capitalize ${variants[status] || 'bg-gray-100'}`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Priority" />
        </div>
      ),
      cell: ({ row }) => {
        const priority = (row.getValue('priority') as string)?.toLowerCase() || ''
        const variants: Record<string, string> = {
          high: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30',
          medium: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30',
          low: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30',
        }
        return (
          <Badge
            variant="outline"
            className={`capitalize ${variants[priority] || 'bg-gray-100'}`}
          >
            {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '—'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'frequency',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Frequency" />
        </div>
      ),
      cell: ({ row }) => row.getValue('frequency') ?? '—',
    },
    {
      accessorKey: 'framework.code',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Framework" />
        </div>
      ),
      cell: ({ row }) => {
        const fw = row.original.framework
        return fw ? `${fw.code} - ${fw.name}` : '—'
      },
    },
    {
      accessorKey: 'tags',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Tags" />
        </div>
      ),
      cell: ({ row }) => {
        const tags = row.original.tags || []
        return tags.length === 0 ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">+{tags.length - 3}</Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const requirement = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.visit(`/requirements/${requirement.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.visit(`/requirements/${requirement.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10"
                onClick={() => {
                  setRequirementToDelete(requirement)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleDeleteConfirm = () => {
    if (requirementToDelete) {
      router.delete(`/requirements/${requirementToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setRequirementToDelete(null)
        },
      })
    }
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const requirementId = Number(draggableId)
    const newValue = destination.droppableId

    const field = groupBy === 'status' ? 'status' : 'priority'

    router.put(`/requirements/${requirementId}`, { [field]: newValue }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // Optionnel : toast.success("Requirement moved successfully")
      },
      onError: (errors) => {
        console.error('Failed to move requirement', errors)
        // Optionnel : toast.error("Failed to move requirement")
      },
    })
  }

  return (
    <AppLayout>
      <Head title="Requirements" />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requirements</h1>
            <p className="text-muted-foreground">Manage compliance requirements</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={() => router.visit('/requirements/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Requirement
            </Button>

            <div className="border rounded-md inline-flex bg-muted/40">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none px-4"
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="mr-1.5 h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none border-l-0 px-4"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="mr-1.5 h-4 w-4" />
                Board
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-card p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low</p>
                <p className="text-4xl font-bold text-emerald-600">{stats.lowCount}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-80" />
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${stats.lowPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{stats.lowPercent}%</p>
          </div>

          <div className="rounded-xl border bg-card p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium</p>
                <p className="text-4xl font-bold text-amber-600">{stats.mediumCount}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-amber-500 opacity-80" />
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${stats.mediumPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{stats.mediumPercent}%</p>
          </div>

          <div className="rounded-xl border bg-card p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High</p>
                <p className="text-4xl font-bold text-red-600">{stats.highCount}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500 opacity-80" />
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${stats.highPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{stats.highPercent}%</p>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'table' ? (
          <ServerDataTable
            columns={columns}
            data={requirements}
            searchPlaceholder="Search by code or title..."
            onExport={handleExport}
            exportLoading={exportLoading}
            filters={
              <>
                <DataTableFacetedFilter filterKey="status" title="Status" options={statusOptions} />
                <DataTableSelectFilter filterKey="priority" title="Priority" placeholder="All priorities" options={priorityOptions} />
              </>
            }
            initialState={{ columnPinning: { right: ['actions'] } }}
          />
        ) : (
          <div className="space-y-4">
            {/* Grouping Selector (comme dans Frameworks) */}
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
                <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Group by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">By Status</SelectItem>
                    <SelectItem value="priority">By Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="overflow-x-auto pb-8">
                <div className="flex gap-6 min-w-max">
                  {groupOrder.map((key) => {
                    const items = groupedData[key] || []
                    const title = key === 'unknown'
                      ? 'Unknown'
                      : key.charAt(0).toUpperCase() + key.slice(1)

                    return (
                      <Droppable droppableId={key} key={key}>
                        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`bg-muted/30 rounded-xl border w-[500px] flex flex-col shadow-sm min-h-[500px] transition-all
                              ${snapshot.isDraggingOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
                          >
                            <div className="p-4 border-b bg-background/80 sticky top-0 backdrop-blur-sm z-10 rounded-t-xl">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">{title}</h3>
                                <Badge variant="secondary">{items.length}</Badge>
                              </div>
                            </div>

                            <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                              {items.length === 0 ? (
                                <div className="text-center text-muted-foreground py-12 italic">
                                  No requirements here
                                </div>
                              ) : (
                                items.map((req, index) => (
                                  <Draggable
                                    key={req.id}
                                    draggableId={String(req.id)}
                                    index={index}
                                  >
                                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`bg-card border rounded-lg p-4 shadow transition-all
                                          ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary scale-[1.02]' : 'hover:shadow-md'}`}
                                      >
                                        <div
                                          {...provided.dragHandleProps}
                                          className="cursor-grab active:cursor-grabbing mb-3 inline-block"
                                        >
                                          <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                        </div>

                                        <div
                                          className="cursor-pointer group"
                                          onClick={() => router.visit(`/requirements/${req.id}`)}
                                        >
                                          <div className="font-medium group-hover:underline mb-1">
                                            {req.code} — {req.title}
                                          </div>

                                          <div className="text-sm text-muted-foreground mb-3">
                                            {req.description ? req.description.substring(0, 80) + '...' : 'No description'}
                                          </div>

                                          <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline" className="text-xs capitalize">
                                              {req.type}
                                            </Badge>

                                            <Badge
                                              variant="outline"
                                              className={`text-xs px-2.5 py-0.5 ${
                                                req.priority?.toLowerCase() === 'high'
                                                  ? 'border-red-400 text-red-700 bg-red-50/50'
                                                  : req.priority?.toLowerCase() === 'medium'
                                                  ? 'border-amber-400 text-amber-700 bg-amber-50/50'
                                                  : 'border-green-400 text-green-700 bg-green-50/50'
                                              }`}
                                            >
                                              {req.priority?.toUpperCase() || '—'}
                                            </Badge>

                                            {req.frequency && (
                                              <Badge variant="outline" className="text-xs">
                                                {req.frequency.replace('_', ' ')}
                                              </Badge>
                                            )}
                                          </div>

                                          {req.tags?.length ? (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                              {req.tags.slice(0, 3).map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                  {tag}
                                                </Badge>
                                              ))}
                                              {req.tags.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                  +{req.tags.length - 3}
                                                </Badge>
                                              )}
                                            </div>
                                          ) : null}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              )}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    )
                  })}
                </div>
              </div>
            </DragDropContext>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requirement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{requirementToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}