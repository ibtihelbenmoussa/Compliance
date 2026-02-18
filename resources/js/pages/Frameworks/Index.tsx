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
  RefreshCw,
  Layers,
  User,
  Globe,
  Tag,
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
  LayoutGrid,
  Table as TableIcon,
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

interface Jurisdiction {
  id: number
  name: string
}

interface TagItem {
  id: number
  name: string
}

export interface Framework {
  id: number
  code: string
  name: string
  version?: string | null
  type: string
  publisher?: string | null
  jurisdictions: string[] | null     // ← strings grâce au backend
  tags: string[] | null             // ← strings grâce au backend
  status: string
  updated_at?: string | null
}

interface FrameworksIndexProps {
  frameworks: PaginatedData<Framework>
}

export default function FrameworksIndex({ frameworks }: FrameworksIndexProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [frameworkToDelete, setFrameworkToDelete] = useState<Framework | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const response = await fetch(`/frameworks/export?${params.toString()}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `frameworks-${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExportLoading(false)
    }
  }

  // Statistiques
  const stats = useMemo(() => {
    const data = frameworks.data
    const total = data.length
    const activeCount = data.filter(f => f.status?.toLowerCase() === 'active').length
    const draftCount = data.filter(f => f.status?.toLowerCase() === 'draft').length
    const archivedCount = data.filter(f => f.status?.toLowerCase() === 'archived').length

    return {
      total,
      activeCount,
      draftCount,
      archivedCount,
      activePercent: total > 0 ? Math.round((activeCount / total) * 100) : 0,
      draftPercent: total > 0 ? Math.round((draftCount / total) * 100) : 0,
      archivedPercent: total > 0 ? Math.round((archivedCount / total) * 100) : 0,
    }
  }, [frameworks.data])

  // Groupement pour Kanban
  const groupedByStatus = useMemo(() => {
    return frameworks.data.reduce((acc, fw) => {
      const status = (fw.status || 'unknown').toLowerCase()
      if (!acc[status]) acc[status] = []
      acc[status].push(fw)
      return acc
    }, {} as Record<string, Framework[]>)
  }, [frameworks.data])

  const statusOrder = ['active', 'draft', 'archived'] as const

  const statusOptions: FacetedFilterOption[] = [
    { label: 'Active', value: 'active', icon: CheckCircle2 },
    { label: 'Draft', value: 'draft', icon: FileText },
    { label: 'Archived', value: 'archived', icon: Archive },
  ]

  const typeOptions: SelectOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Standard', value: 'standard' },
    { label: 'Regulation', value: 'regulation' },
    { label: 'Contract', value: 'contract' },
    { label: 'Internal Policy', value: 'internal_policy' },
  ]

  const columns: ColumnDef<Framework>[] = [
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
      accessorKey: 'name',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Name" />
        </div>
      ),
      cell: ({ row }) => (
        <Link href={`/frameworks/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue('name')}
        </Link>
      ),
    },
    {
      accessorKey: 'version',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Version" />
        </div>
      ),
      cell: ({ row }) => row.getValue('version') ?? '—',
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
          {(row.getValue('type') as string)?.replace('_', ' ') || '—'}
        </Badge>
      ),
    },
    {
      accessorKey: 'publisher',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Publisher" />
        </div>
      ),
      cell: ({ row }) => row.getValue('publisher') ?? '—',
    },
    {
      id: 'jurisdictions',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Jurisdictions" />
        </div>
      ),
      cell: ({ row }) => {
        const jurisdictions = row.original.jurisdictions || []
        return jurisdictions.length === 0 ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {jurisdictions.slice(0, 3).map((name, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
            {jurisdictions.length > 3 && (
              <Badge variant="outline" className="text-xs">+{jurisdictions.length - 3}</Badge>
            )}
          </div>
        )
      },
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
      id: 'tags',
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
        const framework = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.visit(`/frameworks/${framework.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.visit(`/frameworks/${framework.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10"
                onClick={() => {
                  setFrameworkToDelete(framework)
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
    if (frameworkToDelete) {
      router.delete(`/frameworks/${frameworkToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setFrameworkToDelete(null)
        },
      })
    }
  }

  // Fonction pour gérer le drag & drop (mise à jour du status)
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const frameworkId = Number(draggableId)
    const newStatus = destination.droppableId

    router.put(`/frameworks/${frameworkId}`, { status: newStatus }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // Le backend renverra la liste mise à jour via Inertia
      },
      onError: (errors) => {
        console.error('Failed to move framework:', errors)
      },
    })
  }

  return (
    <AppLayout>
      <Head title="Frameworks" />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Frameworks</h1>
            <p className="text-muted-foreground">Manage compliance frameworks and regulations</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={() => router.visit('/frameworks/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Framework
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
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-4xl font-bold text-emerald-600">{stats.activeCount}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-80" />
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${stats.activePercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{stats.activePercent}%</p>
          </div>

          <div className="rounded-xl border bg-card p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-4xl font-bold text-amber-600">{stats.draftCount}</p>
              </div>
              <FileText className="h-10 w-10 text-amber-500 opacity-80" />
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${stats.draftPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{stats.draftPercent}%</p>
          </div>

          <div className="rounded-xl border bg-card p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived</p>
                <p className="text-4xl font-bold text-slate-600">{stats.archivedCount}</p>
              </div>
              <Archive className="h-10 w-10 text-slate-500 opacity-80" />
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-slate-500" style={{ width: `${stats.archivedPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{stats.archivedPercent}%</p>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'table' ? (
          <ServerDataTable
            columns={columns}
            data={frameworks}
            searchPlaceholder="Search by name or code..."
            onExport={handleExport}
            exportLoading={exportLoading}
            filters={
              <>
                <DataTableFacetedFilter filterKey="status" title="Status" options={statusOptions} />
                <DataTableSelectFilter filterKey="type" title="Type" placeholder="All types" options={typeOptions} />
              </>
            }
            initialState={{ columnPinning: { right: ['actions'] } }}
          />
        ) : (
          <div className="space-y-6 -mx-6 px-0">
            {/* Grouping Selector */}
            <div className="flex items-center justify-end px-6">
              <div className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-lg border border-zinc-800/70 rounded-xl px-6 py-3 shadow-xl">
                <ListFilter className="h-5 w-5 text-zinc-400" />
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'kanban')}>
                  <SelectTrigger className="w-[200px] border-0 bg-transparent focus:ring-0 shadow-none p-0 h-auto text-zinc-100 font-medium">
                    <SelectValue placeholder="View mode..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900/95 border-zinc-800 backdrop-blur-md text-zinc-100">
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Kanban Board – full width responsive */}
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="overflow-x-auto pb-12 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-950/20">
                <div className="flex gap-6 w-full min-w-full px-6">
                  {statusOrder.map((key) => {
                    const items = groupedByStatus[key] || []
                    const title = key.charAt(0).toUpperCase() + key.slice(1)
                    const itemCount = items.length
                    const isActive = itemCount > 0

                    return (
                      <Droppable droppableId={key} key={key}>
                        {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`
                              flex-1 min-w-[320px] max-w-[420px] 
                              flex flex-col rounded-2xl border border-zinc-800/60 
                              bg-zinc-950/65 backdrop-blur-2xl shadow-2xl overflow-hidden
                              transition-all duration-300 ease-out
                              ${snapshot.isDraggingOver
                                ? 'ring-2 ring-indigo-500/50 bg-indigo-950/15 scale-[1.015] shadow-indigo-950/50'
                                : 'hover:ring-1 hover:ring-zinc-700/60 hover:shadow-2xl hover:scale-[1.008]'}
                            `}
                          >
                            {/* Header */}
                            <div className={`
                              px-6 py-5 border-b border-zinc-800/50
                              bg-gradient-to-r ${isActive
                                ? 'from-indigo-950/50 to-violet-950/40'
                                : 'from-zinc-900/60 to-zinc-950/50'}
                              backdrop-blur-xl sticky top-0 z-10
                            `}>
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-xl tracking-tight text-zinc-50">
                                  {title}
                                </h3>
                                <Badge
                                  className={`
                                    px-4 py-1.5 text-base font-medium transition-all
                                    ${isActive
                                      ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500/40'
                                      : 'bg-zinc-800/70 text-zinc-400 border-zinc-700/50'}
                                  `}
                                >
                                  {itemCount}
                                </Badge>
                              </div>
                            </div>

                            {/* Contenu colonne */}
                            <div className="flex-1 p-6 space-y-5 overflow-y-auto min-h-[680px]">
                              {itemCount === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-24 opacity-70">
                                  <Archive className="h-16 w-16 text-zinc-600 mb-6" strokeWidth={1.3} />
                                  <p className="text-zinc-500 font-medium text-xl">
                                    No frameworks here
                                  </p>
                                </div>
                              ) : (
                                items.map((fw, index) => (
                                  <Draggable
                                    key={fw.id}
                                    draggableId={String(fw.id)}
                                    index={index}
                                  >
                                    {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`
                                          bg-zinc-900/85 border border-zinc-800/70 rounded-xl p-6 
                                          shadow-xl transition-all duration-300 ease-out
                                          group/card relative overflow-hidden
                                          hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-500/40 hover:scale-[1.02]
                                          ${snapshot.isDragging
                                            ? 'shadow-2xl ring-2 ring-indigo-500/60 scale-[1.04] rotate-[0.5deg] border-indigo-500/50 bg-indigo-950/25'
                                            : ''}
                                        `}
                                      >
                                        <div
                                          {...provided.dragHandleProps}
                                          className="absolute top-5 right-5 opacity-50 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
                                        >
                                          <GripVertical className="h-6 w-6 text-zinc-500" />
                                        </div>

                                        <div
                                          className="cursor-pointer pr-10"
                                          onClick={() => router.visit(`/frameworks/${fw.id}`)}
                                        >
                                          <div className="flex items-start justify-between mb-4">
                                            <h4 className="font-bold text-xl text-zinc-50 group-hover/card:text-indigo-400 transition-colors">
                                              {fw.code} — {fw.name}
                                            </h4>
                                            {fw.version && (
                                              <Badge variant="outline" className="text-sm bg-zinc-800/70 text-zinc-300 border-zinc-700/60">
                                                v{fw.version}
                                              </Badge>
                                            )}
                                          </div>

                                          <div className="text-sm text-zinc-400 mb-4 line-clamp-2">
                                            {fw.description || 'No description'}
                                          </div>

                                          <div className="flex flex-wrap gap-2.5">
                                            <Badge variant="outline" className="text-sm px-3 py-1 bg-zinc-800/50 border-zinc-700 text-zinc-300">
                                              {fw.type.replace('_', ' ')}
                                            </Badge>

                                            {fw.publisher && (
                                              <Badge variant="outline" className="text-sm px-3 py-1 bg-zinc-800/50 border-zinc-700 text-zinc-300">
                                                {fw.publisher}
                                              </Badge>
                                            )}
                                          </div>

                                          {fw.jurisdictions?.length ? (
                                            <div className="flex flex-wrap gap-2 mt-5">
                                              {fw.jurisdictions.slice(0, 3).map((name, i) => (
                                                <Badge key={i} variant="outline" className="text-sm px-3 py-1 bg-zinc-800/50 border-zinc-700 text-zinc-300">
                                                  {name}
                                                </Badge>
                                              ))}
                                              {fw.jurisdictions.length > 3 && (
                                                <Badge variant="secondary" className="text-sm bg-zinc-800/70 text-zinc-400">
                                                  +{fw.jurisdictions.length - 3}
                                                </Badge>
                                              )}
                                            </div>
                                          ) : null}

                                          {fw.tags?.length ? (
                                            <div className="flex flex-wrap gap-2 mt-5">
                                              {fw.tags.slice(0, 4).map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-sm px-3 py-1 bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-700/70 transition-colors">
                                                  {tag}
                                                </Badge>
                                              ))}
                                              {fw.tags.length > 4 && (
                                                <Badge variant="secondary" className="text-sm bg-zinc-800/70 text-zinc-400">
                                                  +{fw.tags.length - 4}
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
            <AlertDialogTitle>Delete Framework</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{frameworkToDelete?.name}"? This action cannot be undone.
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