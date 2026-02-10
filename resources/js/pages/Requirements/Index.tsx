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
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  FileText,
  Archive,
  AlertTriangle,
  AlertCircle,
  Key,
  BookOpen,
  Layers,
  SignalHigh,
  Building2,
  ListTodo,
  Tag,
  RefreshCw,          
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { PaginatedData } from '@/types'

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
  stats?: {
    total?: number
    lowCount?: number
    mediumCount?: number
    highCount?: number
    lowPercent?: number
    mediumPercent?: number
    highPercent?: number
  }
}

export default function RequirementsIndex({ requirements, stats = {} }: RequirementsIndexProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<Requirement | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  const {
    total = 0,
    lowCount = 0,
    mediumCount = 0,
    highCount = 0,
    lowPercent = 0,
    mediumPercent = 0,
    highPercent = 0,
  } = stats

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const response = await fetch(`/requirements/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
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

  const statusOptions: FacetedFilterOption[] = [
    { label: 'Active', value: 'active', icon: CheckCircle2 },
    { label: 'Inactive', value: 'inactive', icon: FileText },
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
          active: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
          inactive: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/50 dark:text-gray-300',
          draft: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
          archived: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300',
        }

        return (
          <Badge
            variant="outline"
            className={`capitalize ${variants[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
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
          high: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300',
          medium: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
          low: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300',
        }

        return (
          <Badge
            variant="outline"
            className={`capitalize ${variants[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
          >
            {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '—'}
          </Badge>
        )
      },
    },
    // ────────────────────────────────────────────────
    // NEW COLUMN: Frequency
    // ────────────────────────────────────────────────
    {
      accessorKey: 'frequency',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Frequency" />
        </div>
      ),
      cell: ({ row }) => {
        const freq = (row.getValue('frequency') as string)?.toLowerCase() || ''

        const displayMap: Record<string, { label: string; variant: string }> = {
          one_time: {
            label: 'One Time',
            variant: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300',
          },
          daily: {
            label: 'Daily',
            variant: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300',
          },
          weekly: {
            label: 'Weekly',
            variant: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300',
          },
          monthly: {
            label: 'Monthly',
            variant: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/30 dark:text-violet-300',
          },
          quarterly: {
            label: 'Quarterly',
            variant: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
          },
          yearly: {
            label: 'Yearly',
            variant: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
          },
          continuous: {
            label: 'Continuous',
            variant: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300',
          },
        }

        const info = displayMap[freq] || {
          label: freq ? freq.charAt(0).toUpperCase() + freq.slice(1).replace('_', ' ') : '—',
          variant: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        }

        return (
          <Badge
            variant="outline"
            className={`capitalize ${info.variant}`}
          >
            {info.label}
          </Badge>
        )
      },
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
    // {
    //   accessorKey: 'process.name',
    //   header: ({ column }) => (
    //     <div className="flex items-center gap-1.5">
    //       <ListTodo className="h-4 w-4 text-muted-foreground" />
    //       <DataTableColumnHeader column={column} title="Process" />
    //     </div>
    //   ),
    //   cell: ({ row }) => row.original.process?.name || '—',
    // },
   /*  {
      accessorKey: 'tags',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <DataTableColumnHeader column={column} title="Tags" />
        </div>
      ),
      cell: ({ row }) => {
        const tags: string[] = row.original.tags || []
        if (tags.length === 0) return <span className="text-muted-foreground text-sm">—</span>

        return (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )
      },
      enableSorting: false,
    }, */
    {
      id: 'actions',
      cell: ({ row }) => {
        const requirement = row.original
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
              <DropdownMenuItem onClick={() => router.visit(`/requirements/${requirement.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.visit(`/requirements/${requirement.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setRequirementToDelete(requirement)
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
    if (requirementToDelete) {
      router.delete(`/requirements/${requirementToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setRequirementToDelete(null)
        },
      })
    }
  }

  return (
    <AppLayout>
      <Head title="Requirements" />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requirements</h1>
            <p className="text-muted-foreground">Manage compliance requirements</p>
          </div>
          <Button onClick={() => router.visit('/requirements/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Requirement
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Total */}
          <div className="rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-4xl font-extrabold text-slate-800 dark:text-slate-200">
                  {total}
                </p>
              </div>
              <div className="rounded-full bg-slate-100 dark:bg-slate-800/40 p-3 transition-transform group-hover:scale-110">
                <AlertCircle className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-500 dark:bg-slate-400 transition-all duration-1000 ease-out"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Low */}
          <div className="rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low</p>
                <p className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {lowCount}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100/60 dark:bg-emerald-900/30 p-3 transition-transform group-hover:scale-110">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600/80 dark:bg-emerald-500 transition-all duration-1000 ease-out"
                style={{ width: `${lowPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 text-right">{lowPercent}%</p>
          </div>

          {/* Medium */}
          <div className="rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium</p>
                <p className="text-4xl font-extrabold text-amber-700 dark:text-amber-300">
                  {mediumCount}
                </p>
              </div>
              <div className="rounded-full bg-amber-100/60 dark:bg-amber-900/30 p-3 transition-transform group-hover:scale-110">
                <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600/80 dark:bg-amber-500 transition-all duration-1000 ease-out"
                style={{ width: `${mediumPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 text-right">{mediumPercent}%</p>
          </div>

          {/* High */}
          <div className="rounded-xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High</p>
                <p className="text-4xl font-extrabold text-red-700 dark:text-red-300">
                  {highCount}
                </p>
              </div>
              <div className="rounded-full bg-red-100/60 dark:bg-red-900/30 p-3 transition-transform group-hover:scale-110">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600/80 dark:bg-red-500 transition-all duration-1000 ease-out"
                style={{ width: `${highPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 text-right">{highPercent}%</p>
          </div>
        </div>

        {/* Data Table */}
        <ServerDataTable
          columns={columns}
          data={requirements}
          searchPlaceholder="Search by code or title..."
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
                filterKey="priority"
                title="Priority"
                placeholder="All priorities"
                options={priorityOptions}
              />
            </>
          }
          initialState={{
            columnPinning: {
              right: ['actions'],
            },
          }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
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