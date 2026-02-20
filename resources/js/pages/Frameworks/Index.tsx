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
  AlertTriangle,
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
} from '@hello-pangea/dnd'

interface RelationItem {
  id: number
  name: string
  pivot?: Record<string, any>
}

export interface Framework {
  id: number
  code: string
  name: string
  version?: string | null
  type: string
  publisher?: string | null
  jurisdictions: (string | RelationItem)[] | null
  tags: (string | RelationItem)[] | null
  status: string
  updated_at?: string | null
  description?: string | null
}

interface FrameworksIndexProps {
  frameworks: PaginatedData<Framework>
}

type GroupBy = 'status' | 'type'

export default function FrameworksIndex({ frameworks }: FrameworksIndexProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [frameworkToDelete, setFrameworkToDelete] = useState<Framework | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [groupBy, setGroupBy] = useState<GroupBy>('status')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // ────────────────────────────────────────────────
  // Couleurs harmonisées avec Requirements
  // ────────────────────────────────────────────────
  const getStatusBadgeClasses = (status: string | undefined) => {
    const s = (status || '').toLowerCase()
    const styles: Record<string, string> = {
      active: 'border-emerald-500 bg-emerald-900/30 text-white',
      draft: 'border-amber-500 bg-amber-900/30 text-white',
      archived: 'border-slate-500 bg-slate-800/40 text-white',
    }
    return styles[s] || 'border-gray-600 bg-gray-800/30 text-white'
  }

  const getTypeBadgeClasses = (type: string | undefined) => {
    const t = (type || '').toLowerCase()
    const styles: Record<string, string> = {
      standard: 'border-emerald-500 bg-emerald-900/30 text-white',
      regulation: 'border-violet-500 bg-violet-900/30 text-white',
      contract: 'border-amber-500 bg-amber-900/30 text-white',
      internal_policy: 'border-indigo-500 bg-indigo-900/30 text-white',
    }
    return styles[t] || 'border-gray-600 bg-gray-800/30 text-white'
  }

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

  // ────────────────────────────────────────────────
  // Statistiques dynamiques
  // ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const data = frameworks.data
    const total = data.length

    if (groupBy === 'status') {
      const active = data.filter(f => f.status?.toLowerCase() === 'active').length
      const draft = data.filter(f => f.status?.toLowerCase() === 'draft').length
      const archived = data.filter(f => f.status?.toLowerCase() === 'archived').length

      return {
        total,
        items: [
          { label: 'Total', count: total, percent: 100, color: 'blue', icon: Building2 },
          { label: 'Active', count: active, percent: total > 0 ? Math.round((active / total) * 100) : 0, color: 'emerald', icon: CheckCircle2 },
          { label: 'Draft', count: draft, percent: total > 0 ? Math.round((draft / total) * 100) : 0, color: 'amber', icon: FileText },
          { label: 'Archived', count: archived, percent: total > 0 ? Math.round((archived / total) * 100) : 0, color: 'slate', icon: Archive },
        ]
      }
    } else {
      const standard = data.filter(f => f.type?.toLowerCase() === 'standard').length
      const regulation = data.filter(f => f.type?.toLowerCase() === 'regulation').length
      const contract = data.filter(f => f.type?.toLowerCase() === 'contract').length
      const internalPolicy = data.filter(f => f.type?.toLowerCase() === 'internal_policy').length

      return {
        total,
        items: [
          { label: 'Total', count: total, percent: 100, color: 'blue', icon: Building2 },
          { label: 'Standard', count: standard, percent: total > 0 ? Math.round((standard / total) * 100) : 0, color: 'emerald', icon: Layers },
          { label: 'Regulation', count: regulation, percent: total > 0 ? Math.round((regulation / total) * 100) : 0, color: 'violet', icon: Globe },
          { label: 'Contract', count: contract, percent: total > 0 ? Math.round((contract / total) * 100) : 0, color: 'amber', icon: FileText },
          { label: 'Internal Policy', count: internalPolicy, percent: total > 0 ? Math.round((internalPolicy / total) * 100) : 0, color: 'indigo', icon: Building2 },
        ]
      }
    }
  }, [frameworks.data, groupBy])

  const groupedData = useMemo(() => {
    return frameworks.data.reduce((acc, fw) => {
      const key = groupBy === 'status'
        ? (fw.status || 'unknown').toLowerCase()
        : (fw.type || 'unknown').toLowerCase()
      acc[key] = acc[key] || []
      acc[key].push(fw)
      return acc
    }, {} as Record<string, Framework[]>)
  }, [frameworks.data, groupBy])

  const groupOrder = useMemo(() => {
    return groupBy === 'status'
      ? ['active', 'draft', 'archived', 'unknown']
      : ['standard', 'regulation', 'contract', 'internal_policy', 'unknown']
  }, [groupBy])

  const getColumnTitle = (key: string) => {
    if (key === 'unknown') return 'Unknown'
    if (groupBy === 'status') {
      return key.charAt(0).toUpperCase() + key.slice(1)
    }
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // ────────────────────────────────────────────────
  // Filtres comme dans Requirements
  // ────────────────────────────────────────────────
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
        <Badge
          variant="outline"
          className={`capitalize border font-medium px-2.5 py-0.5 ${getTypeBadgeClasses(row.getValue('type'))}`}
        >
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
        if (jurisdictions.length === 0) return <span className="text-muted-foreground text-xs">—</span>

        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {jurisdictions.slice(0, 3).map((item, i) => {
              const name = typeof item === 'string' ? item : (item as RelationItem)?.name || '—'
              return (
                <Badge key={i} variant="outline" className="text-xs border-gray-600 text-white bg-gray-800/30">
                  {name}
                </Badge>
              )
            })}
            {jurisdictions.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{jurisdictions.length - 3}
              </Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <SignalHigh className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Status" />
        </div>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`capitalize border font-medium px-2.5 py-0.5 ${getStatusBadgeClasses(row.getValue('status'))}`}
        >
          {(row.getValue('status') as string)?.charAt(0).toUpperCase() + (row.getValue('status') as string)?.slice(1).toLowerCase() || '—'}
        </Badge>
      ),
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
        if (tags.length === 0) return <span className="text-muted-foreground text-xs">—</span>

        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {tags.slice(0, 3).map((tag, i) => {
              const name = typeof tag === 'string' ? tag : (tag as RelationItem)?.name || '—'
              return (
                <Badge key={i} variant="outline" className="text-xs border-gray-600 text-white bg-gray-800/30">
                  {name}
                </Badge>
              )
            })}
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const frameworkId = Number(draggableId)
    const newValue = destination.droppableId

    const payload = groupBy === 'status'
      ? { status: newValue }
      : { type: newValue }

    router.put(`/frameworks/${frameworkId}`, payload, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        // toast.success("Framework moved successfully")
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
            <p className="text-muted-foreground">Manage compliance and regulatory frameworks</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={() => router.visit('/frameworks/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Framework
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

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.items.map((stat, idx) => (
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

        {/* Contenu principal */}
        {viewMode === 'table' ? (
          <ServerDataTable
            columns={columns}
            data={frameworks}
            searchPlaceholder="Search by code or name..."
            onExport={handleExport}
            exportLoading={exportLoading}
            filters={
              <>
                <DataTableFacetedFilter
                  filterKey="status"
                  title="Status"
                  options={statusOptions}
                />
                <DataTableSelectFilter
                  filterKey="type"
                  title="Type"
                  placeholder="All types"
                  options={typeOptions}
                />
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
                    <SelectItem value="type">By Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="overflow-x-auto pb-8">
                <div className="flex gap-6 min-w-max">
                  {groupOrder.map((key) => {
                    const items = groupedData[key] || []
                    const title = getColumnTitle(key)

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
                                  No frameworks here
                                </div>
                              ) : (
                                items.map((fw, index) => (
                                  <Draggable key={fw.id} draggableId={String(fw.id)} index={index}>
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
                                          onClick={() => router.visit(`/frameworks/${fw.id}`)}
                                        >
                                          <div className="font-medium group-hover:underline mb-1">
                                            {fw.code} — {fw.name}
                                          </div>

                                          <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {fw.description || 'No description'}
                                          </div>

                                          <div className="flex flex-wrap gap-2">
                                            <Badge
                                              variant="outline"
                                              className={`text-xs px-2.5 py-0.5 font-medium border ${getTypeBadgeClasses(fw.type)}`}
                                            >
                                              {fw.type?.replace('_', ' ')?.toUpperCase() || '—'}
                                            </Badge>

                                            <Badge
                                              variant="outline"
                                              className={`text-xs px-2.5 py-0.5 font-medium border ${getStatusBadgeClasses(fw.status)}`}
                                            >
                                              {fw.status?.toUpperCase() || '—'}
                                            </Badge>

                                            {fw.version && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs border-gray-600 text-white bg-gray-800/30"
                                              >
                                                v{fw.version}
                                              </Badge>
                                            )}

                                            {fw.publisher && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs border-gray-600 text-white bg-gray-800/30"
                                              >
                                                {fw.publisher}
                                              </Badge>
                                            )}
                                          </div>

                                          {fw.tags?.length ? (
                                            <div className="flex flex-wrap gap-1 mt-3">
                                              {fw.tags.slice(0, 3).map((tag, i) => {
                                                const name = typeof tag === 'string' ? tag : (tag as RelationItem)?.name || '—'
                                                return (
                                                  <Badge
                                                    key={i}
                                                    variant="outline"
                                                    className="text-xs border-gray-600 text-white bg-gray-800/30"
                                                  >
                                                    {name}
                                                  </Badge>
                                                )
                                              })}
                                              {fw.tags.length > 3 && (
                                                <Badge variant="secondary" className="text-xs">
                                                  +{fw.tags.length - 3}
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