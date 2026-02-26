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
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Calcul des stats par priority
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
        { label: 'Low', count: low, percent: total > 0 ? Math.round((low / total) * 100) : 0, color: 'emerald', icon: CheckCircle2 },
        { label: 'Medium', count: medium, percent: total > 0 ? Math.round((medium / total) * 100) : 0, color: 'amber', icon: AlertTriangle },
        { label: 'High', count: high, percent: total > 0 ? Math.round((high / total) * 100) : 0, color: 'red', icon: AlertTriangle },
      ]
    }
  }, [requirements.data])

  // Calcul des stats par status
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
        { label: 'Active', count: active, percent: total > 0 ? Math.round((active / total) * 100) : 0, color: 'emerald', icon: CheckCircle2 },
        { label: 'Draft', count: draft, percent: total > 0 ? Math.round((draft / total) * 100) : 0, color: 'amber', icon: FileText },
        { label: 'Archived', count: archived, percent: total > 0 ? Math.round((archived / total) * 100) : 0, color: 'slate', icon: Archive },
      ]
    }
  }, [requirements.data])

  // Sélection des stats selon le groupBy actuel
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
      const key = (req[groupBy] || 'unknown').toLowerCase()
      acc[key] = acc[key] || []
      acc[key].push(req)
      return acc
    }, {} as Record<string, Requirement[]>)
  }, [requirements.data, groupBy])

  const groupOrder = groupBy === 'status'
    ? ['active', 'draft', 'archived']
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
        <Badge variant="outline" className="capitalize border-gray-600 text-white bg-gray-800/30">
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
          active: 'border-emerald-500 bg-emerald-900/30 text-white',
          draft: 'border-amber-500 bg-amber-900/30 text-white',
          archived: 'border-slate-500 bg-slate-800/40 text-white',
        }
        const style = variants[status] || 'border-gray-600 bg-gray-800/30 text-white'

        return (
          <Badge
            variant="outline"
            className={`capitalize border font-medium px-2.5 py-0.5 ${style}`}
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
          high: 'border-red-500 bg-red-900/35 text-white',
          medium: 'border-amber-500 bg-amber-900/30 text-white',
          low: 'border-emerald-500 bg-emerald-900/30 text-white',
        }
        const style = variants[priority] || 'border-gray-600 bg-gray-800/30 text-white'

        return (
          <Badge
            variant="outline"
            className={`capitalize border font-medium px-2.5 py-0.5 ${style}`}
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
      cell: ({ row }) => (
        <Badge variant="outline" className="border-gray-600 text-white bg-gray-800/30">
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
        if (tags.length === 0) return <span className="text-muted-foreground text-xs">—</span>

        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs border-gray-600 text-white bg-gray-800/30">
                {tag}
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

        {/* Statistics Cards – dynamiques selon groupBy */}
        <div className="grid gap-4 md:grid-cols-4">
          {currentStats.items.map((stat, idx) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-6 hover:shadow-xl transition-all group hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl duration-300 ease-out"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-4xl font-bold ${idx === 0 ? '' : `text-${stat.color}-600`}`}>
                    {stat.count}
                  </p>
                </div>
                <stat.icon className={`h-10 w-10 text-${stat.color}-500 opacity-80 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1500 ease-out`}
                  style={{ width: isMounted ? `${stat.percent}%` : '0%' }}
                />
              </div>
              {idx > 0 && (
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {isMounted ? stat.percent : 0}%
                </p>
              )}
            </div>
          ))}
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
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`bg-muted/30 rounded-xl border w-[380px] flex flex-col shadow-sm min-h-[500px] transition-all
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
                                  <Draggable key={req.id} draggableId={String(req.id)} index={index}>
                                    {(provided, snapshot) => (
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

                                          <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {req.description || 'No description'}
                                          </div>

                                          <div className="flex flex-wrap gap-2">
                                            <Badge
                                              variant="outline"
                                              className="text-xs capitalize border-gray-600 text-white bg-gray-800/30"
                                            >
                                              {req.type}
                                            </Badge>

                                            <Badge
                                              variant="outline"
                                              className={`text-xs px-2.5 py-0.5 font-medium border text-white ${
                                                req.priority?.toLowerCase() === 'high'
                                                  ? 'border-red-500 bg-red-900/35'
                                                  : req.priority?.toLowerCase() === 'medium'
                                                  ? 'border-amber-500 bg-amber-900/30'
                                                  : req.priority?.toLowerCase() === 'low'
                                                  ? 'border-emerald-500 bg-emerald-900/30'
                                                  : 'border-gray-600 bg-gray-800/30'
                                              }`}
                                            >
                                              {req.priority?.toUpperCase() || '—'}
                                            </Badge>

                                            {req.frequency && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs border-gray-600 text-white bg-gray-800/30"
                                              >
                                                {req.frequency.replace('_', ' ')}
                                              </Badge>
                                            )}
                                          </div>

                                          {req.tags?.length ? (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                              {req.tags.slice(0, 3).map((tag, i) => (
                                                <Badge
                                                  key={i}
                                                  variant="outline"
                                                  className="text-xs border-gray-600 text-white bg-gray-800/30"
                                                >
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