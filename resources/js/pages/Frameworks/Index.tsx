import React, { useState } from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pencil,
  Trash2,
  MoreHorizontal,
  Eye,
  Search,
  FileSpreadsheet,
  Filter,
  Building2,
  CheckCircle2,
  FileText,
  AlertCircle,
  Archive,
  Plus,
} from 'lucide-react'
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
import { DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Link } from '@inertiajs/react'

interface Jurisdiction {
  id: number
  name: string
}
 
interface Framework {
  id: number
  code: string
  name: string
  version?: string | null
  type: string
  publisher?: string | null
  jurisdiction: Jurisdiction | null
  tags?: string[] 
  status: string
  updated_at?: string | null
}
 
export default function FrameworksIndex() {
  const { frameworks = [] } = usePage<{ frameworks: Framework[] }>().props

  
 
  /* ===== STATS ===== */
  const totalFrameworks = frameworks.length
  const activeCount = frameworks.filter(f => f.status === 'active').length
  const draftCount = frameworks.filter(f => f.status === 'draft').length
  const archivedCount = frameworks.filter(f => f.status === 'archived').length
 
  /* ===== STATES ===== */
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [frameworkToDelete, setFrameworkToDelete] = useState<Framework | null>(null)
 
  /* ===== HELPERS ===== */
  const parseArray = (value: any) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
      return JSON.parse(value)
    } catch {
      return [value]
    }
  }
 
  const filteredFrameworks = frameworks.filter((fw) => {
    const matchesSearch =
      fw.name.toLowerCase().includes(search.toLowerCase()) ||
      fw.code.toLowerCase().includes(search.toLowerCase())
 
    const matchesType = typeFilter === 'all' || fw.type === typeFilter
 
    return matchesSearch && matchesType
  })
 
  /* ===== DELETE ===== */
  const handleDelete = (fw: Framework) => {
    setFrameworkToDelete(fw)
    setDeleteDialogOpen(true)
  }
 
  const confirmDelete = () => {
    if (frameworkToDelete) {
      router.delete(`/frameworks/${frameworkToDelete.id}`, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setFrameworkToDelete(null)
        },
      })
    }
  }

  /* ===== COLUMNS SERVER DATATABLE ===== */
  const columns = [
    { header: 'Code', accessorKey: 'code' },
    {
      header: 'Name',
      accessorKey: 'name',
      render: (fw: Framework) => (
        <Link href={`/frameworks/${fw.id}`} className="font-medium hover:underline">
          {fw.name}
        </Link>
      ),
    },
    { header: 'Version', accessorKey: 'version', render: (fw: Framework) => fw.version ?? '-' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Publisher', accessorKey: 'publisher', render: (fw: Framework) => fw.publisher ?? '-' },
    {
      header: 'Jurisdiction',
      accessorKey: 'jurisdiction',
      render: (fw: Framework) => fw.jurisdiction?.name ?? '-',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (fw: Framework) => (
        <Badge
          variant={fw.status === 'active' ? 'default' : fw.status === 'draft' ? 'destructive' : 'secondary'}
          className="capitalize"
        >
          {fw.status}
        </Badge>
      ),
    },
    {
      header: 'Tags',
      accessorKey: 'tags',
      render: (fw: Framework) => (
        <div className="flex flex-wrap gap-1">
          {fw.tags?.length
            ? fw.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs">
                  {tag}
                </Badge>
              ))
            : <span className="text-gray-400">-</span>}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      render: (fw: Framework) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.visit(`/frameworks/${fw.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.visit(`/frameworks/${fw.id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(fw)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
 
  return (
    <AppLayout>
      <Head title="Frameworks" />
 
      <div className="p-6 space-y-6">
 
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Frameworks</h1>
          <Button onClick={() => router.visit('/frameworks/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Framework
          </Button>
        </div>
 
        {/* ===== STATISTICS ===== */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <StatCard
    title="Total"
    value={totalFrameworks}
    icon={Building2}
    color="text-blue-600"
    bgColor="bg-blue-50 dark:bg-blue-900"
  />
  <StatCard
    title="Active"
    value={activeCount}
    icon={CheckCircle2}
    color="text-green-600"
    bgColor="bg-green-50 dark:bg-green-900"
  />
  <StatCard
    title="Draft"
    value={draftCount}
    icon={FileText}
    color="text-yellow-500"
    bgColor="bg-yellow-50 dark:bg-yellow-900"
  />
  
  <StatCard
    title="Archived"
    value={archivedCount}
    icon={Archive}
    color="text-gray-500"
    bgColor="bg-gray-50 dark:bg-gray-800"
  />
</div>

 
        {/* ===== TOOLBAR ===== */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or code..."
              className="w-full rounded-lg border pl-10 pr-4 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
 
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {['all', 'standard', 'regulation', 'contract', 'internal_policy'].map(t => (
                  <DropdownMenuItem key={t} onClick={() => setTypeFilter(t)}>
                    {t === 'all' ? 'All types' : t}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
 
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = '/frameworks/export')}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
              Export Excel
            </Button>
          </div>
        </div>
 
        {/* ===== TABLE ===== */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Publisher</TableHead>
              <TableHead>Jurisdiction</TableHead>
              <TableHead>Status</TableHead>
                            <TableHead>Tags</TableHead>

              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
 
          <TableBody>
  {filteredFrameworks.length ? (
    filteredFrameworks.map((fw) => (
      <TableRow
        key={fw.id}
        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
      >
        <TableCell className="font-mono text-gray-900 dark:text-gray-100">{fw.code}</TableCell>
        <TableCell>
          <Link href={`/frameworks/${fw.id}`} className="font-medium hover:underline text-gray-700 dark:text-gray-300">
            {fw.name}
          </Link>
        </TableCell>
        <TableCell className="text-gray-700 dark:text-gray-300">{fw.version ?? '-'}</TableCell>
        <TableCell className="capitalize text-gray-700 dark:text-gray-300">{fw.type}</TableCell>
        <TableCell className="text-gray-700 dark:text-gray-300">{fw.publisher ?? '-'}</TableCell>
        <TableCell className="text-gray-700 dark:text-gray-300">{fw.jurisdiction?.name ?? '-'}</TableCell>

        {/* ===== STATUS BADGE ===== */}
        <TableCell>
     <Badge
  variant={
    fw.status === 'active'
      ? 'default'
      : fw.status === 'draft'
      ? 'destructive'
      : 'secondary'
  }
  className="capitalize"
>
  {fw.status}
</Badge>

        </TableCell>

        {/* ===== TAGS ===== */}
        <TableCell className="flex flex-wrap gap-1">
          {fw.tags?.length ? (
            fw.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </TableCell>

        {/* ===== ACTIONS DROPDOWN ===== */}
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.visit(`/frameworks/${fw.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.visit(`/frameworks/${fw.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFrameworkToDelete(fw)
                  setDeleteDialogOpen(true)
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={9} className="text-center text-gray-500 dark:text-gray-400 py-4">
        Aucun framework trouvé
      </TableCell>
    </TableRow>
  )}
</TableBody>

        </Table>
      </div>
 
      {/* ===== DELETE MODAL ===== */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Framework</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{frameworkToDelete?.name}" ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
 
/* ===== STAT CARD COMPONENT ===== */
function StatCard({ title, value, icon: Icon, color = 'text-muted-foreground' }: any) {
  return (
    <div className="rounded-xl border bg-background p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <Icon className={`h-7 w-7 ${color}`} />
    </div>
  )
}