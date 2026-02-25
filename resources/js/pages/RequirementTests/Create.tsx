import { Head, useForm, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { useState } from 'react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Framework {
  id: number
  code: string
  name: string
}

interface Requirement {
  id: number
  code: string
  title: string
  framework?: Framework | null
}

interface Props {
  requirement: Requirement
}

export default function Create({ requirement }: Props) {
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    test_code: '',
    name: '',
    objective: '',
    procedure: '',
    status: 'pending',
    result: '',
    evidence: '',
    effective_date: '' as string,
    efficacy: '',
  })

  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(undefined)

  const validateForm = () => {
    let isValid = true
    clearErrors()

    if (!data.test_code.trim()) {
      setError('test_code', 'Test Code is required')
      isValid = false
    }

    if (!data.name.trim()) {
      setError('name', 'Name is required')
      isValid = false
    }

    if (!data.objective.trim()) {
      setError('objective', 'Objective is required')
      isValid = false
    }

    if (!data.procedure.trim()) {
      setError('procedure', 'Procedure is required')
      isValid = false
    }

    if (!data.status) {
      setError('status', 'Status is required')
      isValid = false
    }

    if (!data.result) {
      setError('result', 'Result is required')
      isValid = false
    }

    if (!data.efficacy) {
      setError('efficacy', 'Efficacy is required')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    post(route('requirements.test.store', requirement.id), {
      onSuccess: () => {
        router.visit(route('requirement-tests.index'))
      },
    })
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Compliance Tests', href: '/req-testing' },
        { title: 'Create', href: '' },
        
      ]}
    >
      <Head title="New Compliance Test" />

      <div className="space-y-12 p-6 lg:p-10">
        {/* Header – identique à CreateRequirement */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Compliance Test</h1>
            <div className="mt-3 space-y-2">
              <p className="text-lg text-foreground/90">
                <span className="font-semibold">{requirement.code}</span> — {requirement.title}
              </p>
              {requirement.framework && (
                <div className="inline-flex items-center gap-3 bg-background/70 px-4 py-2 rounded-full border border-border/60">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {requirement.framework.code}
                  </Badge>
                  <span className="text-sm text-muted-foreground font-medium">
                    {requirement.framework.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <a href={route('requirement-tests.index')}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to List
            </a>
          </Button>
        </div>

        {/* Formulaire – structure et style identiques à CreateRequirement */}
        <Card className="border-none shadow-2xl bg-gradient-to-b from-card to-card/90 backdrop-blur-sm">
          <CardContent className="pt-10 pb-14 px-6 md:px-12 lg:px-16">
            <form onSubmit={handleSubmit} className="space-y-16">
              {/* Basic Information */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="test_code" className="text-sm font-medium flex items-center gap-1.5">
                      Test Code <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Input
                      id="test_code"
                      placeholder="TEST-2025-001"
                      value={data.test_code}
                      onChange={e => {
                        setData('test_code', e.target.value.trim().toUpperCase())
                        if (errors.test_code) clearErrors('test_code')
                      }}
                      className={cn(
                        "h-11 text-base",
                        errors.test_code && "border-red-500 focus-visible:ring-red-500"
                      )}
                      maxLength={50}
                    />
                    {errors.test_code && <p className="text-red-600 text-sm mt-1.5">{errors.test_code}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                      Name / Summary <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Quarterly access rights review"
                      value={data.name}
                      onChange={e => {
                        setData('name', e.target.value)
                        if (errors.name) clearErrors('name')
                      }}
                      className={cn(
                        "h-11 text-base",
                        errors.name && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1.5">{errors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium flex items-center gap-1.5">
                      Status <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Select
                      value={data.status}
                      onValueChange={v => {
                        setData('status', v)
                        if (errors.status) clearErrors('status')
                      }}
                    >
                      <SelectTrigger className={cn("h-11", errors.status && "border-red-500")}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-600 text-sm mt-1.5">{errors.status}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="result" className="text-sm font-medium flex items-center gap-1.5">
                      Result <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Select
                      value={data.result}
                      onValueChange={v => {
                        setData('result', v)
                        if (errors.result) clearErrors('result')
                      }}
                    >
                      <SelectTrigger className={cn("h-11", errors.result && "border-red-500")}>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="non_compliant">Non-compliant</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.result && <p className="text-red-600 text-sm mt-1.5">{errors.result}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="efficacy" className="text-sm font-medium flex items-center gap-1.5">
                      Efficacy <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Select
                      value={data.efficacy}
                      onValueChange={v => {
                        setData('efficacy', v)
                        if (errors.efficacy) clearErrors('efficacy')
                      }}
                    >
                      <SelectTrigger className={cn("h-11", errors.efficacy && "border-red-500")}>
                        <SelectValue placeholder="Select efficacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="effective">Effective</SelectItem>
                        <SelectItem value="partially_effective">Partially Effective</SelectItem>
                        <SelectItem value="ineffective">Ineffective</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.efficacy && <p className="text-red-600 text-sm mt-1.5">{errors.efficacy}</p>}
                  </div>
                </div>
              </div>

              {/* Test Details */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Test Details
                </h2>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="objective" className="text-sm font-medium flex items-center gap-1.5">
                      Objective <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Textarea
                      id="objective"
                      placeholder="Define what this test aims to verify..."
                      value={data.objective}
                      onChange={e => {
                        setData('objective', e.target.value)
                        if (errors.objective) clearErrors('objective')
                      }}
                      className={cn(
                        "min-h-[120px] resize-y",
                        errors.objective && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.objective && <p className="text-red-600 text-sm mt-1.5">{errors.objective}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="procedure" className="text-sm font-medium flex items-center gap-1.5">
                      Procedure / Steps <span className="text-red-500 text-base">*</span>
                    </Label>
                    <Textarea
                      id="procedure"
                      placeholder="Step-by-step instructions to perform the test..."
                      value={data.procedure}
                      onChange={e => {
                        setData('procedure', e.target.value)
                        if (errors.procedure) clearErrors('procedure')
                      }}
                      className={cn(
                        "min-h-[160px] resize-y",
                        errors.procedure && "border-red-500 focus-visible:ring-red-500"
                      )}
                    />
                    {errors.procedure && <p className="text-red-600 text-sm mt-1.5">{errors.procedure}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="evidence" className="text-sm font-medium">
                      Evidence / Proof
                    </Label>
                    <Textarea
                      id="evidence"
                      placeholder="Screenshots, logs, documents, links... (one per line if multiple)"
                      value={data.evidence}
                      onChange={e => setData('evidence', e.target.value)}
                      className="min-h-[140px] resize-y"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      Effective Test Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-11",
                            !effectiveDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {effectiveDate
                            ? format(effectiveDate, 'MMM dd, yyyy')
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={effectiveDate}
                          onSelect={date => {
                            setEffectiveDate(date)
                            setData('effective_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-12 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => router.visit(route('requirement-tests.index'))}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={processing}
                  size="lg"
                  className="min-w-[220px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                      </svg>
                      Creating...
                    </span>
                  ) : 'Create Test'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}