// resources/js/Pages/RequirementTests/Index.tsx
import { Head, Link, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { useEffect, useMemo, useState } from 'react'

import type { ColumnDef } from '@tanstack/react-table'
import type { PaginatedData } from '@/types'

import AppLayout from '@/layouts/app-layout'
import { ServerDataTable } from '@/components/server-data-table'
import { DataTableColumnHeader } from '@/components/server-data-table-column-header'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Key,
  FileText,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Framework { id: number; code: string; name: string }
interface Process   { id: number; name: string }
interface Tag       { id: number; name: string }

interface Requirement {
  id: number
  code: string
  title: string
  frequency: string
  deadline?: string | null
  framework?: Framework | null
  process?: Process | null
  tags?: Tag[] | null
  latest_test_status?: 'pending' | 'accepted' | 'rejected' | null
  latest_test_comment?: string | null
  latest_test_id?: number | null
}

interface Props {
  date: string
  requirements: PaginatedData<Requirement>
  filters?: { search?: string; date?: string }
  isToday: boolean
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RequirementTestsIndex({
  date: initialDate,
  requirements: paginatedRequirements,
  filters = {},
  isToday,
}: Props) {

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date(initialDate)
    return isNaN(d.getTime()) ? new Date() : d
  })

  const [exportLoading, setExportLoading] = useState(false)

  const formattedDate = useMemo(
    () => format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: enUS }),
    [selectedDate],
  )

  // ── S'assurer que la date est toujours dans l'URL ──────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get('date')) {
      params.set('date', format(selectedDate, 'yyyy-MM-dd'))
      router.visit(`${window.location.pathname}?${params.toString()}`, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })
    }
  }, [])

  // ── Navigation (date change) ───────────────────────────────────────────────
  // On reconstruit l'URL en conservant TOUS les params existants (search, per_page…)
  // et on écrase seulement la date.
  const navigate = (newDate: Date) => {
    const params = new URLSearchParams(window.location.search)
    params.set('date', format(newDate, 'yyyy-MM-dd'))
    params.delete('page') // reset page quand on change de date
    router.visit(`${window.location.pathname}?${params.toString()}`, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    })
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate || isNaN(newDate.getTime())) return
    setSelectedDate(newDate)
    navigate(newDate)
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const response = await fetch(
        `${route('requirement-tests.export')}?${params.toString()}`,
        { headers: { 'X-Requested-With': 'XMLHttpRequest' } },
      )
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `compliance-tests-${format(selectedDate, 'yyyy-MM-dd')}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setExportLoading(false)
    }
  }

  // ── Colonnes ───────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Requirement>[]>(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => (
          <div className="flex items-center gap-1.5">
            <Key className="h-4 w-4 text-muted-foreground" />
            <DataTableColumnHeader column={column} title="Code" />
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-mono font-medium">{row.getValue('code') || '—'}</div>
        ),
        size: 140,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <DataTableColumnHeader column={column} title="Title" />
          </div>
        ),
        cell: ({ row }) => (
          <Link
            href={`/requirements/${row.original.id}`}
            className="font-medium hover:underline line-clamp-1"
          >
            {row.getValue('title')}
          </Link>
        ),
      },
      {
        accessorKey: 'frequency',
        header: ({ column }) => (
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <DataTableColumnHeader column={column} title="Frequency" />
          </div>
        ),
        cell: ({ row }) => {
          const freq = (row.getValue('frequency') as string | undefined)?.toLowerCase() || ''
          let badgeClass = 'border-gray-700 bg-gray-900/40 text-gray-300'

          if (freq.includes('daily'))     badgeClass = 'border-blue-600 bg-blue-950/50 text-blue-200'
          if (freq.includes('weekly'))    badgeClass = 'border-violet-600 bg-violet-950/50 text-violet-200'
          if (freq.includes('monthly'))   badgeClass = 'border-amber-600 bg-amber-950/50 text-amber-200'
          if (freq.includes('quarterly')) badgeClass = 'border-cyan-600 bg-cyan-950/50 text-cyan-200'
          if (freq.includes('yearly') || freq.includes('annual'))
            badgeClass = 'border-emerald-600 bg-emerald-950/50 text-emerald-200'
          if (freq.includes('one_time') || freq.includes('one-time') || freq.includes('onetime'))
            badgeClass = 'border-indigo-600 bg-indigo-950/50 text-indigo-200'

          const display = freq
            ? freq.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            : '—'

          return (
            <Badge
              variant="outline"
              className={cn('capitalize px-2.5 py-0.5 min-w-[100px] text-center', badgeClass)}
            >
              {display}
            </Badge>
          )
        },
        size: 160,
      },
      {
        id: 'framework',
        accessorFn: row => row.framework ? `${row.framework.code} — ${row.framework.name}` : '—',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Framework" />,
        cell: ({ row }) => {
          const fw = row.original.framework
          if (!fw) return <span className="text-muted-foreground">—</span>

          const initials  = fw.code ? fw.code.slice(0, 3).toUpperCase() : fw.name.slice(0, 2).toUpperCase()
          const hue       = (fw.id * 47) % 360
          const bgColor   = `hsl(${hue}, 70%, 48%)`

          return (
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: bgColor }}
              >
                {initials}
              </div>
              <span className="text-muted-foreground truncate max-w-[160px]">
                {fw.code} — {fw.name}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'deadline',
        header: ({ column }) => (
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <DataTableColumnHeader column={column} title="Deadline" />
          </div>
        ),
        cell: ({ row }) => {
          const dl = row.original.deadline
          if (!dl) return <span className="text-muted-foreground">—</span>

          const date = new Date(dl)
          if (isNaN(date.getTime())) return <span className="text-red-400">Invalid</span>

          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const diffDays = Math.floor((date.getTime() - today.getTime()) / 86400000)

          const color =
            diffDays < 0   ? 'text-red-400 font-medium' :
            diffDays <= 3  ? 'text-amber-400 font-medium' :
            'text-emerald-400'

          return (
            <span className={color}>
              {format(date, 'MMM d, yyyy', { locale: enUS })}
            </span>
          )
        },
        size: 160,
      },
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => {
          const req    = row.original
          const status = req.latest_test_status

          let config: {
            label: string
            icon: React.ReactNode
            className?: string
            disabled: boolean
            tooltip?: string
          } = {
            label:    'Create Test',
            icon:     <Plus className="h-4 w-4 mr-2" />,
            disabled: false,
          }

          if (isToday) {
            if (status === 'accepted') {
              config = {
                label:     'Accepted',
                icon:      <CheckCircle2 className="h-4 w-4 mr-2" />,
                className: 'bg-emerald-800/90 hover:bg-emerald-800 text-white cursor-not-allowed opacity-80',
                disabled:  true,
                tooltip:   'Test already accepted for today',
              }
            } else if (status === 'pending') {
              config = {
                label:     'Pending',
                icon:      <Clock className="h-4 w-4 mr-2" />,
                className: 'bg-amber-700/90 hover:bg-amber-700 text-white cursor-not-allowed opacity-80',
                disabled:  true,
                tooltip:   'Test is awaiting validation',
              }
            } else if (status === 'rejected') {
              config = {
                label:     'Rejected – Retry',
                icon:      <AlertTriangle className="h-4 w-4 mr-2" />,
                className: 'bg-orange-600 hover:bg-orange-700 text-white',
                disabled:  false,
                tooltip:   req.latest_test_comment || 'Previous test was rejected',
              }
            }
          }

          return (
            <div className="flex justify-end items-center gap-2 pr-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.visit(route('requirement-tests.show', req.id))}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Tests
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={config.disabled}
                      className={cn('min-w-[155px] justify-center', config.className)}
                      onClick={() => {
                        if (!config.disabled) {
                          router.visit(route('requirements.test.create', req.id))
                        }
                      }}
                    >
                      {config.icon}
                      {config.label}
                    </Button>
                  </TooltipTrigger>
                  {config.tooltip && (
                    <TooltipContent side="top">
                      <p>{config.tooltip}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        },
        size: 220,
      },
    ],
    [isToday],
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <Head title="Compliance Tests" />

      <div className="container mx-auto space-y-6 py-6 px-4 md:px-6 lg:px-8">

        {/* Header + sélecteur de date */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Tests</h1>
            <p className="text-muted-foreground mt-1.5">
              Track and manage scheduled compliance activities
            </p>
          </div>

          <div className="flex items-center gap-2 bg-muted/40 border rounded-md px-2 py-1">
            {/* Jour précédent */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const prev = new Date(selectedDate)
                prev.setDate(prev.getDate() - 1)
                handleDateSelect(prev)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Calendrier */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 px-3 min-w-[220px] justify-start font-normal"
                >
                  <CalendarIcon className="h-4 w-4 opacity-80" />
                  {formattedDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Jour suivant */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const next = new Date(selectedDate)
                next.setDate(next.getDate() + 1)
                handleDateSelect(next)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tableau principal — recherche + pagination côté serveur */}
        <ServerDataTable
          columns={columns}
          data={paginatedRequirements}
          searchPlaceholder="Search by code or title..."
          onExport={handleExport}
          exportLoading={exportLoading}
          initialState={{
            columnPinning: { right: ['actions'] },
            sorting: [{ id: 'code', desc: false }],
          }}
        />

      </div>
    </AppLayout>
  )
}