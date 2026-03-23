import { Head, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  CheckCircle,
  XCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Test {
  id: number
  test_code: string
  status: string
  comment?: string
  evidence?: any
  test_date?: string
  validation_status: 'pending' | 'accepted' | 'rejected'
  validation_comment?: string
  created_at: string
  requirement?: {
    code: string
    title: string
  }
}

interface Props {
  tests: {
    data: Test[]
    links: any
    meta: any
  }
}

// ── Helpers ──────────────────────────────────────────────────

const getValidationBadge = (status: Test['validation_status']) => {
  switch (status) {
    case 'accepted':
      return (
        <Badge className="bg-emerald-950/60 text-emerald-300 border border-emerald-700 gap-1.5 px-3 py-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Accepted
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-950/60 text-red-300 border border-red-700 gap-1.5 px-3 py-1">
          <XCircle className="h-3.5 w-3.5" />
          Rejected
        </Badge>
      )
    default:
      return (
        <Badge className="bg-amber-950/60 text-amber-300 border border-amber-700 gap-1.5 px-3 py-1">
          <Clock className="h-3.5 w-3.5" />
          Pending
        </Badge>
      )
  }
}

// ── Filter type ───────────────────────────────────────────────
type FilterType = 'all' | 'pending' | 'accepted' | 'rejected'

// ── Main Component ────────────────────────────────────────────

export default function Validation({ tests }: Props) {
  const [modalOpen, setModalOpen]         = useState(false)
  const [selectedTest, setSelectedTest]   = useState<Test | null>(null)
  const [actionType, setActionType]       = useState<'accept' | 'reject' | null>(null)
  const [rejectComment, setRejectComment] = useState('')
  const [processing, setProcessing]       = useState(false)
  const [activeFilter, setActiveFilter]   = useState<FilterType>('all')

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    const all      = tests.data
    const total    = all.length
    const pending  = all.filter(t => t.validation_status === 'pending').length
    const accepted = all.filter(t => t.validation_status === 'accepted').length
    const rejected = all.filter(t => t.validation_status === 'rejected').length
    return { total, pending, accepted, rejected }
  }, [tests.data])

  // ── Filtered data ─────────────────────────────────────────
  const filteredTests = useMemo(() => {
    if (activeFilter === 'all') return tests.data
    return tests.data.filter(t => t.validation_status === activeFilter)
  }, [tests.data, activeFilter])

  // ── Modal helpers ─────────────────────────────────────────
  const openModal = (test: Test, type: 'accept' | 'reject') => {
    setSelectedTest(test)
    setActionType(type)
    setRejectComment('')
    setModalOpen(true)
  }

  const handleAction = () => {
    if (!selectedTest || !actionType) return
    if (actionType === 'reject' && !rejectComment.trim()) {
      alert('Rejection reason is required')
      return
    }

    setProcessing(true)
    const routeName = actionType === 'accept'
      ? 'requirement-tests.accept'
      : 'requirement-tests.reject'

    router.patch(
      route(routeName, selectedTest.id),
      { comment: actionType === 'reject' ? rejectComment : undefined },
      {
        preserveScroll: true,
        onSuccess: () => {
          setModalOpen(false)
          setSelectedTest(null)
          setActionType(null)
          setRejectComment('')
          setProcessing(false)
        },
        onError: (errors) => {
          console.error('Validation error:', errors)
          setProcessing(false)
        },
      },
    )
  }

  // ── Stat cards config ─────────────────────────────────────
  const statCards = [
    {
      label:    'Total',
      count:    stats.total,
      barColor: 'bg-blue-500',
      icon:     ClipboardList,
      percent:  100,
    },
    {
      label:    'Pending',
      count:    stats.pending,
      barColor: 'bg-amber-500',
      icon:     Clock,
      percent:  stats.total ? Math.round((stats.pending  / stats.total) * 100) : 0,
    },
    {
      label:    'Accepted',
      count:    stats.accepted,
      barColor: 'bg-emerald-500',
      icon:     ShieldCheck,
      percent:  stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0,
    },
    {
      label:    'Rejected',
      count:    stats.rejected,
      barColor: 'bg-red-500',
      icon:     ShieldX,
      percent:  stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0,
    },
  ]

  // ── Filter tabs config ────────────────────────────────────
  const filterTabs: {
    key: FilterType
    label: string
    count: number
    activeClass: string
  }[] = [
    {
      key:         'all',
      label:       'All',
      count:       stats.total,
      activeClass: 'bg-blue-600 text-white border-blue-600',
    },
    {
      key:         'pending',
      label:       'Pending',
      count:       stats.pending,
      activeClass: 'bg-amber-600 text-white border-amber-600',
    },
    {
      key:         'accepted',
      label:       'Accepted',
      count:       stats.accepted,
      activeClass: 'bg-emerald-700 text-white border-emerald-700',
    },
    {
      key:         'rejected',
      label:       'Rejected',
      count:       stats.rejected,
      activeClass: 'bg-red-700 text-white border-red-700',
    },
  ]

  // ── Empty state messages ──────────────────────────────────
  const emptyState: Record<FilterType, { icon: React.ReactNode; title: string; sub: string }> = {
    all: {
      icon:  <ClipboardList className="h-8 w-8 text-muted-foreground" />,
      title: 'No tests found',
      sub:   'Tests will appear here once they are submitted',
    },
    pending: {
      icon:  <Clock className="h-8 w-8 text-amber-400" />,
      title: 'No tests pending validation',
      sub:   'Tests will appear here once they are submitted',
    },
    accepted: {
      icon:  <ShieldCheck className="h-8 w-8 text-emerald-400" />,
      title: 'No accepted tests yet',
      sub:   'Try switching to a different filter',
    },
    rejected: {
      icon:  <ShieldX className="h-8 w-8 text-red-400" />,
      title: 'No rejected tests — all tests passed validation',
      sub:   'Try switching to a different filter',
    },
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <AppLayout>
      <Head title="Test Validation" />

      <div className="container mx-auto space-y-6 py-6 px-4 md:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Validation</h1>
            <p className="text-muted-foreground mt-1.5">
              Review and validate compliance test results
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/60 bg-card px-5 py-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </div>
              <div className="text-3xl font-bold">
                {stat.count}
                {i > 0 && (
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    ({stat.percent}%)
                  </span>
                )}
              </div>
              <div className="h-1 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', stat.barColor)}
                  style={{ width: `${stat.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-150',
                activeFilter === tab.key
                  ? tab.activeClass
                  : 'border-border/60 text-muted-foreground bg-muted/20 hover:bg-muted/40 hover:text-foreground',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full text-xs font-semibold min-w-[20px] h-5 px-1.5',
                  activeFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm">
          {/* Table header – COLONNE STATUS SUPPRIMÉE */}
          <div className="grid grid-cols-[130px_140px_1fr_130px_150px_160px] gap-4 px-5 py-3 bg-muted/40 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>Validation</span>
            <span>Test Code</span>
            <span>Requirement</span>
            <span>Date</span>
            <span>Comment</span>
            <span className="text-right">Actions</span>
          </div>

          {filteredTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="p-4 rounded-full bg-muted/40">
                {emptyState[activeFilter].icon}
              </div>
              <p className="text-muted-foreground font-medium">
                {emptyState[activeFilter].title}
              </p>
              <p className="text-sm text-muted-foreground/60">
                {emptyState[activeFilter].sub}
              </p>
            </div>
          ) : (
            filteredTests.map((test, idx) => (
              <div
                key={test.id}
                className={cn(
                  'grid grid-cols-[130px_140px_1fr_130px_150px_160px] gap-4 px-5 py-4 items-center',
                  'border-b last:border-0 transition-colors hover:bg-muted/20',
                  idx % 2 === 0 ? 'bg-background' : 'bg-muted/5',
                )}
              >
                <div>{getValidationBadge(test.validation_status)}</div>

                <div className="font-mono text-sm font-medium">
                  {test.test_code || '—'}
                </div>

                <div className="min-w-0">
                  {test.requirement ? (
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {test.requirement.code}
                      </span>
                      <p className="text-sm font-medium truncate">
                        {test.requirement.title}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {test.test_date
                    ? format(new Date(test.test_date), 'MMM d, yyyy', { locale: enUS })
                    : '—'}
                </div>

                <div
                  className="text-sm text-muted-foreground truncate max-w-[140px]"
                  title={test.comment || undefined}
                >
                  {test.comment || '—'}
                </div>

                <div className="flex justify-end gap-2">
                  {test.validation_status === 'pending' ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-700 hover:bg-emerald-600 text-white gap-1.5"
                        onClick={() => openModal(test, 'accept')}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-700 text-red-400 hover:bg-red-950/40 gap-1.5"
                        onClick={() => openModal(test, 'reject')}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground italic pr-2">
                      {test.validation_status === 'accepted' ? '✓ Validated' : '✗ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Validation Modal ───────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {actionType === 'accept' ? (
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              ) : (
                <ShieldX className="h-5 w-5 text-red-400" />
              )}
              Test Validation
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="rounded-lg border border-border/60 bg-muted/20 px-5 py-4 space-y-2">
              <p className="font-mono text-sm text-muted-foreground">
                {selectedTest?.test_code}
              </p>
              <p className="font-medium">
                {selectedTest?.requirement?.title || 'Compliance Test'}
              </p>
            </div>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setActionType('accept')}
                className={cn(
                  'flex flex-col items-center gap-2 px-8 py-5 rounded-xl border-2 transition-all duration-200',
                  actionType === 'accept'
                    ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 scale-105 shadow-lg shadow-emerald-950/50'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-emerald-700 hover:text-emerald-400',
                )}
              >
                <CheckCircle className="h-8 w-8" />
                <span className="font-semibold text-sm">Accept</span>
              </button>

              <button
                onClick={() => setActionType('reject')}
                className={cn(
                  'flex flex-col items-center gap-2 px-8 py-5 rounded-xl border-2 transition-all duration-200',
                  actionType === 'reject'
                    ? 'border-red-500 bg-red-950/50 text-red-300 scale-105 shadow-lg shadow-red-950/50'
                    : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-red-700 hover:text-red-400',
                )}
              >
                <XCircle className="h-8 w-8" />
                <span className="font-semibold text-sm">Reject</span>
              </button>
            </div>

            {actionType === 'reject' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="flex items-center gap-1.5 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Rejection reason
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  placeholder="Explain why this test is being rejected..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              disabled={!actionType || processing}
              onClick={handleAction}
              className={cn(
                'min-w-[140px]',
                actionType === 'accept'
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  : actionType === 'reject'
                  ? 'bg-red-700 hover:bg-red-600 text-white'
                  : '',
              )}
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                  </svg>
                  Saving...
                </span>
              ) : actionType === 'accept' ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Confirm Accept
                </span>
              ) : actionType === 'reject' ? (
                <span className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Confirm Reject
                </span>
              ) : (
                'Select an action'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}