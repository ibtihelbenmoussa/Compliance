import React, { useState } from 'react'
import { Head, Link, useForm, usePage, router } from '@inertiajs/react'
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

// Interfaces (inchangées)
interface Jurisdiction { id: number; name: string }
interface Tag { id: number; name: string }

interface Framework {
  id: number
  code: string
  name: string
  version: string | null
  type: string
  status: string
  publisher: string | null
  scope: string | null
  release_date: string | null
  effective_date: string | null
  retired_date: string | null
  description: string | null
  language: string | null
  url_reference: string | null
}

type PageProps = {
  framework: Framework
  jurisdictions: Jurisdiction[]
  tags: Tag[]
  selectedJurisdictions: number[]
  selectedTags: number[]
  flash?: { success?: string; error?: string }
}

export default function EditFramework() {
  const { props } = usePage<PageProps>()

  const {
    framework,
    jurisdictions = [],
    tags = [],
    selectedJurisdictions = [],
    selectedTags = [],
  } = props

  const { data, setData, put, processing, errors, setError, clearErrors } = useForm({
    code: framework.code || '',
    name: framework.name || '',
    version: framework.version || '',
    type: framework.type || '',
    status: framework.status || '',
    publisher: framework.publisher || '',
    scope: framework.scope || '',
    release_date: framework.release_date ? framework.release_date.split('T')[0] : '',
    effective_date: framework.effective_date ? framework.effective_date.split('T')[0] : '',
    retired_date: framework.retired_date ? framework.retired_date.split('T')[0] : '',
    description: framework.description || '',
    language: framework.language || '',
    url_reference: framework.url_reference || '',
    jurisdictions: selectedJurisdictions.map(String),
    tags: selectedTags.map(String),
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

  const validateForm = () => {
    clearErrors()
    let isValid = true

    if (!data.code.trim()) {
      setError('code', 'Code is required')
      isValid = false
    }
    if (!data.name.trim()) {
      setError('name', 'Name is required')
      isValid = false
    }
    if (!data.type) {
      setError('type', 'Type is required')
      isValid = false
    }
    if (!data.status) {
      setError('status', 'Status is required')
      isValid = false
    }
    if (data.jurisdictions.length === 0) {
      setError('jurisdictions', 'At least one jurisdiction is required')
      isValid = false
    }

    // Date coherence
    if (data.release_date && data.effective_date) {
      if (new Date(data.effective_date) < new Date(data.release_date)) {
        setError('effective_date', "Must be ≥ release date")
        isValid = false
      }
    }
    if (data.effective_date && data.retired_date) {
      if (new Date(data.retired_date) < new Date(data.effective_date)) {
        setError('retired_date', "Must be ≥ effective date")
        isValid = false
      }
    }

    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    put(`/frameworks/${framework.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        // Redirection vers la liste après succès
        router.visit('/frameworks', {
          method: 'get',
          preserveState: false,      // recharge complètement la page liste
          preserveScroll: false,
        })
      },
      onError: (err) => {
        console.error('Update error:', err)
      },
    })
  }

  const createNewTag = () => {
    const name = prompt("New tag name:")?.trim()
    if (!name) return

    router.post('/tags', { name }, {
      preserveScroll: true,
      onSuccess: () => router.reload({ only: ['tags'] }),
      onError: (err) => alert(err?.name?.[0] || 'Error creating tag'),
    })
  }

  const createNewJurisdiction = () => {
    const name = prompt("New jurisdiction name:")?.trim()
    if (!name) return

    router.post('/jurisdictions', { name }, {
      preserveScroll: true,
      onSuccess: () => router.reload({ only: ['jurisdictions'] }),
      onError: (err) => alert(err?.name?.[0] || 'Error creating jurisdiction'),
    })
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Frameworks', href: '/frameworks' },
        { title: framework.name || 'Edit', href: '' },
      ]}
    >
      <Head title={`Edit ${framework.name || 'Framework'}`} />

      <div className="p-6 lg:p-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold">Edit Framework</h1>
            <p className="text-muted-foreground mt-1">Update framework information</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/frameworks">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="pt-8 pb-12 px-6 md:px-10 lg:px-14">
            <form onSubmit={handleSubmit} className="space-y-16">

              {/* Main Information */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Main Information</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code <span className="text-red-500">*</span></label>
                    <Input
                      value={data.code}
                      onChange={e => setData('code', e.target.value.toUpperCase())}
                      className={errors.code ? 'border-red-500' : ''}
                    />
                    {errors.code && <p className="text-red-600 text-sm">{errors.code}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Version</label>
                    <Input value={data.version} onChange={e => setData('version', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                    <Select value={data.type} onValueChange={v => setData('type', v)}>
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="regulation">Regulation</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internal_policy">Internal Policy</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-600 text-sm">{errors.type}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                      <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-600 text-sm">{errors.status}</p>}
                  </div>
                </div>
              </section>

              {/* Context */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Context</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Publisher</label>
                    <Input value={data.publisher} onChange={e => setData('publisher', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Jurisdictions <span className="text-red-500">*</span>
                      </label>
                      <Button variant="ghost" size="sm" onClick={createNewJurisdiction}>
                        + New Jurisdiction
                      </Button>
                    </div>
                    <MultiSelect
                      options={jurisdictions.map((r) => ({
                        value: r.id.toString(),
                        label: r.name,
                      }))}
                      defaultValue={data.jurisdictions}
                      onValueChange={(v) => setData('jurisdictions', v)}
                      searchable
                    />
                    {errors.jurisdictions && <p className="text-red-600 text-sm mt-1">{errors.jurisdictions}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scope</label>
                    <Input value={data.scope} onChange={e => setData('scope', e.target.value)} />
                  </div>
                </div>
              </section>

              {/* Key Dates */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Key Dates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Release Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {releaseDate ? format(releaseDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={releaseDate}
                          onSelect={date => {
                            setReleaseDate(date ?? undefined)
                            setData('release_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Effective Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {effectiveDate ? format(effectiveDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={effectiveDate}
                          onSelect={date => {
                            setEffectiveDate(date ?? undefined)
                            setData('effective_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retired Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {retiredDate ? format(retiredDate, 'PPP') : <span>Optional</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={retiredDate}
                          onSelect={date => {
                            setRetiredDate(date ?? undefined)
                            setData('retired_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </section>

              {/* Additional Details */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Additional Details</h2>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={data.description}
                      onChange={e => setData('description', e.target.value)}
                      className="min-h-[140px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Language</label>
                      <Select value={data.language} onValueChange={v => setData('language', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Official Reference URL</label>
                      <Input
                        type="url"
                        value={data.url_reference}
                        onChange={e => setData('url_reference', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Tags</label>
                      <Button variant="ghost" size="sm" onClick={createNewTag}>
                        + New Tag
                      </Button>
                    </div>
                    <MultiSelect
                      options={tags.map((r) => ({
                        value: r.id.toString(),
                        label: r.name,
                      }))}
                      defaultValue={data.tags}
                      onValueChange={(v) => setData('tags', v)}
                      searchable
                    />
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-10 border-t">
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/frameworks">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  size="lg"
                  className="min-w-48"
                >
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}