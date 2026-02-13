import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Requirement {
  id: number
  code: string
  title: string
  frequency: string
  deadline?: string | null
  framework?: { code: string; name: string } | null
  process?: { name: string } | null
  tags?: string[]
}

interface Props {
  date: string          // YYYY-MM-DD initial
  requirements: Requirement[]
}

export default function RequirementTestsIndex({ date: initialDate, requirements }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate))

  const formattedDate = format(selectedDate, 'EEEE, MMMM d, yyyy') // ex: Friday, February 13, 2026

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  // Quand on sélectionne une nouvelle date dans le calendrier
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate)
      const dateStr = format(newDate, 'yyyy-MM-dd')
      router.visit(`/requirements/testing?date=${dateStr}`, { preserveState: true })
    }
  }

  return (
    <AppLayout>
      <Head title="Requirement Tests" />

      <div className="p-6 md:p-8 lg:p-10 space-y-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Requirement Tests
            </h1>
            <p className="text-base text-muted-foreground">
              Select a date to view and manage scheduled compliance tests
            </p>
          </div>

          {/* Barre avec calendrier picker */}
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal border-border/50 bg-background/80 backdrop-blur-sm shadow-sm",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary/70" />
                  {formattedDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border/50 shadow-xl">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm"
                />
              </PopoverContent>
            </Popover>

            {/* Flèches rapides (optionnelles) */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-accent/70 transition-colors"
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
                className="h-10 w-10 rounded-full hover:bg-accent/70 transition-colors"
                onClick={() => {
                  const next = new Date(selectedDate)
                  next.setDate(next.getDate() + 1)
                  handleDateSelect(next)
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {requirements.length === 0 ? (
          <div className="bg-muted/20 border border-border/30 rounded-2xl p-12 text-center shadow-md">
            <AlertCircle className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-70" />
            <h3 className="text-2xl font-semibold text-foreground mb-3">
              No Tests Scheduled
            </h3>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              There are no requirements due for testing on the selected date.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {requirements.map((req, index) => (
              <div
                key={req.id}
                className={cn(
                  "group relative bg-card border border-border/40 rounded-2xl p-6 shadow-md transition-all duration-300",
                  "hover:shadow-xl hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10"
                )}
              >
                <div className="relative space-y-5">
                  {/* Titre + icône */}
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <CalendarIcon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {req.code} — {req.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs capitalize px-3 py-0.5">
                            {req.frequency.replace('_', ' ')}
                          </Badge>
                          {req.framework && (
                            <Badge variant="secondary" className="text-xs px-3 py-0.5">
                              {req.framework.code}
                            </Badge>
                          )}
                          {req.process && (
                            <Badge variant="outline" className="text-xs px-3 py-0.5">
                              {req.process.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bouton Add Test */}
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-red-500/30 transition-all duration-300 min-w-[130px]"
                      onClick={() => router.visit(`/requirements/${req.id}/test`)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Test
                    </Button>
                  </div>

                  {/* Deadline */}
                  {req.deadline && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/40 rounded-lg px-4 py-2">
                      <CalendarIcon className="h-4 w-4 text-primary/70" />
                      <span>Deadline: {new Date(req.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {Array.isArray(req.tags) && req.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {req.tags.slice(0, 5).map((tag, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs px-3 py-1 bg-muted/70 border border-muted-foreground/20 rounded-full"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {req.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs px-3 py-1 rounded-full">
                          +{req.tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}