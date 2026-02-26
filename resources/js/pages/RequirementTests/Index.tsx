import { useState, useMemo } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Key,
  FileText,
  RefreshCw,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

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

export default function RequirementTestsIndex({ date: initialDate, requirements: rawRequirements }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const initial = new Date(initialDate)
    return isNaN(initial.getTime()) ? new Date() : initial
  })

  const formattedDate = useMemo(() => {
    return !isNaN(selectedDate.getTime())
      ? format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: enUS })
      : 'Select a date'
  }, [selectedDate])

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate || isNaN(newDate.getTime())) return

    setSelectedDate(newDate)
    const dateStr = format(newDate, 'yyyy-MM-dd')

    router.visit(route('req-testing.index'), {
      data: { date: dateStr },
      preserveState: true,
      preserveScroll: true,
      replace: true,
    })
  }

  const requirements = useMemo(() => {
    return [...(rawRequirements ?? [])]
      .map((req) => ({
        ...req,
        tags: Array.isArray(req.tags) ? req.tags : [],
        framework: req.framework ?? null,
        process: req.process ?? null,
      }))
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [rawRequirements])

  const getFrequencyBadgeClasses = (frequency: string) => {
    const f = (frequency || '').toLowerCase().trim()

    const styles: Record<string, string> = {
      daily: 'border-blue-600 bg-blue-950/50 text-blue-200',
      weekly: 'border-violet-600 bg-violet-950/50 text-violet-200',
      monthly: 'border-amber-600 bg-amber-950/50 text-amber-200',
      quarterly: 'border-cyan-600 bg-cyan-950/50 text-cyan-200',
      yearly: 'border-emerald-600 bg-emerald-950/50 text-emerald-200',
      annual: 'border-emerald-600 bg-emerald-950/50 text-emerald-200',
      'one time': 'border-indigo-600 bg-indigo-950/50 text-indigo-200',
      'one-time': 'border-indigo-600 bg-indigo-950/50 text-indigo-200',
      onetime: 'border-indigo-600 bg-indigo-950/50 text-indigo-200',
      recurring: 'border-green-600 bg-green-950/50 text-green-200',
      'ad hoc': 'border-gray-600 bg-gray-800/50 text-gray-300',
    }

    for (const [key, value] of Object.entries(styles)) {
      if (f.includes(key)) return value
    }

    return 'border-gray-700 bg-gray-900/40 text-gray-300'
  }

  const columns: ColumnDef<Requirement>[] = [
    {
      id: 'status',
      header: "Status",
      cell: ({ row }) => {
        const deadlineStr = row.original.deadline

        // Sans deadline → on affiche "Validé" en vert (très utile pour les nouveaux tests)
        if (!deadlineStr) {
          return (
            <div className="flex items-center gap-1.5 justify-center text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Validé</span>
            </div>
          )
        }

        const deadline = new Date(deadlineStr)
        if (isNaN(deadline.getTime())) {
          return <span className="text-red-400 text-lg">⚠</span>
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
          return (
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="text-lg font-bold">⚠</span>
              <span className="text-xs font-medium">Overdue</span>
            </div>
          )
        }

        if (diffDays <= 3) {
          return (
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="text-lg">⏳</span>
              <span className="text-xs font-medium">{diffDays}d left</span>
            </div>
          )
        }

        return (
          <div className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">On track</span>
          </div>
        )
      },
      enableSorting: false,
      size: 130,
    },

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
          {row.getValue('title') as string}
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
        const freq = row.getValue('frequency') as string | undefined
        const display = freq
          ? freq.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          : '—'

        return (
          <Badge
            variant="outline"
            className={cn(
              'capitalize font-medium px-2.5 py-0.5 border min-w-[100px] text-center',
              getFrequencyBadgeClasses(freq || '')
            )}
          >
            {display}
          </Badge>
        )
      },
    },

    {
      id: 'framework',
      accessorFn: (row) => (row.framework ? `${row.framework.code} — ${row.framework.name}` : '—'),
      header: ({ column }) => (
        <div className="flex items-center gap-1.5">
          <DataTableColumnHeader column={column} title="Framework" />
        </div>
      ),
      cell: ({ row }) => {
        const fw = row.original.framework
        if (!fw) return <span className="text-muted-foreground">—</span>

        const initials = fw.code
          ? fw.code.slice(0, 3).toUpperCase()
          : fw.name.slice(0, 2).toUpperCase()

        const hue = (fw.id * 47) % 360
        const bgColor = `hsl(${hue}, 70%, 48%)`

        return (
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: bgColor }}
            >
              {initials}
            </div>
            <span className="text-muted-foreground truncate max-w-[160px]">{fw.code} — {fw.name}</span>
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
        const deadlineStr = row.original.deadline
        if (!deadlineStr) return <span className="text-muted-foreground">—</span>

        const date = new Date(deadlineStr)
        if (isNaN(date.getTime())) return <span className="text-red-400">Invalid</span>

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        let colorClass = 'text-muted-foreground'
        if (diffDays < 0) colorClass = 'text-red-400 font-medium'
        else if (diffDays <= 3) colorClass = 'text-amber-400 font-medium'
        else colorClass = 'text-emerald-400'

        return <span className={colorClass}>{format(date, 'MMM d, yyyy', { locale: enUS })}</span>
      },
    },

    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex justify-end pr-2">
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              router.visit(route('requirements.test.create', row.original.id))
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <Head title="Compliance Tests" />

      <div className="min-h-screen space-y-6 p-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Tests</h1>
            <p className="text-muted-foreground">Track and manage scheduled compliance activities</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-muted/40 border rounded-md px-2 py-1">
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
          </div>
        </div>

        <div className="pt-4">
          <ServerDataTable
            columns={columns}
            data={requirements}
            searchPlaceholder="Search by code or title..."
            initialState={{
              columnPinning: { right: ['actions'] },
            }}
          />
        </div>
      </div>
    </AppLayout>
  )
}