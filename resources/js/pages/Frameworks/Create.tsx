import React, { useState, useEffect } from 'react'
import { Head, Link, useForm, usePage, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, X, Calendar as CalendarIcon, Pencil, Trash2 } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { MultiSelect } from '@/components/ui/multi-select'

interface Jurisdiction {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

interface FrameworkCreateProps {
  jurisdictions: Jurisdiction[]
}

interface MyPageProps extends Record<string, any> {
  flash?: { success?: string; error?: string }
  tags?: Tag[]
  jurisdictions?: Jurisdiction[]
}

export default function CreateFramework({ jurisdictions }: FrameworkCreateProps) {
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    code: '',
    name: '',
    version: '',
    type: '',
    status: '',
    publisher: '',
    jurisdictions: [] as string[],
    scope: '',
    release_date: '',
    effective_date: '',
    retired_date: '',
    description: '',
    language: '',
    url_reference: '',
    tags: [] as string[],
  })

  const validateForm = () => {
    let isValid = true
    clearErrors()

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

    return isValid
  }

  const { props } = usePage<MyPageProps>()

  // Dates
  const [releaseDate, setReleaseDate] = useState<Date | undefined>()
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>()
  const [retiredDate, setRetiredDate] = useState<Date | undefined>()

  const [jurisdictionsList, setJurisdictionsList] = useState<Jurisdiction[]>(jurisdictions)
  const [isJurisdictionListOpen, setIsJurisdictionListOpen] = useState(false)

  // Tags
  const [tagsListState, setTagsListState] = useState<Tag[]>(props.tags || [])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null)
  const [editedTagName, setEditedTagName] = useState('')

  // Jurisdiction modal
  const [newJurisdiction, setNewJurisdiction] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [jurisdictionToDelete, setJurisdictionToDelete] = useState<Jurisdiction | null>(null)
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const [deleteMessageType, setDeleteMessageType] = useState<'success' | 'error'>('success')

  const [jurisdictionToEdit, setJurisdictionToEdit] = useState<Jurisdiction | null>(null)
  const [editedJurisdictionName, setEditedJurisdictionName] = useState('')

  // Messages flash
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [isMessageOpen, setIsMessageOpen] = useState(false)

  useEffect(() => {
    if (props.flash?.success) {
      setMessageType('success')
      setMessage(props.flash.success)
      setIsMessageOpen(true)
      const timer = setTimeout(() => setIsMessageOpen(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [props.flash])

  // ====================== TAGS ======================
  const openTagsModal = () => setIsTagsModalOpen(true)
  const closeTagsModal = () => {
    setIsTagsModalOpen(false)
    setNewTag('')
    setTagToEdit(null)
    setEditedTagName('')
  }

  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id)
    const newSelected = isSelected
      ? selectedTags.filter(t => t.id !== tag.id)
      : [...selectedTags, tag]

    setSelectedTags(newSelected)
    setData('tags', newSelected.map(t => t.id.toString()))
  }

  const addTag = () => {
    const trimmed = newTag.trim()
    if (!trimmed) return

    router.post('/tags', { name: trimmed }, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const refreshed = page.props?.tags
        if (refreshed) setTagsListState(refreshed)
        setNewTag('')
      },
      onError: (err: any) => alert(err?.name?.[0] || 'Error creating tag'),
    })
  }

  const startEditTag = (tag: Tag) => {
    setTagToEdit(tag)
    setEditedTagName(tag.name)
  }

  const confirmEditTag = () => {
    if (!tagToEdit || !editedTagName.trim()) return
    router.put(`/tags/${tagToEdit.id}`, { name: editedTagName.trim() }, {
      preserveScroll: true,
      onSuccess: () => {
        setTagsListState(prev =>
          prev.map(t => (t.id === tagToEdit.id ? { ...t, name: editedTagName.trim() } : t))
        )
        setSelectedTags(prev =>
          prev.map(t => (t.id === tagToEdit.id ? { ...t, name: editedTagName.trim() } : t))
        )
        setData('tags', selectedTags.map(t => t.id.toString()))
        setTagToEdit(null)
        setEditedTagName('')
      },
      onError: () => alert('Error updating tag'),
    })
  }

  const deleteTag = (tag: Tag) => {
    router.delete(`/tags/${tag.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setTagsListState(prev => prev.filter(t => t.id !== tag.id))
        const updated = selectedTags.filter(t => t.id !== tag.id)
        setSelectedTags(updated)
        setData('tags', updated.map(t => t.id.toString()))
        closeTagsModal()
      },
      onError: () => alert('Error deleting tag'),
    })
  }

  // ====================== JURISDICTIONS ======================
  const toggleJurisdiction = (j: Jurisdiction) => {
    const idStr = j.id.toString()
    const updated = data.jurisdictions.includes(idStr)
      ? data.jurisdictions.filter(id => id !== idStr)
      : [...data.jurisdictions, idStr]

    setData('jurisdictions', updated)
  }

  const addJurisdiction = () => {
    const trimmed = newJurisdiction.trim()
    if (!trimmed) return

    router.post('/jurisdictions', { name: trimmed }, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const refreshed = page.props?.jurisdictions as Jurisdiction[] | undefined
        if (refreshed) {
          setJurisdictionsList(refreshed)

          // Auto-select the newly created jurisdiction
          const created = refreshed.find(j => j.name === trimmed)
          if (created) {
            const idStr = created.id.toString()
            if (!data.jurisdictions.includes(idStr)) {
              setData('jurisdictions', [...data.jurisdictions, idStr])
            }
          }
        }
        setNewJurisdiction('')
      },
      onError: (err: any) => alert(err.name?.[0] || 'Error creating jurisdiction'),
    })
  }

  const requestDeleteJurisdiction = (j: Jurisdiction) => {
    setJurisdictionToDelete(j)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteJurisdiction = () => {
    if (!jurisdictionToDelete) return

    router.delete(`/jurisdictions/${jurisdictionToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setJurisdictionsList(prev => prev.filter(j => j.id !== jurisdictionToDelete.id))
        setDeleteMessage('Jurisdiction deleted successfully')
        setDeleteMessageType('success')
        setTimeout(() => {
          setIsDeleteModalOpen(false)
          setJurisdictionToDelete(null)
          setDeleteMessage(null)
        }, 1500)
      },
      onError: () => {
        setDeleteMessage('Error deleting jurisdiction')
        setDeleteMessageType('error')
      },
    })
  }

  const requestEditJurisdiction = (j: Jurisdiction) => {
    setJurisdictionToEdit(j)
    setEditedJurisdictionName(j.name)
  }

  const confirmEditJurisdiction = () => {
    if (!jurisdictionToEdit || !editedJurisdictionName.trim()) return

    router.put(`/jurisdictions/${jurisdictionToEdit.id}`, { name: editedJurisdictionName.trim() }, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const refreshed = page.props?.jurisdictions as Jurisdiction[] | undefined
        if (refreshed) setJurisdictionsList(refreshed)
        setJurisdictionToEdit(null)
        setEditedJurisdictionName('')
      },
      onError: () => alert('Error updating jurisdiction'),
    })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    post('/frameworks')
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Frameworks', href: '/frameworks' },
        { title: 'Create', href: '' },
      ]}
    >
      <Head title="Create Framework" />

      {/* Flash message */}
      {isMessageOpen && message && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-900 border rounded-2xl p-6 w-full max-w-md ${messageType === 'success' ? 'border-green-600' : 'border-red-600'}`}>
            <h3 className={`text-xl font-semibold mb-3 ${messageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {messageType === 'success' ? 'Success' : 'Error'}
            </h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete jurisdiction confirmation */}
      {isDeleteModalOpen && jurisdictionToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            {deleteMessage && (
              <div className={`mb-5 p-4 rounded-lg text-sm ${deleteMessageType === 'success' ? 'bg-green-950/40 text-green-300' : 'bg-red-950/40 text-red-300'}`}>
                {deleteMessage}
              </div>
            )}
            <h3 className="text-xl font-semibold mb-4">Delete Jurisdiction</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong>{jurisdictionToDelete.name}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteJurisdiction}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <div className="space-y-12 p-6 lg:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Framework</h1>
            <p className="text-muted-foreground mt-2 text-lg">Add a new compliance, security or governance framework</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/frameworks">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsJurisdictionListOpen(true)}>
              Manage Jurisdictions
            </Button>
            <Button variant="outline" size="sm" onClick={openTagsModal}>
              Manage Tags
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-2xl">
          <CardContent className="pt-10 pb-14 px-6 md:px-12 lg:px-16">
            <form onSubmit={submit} className="space-y-16">

              {/* Basic Information */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">Basic Information</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code <span className="text-red-500">*</span></label>
                    <Input
                      placeholder="e.g. ISO27001"
                      value={data.code}
                      onChange={e => setData('code', e.target.value.toUpperCase())}
                      className={errors.code ? 'border-red-500' : ''}
                    />
                    {errors.code && <p className="text-red-600 text-sm">{errors.code}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input
                      placeholder="e.g. ISO/IEC 27001:2022"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Version</label>
                    <Input value={data.version} onChange={e => setData('version', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type <span className="text-red-500">*</span></label>
                    <Select value={data.type} onValueChange={v => setData('type', v)}>
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="regulation">Regulation / Law</SelectItem>
                        <SelectItem value="contract">Contract / Agreement</SelectItem>
                        <SelectItem value="internal_policy">Internal Policy</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-600 text-sm">{errors.type}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                      <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-600 text-sm">{errors.status}</p>}
                  </div>
                </div>
              </div>

              {/* Context */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">Context</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Publisher</label>
                    <Input value={data.publisher} onChange={e => setData('publisher', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Jurisdictions <span className="text-red-500">*</span>
                    </label>
                    <MultiSelect
                      options={jurisdictionsList.map(j => ({ value: j.id.toString(), label: j.name }))}
                      value={data.jurisdictions}
                      onValueChange={(selected) => {
                        setData('jurisdictions', selected)
                        if (errors.jurisdictions) clearErrors('jurisdictions')
                      }}
                      placeholder="Select one or more jurisdictions..."
                    />
                    {errors.jurisdictions && <p className="text-red-600 text-sm mt-1.5">{errors.jurisdictions}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scope</label>
                    <Input value={data.scope} onChange={e => setData('scope', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">Important Dates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Release Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {releaseDate ? format(releaseDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={releaseDate}
                          onSelect={date => {
                            setReleaseDate(date)
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
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {effectiveDate ? format(effectiveDate, 'PPP') : 'Pick a date'}
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
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retired Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {retiredDate ? format(retiredDate, 'PPP') : 'Optional'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={retiredDate}
                          onSelect={date => {
                            setRetiredDate(date)
                            setData('retired_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">Additional Details</h2>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="min-h-[160px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Language</label>
                    <Select value={data.language} onValueChange={v => setData('language', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Arabic">Arabic</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium">Official Reference URL</label>
                    <Input type="url" value={data.url_reference} onChange={e => setData('url_reference', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Tags</label>
                  <MultiSelect
                    options={tagsListState.map(tag => ({ value: tag.id.toString(), label: tag.name }))}
                    value={selectedTags.map(t => t.id.toString())}
                    onValueChange={(selected: string[]) => {
                      const newSelected = tagsListState.filter(tag => selected.includes(tag.id.toString()))
                      setSelectedTags(newSelected)
                      setData('tags', selected)
                    }}
                    placeholder="Select or search tags..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-12 border-t">
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/frameworks">Cancel</Link>
                </Button>
                <Button type="submit" disabled={processing} size="lg" className="min-w-[200px]">
                  {processing ? 'Creating...' : 'Create Framework'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ====================== MANAGE JURISDICTIONS MODAL ====================== */}
      {isJurisdictionListOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-800 bg-gray-950/40">
              <h2 className="text-2xl font-semibold text-white">Manage Jurisdictions</h2>
              <button onClick={() => setIsJurisdictionListOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-5 max-h-[55vh] overflow-y-auto">
              {jurisdictionsList.map(j => (
                <div key={j.id} className="group flex items-center justify-between px-5 py-3.5 rounded-xl bg-gray-900/40 hover:bg-gray-800/60 mb-2.5">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={data.jurisdictions.includes(j.id.toString())}
                      onChange={() => toggleJurisdiction(j)}
                      className="h-4 w-4 rounded border-gray-600 text-rose-600 focus:ring-rose-600/30 bg-gray-800 checked:bg-rose-600"
                    />
                    <span className="font-medium text-gray-100 truncate">{j.name}</span>
                    {data.jurisdictions.includes(j.id.toString()) && (
                      <span className="px-2.5 py-1 text-xs bg-rose-950/40 text-rose-300 rounded-full border border-rose-900/50">Selected</span>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button size="icon" variant="ghost" onClick={() => requestEditJurisdiction(j)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => requestDeleteJurisdiction(j)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-800 bg-gray-950/30">
              {!jurisdictionToEdit ? (
                <div className="flex gap-3">
                  <Input
                    placeholder="New jurisdiction (e.g. EU, Tunisia...)"
                    value={newJurisdiction}
                    onChange={e => setNewJurisdiction(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addJurisdiction())}
                  />
                  <Button onClick={addJurisdiction} disabled={!newJurisdiction.trim()}>Add</Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    value={editedJurisdictionName}
                    onChange={e => setEditedJurisdictionName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), confirmEditJurisdiction())}
                  />
                  <Button onClick={confirmEditJurisdiction}>Save</Button>
                  <Button variant="ghost" onClick={() => { setJurisdictionToEdit(null); setEditedJurisdictionName('') }}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================== MANAGE TAGS MODAL ====================== */}
      {isTagsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-gray-800 bg-gray-950/40">
              <h2 className="text-2xl font-semibold text-white">Manage Tags</h2>
              <button onClick={closeTagsModal} className="absolute top-5 right-5 text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 py-5 max-h-[55vh] overflow-y-auto">
              {tagsListState.map(tag => (
                <div key={tag.id} className="group flex items-center justify-between px-5 py-3.5 rounded-xl bg-gray-900/40 hover:bg-gray-800/60 mb-2.5">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedTags.some(t => t.id === tag.id)}
                      onChange={() => toggleTag(tag)}
                      className="h-4 w-4 rounded border-gray-600 text-rose-600 focus:ring-rose-600/30 bg-gray-800 checked:bg-rose-600"
                    />
                    <span className="font-medium text-gray-100 truncate">{tag.name}</span>
                    {selectedTags.some(t => t.id === tag.id) && (
                      <span className="px-2.5 py-1 text-xs bg-rose-950/40 text-rose-300 rounded-full border border-rose-900/50">Selected</span>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button size="icon" variant="ghost" onClick={() => startEditTag(tag)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteTag(tag)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-800 bg-gray-950/30">
              {tagToEdit ? (
                <div className="flex gap-3">
                  <Input
                    value={editedTagName}
                    onChange={e => setEditedTagName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), confirmEditTag())}
                  />
                  <Button onClick={confirmEditTag} disabled={!editedTagName.trim()}>Save</Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    placeholder="New tag (e.g. GDPR, Cloud...)"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} disabled={!newTag.trim()}>Add</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}