import React, { useState, useEffect } from 'react'
import { Head, Link, useForm, usePage, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronDown, X, Calendar as CalendarIcon, Check, Pencil, Trash2 } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { MultiSelect } from '@/components/ui/multi-select'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ChevronsUpDown } from 'lucide-react'
 
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
    jurisdiction_id: '',
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
 
    return isValid
  }
 
  const { props } = usePage<MyPageProps>()
 
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(
    data.release_date ? new Date(data.release_date) : undefined
  )
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(
    data.effective_date ? new Date(data.effective_date) : undefined
  )
  const [retiredDate, setRetiredDate] = useState<Date | undefined>(
    data.retired_date ? new Date(data.retired_date) : undefined
  )
 
  const formatDate = (date: Date | undefined) => (date ? format(date, 'yyyy-MM-dd') : '')
 
  const [jurisdictionsList, setJurisdictionsList] = useState<Jurisdiction[]>(jurisdictions)
  const [isJurisdictionListOpen, setIsJurisdictionListOpen] = useState(false)
  const [open, setOpen] = useState(false)
 
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [isMessageOpen, setIsMessageOpen] = useState(false)
 
  const [tagsListState, setTagsListState] = useState<Tag[]>(props.tags || [])
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    data.tags.map((t, i) => ({ id: i + 1, name: t }))
  )
 
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null)
  const [editedTagName, setEditedTagName] = useState('')
 
  const openTagsModal = () => setIsTagsModalOpen(true)
  const closeTagsModal = () => {
    setIsTagsModalOpen(false)
    setNewTag('')
    setTagToEdit(null)
    setEditedTagName('')
  }
 
  // Tag actions
  const addTag = () => {
    const trimmed = newTag.trim()
    if (!trimmed) return
 
    router.post('/tags', { name: trimmed }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        const createdTag: Tag | undefined = page.props?.tag
        const refreshedTags: Tag[] | undefined = page.props?.tags
 
        // ✅ Option 1 (idéale) : backend renvoie toute la liste
        if (refreshedTags) {
          setTagsListState(refreshedTags)
        }
 
        // ✅ Option 2 (fallback) : on ajoute juste le nouveau tag
        if (createdTag) {
          setTagsListState(prev => {
            if (prev.find(t => t.id === createdTag.id)) return prev
            return [...prev, createdTag]
          })
 
          // auto-select (si tu veux)
          const updatedSelected = selectedTags.find(t => t.id === createdTag.id)
            ? selectedTags
            : [...selectedTags, createdTag]
 
          setSelectedTags(updatedSelected)
          setData('tags', updatedSelected.map(t => t.id.toString()))
        }
 
        setNewTag('')
        // ❌ on ne ferme pas le modal
      },
      onError: (errors: any) => {
        alert(errors?.name?.[0] || 'Error creating tag')
      }
    })
  }
 
 
  const toggleTag = (tag: Tag) => {
    let newSelected: Tag[]
    if (selectedTags.find(t => t.id === tag.id)) {
      newSelected = selectedTags.filter(t => t.id !== tag.id)
    } else {
      newSelected = [...selectedTags, tag]
    }
    setSelectedTags(newSelected)
    setData('tags', newSelected.map(t => t.name))
  }
 
  const startEditTag = (tag: Tag) => {
    setTagToEdit(tag)
    setEditedTagName(tag.name)
  }
 
  const confirmEditTag = () => {
    if (!tagToEdit || !editedTagName.trim()) return
 
    router.put(`/tags/${tagToEdit.id}`, {
      name: editedTagName.trim(),
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setTagsListState(prev =>
          prev.map(t =>
            t.id === tagToEdit.id
              ? { ...t, name: editedTagName.trim() }
              : t
          )
        )
 
        setSelectedTags(prev =>
          prev.map(t =>
            t.id === tagToEdit.id
              ? { ...t, name: editedTagName.trim() }
              : t
          )
        )
 
        setData('tags', selectedTags.map(t => t.id.toString()))
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
        const updatedSelected = selectedTags.filter(t => t.id !== tag.id)
        setSelectedTags(updatedSelected)
        setData('tags', updatedSelected.map(t => t.id.toString()))
        closeTagsModal()
      },
      onError: () => alert('Error deleting tag'),
    })
  }
 
  useEffect(() => {
    if (!props.flash) return
    if (props.flash.success) {
      setMessageType('success')
      setMessage(props.flash.success)
      setIsMessageOpen(true)
    }
    const timer = setTimeout(() => setIsMessageOpen(false), 5000)
    return () => clearTimeout(timer)
  }, [props.flash])
 
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
 
    if (!validateForm()) {
      const firstError = document.querySelector('[data-error-field]')
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
 
    post('/frameworks')
  }
 
  // Jurisdiction actions
  const [newJurisdiction, setNewJurisdiction] = useState('')
  const addJurisdiction = () => {
    const trimmed = newJurisdiction.trim()
    if (!trimmed) return
 
    router.post('/jurisdictions', { name: trimmed }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page) => {
        const props = page.props as any
        const created = (props.jurisdictions as Jurisdiction[]).find(
          (j: Jurisdiction) => j.name === trimmed
        )
        if (created) {
          setJurisdictionsList(prev => [...prev, created])
          setData('jurisdiction_id', created.id.toString())
          setNewJurisdiction('')
        }
        setIsJurisdictionListOpen(true)
      },
      onError: (errors) => {
        alert(errors.name?.[0] || 'Error creating jurisdiction')
      },
    })
  }
 
  // Delete / Edit jurisdiction logic (kept as is)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [jurisdictionToDelete, setJurisdictionToDelete] = useState<Jurisdiction | null>(null)
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const [deleteMessageType, setDeleteMessageType] = useState<'success' | 'error'>('success')
 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [jurisdictionToEdit, setJurisdictionToEdit] = useState<Jurisdiction | null>(null)
  const [editedJurisdictionName, setEditedJurisdictionName] = useState('')
 
  const openJurisdictionList = () => setIsJurisdictionListOpen(true)
  const closeJurisdictionList = () => setIsJurisdictionListOpen(false)
 
  const requestDeleteJurisdiction = (jurisdiction: Jurisdiction) => {
    setJurisdictionToDelete(jurisdiction)
    setIsDeleteModalOpen(true)
    closeJurisdictionList()
  }
 
  const confirmDeleteJurisdiction = () => {
    if (!jurisdictionToDelete) return
 
    router.delete(`/jurisdictions/${jurisdictionToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setJurisdictionsList(prev =>
          prev.filter(j => j.id !== jurisdictionToDelete.id)
        )
 
        if (data.jurisdiction_id === jurisdictionToDelete.id.toString()) {
          setData('jurisdiction_id', '')
        }
 
        setDeleteMessageType('success')
        setDeleteMessage('Jurisdiction deleted successfully')
 
        setTimeout(() => {
          setIsDeleteModalOpen(false)
          setJurisdictionToDelete(null)
          setDeleteMessage(null)
        }, 1000)
      },
      onError: () => {
        setDeleteMessageType('error')
        setDeleteMessage('Error deleting jurisdiction')
      },
    })
  }
 
  const requestEditJurisdiction = (j: Jurisdiction) => {
    setJurisdictionToEdit(j)
    setEditedJurisdictionName(j.name)
  }
 
  const confirmEditJurisdiction = () => {
    if (!jurisdictionToEdit || !editedJurisdictionName.trim()) return
 
    router.put(`/jurisdictions/${jurisdictionToEdit.id}`, {
      name: editedJurisdictionName.trim()
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page) => {
        const props = page.props as any
        const updated = (props.jurisdictions as Jurisdiction[]).find(
          (j: Jurisdiction) => j.id === jurisdictionToEdit.id
        )
        if (updated) {
          setJurisdictionsList(prev =>
            prev.map(j =>
              j.id === updated.id ? updated : j
            )
          )
          // Met à jour la sélection si nécessaire
          if (data.jurisdiction_id === updated.id.toString()) {
            setData('jurisdiction_id', updated.id.toString())
          }
          setEditedJurisdictionName('')
          setJurisdictionToEdit(null)
        }
      },
      onError: () => alert('Error updating jurisdiction')
    })
  }
 
 
 
  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Frameworks', href: '/frameworks' },
        { title: 'Create', href: '' },
      ]}
    >
      <Head title="Create Framework" />
 
      {/* Success / Error message modal */}
      {isMessageOpen && message && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`bg-gray-900 border rounded-2xl p-6 w-full max-w-md shadow-2xl ${messageType === 'success' ? 'border-green-600' : 'border-red-600'
              }`}
          >
            <h3
              className={`text-xl font-semibold mb-3 ${messageType === 'success' ? 'text-green-400' : 'text-red-400'
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
 
      {/* Delete jurisdiction confirmation modal */}
      {isDeleteModalOpen && jurisdictionToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {deleteMessage && (
              <div
                className={`mb-5 p-4 rounded-lg text-sm ${deleteMessageType === 'success'
                  ? 'bg-green-950/40 border border-green-800 text-green-300'
                  : 'bg-red-950/40 border border-red-800 text-red-300'
                  }`}
              >
                {deleteMessage}
              </div>
            )}
            <h3 className="text-xl font-semibold mb-4">Delete Jurisdiction</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <strong>{jurisdictionToDelete.name}</strong>?
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setJurisdictionToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteJurisdiction}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
 
      {/* FORMULAIRE PRINCIPAL - VERSION AMÉLIORÉE */}
      <div className="space-y-12 p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Framework</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Add a new compliance, security or governance framework
            </p>
          </div>
 
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/frameworks">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
 
            <Button variant="outline" size="sm" onClick={openJurisdictionList}>
              Manage Jurisdictions
            </Button>
 
            <Button variant="outline" size="sm" onClick={openTagsModal}>
              Manage Tags
            </Button>
          </div>
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
                      placeholder="e.g. ISO27001, GDPR, PCI-DSS, NIST-800-53"
                      value={data.code}
                      onChange={(e) => {
                        setData(
                          'code',
                          e.target.value.toUpperCase(),
                        )
 
                        if (errors.code) clearErrors('code')
                      }}
                      className={`h-11 transition-colors ${errors.code ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.code && <p className="text-red-600 text-sm mt-1.5">{errors.code}</p>}
                  </div>
 
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Name <span className="text-red-500 text-base">*</span>
                    </label>
                    <Input
                      placeholder="e.g. ISO/IEC 27001:2022 – Information security management systems – Requirements"
                      value={data.name}
                      onChange={(e) => {
                        setData('name', e.target.value)
                        if (errors.name) clearErrors('name')
                      }}
                      className={`h-11 transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1.5">{errors.name}</p>}
                  </div>
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Version</label>
                    <Input
                      placeholder="e.g. 2022, v2024.1, rev.3"
                      value={data.version}
                      onChange={(e) => setData('version', e.target.value)}
                      className="h-11"
                    />
                  </div>
 
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
                        <SelectValue placeholder="Select framework type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="regulation">Regulation / Law</SelectItem>
                        <SelectItem value="contract">Contract / Agreement</SelectItem>
                        <SelectItem value="internal_policy">Internal Policy</SelectItem>
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
                        <SelectValue placeholder="Select current status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active / Current</SelectItem>
                        <SelectItem value="draft">Draft / In preparation</SelectItem>
                        <SelectItem value="archived">Archived / Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-600 text-sm mt-1.5">{errors.status}</p>}
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
                    <label className="text-sm font-medium">Publisher </label>
                    <Input
                      placeholder="e.g. ISO, NIST, ANSSI, European Commission..."
                      value={data.publisher}
                      onChange={(e) => setData('publisher', e.target.value)}
                      className="h-11"
                    />
                  </div>
 
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Jurisdiction <span className="text-red-500 text-base">*</span>
                    </label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full h-11 justify-between ${errors.jurisdiction_id ? 'border-red-500' : ''
                            }`}
                        >
                          {data.jurisdiction_id
                            ? jurisdictions.find(j => j.id === Number(data.jurisdiction_id))?.name || '—'
                            : 'Select jurisdiction...'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Search jurisdiction..." />
                          <CommandList>
 
                            {jurisdictions?.map((j) => (
                              <CommandItem
                                key={j.id}
                                value={j.name}
                                onSelect={() => {
                                  setData('jurisdiction_id', j.id.toString());
                                  setOpen(false);
                                  if (errors.jurisdiction_id) clearErrors('jurisdiction_id');
                                }}
                              >
                                {j.name}
                              </CommandItem>
                            ))}
                          </CommandList>
 
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {errors.jurisdiction_id && (
                      <p className="text-red-600 text-sm mt-1.5">{errors.jurisdiction_id}</p>
                    )}
                  </div>
 
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Scope </label>
                    <Input
                      placeholder="e.g. All organizations, Financial institutions only, Public sector..."
                      value={data.scope}
                      onChange={(e) => setData('scope', e.target.value)}
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
                    <label className="text-sm font-medium">Release  Date</label>
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
                          onSelect={(date) => {
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
                          onSelect={(date) => {
                            setEffectiveDate(date)
                            setData('effective_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
 
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Retired  Date</label>
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
                          onSelect={(date) => {
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
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Additional Details
                </h2>
 
                <div className="space-y-4">
                  <label className="text-sm font-medium">Description </label>
                  <Textarea
                    placeholder="Enter detailed description, scope notes, implementation guidance, or any additional context..."
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="min-h-[160px] resize-y"
                  />
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Language</label>
                    <Select
                      value={data.language}
                      onValueChange={(v) => setData('language', v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select document language" />
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
                    <Input
                      type="url"
                      placeholder="https://www.iso.org/standard/27001.html"
                      value={data.url_reference}
                      onChange={(e) => setData('url_reference', e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
 
                <div className="space-y-4">
                  <label className="text-sm font-medium">Tags </label>
                  <MultiSelect
                    options={tagsListState.map((tag) => ({
                      value: tag.id.toString(),
                      label: tag.name,
                    }))}
                    value={selectedTags.map(t => t.id.toString())}
                    onValueChange={(selected: string[]) => {
                      const newSelected = tagsListState.filter(tag =>
                        selected.includes(tag.id.toString())
                      )
                      setSelectedTags(newSelected)
                      setData('tags', newSelected.map(t => t.id.toString()))
                    }}
                    placeholder="Select or search relevant tags (compliance, security, privacy...)"
                  />
                </div>
              </div>
 
              {/* Actions */}
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
                  {processing ? 'Creating...' : 'Create Framework'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
 
  {/* Modal Ajouter Juridiction */}
      {isJurisdictionListOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] bg-gray-950/95 border border-gray-800/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-gray-800/50 bg-gray-950/40">
              <h2 className="text-2xl font-semibold text-white">Manage Jurisdictions</h2>
              <p className="mt-1.5 text-sm text-gray-400">Select, edit, or add a new jurisdiction</p>
              <button
                onClick={closeJurisdictionList}
                className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
 
            {/* Liste des juridictions */}
            <div className="px-4 py-5 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent scrollbar-thumb-rounded-full">
              {jurisdictionsList.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-lg text-gray-300">No jurisdictions available</p>
                  <p className="mt-2 text-sm text-gray-500">Add one below to get started</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {jurisdictionsList.map((j) => (
                    <div
                      key={j.id}
                      className="group flex items-center justify-between px-5 py-3.5 rounded-xl bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800/40 hover:border-gray-700/80 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-100 tracking-wide">{j.name}</span>
                        {j.id.toString() === data.jurisdiction_id && (
                          <span className="px-2.5 py-1 text-xs font-medium bg-rose-950/40 text-rose-300 rounded-full border border-rose-900/50">
                            Selected
                          </span>
                        )}
                      </div>
 
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-emerald-500/80 hover:text-emerald-400 hover:bg-emerald-950/30"
                          onClick={() => {
                            setData('jurisdiction_id', j.id.toString())
                            // ne ferme pas le modal pour garder sélection visible
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
 
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-gray-300 hover:text-gray-100 hover:bg-gray-800/50"
                          onClick={() => requestEditJurisdiction(j)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
 
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500/80 hover:text-red-400 hover:bg-red-950/30"
                          onClick={() => requestDeleteJurisdiction(j)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
 
            {/* Zone d'ajout / édition */}
            <div className="p-5 border-t border-gray-800/50 bg-gray-950/30 space-y-3">
 
              {/* ADD — affiché seulement si on n'édite PAS */}
              {!jurisdictionToEdit && (
                <div className="flex gap-3">
                  <Input
                    placeholder="New jurisdiction (e.g. EU, Tunisia...)"
                    value={newJurisdiction}
                    onChange={(e) => setNewJurisdiction(e.target.value)}
                    className="bg-gray-900/60 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-rose-600/70 focus:ring-2 focus:ring-rose-600/20 transition-all duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addJurisdiction()
                      }
                    }}
                  />
                  <Button
                    onClick={addJurisdiction}
                    disabled={!newJurisdiction.trim() || processing}
                    className="min-w-[100px] bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-rose-950/30 text-white font-medium"
                  >
                    Add
                  </Button>
                </div>
              )}
 
              {/* EDIT — affiché seulement si on édite */}
              {jurisdictionToEdit && (
                <div className="flex gap-3">
                  <Input
                    value={editedJurisdictionName}
                    onChange={(e) => setEditedJurisdictionName(e.target.value)}
                    placeholder="Edit jurisdiction name..."
                    className="bg-gray-900/60 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-emerald-500/70 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        confirmEditJurisdiction()
                      }
                    }}
                  />
                  <Button
                    onClick={confirmEditJurisdiction}
                    disabled={!editedJurisdictionName.trim()}
                    className="min-w-[100px] bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-rose-950/30 text-white font-medium"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setJurisdictionToEdit(null)
                      setEditedJurisdictionName('')
                    }}
                    variant="ghost"
                    className="text-gray-300 hover:text-gray-100"
                  >
                    Cancel
                  </Button>
                </div>
              )}
 
            </div>
 
          </div>
        </div>
      )}
 
 
      {isTagsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div
            className="
        relative w-full max-w-lg max-h-[90vh]
        bg-gray-950/95 border border-gray-800/60 rounded-2xl md:rounded-3xl
        shadow-2xl shadow-black/70 overflow-hidden
        animate-in fade-in zoom-in-95 duration-200
      "
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-4 border-b border-gray-800/50 bg-gray-950/40">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Manage Tags
              </h2>
              <p className="mt-1.5 text-sm text-gray-400">
                Select, edit, or add a new tag
              </p>
 
              <button
                onClick={closeTagsModal}
                className="
            absolute top-5 right-5
            p-2 rounded-full
            text-gray-400 hover:text-gray-200
            hover:bg-gray-800/60 transition-all duration-200
          "
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
 
            {/* Liste des tags */}
            <div className="px-4 py-5 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent scrollbar-thumb-rounded-full">
              {tagsListState.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-lg text-gray-300">No tags available</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Add one below to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tagsListState.map((tag) => (
                    <div
                      key={tag.id}
                      className="
                  group flex items-center justify-between
                  px-5 py-3.5 rounded-xl
                  bg-gray-900/40 hover:bg-gray-800/60
                  border border-gray-800/40 hover:border-gray-700/80
                  transition-all duration-200
                "
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={!!selectedTags.find(t => t.id === tag.id)}
                          onChange={() => toggleTag(tag)}
                          className="
                      h-4 w-4 rounded border-gray-600
                      text-rose-600 focus:ring-rose-600/30
                      bg-gray-800 checked:bg-rose-600
                    "
                        />
                        <span className="font-medium text-gray-100 tracking-wide truncate">
                          {tag.name}
                        </span>
                        {!!selectedTags.find(t => t.id === tag.id) && (
                          <span className="
                      px-2.5 py-1 text-xs font-medium
                      bg-rose-950/40 text-rose-300
                      rounded-full border border-rose-900/50
                      whitespace-nowrap
                    ">
                            Selected
                          </span>
                        )}
                      </div>
 
                      <div className="
                  flex items-center gap-1.5
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                ">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="
                      h-8 w-8 text-gray-300
                      hover:text-gray-100 hover:bg-gray-800/50
                    "
                          onClick={() => startEditTag(tag)}
                          title="Edit tag"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
 
                        <Button
                          size="icon"
                          variant="ghost"
                          className="
                      h-8 w-8 text-red-500/80
                      hover:text-red-400 hover:bg-red-950/30
                    "
                          onClick={() => deleteTag(tag)}
                          title="Delete tag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
 
 
     {/* Zone d'ajout / édition */}
            <div className="p-5 border-t border-gray-800/50 bg-gray-950/30">
              {tagToEdit ? (
                <div className="flex gap-3">
                  <Input
                    value={editedTagName}
                    onChange={(e) => setEditedTagName(e.target.value)}
                    placeholder="Edit tag name..."
                    className="
                flex-1 bg-gray-900/60 border-gray-700 text-gray-100
                placeholder:text-gray-500
                focus:border-rose-600/70 focus:ring-2 focus:ring-rose-600/20
              "
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        confirmEditTag();
                      }
                    }}
                  />
                  <Button
                    onClick={confirmEditTag}
                    disabled={!editedTagName.trim()}
                    className="
                min-w-[100px] bg-gradient-to-r from-rose-600 to-rose-500
                hover:from-rose-500 hover:to-rose-400
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-md shadow-rose-950/30
                text-white font-medium
              "
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    placeholder="New tag (e.g. Security, GDPR, Cloud...)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="
                flex-1 bg-gray-900/60 border-gray-700 text-gray-100
                placeholder:text-gray-500
                focus:border-rose-600/70 focus:ring-2 focus:ring-rose-600/20
              "
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button
                    onClick={addTag}
                    disabled={!newTag.trim() || processing}
                    className="
                min-w-[100px] bg-gradient-to-r from-rose-600 to-rose-500
                hover:from-rose-500 hover:to-rose-400
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-md shadow-rose-950/30
                text-white font-medium
              "
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
 
    </AppLayout>
  )
}
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 text-base leading-none">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  )
}
 