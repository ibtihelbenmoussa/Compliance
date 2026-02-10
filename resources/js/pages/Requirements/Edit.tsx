import React, { useState } from 'react'
import { Head, useForm, usePage, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import { MultiSelect } from '@/components/ui/multi-select'

type Tag = {
  id: number
  name: string
}

export default function EditRequirement() {
  const { requirement, frameworks, processes, tags, selectedTagIds } = usePage<{
    requirement: any
    frameworks: { id: number; code: string; name: string }[]
    processes: { id: number; name: string }[]
    tags: Tag[]
    selectedTagIds: string[]
  }>().props

  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const formatDateString = (date: string | null) => (date ? date.split('T')[0] : '')

  const { data, setData, put, processing } = useForm({
    code: requirement.code || '',
    title: requirement.title || '',
    description: requirement.description || '',
    type: requirement.type || 'regulatory',
    status: requirement.status || 'active',
    priority: requirement.priority || 'medium',
    frequency: requirement.frequency || 'one_time',
    framework_id: requirement.framework_id?.toString() || '',
    process_id: requirement.process_id?.toString() || '',
    owner_id: requirement.owner_id || '',
    tags: selectedTagIds || [],
    deadline: formatDateString(requirement.deadline),
    completion_date: formatDateString(requirement.completion_date),
    compliance_level: requirement.compliance_level || 'Mandatory',
    attachments: requirement.attachments || '',
  })

  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(
    data.deadline ? new Date(data.deadline) : undefined
  )
  const [completionDate, setCompletionDate] = useState<Date | undefined>(
    data.completion_date ? new Date(data.completion_date) : undefined
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/requirements/${requirement.id}`, {
      onSuccess: () => {
        setMessage('Requirement updated successfully.')
        setMessageType('success')
        setIsMessageOpen(true)
      },
      onError: () => {
        setMessage('Error updating requirement.')
        setMessageType('error')
        setIsMessageOpen(true)
      },
    })
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Requirements', href: '/requirements' },
        { title: 'Edit', href: '' },
      ]}
    >
      <Head title="Edit Requirement" />

      {/* Message Modal */}
      {isMessageOpen && message && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`bg-gray-900 border rounded-2xl p-6 w-full max-w-md shadow-2xl ${
              messageType === 'success' ? 'border-green-600' : 'border-red-600'
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-3 ${
                messageType === 'success' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {messageType === 'success' ? 'Success' : 'Error'}
            </h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsMessageOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-12 p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Requirement</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Modify an existing compliance requirement
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/requirements">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Card du formulaire */}
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
                      onChange={e => setData('code', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Title <span className="text-red-500 text-base">*</span>
                    </label>
                    <Input
                      placeholder="Data Protection Impact Assessment Requirement"
                      value={data.title}
                      onChange={e => setData('title', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Type <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select value={data.type} onValueChange={v => setData('type', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="contractual">Contractual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Status <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Priority <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select value={data.priority} onValueChange={v => setData('priority', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Frequency <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select value={data.frequency} onValueChange={v => setData('frequency', v)}>
                      <SelectTrigger className="h-11">
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Framework <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.framework_id}
                      onValueChange={v => setData('framework_id', v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks.map(fw => (
                          <SelectItem key={fw.id} value={fw.id.toString()}>
                            {fw.code} - {fw.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Process</label>
                    <Select
                      value={data.process_id || 'none'}
                      onValueChange={v => setData('process_id', v === 'none' ? '' : v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select process (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {processes.map(proc => (
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
                    onChange={e => setData('description', e.target.value)}
                    className="min-h-[160px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Compliance Level <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.compliance_level}
                      onValueChange={v => setData('compliance_level', v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mandatory">Mandatory</SelectItem>
                        <SelectItem value="Recommended">Recommended</SelectItem>
                        <SelectItem value="Optional">Optional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deadline</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadlineDate ? format(deadlineDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={deadlineDate}
                          onSelect={d => {
                            setDeadlineDate(d)
                            setData('deadline', d ? formatDateString(d.toISOString()) : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
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
                          {completionDate ? format(completionDate, 'PPP') : 'Optional'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={completionDate}
                          onSelect={d => {
                            setCompletionDate(d)
                            setData('completion_date', d ? formatDateString(d.toISOString()) : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Tags</label>
                  <MultiSelect
                    options={tags.map(tag => ({ value: tag.id.toString(), label: tag.name }))}
                    defaultValue={selectedTagIds}
                    onValueChange={(values: string[]) => setData('tags', values)}
                    placeholder="Select relevant tags..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Attachments (URLs)</label>
                  <Textarea
                    placeholder="Paste one or more document URLs (one per line)\nExamples:\nhttps://drive.google.com/...\nhttps://company.sharepoint.com/..."
                    value={data.attachments}
                    onChange={e => setData('attachments', e.target.value)}
                    className="min-h-[120px] resize-y"
                  />
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
                  className="min-w-[200px] font-medium"
                >
                  {processing ? 'Updating...' : 'Update Requirement'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}