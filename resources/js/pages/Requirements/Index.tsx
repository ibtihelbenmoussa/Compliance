import { useMemo, useState, useEffect } from 'react'
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

// ─── ADD THESE ───────────────────────────────────────────────
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// ──────────────────────────────────────────────────────────────

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
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
  GripVertical,
  ListFilter,
  Download,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PaginatedData } from '@/types'
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'

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
type ViewMode = 'table' | 'kanban'

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  active: { bg: 'bg-emerald-950/40', border: 'border-emerald-700', text: 'text-emerald-400' },
  draft: { bg: 'bg-amber-950/40', border: 'border-amber-700', text: 'text-amber-400' },
  archived: { bg: 'bg-slate-950/50', border: 'border-slate-700', text: 'text-slate-400' },
}

const priorityColors: Record<string, { bg: string; border: string; text: string }> = {
  high: { bg: 'bg-red-950/40', border: 'border-red-700', text: 'text-red-400' },
  medium: { bg: 'bg-amber-950/40', border: 'border-amber-700', text: 'text-amber-400' },
  low: { bg: 'bg-emerald-950/40', border: 'border-emerald-700', text: 'text-emerald-400' },
}

export default function RequirementsIndex({ requirements }: RequirementsIndexProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<Requirement | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [groupBy, setGroupBy] = useState<GroupBy>('status')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const priorityStats = useMemo(() => {
    const data = requirements.data
    const total = data.length
    const low = data.filter(r => r.priority?.toLowerCase() === 'low').length
    const medium = data.filter(r => r.priority?.toLowerCase() === 'medium').length
    const high = data.filter(r => r.priority?.toLowerCase() === 'high').length

    return {
      total,
      items: [
        { label: 'Total', count: total, percent: 100, color: 'blue', icon: Building2 },
        { label: 'Low', count: low, percent: total ? Math.round((low / total) * 100) : 0, color: 'emerald', icon: CheckCircle2 },
        { label: 'Medium', count: medium, percent: total ? Math.round((medium / total) * 100) : 0, color: 'amber', icon: AlertTriangle },
        { label: 'High', count: high, percent: total ? Math.round((high / total) * 100) : 0, color: 'red', icon: AlertTriangle },
      ]
    }
  }, [requirements.data])

  const statusStats = useMemo(() => {
    const data = requirements.data
    const total = data.length
    const active = data.filter(r => r.status?.toLowerCase() === 'active').length
    const draft = data.filter(r => r.status?.toLowerCase() === 'draft').length
    const archived = data.filter(r => r.status?.toLowerCase() === 'archived').length

    return {
      total,
      items: [
        { label: 'Total', count: total, percent: 100, color: 'blue', icon: Building2 },
        { label: 'Active', count: active, percent: total ? Math.round((active / total) * 100) : 0, color: 'emerald', icon: CheckCircle2 },
        { label: 'Draft', count: draft, percent: total ? Math.round((draft / total) * 100) : 0, color: 'amber', icon: FileText },
        { label: 'Archived', count: archived, percent: total ? Math.round((archived / total) * 100) : 0, color: 'slate', icon: Archive },
      ]
    }
  }, [requirements.data])

  const currentStats = groupBy === 'status' ? statusStats : priorityStats

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

  const groupedData = useMemo(() => {
    return requirements.data.reduce((acc, req) => {
      const key = (req[groupBy]?.toLowerCase() ?? 'other')
      acc[key] = acc[key] || []
      acc[key].push(req)
      return acc
    }, {} as Record<string, Requirement[]>)
  }, [requirements.data, groupBy])

  const groupOrder = groupBy === 'status'
    ? ['active', 'draft', 'archived']
    : ['high', 'medium', 'low']

  const getGroupTitle = (key: string) => {
    if (key === 'other') return 'Other'
    return key.charAt(0).toUpperCase() + key.slice(1)
  }

  const statusOptions: FacetedFilterOption[] = [
    { label: 'Active', value: 'active', icon: CheckCircle2 },
    { label: 'Draft', value: 'draft', icon: FileText },
    { label: 'Archived', value: 'archived', icon: Archive },
  ]

  const priorityOptions: SelectOption[] = [
    { label: 'All', value: 'all' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
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
        const status = (row.getValue('status') as string)?.toLowerCase() || 'other'
        const { bg, border, text } = statusColors[status] || statusColors.archived
        return (
          <Badge variant="outline" className={`capitalize ${bg} ${border} ${text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
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
        const priority = (row.getValue('priority') as string)?.toLowerCase() || 'other'
        const { bg, border, text } = priorityColors[priority] || priorityColors.low
        return (
          <Badge variant="outline" className={`capitalize ${bg} ${border} ${text}`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue('frequency') ?? '—'}
        </Badge>
      ),
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

        if (tags.length === 0)
          return <span className="text-muted-foreground text-xs">—</span>

        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}

            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 3}
              </Badge>
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
        // toast.success("Requirement moved successfully")
      },
      onError: (errors) => {
        console.error('Failed to move requirement', errors)
      },
    })
  }

  return (
    <AppLayout>
      <Head title="Requirements" />

      <div className="container mx-auto space-y-6 py-6 px-4 md:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requirements</h1>
            <p className="text-muted-foreground mt-1.5">
              Track and manage your compliance requirements
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/requirements/create">
                <Plus className="mr-2 h-4 w-4" />
                New Requirement
              </Link>
            </Button>

            {/* Uncomment if you want the export button visible */}
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleExport}
                    disabled={exportLoading}
                  >
                    {exportLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export to Excel</TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
              className="hidden sm:block"
            >
              <TabsList className="grid w-44 grid-cols-2">
                <TabsTrigger value="table">
                  <TableIcon className="mr-2 h-4 w-4" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="kanban">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Board
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {currentStats.items.map((stat, i) => (
            <Card
              key={stat.label}
              className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <stat.icon className="h-4 w-4" />
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stat.count}
                  {i > 0 && (
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                      ({stat.percent}%)
                    </span>
                  )}
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-${stat.color}-600`}
                    style={{ width: isMounted ? `${stat.percent}%` : '0%' }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-6" />

        {viewMode === 'table' ? (
          <ServerDataTable
            columns={columns}
            data={requirements}
            searchPlaceholder="Search code, title, tags..."
            onExport={handleExport}
            exportLoading={exportLoading}
            filters={
              <>
                <DataTableFacetedFilter filterKey="status" title="Status" options={statusOptions} />
                <DataTableSelectFilter
                  filterKey="priority"
                  title="Priority"
                  placeholder="All priorities"
                  options={priorityOptions}
                />
              </>
            }
            initialState={{ columnPinning: { right: ['actions'] } }}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-lg font-semibold tracking-tight">
                {groupBy === 'status' ? 'Status Board' : 'Priority Board'}
              </h2>

              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                <SelectTrigger className="w-48">
                  <ListFilter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Group by Status</SelectItem>
                  <SelectItem value="priority">Group by Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="overflow-x-auto pb-6 scrollbar-thin">
                <div className="grid grid-flow-col auto-cols-[minmax(320px,1fr)] gap-5 lg:gap-6">
                  {groupOrder.map((key) => {
                    const items = groupedData[key] || []
                    const color =
                      groupBy === 'status'
                        ? statusColors[key] || statusColors.archived
                        : priorityColors[key] || priorityColors.low

                    return (
                      <Droppable droppableId={key} key={key}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "flex flex-col min-w-[320px] rounded-xl border bg-gradient-to-b from-card/80 to-card/40 shadow-sm transition-all duration-200",
                              snapshot.isDraggingOver && "ring-2 ring-primary/50 shadow-xl"
                            )}
                          >
                            <div
                              className={cn(
                                "px-5 py-4 rounded-t-xl border-b font-medium text-lg flex items-center justify-between",
                                color.bg,
                                color.border,
                                "border-b-2"
                              )}
                            >
                              <span>{getGroupTitle(key)}</span>
                              <Badge variant="outline" className="bg-background/70">
                                {items.length}
                              </Badge>
                            </div>

                            <div className="p-4 flex-1 space-y-4 min-h-[500px]">
                              {items.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground/70 italic py-12">
                                  Empty column
                                </div>
                              ) : (
                                items.map((req, idx) => (
                                  <Draggable key={req.id} draggableId={String(req.id)} index={idx}>
                                    {(dragProvided, dragSnapshot) => (
                                      <Card
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        className={cn(
                                          "transition-all duration-200 cursor-grab active:cursor-grabbing",
                                          dragSnapshot.isDragging
                                            ? "shadow-2xl ring-2 ring-primary/60 scale-[1.02]"
                                            : "hover:shadow-md hover:ring-1 hover:ring-primary/30"
                                        )}
                                      >
                                        <CardContent className="p-4 space-y-3">
                                          <div className="flex items-start justify-between gap-3">
                                            <div {...dragProvided.dragHandleProps}>
                                              <GripVertical className="h-5 w-5 text-muted-foreground/70 hover:text-foreground transition-colors" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                              <div className="font-medium leading-tight mb-1.5">
                                                {req.code} — {req.title}
                                              </div>
                                              <p className="text-sm text-muted-foreground line-clamp-2">
                                                {req.description || 'No description provided'}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex flex-wrap gap-2 pt-2">
                                            <Badge variant="outline" className="text-xs">
                                              {req.type}
                                            </Badge>

                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-xs",
                                                priorityColors[req.priority?.toLowerCase() as keyof typeof priorityColors]?.text ||
                                                'text-muted-foreground'
                                              )}
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
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                              {req.tags.slice(0, 4).map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                  {tag}
                                                </Badge>
                                              ))}
                                              {req.tags.length > 4 && (
                                                <Badge variant="secondary" className="text-xs">
                                                  +{req.tags.length - 4}
                                                </Badge>
                                              )}
                                            </div>
                                          ) : null}

                                          <div className="pt-3 flex gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="flex-1 h-8 text-xs"
                                              asChild
                                            >
                                              <Link href={`/requirements/${req.id}`}>
                                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                View
                                              </Link>
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="flex-1 h-8 text-xs"
                                              asChild
                                            >
                                              <Link href={`/requirements/${req.id}/edit`}>
                                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                Edit
                                              </Link>
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
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