import { useState, useMemo } from 'react'
import { Head, router, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
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
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Key,
  FileText,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
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
import { Card, CardContent } from '@/components/ui/card'

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
  status?: 'pending' | 'in_progress' | 'completed'
}

interface Props {
  date: string
  requirements: Requirement[]
}

type ViewMode = 'table' | 'board'

export default function RequirementTestsIndex({ date: initialDate, requirements }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate))
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy', { locale: enUS })

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate)
      const dateStr = format(newDate, 'yyyy-MM-dd')
      router.visit(`/requirements/testing?date=${dateStr}`, {
        preserveState: true,
        preserveScroll: true,
      })
    }
  }

  const normalizedRequirements = useMemo(() => {
    return [...requirements]
      .map(req => ({
        ...req,
        tags: Array.isArray(req.tags) ? req.tags : [],
        framework: req.framework ?? null,
        process: req.process ?? null,
      }))
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [requirements])

  const groupedByFrequency = useMemo(() => {
    const groups: Record<string, Requirement[]> = {}
    normalizedRequirements.forEach(req => {
      const freq = req.frequency?.toLowerCase() || 'other'
      groups[freq] = groups[freq] || []
      groups[freq].push(req)
    })
    return groups
  }, [normalizedRequirements])

  const frequencyOrder = [
    'continuous',
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly',
    'one_time',
    'other',
  ]

  const hasRequirements = normalizedRequirements.length > 0

  return (
    <AppLayout>
      <Head title="Compliance Tests" />

      <div className="p-6 md:p-8 lg:p-10 space-y-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Compliance Tests
              </h1>
              <p className="mt-4 text-xl text-muted-foreground font-medium">
                Track and manage scheduled compliance activities
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Date Picker + Navigation */}
              <div className="flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border/50 rounded-xl px-4 py-2 shadow-lg">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                  const prev = new Date(selectedDate)
                  prev.setDate(prev.getDate() - 1)
                  handleDateSelect(prev)
                }}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="px-3 min-w-[220px] justify-start font-normal hover:bg-transparent">
                      <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
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

                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                  const next = new Date(selectedDate)
                  next.setDate(next.getDate() + 1)
                  handleDateSelect(next)
                }}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* View Toggle */}
              <div className="inline-flex rounded-xl border bg-card/80 backdrop-blur-md shadow-lg overflow-hidden">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none px-6 py-5"
                  onClick={() => setViewMode('table')}
                >
                  <TableIcon className="mr-2 h-5 w-5" />
                  Table
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none px-6 py-5 border-l border-border/50"
                  onClick={() => setViewMode('board')}
                >
                  <LayoutGrid className="mr-2 h-5 w-5" />
                  Board
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!hasRequirements ? (
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-16 text-center shadow-lg">
            <AlertCircle className="h-24 w-24 mx-auto mb-8 text-muted-foreground/60" />
            <h3 className="text-4xl font-bold mb-4 text-foreground/90">No Tests Scheduled</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              There are no requirements scheduled for testing on this date.
            </p>
          </Card>
        ) : viewMode === 'table' ? (
          <TableView requirements={normalizedRequirements} />
        ) : (
          <BoardView grouped={groupedByFrequency} order={frequencyOrder} />
        )}
      </div>
    </AppLayout>
  )
}

// ─── Table View avec glassmorphism ──────────────────────────────────────

