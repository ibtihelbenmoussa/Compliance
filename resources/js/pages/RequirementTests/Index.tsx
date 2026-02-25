import { useState, useMemo } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/layouts/app-layout'
import { ServerDataTable } from '@/components/server-data-table'
import { DataTableColumnHeader } from '@/components/server-data-table-column-header'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  Key,
  FileText,
  RefreshCw,
  Building2,
  MoreHorizontal,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface Framework {
  id: number
  code: string
  name: string
}

interface Process {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

interface Requirement {
  id: number
  code: string
  title: string
  frequency: string
  deadline?: string | null
  framework?: Framework | null
  process?: Process | null
  tags?: Tag[] | null
}

interface Props {
  date: string
  requirements: Requirement[]
}

type ViewMode = 'table' | 'board'

const getFrequencyBadgeClasses = (frequency: string) => {
  const freq = (frequency || '').toLowerCase().trim()

  if (freq.includes('daily')) {
    return 'bg-gradient-to-r from-blue-950/50 to-blue-900/40 text-blue-300 border border-blue-800/50'
  }
  if (freq.includes('weekly')) {
    return 'bg-gradient-to-r from-purple-950/50 to-purple-900/40 text-purple-300 border border-purple-800/50'
  }
  if (freq.includes('monthly')) {
    return 'bg-gradient-to-r from-amber-950/50 to-amber-900/40 text-amber-300 border border-amber-800/50'
  }
  if (freq.includes('yearly') || freq.includes('annual')) {
    return 'bg-gradient-to-r from-emerald-950/50 to-emerald-900/40 text-emerald-300 border border-emerald-800/50'
  }

  return 'bg-gray-800/40 text-gray-300 border border-gray-700/50'
}

export default function RequirementTestsIndex({ date: initialDate, requirements: rawRequirements }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const initial = new Date(initialDate)
    return isNaN(initial.getTime()) ? new Date() : initial
  })

  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const formattedDate = selectedDate && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: enUS })
    : 'Select a date'

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate && !isNaN(newDate.getTime())) {
      setSelectedDate(newDate)
      const dateStr = format(newDate, 'yyyy-MM-dd')

      router.visit(route('req-testing.index'), {
        data: { date: dateStr },
        preserveState: true,
        preserveScroll: true,
        replace: true,
      })
    }
  }

  const requirements = useMemo(() => {
    return [...(rawRequirements ?? [])]
      .map(req => ({
        ...req,
        tags: Array.isArray(req.tags) ? req.tags : [],
        framework: req.framework ?? null,
        process: req.process ?? null,
      }))
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [rawRequirements])

  const columns: ColumnDef<Requirement>[] = [
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5 pl-3">
          <Key className="h-4 w-4 text-muted-foreground/70" />
          <DataTableColumnHeader column={column} title="Code" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-mono font-medium text-sm tracking-tight pl-3 py-4">
          {row.getValue('code') ?? '—'}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" className="pl-3" />,
      cell: ({ row }) => (
        <div className="py-4 pl-3 pr-4">
          <Link
            href={`/requirements/${row.original.id}`}
            className="font-medium text-foreground/90 hover:text-primary transition-colors line-clamp-2"
          >
            {row.getValue('title')}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'frequency',
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <RefreshCw className="h-4 w-4 text-muted-foreground/70" />
          <DataTableColumnHeader column={column} title="Frequency" />
        </div>
      ),
      cell: ({ row }) => {
        const frequency = row.getValue('frequency') as string
        const displayText = frequency?.replace('_', ' ') || '—'
        const badgeClasses = getFrequencyBadgeClasses(frequency)

        return (
          <div className="py-4">
            <span
              className={cn(
                'inline-flex items-center justify-center',
                'rounded-full px-3 py-1 text-xs font-medium',
                badgeClasses
              )}
            >
              {displayText}
            </span>
          </div>
        )
      },
    },
    {
      accessorFn: row => (row.framework ? `${row.framework.code} — ${row.framework.name}` : '—'),
      id: 'framework',
      header: () => <div className="pl-0.5">Framework</div>,
      cell: ({ row }) => (
        <div className="py-4 text-sm text-muted-foreground/80 line-clamp-1">
          {row.getValue('framework')}
        </div>
      ),
    },
    {
      accessorKey: 'deadline',
      header: () => (
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="h-4 w-4 text-muted-foreground/70" />
          <div>Deadline</div>
        </div>
      ),
      cell: ({ row }) => {
        const deadlineStr = row.original.deadline

        if (!deadlineStr) {
          return (
            <div className="py-4 flex items-center gap-2 text-muted-foreground/60 text-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
              —
            </div>
          )
        }

        const deadlineDate = new Date(deadlineStr)
        if (isNaN(deadlineDate.getTime())) {
          return (
            <div className="py-4 flex items-center gap-2 text-red-400/80 text-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500/60" />
              Invalid date
            </div>
          )
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const diffTime = deadlineDate.getTime() - today.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        let dotColor = 'bg-muted-foreground/40'
        let textColor = 'text-muted-foreground/80'
        let displayText = format(deadlineDate, 'MMM d, yyyy', { locale: enUS })

        if (diffDays < 0) {
          dotColor = 'bg-red-500/70'
          textColor = 'text-red-400/90 font-medium'
        } else if (diffDays <= 3) {
          dotColor = 'bg-amber-500/70'
          textColor = 'text-amber-400/90 font-medium'
        } else {
          dotColor = 'bg-emerald-500/50'
          textColor = 'text-emerald-300/90'
        }

        return (
          <div className={cn('py-4 flex items-center gap-2.5 text-sm', textColor)}>
            <span className={cn('inline-block w-2.5 h-2.5 rounded-full shadow-sm', dotColor)} />
            {displayText}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const req = row.original
        return (
          <div className="flex justify-end items-center pr-3 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-60 hover:opacity-100 hover:bg-accent/50 transition-all"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.visit(route('requirements.test.create', req.id))}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <AppLayout>
      <Head title="Compliance Tests" />

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Tests</h1>
            <p className="text-muted-foreground">Track and manage scheduled compliance activities</p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Date picker */}
            <div className="flex items-center gap-1 bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5">
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-3 min-w-[210px] justify-start font-normal">
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

            {/* View toggle */}
            <div className="border border-border/50 rounded-lg inline-flex bg-muted/30 overflow-hidden">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none px-4 border-r border-border/40"
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="mr-1.5 h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none px-4"
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid className="mr-1.5 h-4 w-4" />
                Board
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pt-1">
          {viewMode === 'table' ? (
            <div
              className={cn(
                'rounded-xl border border-border/40 bg-card/60 shadow-sm overflow-hidden',
                'backdrop-blur-[1px] transition-all duration-200'
              )}
            >
              <ServerDataTable
                columns={columns}
                data={requirements}
                initialState={{
                  columnPinning: { right: ['actions'] }
                }}
              />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {requirements.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-muted-foreground/70">
                    <LayoutGrid className="h-16 w-16 mx-auto mb-6 opacity-40" />
                    <p className="text-lg">Aucune exigence pour cette date</p>
                  </div>
                ) : (
                  requirements.map((req) => (
                    <div
                      key={req.id}
                      className={cn(
                        'p-5 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer group',
                        'hover:border-primary/40 hover:scale-[1.01]'
                      )}
                      onClick={() => router.visit(`/requirements/${req.id}`)}
                    >
                      {/* Titre */}
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {req.title}
                      </h3>

                      {/* Code + Fréquence */}
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Key className="h-3.5 w-3.5" />
                          <span className="font-mono">{req.code || '—'}</span>
                        </div>
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-xs font-medium',
                            getFrequencyBadgeClasses(req.frequency)
                          )}
                        >
                          {req.frequency?.replace('_', ' ') || '—'}
                        </span>
                      </div>

                      {/* Deadline */}
                      {req.deadline && (
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                          <CalendarIcon className="h-4 w-4" />
                          {format(new Date(req.deadline), 'MMM d, yyyy', { locale: enUS })}
                        </div>
                      )}

                      {/* Framework */}
                      {req.framework && (
                        <div className="text-xs text-muted-foreground/80 mb-2">
                          {req.framework.code} — {req.framework.name}
                        </div>
                      )}

                      {/* Bouton action rapide */}
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 opacity-70 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.visit(route('requirements.test.create', req.id))
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Test
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}