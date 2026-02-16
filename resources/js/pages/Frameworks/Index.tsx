import { useState } from 'react'
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
  ArrowDownUp,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PaginatedData } from '@/types'

interface Jurisdiction {
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
  jurisdictions: Jurisdiction[] | null
  tags?: string[]
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
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `frameworks-${new Date().toISOString().split('T')[0]}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExportLoading(false)
    }
  }

  const groupedByStatus = frameworks.data.reduce((acc, fw) => {
    const status = (fw.status || 'unknown').toLowerCase()
    if (!acc[status]) acc[status] = []
    acc[status].push(fw)
    return acc
  }, {} as Record<string, Framework[]>)

  const statusOrder = ['active', 'draft', 'archived']

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

  const total = frameworks.total || frameworks.data.length
  const activeCount = frameworks.data.filter(f => f.status === 'active').length
  const draftCount = frameworks.data.filter(f => f.status === 'draft').length
  const archivedCount = frameworks.data.filter(f => f.status === 'archived').length

  const activePercent = total > 0 ? Math.round((activeCount / total) * 100) : 0
  const draftPercent = total > 0 ? Math.round((draftCount / total) * 100) : 0
  const archivedPercent = total > 0 ? Math.round((archivedCount / total) * 100) : 0

  const columns: ColumnDef<Framework>[] = [
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Key className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Code" />
        </div>
      ),
      cell: ({ row }) => <div className="font-mono">{row.getValue('code')}</div>,
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
      cell: ({ row }) => <div className="capitalize">{row.getValue('type') || '—'}</div>,
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
      accessorFn: (row) => row.jurisdictions || [],
      cell: ({ getValue }) => {
        const jurisdictions = getValue() as Jurisdiction[]
        if (!jurisdictions.length) return <span>—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {jurisdictions.map((j, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {j.name}
              </Badge>
            ))}
          </div>
        )
      },
    }
    ,
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <SignalHigh className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Status" />
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusLower = status?.toLowerCase() || ''

        let pillClasses = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border shadow-sm'
        let icon = null

        switch (statusLower) {
          case 'active':
            pillClasses += ' bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
            icon = <CheckCircle2 className="h-3.5 w-3.5" />
            break
          case 'draft':
            pillClasses += ' bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
            icon = <FileText className="h-3.5 w-3.5" />
            break
          case 'archived':
            pillClasses += ' bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/60'
            icon = <Archive className="h-3.5 w-3.5" />
            break
          default:
            pillClasses += ' bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/60'
            icon = <FileText className="h-3.5 w-3.5" />
        }

        return (
          <span className={pillClasses}>
            {icon}
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
          </span>
        )
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
        const tags: string[] = row.original.tags || []
        return (
          <div className="flex flex-wrap gap-1">
            {tags.length === 0 ? (
              <span className="text-muted-foreground text-xs">—</span>
            ) : (
              tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))
            )}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.visit(`/frameworks/${framework.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.visit(`/frameworks/${framework.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFrameworkToDelete(framework)
                  setDeleteDialogOpen(true)
                }}
                className="text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
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

  return (
    <AppLayout>
      <Head title="Frameworks" />

      <div className="space-y-6 p-6">
        {/* Header + View Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Frameworks</h1>
            <p className="text-muted-foreground">Manage compliance frameworks</p>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => router.visit('/frameworks/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Framework
            </Button>

            {/* View Mode Toggle */}
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
          {/* Total */}
          <div className="rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {total}
                </p>
              </div>
              <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-3 transition-transform group-hover:scale-110">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Active */}
          <div className="rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {activeCount}
                </p>
              </div>
              <div className="rounded-full bg-emerald-500/10 p-3 transition-transform group-hover:scale-110">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-1000 ease-out" style={{ width: `${activePercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 text-right">{activePercent}%</p>
          </div>

          {/* Draft */}
          <div className="rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {draftCount}
                </p>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3 transition-transform group-hover:scale-110">
                <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000 ease-out" style={{ width: `${draftPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 text-right">{draftPercent}%</p>
          </div>

          {/* Archived */}
          <div className="rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived</p>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                  {archivedCount}
                </p>
              </div>
              <div className="rounded-full bg-gray-500/10 p-3 transition-transform group-hover:scale-110">
                <Archive className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gray-500 to-slate-500 transition-all duration-1000 ease-out" style={{ width: `${archivedPercent}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 text-right">{archivedPercent}%</p>
          </div>
        </div>

        {/* Contenu principal : Table ou Kanban */}
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
            initialState={{
              columnPinning: {
                right: ['actions'],
              },
            }}
          />
        ) : (
          // Kanban / Board View
          <div className="overflow-x-auto pb-6">
            <div className="flex gap-5 min-w-fit">
              {statusOrder.map((statusKey) => {
                const items = groupedByStatus[statusKey] || []
                const title = statusKey.charAt(0).toUpperCase() + statusKey.slice(1)
                const count = items.length

                return (
                  <div
                    key={statusKey}
                    className="bg-muted/30 rounded-xl border w-[360px] flex flex-col shadow-sm"
                  >
                    {/* En-tête de colonne */}
                    <div className="p-4 border-b bg-background/80 sticky top-0 backdrop-blur-sm z-10 rounded-t-xl">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <Badge variant="secondary" className="text-sm">
                          {count}
                        </Badge>
                      </div>
                    </div>

                    {/* Cartes */}
                    <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[65vh]">
                      {items.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12 italic">
                          Aucun framework dans cette colonne
                        </div>
                      ) : (
                        items.map((fw) => (
                          <div
                            key={fw.id}
                            className="bg-card border rounded-lg p-4 shadow hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => router.visit(`/frameworks/${fw.id}`)}
                          >
                            <div className="font-medium mb-1.5 group-hover:underline">
                              {fw.code} — {fw.name}
                            </div>

                            <div className="text-sm text-muted-foreground mb-3">
                              {fw.version ? `Version ${fw.version}` : 'Sans version'}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {fw.type.replace('_', ' ')}
                              </Badge>

                              {fw.jurisdictions?.length ? (
                                <div className="flex flex-wrap gap-1">
                                  {fw.jurisdictions.map((j, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {j.name}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span>—</span>
                              )}

                              {fw.publisher && (
                                <Badge variant="outline" className="text-xs">
                                  {fw.publisher}
                                </Badge>
                              )}
                            </div>

                            {fw.tags && fw.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {fw.tags.slice(0, 3).map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {fw.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{fw.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dialog de suppression */}
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