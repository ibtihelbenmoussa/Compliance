import { useState, useMemo } from 'react'
import { Head, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertCircle,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Requirement {
  id: number
  code: string
  title: string
  frequency: string
  deadline?: string | null
  framework?: { code: string; name: string } | null
  process?: { name: string } | null
  tags?: unknown[] | null | undefined
}

interface Props {
  date: string          // YYYY-MM-DD
  requirements: Requirement[]
}

type ViewMode = 'table' | 'board'

export default function RequirementTestsIndex({ date: initialDate, requirements }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate))
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy')

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate)
      const dateStr = format(newDate, 'yyyy-MM-dd')
      router.visit(`/requirements/testing?date=${dateStr}`, { preserveState: true })
    }
  }

  // Normalisation : on force tags à être toujours string[]
  const normalizedRequirements = useMemo(() => {
    return requirements.map(req => ({
      ...req,
      tags: Array.isArray(req.tags)
        ? req.tags.filter((t): t is string => typeof t === 'string')
        : [],
    }))
  }, [requirements])

  // Grouper par fréquence pour la vue Board
  const groupedByFrequency = useMemo(() => {
    const groups: Record<string, Requirement[]> = {}
    normalizedRequirements.forEach(req => {
      const freq = req.frequency || 'other'
      if (!groups[freq]) groups[freq] = []
      groups[freq].push(req)
    })
    return groups
  }, [normalizedRequirements])

  const frequencyOrder = [
    'continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one_time', 'other'
  ]

  return (
    <AppLayout>
      <Head title="Requirement Tests" />

      <div className="p-6 md:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto">
        {/* Header + Date Picker + View Toggle */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-1.5">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Requirement Tests
              </h1>
              <p className="text-muted-foreground">
                View and manage compliance tests scheduled for a specific date
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] md:w-[320px] justify-start text-left font-normal",
                      "border-border/60 bg-background/80 backdrop-blur-sm shadow-sm"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5 text-primary/70" />
                    {formattedDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Navigation rapide */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const prev = new Date(selectedDate)
                    prev.setDate(prev.getDate() - 1)
                    handleDateSelect(prev)
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const next = new Date(selectedDate)
                    next.setDate(next.getDate() + 1)
                    handleDateSelect(next)
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Toggle Table / Board */}
              <div className="border rounded-lg inline-flex bg-muted/40 shadow-sm">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-r-none px-4"
                  onClick={() => setViewMode('table')}
                >
                  <TableIcon className="mr-2 h-4 w-4" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-l-none border-l-0 px-4"
                  onClick={() => setViewMode('board')}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Board
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu selon le mode */}
        {normalizedRequirements.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'table' ? (
          <TableView requirements={normalizedRequirements} />
        ) : (
          <BoardView grouped={groupedByFrequency} order={frequencyOrder} />
        )}
      </div>
    </AppLayout>
  )
}

// ─── Composants ────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-muted/30 border border-border/40 rounded-2xl p-12 text-center shadow-inner">
      <AlertCircle className="h-16 w-16 mx-auto mb-6 text-muted-foreground/70" />
      <h3 className="text-2xl font-semibold mb-3">No Tests Scheduled</h3>
      <p className="text-muted-foreground max-w-lg mx-auto">
        There are no requirements scheduled for testing on this date.
      </p>
    </div>
  )
}

function TableView({ requirements }: { requirements: Requirement[] }) {
  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow>
            <TableHead className="w-[140px]">Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[140px]">Frequency</TableHead>
            <TableHead className="w-[160px]">Framework</TableHead>
            <TableHead className="w-[140px]">Deadline</TableHead>
            <TableHead className="w-[120px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map(req => (
            <TableRow
              key={req.id}
              className="hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => router.visit(`/requirements/${req.id}`)}
            >
              <TableCell className="font-mono font-medium">{req.code}</TableCell>
              <TableCell className="font-medium group-hover:text-primary transition-colors">
                {req.title}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {req.frequency.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                {req.framework ? (
                  <Badge variant="secondary">
                    {req.framework.code}
                  </Badge>
                ) : '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {req.deadline ? format(new Date(req.deadline), 'MMM d, yyyy') : '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={e => {
                    e.stopPropagation()
                    router.visit(`/requirements/${req.id}/test`)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Test
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function BoardView({
  grouped,
  order,
}: {
  grouped: Record<string, Requirement[]>
  order: string[]
}) {
  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-6 min-w-max">
        {order.map(freq => {
          const items = grouped[freq] || []
          if (items.length === 0) return null

          const title = freq === 'one_time'
            ? 'One-Time'
            : freq.charAt(0).toUpperCase() + freq.slice(1).replace('_', ' ')

          return (
            <div
              key={freq}
              className="bg-muted/30 border rounded-xl w-[380px] flex flex-col shadow-sm min-h-[500px]"
            >
              <div className="p-4 border-b bg-background/80 sticky top-0 backdrop-blur-sm z-10 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
              </div>

              <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                {items.map(req => (
                  <div
                    key={req.id}
                    className={cn(
                      "bg-card border rounded-lg p-5 shadow transition-all cursor-pointer",
                      "hover:shadow-lg hover:border-primary/40 hover:bg-primary/5 group"
                    )}
                    onClick={() => router.visit(`/requirements/${req.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold group-hover:text-primary transition-colors">
                          {req.code} — {req.title}
                        </div>
                        {req.deadline && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {format(new Date(req.deadline), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5"
                        onClick={e => {
                          e.stopPropagation()
                          router.visit(`/requirements/${req.id}/test`)
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Test
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {req.framework && (
                        <Badge variant="secondary" className="text-xs">
                          {req.framework.code}
                        </Badge>
                      )}
                      {req.process && (
                        <Badge variant="outline" className="text-xs">
                          {req.process.name}
                        </Badge>
                      )}

                      {/* Tags – version ultra-safe et typée */}
                      {Array.isArray(req.tags) && req.tags.length > 0 && (
                        <>
                          {req.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag as string}
                            </Badge>
                          ))}
                          {req.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{req.tags.length - 3}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}