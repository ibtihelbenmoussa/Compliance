// resources/js/pages/Frameworks/Create.tsx
import { useState, useEffect } from 'react'
import { Head, Link, useForm, usePage, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Building2,
  Globe,
  Tag as TagIcon,
  FileText,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { MultiSelect } from '@/components/ui/multi-select'

interface Jurisdiction {
  id: number
  name: string
}

interface Tag {
  id: number
  name: string
}

export default function CreateFramework() {
  const { props } = usePage<any>()
  const jurisdictions = props.jurisdictions ?? []
  const allTags = props.tags ?? []

  const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
    code: '',
    name: '',
    version: '',
    type: '',
    status: 'draft',
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

  // ─── Dialogs ───
  const [jurisdictionsDialogOpen, setJurisdictionsDialogOpen] = useState(false)
  const [tagsDialogOpen, setTagsDialogOpen] = useState(false)
  const [flashOpen, setFlashOpen] = useState(false)
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // ─── Date popovers (CORRECTION ICI) ───
  const [releaseOpen, setReleaseOpen] = useState(false)
  const [effectiveOpen, setEffectiveOpen] = useState(false)
  const [retiredOpen, setRetiredOpen] = useState(false)

  // ─── Jurisdictions state ───
  const [jurisdictionsList, setJurisdictionsList] = useState<Jurisdiction[]>(jurisdictions)
  const [newJurisdictionName, setNewJurisdictionName] = useState('')
  const [editingJurisdiction, setEditingJurisdiction] = useState<Jurisdiction | null>(null)
  const [editingJurisdictionName, setEditingJurisdictionName] = useState('')
  const [jurisdictionToDelete, setJurisdictionToDelete] = useState<Jurisdiction | null>(null)

  // ─── Tags state ───
  const [tagsList, setTagsList] = useState<Tag[]>(allTags)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editingTagName, setEditingTagName] = useState('')
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)

  useEffect(() => {
    if (props.flash?.success || props.flash?.error) {
      setFlash({
        type: props.flash.success ? 'success' : 'error',
        message: props.flash.success || props.flash.error,
      })
      setFlashOpen(true)
    }
  }, [props.flash])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()

    const validationErrors: Record<string, string> = {}

    if (!data.code.trim()) validationErrors.code = 'Code is required'
    if (!data.name.trim()) validationErrors.name = 'Name is required'
    if (!data.type) validationErrors.type = 'Type is required'
    if (!data.status) validationErrors.status = 'Status is required'
    if (data.jurisdictions.length === 0) validationErrors.jurisdictions = 'At least one jurisdiction is required'

    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([key, msg]) => setError(key as any, msg))
      return
    }

    post('/frameworks', {
      onSuccess: () => {
        reset()
        setReleaseOpen(false)
        setEffectiveOpen(false)
        setRetiredOpen(false)
      },
    })
  }

  // ─── Tags Handlers ───
  const toggleTag = (tag: Tag) => {
    const updated = selectedTags.some(t => t.id === tag.id)
      ? selectedTags.filter(t => t.id !== tag.id)
      : [...selectedTags, tag]
    setSelectedTags(updated)
    setData('tags', updated.map(t => t.id.toString()))
  }

  const createTag = () => {
    const trimmed = newTagName.trim()
    if (!trimmed) return

    router.post('/tags', { name: trimmed }, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const refreshed = page.props?.tags ?? []
        setTagsList(refreshed)
        const created = refreshed.find((t: Tag) => t.name === trimmed)
        if (created) toggleTag(created)
        setNewTagName('')
      },
    })
  }

  const updateTag = () => {
    if (!editingTag || !editingTagName.trim()) return
    router.put(`/tags/${editingTag.id}`, { name: editingTagName.trim() }, {
      preserveScroll: true,
      onSuccess: () => {
        setTagsList(prev => prev.map(t => t.id === editingTag.id ? { ...t, name: editingTagName.trim() } : t))
        setSelectedTags(prev => prev.map(t => t.id === editingTag.id ? { ...t, name: editingTagName.trim() } : t))
        setEditingTag(null)
        setEditingTagName('')
      },
    })
  }

  const removeTag = () => {
    if (!tagToDelete) return
    router.delete(`/tags/${tagToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setTagsList(prev => prev.filter(t => t.id !== tagToDelete.id))
        const updated = selectedTags.filter(t => t.id !== tagToDelete.id)
        setSelectedTags(updated)
        setData('tags', updated.map(t => t.id.toString()))
        setTagToDelete(null)
      },
    })
  }

  // ─── Jurisdictions Handlers ───
  const toggleJurisdiction = (jurisdiction: Jurisdiction) => {
    const idStr = jurisdiction.id.toString()
    setData('jurisdictions',
      data.jurisdictions.includes(idStr)
        ? data.jurisdictions.filter(id => id !== idStr)
        : [...data.jurisdictions, idStr]
    )
  }

  const createJurisdiction = () => {
    const trimmed = newJurisdictionName.trim()
    if (!trimmed) return

    router.post('/jurisdictions', { name: trimmed }, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const refreshed = page.props?.jurisdictions ?? []
        setJurisdictionsList(refreshed)
        const created = refreshed.find((j: Jurisdiction) => j.name === trimmed)
        if (created) toggleJurisdiction(created)
        setNewJurisdictionName('')
      },
    })
  }

  const updateJurisdiction = () => {
    if (!editingJurisdiction || !editingJurisdictionName.trim()) return
    router.put(`/jurisdictions/${editingJurisdiction.id}`, { name: editingJurisdictionName.trim() }, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        setJurisdictionsList(page.props?.jurisdictions ?? [])
        setEditingJurisdiction(null)
        setEditingJurisdictionName('')
      },
    })
  }

  const removeJurisdiction = () => {
    if (!jurisdictionToDelete) return
    router.delete(`/jurisdictions/${jurisdictionToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setJurisdictionsList(prev => prev.filter(j => j.id !== jurisdictionToDelete.id))
        setData('jurisdictions', data.jurisdictions.filter(id => id !== jurisdictionToDelete.id.toString()))
        setJurisdictionToDelete(null)
      },
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

      {/* Flash Dialog */}
      <Dialog open={flashOpen} onOpenChange={setFlashOpen}>
        <DialogContent className={cn(
          flash?.type === 'success' ? 'border-green-600' : 'border-red-600'
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              flash?.type === 'success' ? 'text-green-600' : 'text-red-600'
            )}>
              {flash?.type === 'success' ? 'Success' : 'Error'}
            </DialogTitle>
          </DialogHeader>
          <p className="py-4">{flash?.message}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlashOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Jurisdiction Confirmation */}
      <Dialog open={!!jurisdictionToDelete} onOpenChange={() => setJurisdictionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Jurisdiction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{jurisdictionToDelete?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJurisdictionToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={removeJurisdiction}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Confirmation */}
      <Dialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{tagToDelete?.name}</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={removeTag}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Framework</h1>
            <p className="text-muted-foreground mt-1.5">
              Add a new compliance, regulatory, contractual or internal framework
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/frameworks">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          {/*   <Button variant="outline" size="sm" onClick={() => setJurisdictionsDialogOpen(true)}>
              Manage Jurisdictions
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTagsDialogOpen(true)}>
              Manage Tags
            </Button> */}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Information */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2.5">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Required fields are marked with *</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pt-2">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Code <span className="text-destructive text-base">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={data.code}
                    onChange={e => {
                      setData('code', e.target.value.toUpperCase().trim())
                      clearErrors('code')
                    }}
                    className={cn(errors.code && 'border-destructive focus-visible:ring-destructive/50')}
                    placeholder="e.g. ISO27001, GDPR, NIST-CSF"
                  />
                  {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive text-base">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={e => {
                      setData('name', e.target.value)
                      clearErrors('name')
                    }}
                    className={cn(errors.name && 'border-destructive focus-visible:ring-destructive/50')}
                    placeholder="e.g. ISO/IEC 27001:2022 – Information Security"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input
                    value={data.version}
                    onChange={e => setData('version', e.target.value)}
                    placeholder="2022, v1.1, 4.0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Type <span className="text-destructive text-base">*</span>
                  </Label>
                  <Select value={data.type} onValueChange={v => {
                    setData('type', v)
                    clearErrors('type')
                  }}>
                    <SelectTrigger className={cn(errors.type && 'border-destructive')}>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="regulation">Regulation / Law</SelectItem>
                      <SelectItem value="contract">Contract / Agreement</SelectItem>
                      <SelectItem value="internal_policy">Internal Policy</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label>
                    Status <span className="text-destructive text-base">*</span>
                  </Label>
                  <Select value={data.status} onValueChange={v => {
                    setData('status', v)
                    clearErrors('status')
                  }}>
                    <SelectTrigger className={cn(errors.status && 'border-destructive')}>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Publisher</Label>
                  <Input
                    value={data.publisher}
                    onChange={e => setData('publisher', e.target.value)}
                    placeholder="ISO, NIST, European Union, Internal..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scope / Applicability</Label>
                  <Input
                    value={data.scope}
                    onChange={e => setData('scope', e.target.value)}
                    placeholder="Information Security, All organization, EU entities..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jurisdictions & Tags */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2.5">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Jurisdictions & Tags</CardTitle>
                  <CardDescription>Geographic scope and categorization</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    Jurisdictions <span className="text-destructive text-base">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setJurisdictionsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Manage
                  </Button>
                </div>
                <MultiSelect
                  options={jurisdictionsList.map(j => ({
                    value: j.id.toString(),
                    label: j.name,
                  }))}
                  value={data.jurisdictions}
                  onValueChange={selected => {
                    setData('jurisdictions', selected)
                    clearErrors('jurisdictions')
                  }}
                  placeholder="Select one or multiple jurisdictions..."
                />
                {errors.jurisdictions && (
                  <p className="text-sm text-destructive mt-1.5">{errors.jurisdictions}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <TagIcon className="h-4 w-4" /> Tags
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTagsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Manage
                  </Button>
                </div>
                <MultiSelect
                  options={tagsList.map(t => ({
                    value: t.id.toString(),
                    label: t.name,
                  }))}
                  value={data.tags}
                  onValueChange={selected => setData('tags', selected)}
                  placeholder="Select or search tags..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2.5">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Important Dates</CardTitle>
                  <CardDescription>Timeline of the framework lifecycle</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Release Date</Label>
                  <Popover open={releaseOpen} onOpenChange={setReleaseOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-11',
                          !data.release_date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.release_date ? format(new Date(data.release_date), 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={data.release_date ? new Date(data.release_date) : undefined}
                        onSelect={date => {
                          setData('release_date', date ? format(date, 'yyyy-MM-dd') : '')
                          setReleaseOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Popover open={effectiveOpen} onOpenChange={setEffectiveOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-11',
                          !data.effective_date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.effective_date ? format(new Date(data.effective_date), 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={data.effective_date ? new Date(data.effective_date) : undefined}
                        onSelect={date => {
                          setData('effective_date', date ? format(date, 'yyyy-MM-dd') : '')
                          setEffectiveOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Retired Date (optional)</Label>
                  <Popover open={retiredOpen} onOpenChange={setRetiredOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-11',
                          !data.retired_date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.retired_date ? format(new Date(data.retired_date), 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={data.retired_date ? new Date(data.retired_date) : undefined}
                        onSelect={date => {
                          setData('retired_date', date ? format(date, 'yyyy-MM-dd') : '')
                          setRetiredOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description & Reference */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Description & Reference</CardTitle>
                  <CardDescription>Full description and official source</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pt-2">
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  placeholder="Purpose of the framework, main requirements, applicability, responsibilities..."
                  className="min-h-[160px] resize-y"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={data.language} onValueChange={v => setData('language', v)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select language..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Arabic">Arabic</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Official Reference URL</Label>
                  <Input
                    type="url"
                    value={data.url_reference}
                    onChange={e => setData('url_reference', e.target.value)}
                    placeholder="https://www.iso.org/standard/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-8">
            <Button variant="outline" size="lg" asChild disabled={processing}>
              <Link href="/frameworks">Cancel</Link>
            </Button>
            <Button type="submit" size="lg" disabled={processing} className="min-w-[200px]">
              {processing ? 'Creating...' : 'Create Framework'}
            </Button>
          </div>
        </form>
      </div>

      {/* Manage Jurisdictions Dialog */}
      <Dialog open={jurisdictionsDialogOpen} onOpenChange={setJurisdictionsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Jurisdictions</DialogTitle>
            <DialogDescription>
              Add, edit or remove jurisdictions. Selected ones will be associated with this framework.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 max-h-[60vh] overflow-y-auto space-y-2">
            {jurisdictionsList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No jurisdictions yet</p>
            ) : (
              jurisdictionsList.map(j => (
                <div
                  key={j.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={data.jurisdictions.includes(j.id.toString())}
                      onChange={() => toggleJurisdiction(j)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="font-medium">{j.name}</span>
                    {data.jurisdictions.includes(j.id.toString()) && (
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">Selected</span>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingJurisdiction(j)
                        setEditingJurisdictionName(j.name)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setJurisdictionToDelete(j)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t">
            {editingJurisdiction ? (
              <div className="flex gap-3">
                <Input
                  value={editingJurisdictionName}
                  onChange={e => setEditingJurisdictionName(e.target.value)}
                  placeholder="Edit jurisdiction name"
                  autoFocus
                />
                <Button onClick={updateJurisdiction} disabled={!editingJurisdictionName.trim()}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditingJurisdiction(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Input
                  value={newJurisdictionName}
                  onChange={e => setNewJurisdictionName(e.target.value)}
                  placeholder="New jurisdiction (e.g. EU, USA...)"
                  onKeyDown={e => e.key === 'Enter' && createJurisdiction()}
                />
                <Button onClick={createJurisdiction} disabled={!newJurisdictionName.trim()}>
                  Add
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Tags Dialog */}
      <Dialog open={tagsDialogOpen} onOpenChange={setTagsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Add, edit or remove tags. Selected ones will be associated with this framework.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 max-h-[60vh] overflow-y-auto space-y-2">
            {tagsList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tags yet</p>
            ) : (
              tagsList.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedTags.some(t => t.id === tag.id)}
                      onChange={() => toggleTag(tag)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="font-medium">{tag.name}</span>
                    {selectedTags.some(t => t.id === tag.id) && (
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">Selected</span>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingTag(tag)
                        setEditingTagName(tag.name)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setTagToDelete(tag)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t">
            {editingTag ? (
              <div className="flex gap-3">
                <Input
                  value={editingTagName}
                  onChange={e => setEditingTagName(e.target.value)}
                  placeholder="Edit tag name"
                  autoFocus
                />
                <Button onClick={updateTag} disabled={!editingTagName.trim()}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditingTag(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Input
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  placeholder="New tag (e.g. GDPR, PCI-DSS, Cloud...)"
                  onKeyDown={e => e.key === 'Enter' && createTag()}
                />
                <Button onClick={createTag} disabled={!newTagName.trim()}>
                  Add
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}