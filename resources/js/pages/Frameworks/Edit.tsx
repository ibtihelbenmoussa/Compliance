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

export default function EditFramework() {
  const { framework, jurisdictions, tags, selectedTagIds } = usePage<{
    framework: any
    jurisdictions: { id: number; name: string }[]
    tags: { id: number; name: string }[]
    selectedTagIds: string[]
  }>().props

  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const formatDateString = (date: string | null) => (date ? date.split('T')[0] : '')

  const { data, setData, put, processing } = useForm({
    code: framework.code || '',
    name: framework.name || '',
    version: framework.version || '',
    type: framework.type || 'standard',
    status: framework.status || 'active',
    publisher: framework.publisher || '',
    jurisdiction_id: framework.jurisdiction_id?.toString() || '',
    scope: framework.scope || '',
    release_date: formatDateString(framework.release_date),
    effective_date: formatDateString(framework.effective_date),
    retired_date: formatDateString(framework.retired_date),
    description: framework.description || '',
    language: framework.language || '',
    url_reference: framework.url_reference || '',
    tags: selectedTagIds,
  })

  const [releaseDate, setReleaseDate] = useState<Date | undefined>(
    data.release_date ? new Date(data.release_date) : undefined
  )
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(
    data.effective_date ? new Date(data.effective_date) : undefined
  )
  const [retiredDate, setRetiredDate] = useState<Date | undefined>(
    data.retired_date ? new Date(data.retired_date) : undefined
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/frameworks/${framework.id}`, {
      onSuccess: () => {
        setMessage('Framework updated successfully.')
        setMessageType('success')
        setIsMessageOpen(true)
      },
      onError: () => {
        setMessage('Error updating framework.')
        setMessageType('error')
        setIsMessageOpen(true)
      },
    })
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Frameworks', href: '/frameworks' },
        { title: 'Edit', href: '' },
      ]}
    >
      <Head title="Edit Framework" />

      {/* Message Modal - même style que Create */}
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
        {/* Header - identique à Create */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Framework</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Modify an existing compliance, security or governance framework
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/frameworks">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Card du formulaire - même style que Create */}
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
                      placeholder="e.g. ISO27001, GDPR, PCI-DSS"
                      value={data.code}
                      onChange={e => setData('code', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Name <span className="text-red-500 text-base">*</span>
                    </label>
                    <Input
                      placeholder="ISO/IEC 27001:2022 Information security management systems — Requirements"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Version</label>
                    <Input
                      placeholder="e.g. v4.0, 2022, rev.2"
                      value={data.version}
                      onChange={e => setData('version', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Type <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select value={data.type} onValueChange={v => setData('type', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="regulation">Regulation</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internal_policy">Internal Policy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Status <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Context */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Context
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Publisher</label>
                    <Input
                      placeholder="e.g. ISO, NIST, European Commission..."
                      value={data.publisher}
                      onChange={e => setData('publisher', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Jurisdiction <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.jurisdiction_id}
                      onValueChange={v => setData('jurisdiction_id', v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select jurisdiction" />
                      </SelectTrigger>
                      <SelectContent>
                        {jurisdictions.map((j) => (
                          <SelectItem key={j.id} value={j.id.toString()}>
                            {j.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scope</label>
                    <Input
                      placeholder="e.g. All organizations, Financial sector only..."
                      value={data.scope}
                      onChange={e => setData('scope', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Important Dates
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Release Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {releaseDate ? format(releaseDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={releaseDate}
                          onSelect={d => {
                            setReleaseDate(d)
                            setData('release_date', d ? formatDateString(d.toISOString()) : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Effective Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {effectiveDate ? format(effectiveDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={effectiveDate}
                          onSelect={d => {
                            setEffectiveDate(d)
                            setData('effective_date', d ? formatDateString(d.toISOString()) : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retired Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {retiredDate ? format(retiredDate, 'PPP') : 'Optional'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={retiredDate}
                          onSelect={d => {
                            setRetiredDate(d)
                            setData('retired_date', d ? formatDateString(d.toISOString()) : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Additional Details
                </h2>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Description ou notes d'implémentation..."
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="min-h-[160px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Language</label>
                    <Input
                      placeholder="Document language"
                      value={data.language}
                      onChange={e => setData('language', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Url Reference</label>
                    <Input
                      type="url"
                      placeholder="https://www.iso.org/standard/82875.html"
                      value={data.url_reference}
                      onChange={e => setData('url_reference', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Tags</label>
                  <MultiSelect
                    options={tags.map(tag => ({ value: tag.id.toString(), label: tag.name }))}
                    defaultValue={selectedTagIds}
                    onValueChange={(values: string[]) => setData('tags', values)}
                    placeholder="Select tags"
                  />
                </div>
              </div>

              {/* Actions - même style que Create */}
              <div className="flex justify-end gap-4 pt-12 border-t">
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/frameworks">Cancel</Link>
                </Button>

                <Button
                  type="submit"
                  disabled={processing}
                  size="lg"
                  className="min-w-[200px] font-medium"
                >
                  {processing ? 'Updating...' : 'Update Framework'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}