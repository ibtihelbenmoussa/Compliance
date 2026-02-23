import { useState } from 'react'
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { MultiSelect } from '@/components/ui/multi-select'

// Interfaces
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

interface PageProps {
  frameworks?: Framework[]
  processes?: Process[]
  tags?: Tag[]
  flash?: { success?: string; error?: string }
  [key: string]: any
}

export default function CreateRequirement() {
  const { props } = usePage<PageProps>()

  const frameworks = props.frameworks ?? []
  const processes = props.processes ?? []
  const tags = props.tags ?? []

  const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
    code: '',
    title: '',
    description: '',
    type: '',
    status: '',
    priority: '',
    frequency: '',
    framework_id: '',
    process_id: '',
    tags: [] as string[], // array of tag IDs
    deadline: '',
    completion_date: '',
    compliance_level: '',
    attachments: '',
  })

  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined)
  const [completionDate, setCompletionDate] = useState<Date | undefined>(undefined)

  // Full form validation
  const validateForm = () => {
    let isValid = true
    clearErrors()

    // Code (required + uppercase)
    if (!data.code.trim()) {
      setError('code', 'Code is required')
      isValid = false
    } else if (data.code.trim().length < 3) {
      setError('code', 'Code must be at least 3 characters')
      isValid = false
    }

    // Title
    if (!data.title.trim()) {
      setError('title', 'Title is required')
      isValid = false
    }

    // Type
    if (!data.type) {
      setError('type', 'Type is required')
      isValid = false
    }

    // Status
    if (!data.status) {
      setError('status', 'Status is required')
      isValid = false
    }

    // Priority
    if (!data.priority) {
      setError('priority', 'Priority is required')
      isValid = false
    }

    // Frequency
    if (!data.frequency) {
      setError('frequency', 'Frequency is required')
      isValid = false
    }

    // Framework
    if (!data.framework_id) {
      setError('framework_id', 'Framework is required')
      isValid = false
    }

    // Compliance Level
    if (!data.compliance_level) {
      setError('compliance_level', 'Compliance level is required')
      isValid = false
    }

    // Deadline (optional but must be valid if filled)
    if (data.deadline && isNaN(new Date(data.deadline).getTime())) {
      setError('deadline', 'Invalid date format')
      isValid = false
    }

    return isValid
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase().trim()
    setData('code', upperValue)
    if (errors.code) clearErrors('code')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    post(route('requirements.store'), {
      onSuccess: () => {
        reset()
        setDeadlineDate(undefined)
        setCompletionDate(undefined)
      },
    })
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Requirements', href: '/requirements' },
        { title: 'Create', href: '' },
      ]}
    >
      <Head title="Create Requirement" />

      <div className="space-y-12 p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Requirement</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Add a new compliance requirement
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/requirements">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Form */}
        <Card className="border-none shadow-2xl bg-gradient-to-b from-card to-card/90 backdrop-blur-sm">
          <CardContent className="pt-10 pb-14 px-6 md:px-12 lg:px-16">
            <form onSubmit={submit} className="space-y-16">
              {/* Basic Information */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Code <span className="text-red-500 text-base">*</span>
                    </label>
                    <Input
                      placeholder="REQ-001, ART-12, GDPR-5.1..."
                      value={data.code}
                      onChange={handleCodeChange}
                      className={`h-11 ${errors.code ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      maxLength={50}
                    />
                    {errors.code && <p className="text-red-600 text-sm mt-1.5">{errors.code}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Title <span className="text-red-500 text-base">*</span>
                    </label>
                    <Input
                      placeholder="Data Protection Impact Assessment Requirement..."
                      value={data.title}
                      onChange={(e) => {
                        setData('title', e.target.value)
                        if (errors.title) clearErrors('title')
                      }}
                      className={`h-11 ${errors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {errors.title && <p className="text-red-600 text-sm mt-1.5">{errors.title}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Type <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.type}
                      onValueChange={(v) => {
                        setData('type', v)
                        if (errors.type) clearErrors('type')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.type ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="contractual">Contractual</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-600 text-sm mt-1.5">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Status <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.status}
                      onValueChange={(v) => {
                        setData('status', v)
                        if (errors.status) clearErrors('status')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.status ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-600 text-sm mt-1.5">{errors.status}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Priority <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.priority}
                      onValueChange={(v) => {
                        setData('priority', v)
                        if (errors.priority) clearErrors('priority')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.priority ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && <p className="text-red-600 text-sm mt-1.5">{errors.priority}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Frequency <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.frequency}
                      onValueChange={(v) => {
                        setData('frequency', v)
                        if (errors.frequency) clearErrors('frequency')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.frequency ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">One Time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="continuous">Continuous</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.frequency && <p className="text-red-600 text-sm mt-1.5">{errors.frequency}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Framework <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.framework_id}
                      onValueChange={(v) => {
                        setData('framework_id', v)
                        if (errors.framework_id) clearErrors('framework_id')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.framework_id ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
             <SelectContent>
  {frameworks.length > 0 ? (
    frameworks.map((fw) => (
      <SelectItem key={fw.id} value={fw.id.toString()}>
        {fw.code} - {fw.name}
      </SelectItem>
    ))
  ) : (
    <SelectItem value="none" disabled>
      No frameworks available
    </SelectItem>
  )}
</SelectContent>
                    </Select>
                    {errors.framework_id && <p className="text-red-600 text-sm mt-1.5">{errors.framework_id}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Process</label>
                    <Select
                      value={data.process_id || 'none'}
                      onValueChange={(v) => setData('process_id', v === 'none' ? '' : v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {processes.map((proc) => (
                          <SelectItem key={proc.id} value={proc.id.toString()}>
                            {proc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Context & Details */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Context & Details
                </h2>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Detailed explanation of the requirement, scope, applicability..."
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="min-h-[140px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Compliance Level <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.compliance_level}
                      onValueChange={(v) => {
                        setData('compliance_level', v)
                        if (errors.compliance_level) clearErrors('compliance_level')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.compliance_level ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mandatory">Mandatory</SelectItem>
                        <SelectItem value="Recommended">Recommended</SelectItem>
                        <SelectItem value="Optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.compliance_level && (
                      <p className="text-red-600 text-sm mt-1.5">{errors.compliance_level}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full h-11 justify-start text-left font-normal ${
                            errors.deadline ? 'border-red-500' : ''
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadlineDate ? format(deadlineDate, 'MMM dd, yyyy') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={deadlineDate}
                          onSelect={(date) => {
                            setDeadlineDate(date)
                            setData('deadline', date ? format(date, 'yyyy-MM-dd') : '')
                            if (errors.deadline) clearErrors('deadline')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.deadline && <p className="text-red-600 text-sm mt-1.5">{errors.deadline}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Completion Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {completionDate ? format(completionDate, 'MMM dd, yyyy') : 'Optional'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={completionDate}
                          onSelect={(date) => {
                            setCompletionDate(date)
                            setData('completion_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Tags</label>
                  <MultiSelect
                    options={(tags ?? []).map((tag) => ({
                      value: tag.id.toString(),
                      label: tag.name,
                    }))}
                    value={data.tags}
                    onValueChange={(selected: string[]) => setData('tags', selected)}
                    placeholder="Select relevant tags..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Attachments (URLs)</label>
                  <Textarea
                    placeholder="Paste one or more URLs (one per line)\nExamples:\nhttps://drive.google.com/...\nhttps://company.sharepoint.com/...\nhttps://example.com/policy.pdf"
                    value={data.attachments}
                    onChange={(e) => setData('attachments', e.target.value)}
                    className="min-h-[120px] resize-y"
                  />
                  {errors.attachments && (
                    <p className="text-red-600 text-sm mt-1.5">{errors.attachments}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-12 border-t">
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/requirements">Cancel</Link>
                </Button>

                <Button
                  type="submit"
                  disabled={processing}
                  size="lg"
                  className="min-w-[220px]"
                >
                  {processing ? 'Creating...' : 'Create Requirement'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}