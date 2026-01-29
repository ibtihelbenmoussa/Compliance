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
  Plus ,
  ArrowDownUp,
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

interface Framework {
  id: number
  code: string
  name: string
  version?: string | null
  type: string
  publisher?: string | null
  jurisdiction: string[] | string | null
  scope?: string | null
  status: string
  updated_at?: string | null
}

export default function FrameworksIndex() {
  const { frameworks = [] } = usePage<{ frameworks: Framework[] }>().props

  /* ===== STATS ===== */
  const totalFrameworks = frameworks.length
  const activeCount = frameworks.filter(f => f.status === 'active').length
  const draftCount = frameworks.filter(f => f.status === 'draft').length
  const deprecatedCount = frameworks.filter(f => f.status === 'deprecated').length
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

  return (
    <AppLayout>
      <Head title="Frameworks" />

      <div className="p-6 space-y-6">

        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold"> Frameworks</h1>
          <Button onClick={() => router.visit('/frameworks/create')}>
              <Plus className="h-4 w-4 mr-2" />

            Add Framework
          </Button>
        </div>

        {/* ===== STATISTICS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total" value={totalFrameworks} icon={Building2} />
          <StatCard title="Active" value={activeCount} icon={CheckCircle2} color="text-green-600" />
          <StatCard title="Draft" value={draftCount} icon={FileText} color="text-yellow-500" />
          <StatCard title="Deprecated" value={deprecatedCount} icon={AlertCircle} color="text-orange-500" />
          <StatCard title="Archived" value={archivedCount} icon={Archive} color="text-gray-500" />
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
                {['all','standard','regulation','contract','internal_policy'].map(t => (
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredFrameworks.length ? (
              filteredFrameworks.map((fw) => (
                <TableRow key={fw.id}>
                  <TableCell className="font-medium">{fw.code}</TableCell>
                  <TableCell>{fw.name}</TableCell>
                  <TableCell>{fw.version ?? '-'}</TableCell>
                  <TableCell>{fw.type}</TableCell>
                  <TableCell>{fw.publisher ?? '-'}</TableCell>
                  <TableCell>{parseArray(fw.jurisdiction).join(', ') || '-'}</TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.visit(`/frameworks/${fw.id}`)}
                          className="flex items-center gap-2"
                        >
                          <Eye size={14} />
                          view
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => router.visit(`/frameworks/${fw.id}/edit`)}
                          className="flex items-center gap-2"
                        >
                          <Pencil size={14} />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDelete(fw)}
                          className="text-red-600 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
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
              Êtes-vous sûr de vouloir supprimer "{frameworkToDelete?.name}" ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={confirmDelete}>
              Supprimer
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