function TableView({ requirements }: { requirements: Requirement[] }) {
  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5 backdrop-blur-sm border-b border-white/10">
          <TableRow>
            <TableHead className="w-[140px] font-semibold text-foreground/90">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Code
              </div>
            </TableHead>
            <TableHead className="font-semibold text-foreground/90">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Title
              </div>
            </TableHead>
            <TableHead className="w-[140px] font-semibold text-foreground/90">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Frequency
              </div>
            </TableHead>
            <TableHead className="w-[160px] font-semibold text-foreground/90">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Framework
              </div>
            </TableHead>
            <TableHead className="w-[140px] font-semibold text-foreground/90">
              Deadline
            </TableHead>
            <TableHead className="w-[120px] font-semibold text-right text-foreground/90">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map(req => (
            <TableRow
              key={req.id}
              className="hover:bg-white/10 transition-colors cursor-pointer group border-b border-white/5 last:border-none"
              onClick={() => router.visit(`/requirements/${req.id}`)}
            >
              <TableCell className="font-mono font-medium text-foreground/90">{req.code}</TableCell>
              <TableCell className="font-medium group-hover:text-primary transition-colors">
                <Link href={`/requirements/${req.id}`} className="hover:underline">
                  {req.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-white/5 backdrop-blur-sm border-white/20 text-foreground/80 capitalize px-3 py-1">
                  {req.frequency.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                {req.framework ? (
                  <Badge variant="secondary" className="bg-white/5 backdrop-blur-sm border-white/20 px-3 py-1">
                    {req.framework.code}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {req.deadline ? format(new Date(req.deadline), 'MMM d, yyyy', { locale: enUS }) : '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 hover:border-white/30 transition-all gap-1.5 shadow-sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    router.visit(route('requirements.test.create', req.id))
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Test
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

// ─── Board View avec glassmorphism + status pills ───────────────────────

function BoardView({
  grouped,
  order,
}: {
  grouped: Record<string, Requirement[]>
  order: string[]
}) {
  return (
    <div className="overflow-x-auto pb-10">
      <div className="flex gap-6 min-w-max">
        {order.map(freq => {
          const items = grouped[freq] || []
          if (items.length === 0) return null

          const title = freq === 'one_time'
            ? 'One-Time'
            : freq === 'other'
            ? 'Other'
            : freq.charAt(0).toUpperCase() + freq.slice(1).replace('_', ' ')

          return (
            <Card
              key={freq}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl w-[420px] flex flex-col shadow-lg overflow-hidden min-h-[600px] hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-foreground/90">{title}</h3>
                  <Badge variant="secondary" className="bg-white/10 backdrop-blur-md border-white/20 px-4 py-1.5 text-base">
                    {items.length}
                  </Badge>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                {items.map(req => (
                  <Card
                    key={req.id}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-md hover:shadow-xl hover:border-white/20 transition-all duration-300 cursor-pointer"
                    onClick={() => router.visit(`/requirements/${req.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="space-y-2 flex-1">
                        <div className="font-bold text-lg group-hover:text-primary transition-colors">
                          {req.code} — {req.title}
                        </div>
                        {req.deadline && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(req.deadline), 'MMM d, yyyy', { locale: enUS })}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 hover:border-white/30 transition-all gap-2 shadow-sm"
                        onClick={e => {
                          e.stopPropagation()
                          router.visit(route('requirements.test.create', req.id))
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Test
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {req.framework && (
                        <Badge variant="secondary" className="bg-white/10 backdrop-blur-md border-white/20 px-3 py-1 text-xs">
                          {req.framework.code}
                        </Badge>
                      )}
                      {req.process && (
                        <Badge variant="outline" className="bg-white/5 backdrop-blur-sm border-white/20 px-3 py-1 text-xs">
                          {req.process.name}
                        </Badge>
                      )}
                      {Array.isArray(req.tags) && req.tags.length > 0 && (
                        <>
                          {req.tags.slice(0, 3).map(tag => (
                            <Badge key={tag.id} variant="outline" className="bg-white/5 backdrop-blur-sm border-white/20 px-3 py-1 text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {req.tags.length > 3 && (
                            <Badge variant="secondary" className="bg-white/10 backdrop-blur-md border-white/20 px-3 py-1 text-xs">
                              +{req.tags.length - 3}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>

                    {/* Status Pill */}
                    {req.status && (
                      <div className="mt-4">
                        <Badge
                          className={cn(
                            "px-4 py-1.5 text-sm font-medium flex items-center gap-2 w-fit rounded-full",
                            req.status === 'pending' && "bg-amber-500/15 text-amber-400 border-amber-500/30",
                            req.status === 'in_progress' && "bg-blue-500/15 text-blue-400 border-blue-500/30",
                            req.status === 'completed' && "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          )}
                        >
                          {req.status === 'pending' && <Clock className="h-4 w-4" />}
                          {req.status === 'in_progress' && <AlertTriangle className="h-4 w-4" />}
                          {req.status === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── Empty State ────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-16 text-center shadow-lg">
      <AlertCircle className="h-24 w-24 mx-auto mb-8 text-muted-foreground/60" />
      <h3 className="text-4xl font-bold mb-4 text-foreground/90">No Tests Scheduled</h3>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        There are no requirements scheduled for testing on this date.
      </p>
    </Card>
  )
}