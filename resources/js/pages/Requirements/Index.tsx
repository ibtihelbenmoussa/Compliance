import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Head, Link, router } from '@inertiajs/react'
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
  ArrowDownUp,
  MoreHorizontal,
  CheckCircle2,
  FileText,
  Archive,
  Plus,
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
  framework_id: number
  framework?: { code: string; name: string }
  process_id?: number | null
  process?: { name: string }
  owner_id?: string | null
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

export default function RequirementsIndex({ requirements }: RequirementsIndexProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<Requirement | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

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

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `requirements-${new Date().toISOString().split('T')[0]}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)
      }
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
        <DataTableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => (
        <div className="font-mono">{row.getValue('code')}</div>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/requirements/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.getValue('title')}
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
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
        <div className="flex items-center gap-2">
          <DataTableColumnHeader column={column} title="Status" />
          <ArrowDownUp className="h-4 w-4 text-muted-foreground opacity-70" />
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const statusLower = status?.toLowerCase() || ''

        let badgeClasses = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border'

        switch (statusLower) {
          case 'active':
            badgeClasses += ' bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
            break
          case 'inactive':
            badgeClasses += ' bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/60'
            break
          case 'draft':
            badgeClasses += ' bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
            break
          case 'archived':
            badgeClasses += ' bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800/60'
            break
          default:
            badgeClasses += ' bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/60'
        }

        return (
          <span className={badgeClasses}>
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string

        let badgeClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border'

        switch (priority?.toLowerCase()) {
          case 'high':
            badgeClasses += ' bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60'
            break
          case 'medium':
            badgeClasses += ' bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
            break
          case 'low':
            badgeClasses += ' bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60'
            break
          default:
            badgeClasses += ' bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/60'
        }

        return (
          <span className={badgeClasses}>
            {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'frequency',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Frequency" />
      ),
      cell: ({ row }) => (
        <div className="capitalize">{(row.getValue('frequency') as string)?.replace('_', ' ') || '—'}</div>
      ),
    },
    {
      accessorKey: 'framework.code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Framework" />
      ),
      cell: ({ row }) => {
        const framework = row.original.framework
        return framework ? `${framework.code} - ${framework.name}` : '—'
      },
    },
    {
      accessorKey: 'process.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Process" />
      ),
      cell: ({ row }) => row.original.process?.name || '—',
    },
    {
      accessorKey: 'compliance_level',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Compliance Level" />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue('compliance_level') || '—'}</Badge>
      ),
    },
    {
      accessorKey: 'deadline',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Deadline" />
      ),
      cell: ({ row }) => row.getValue('deadline') || '—',
    },
    {
      accessorKey: 'completion_date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Completion" />
      ),
      cell: ({ row }) => row.getValue('completion_date') || '—',
    },
    {
      accessorKey: 'tags',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row }) => {
        const tags: string[] = row.original.tags || []
        return (
          <div className="flex flex-wrap gap-1">
            {tags.length > 0 ? (
              tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">—</span>
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
            <p className="text-muted-foreground">
              Manage compliance requirements
            </p>
          </div>
          <Button onClick={() => router.visit('/requirements/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Requirement
          </Button>
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