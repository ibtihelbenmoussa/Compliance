import React, { useState, useEffect } from 'react'
import { Head, Link, useForm, usePage, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronDownIcon, X } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Pencil, Trash2 } from 'lucide-react'


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


/* const tagsList = [
  'Information Security',
  'Cybersecurity',
  'Compliance',
  'Audit',
  'Risk Management',
  'GDPR',
  'Privacy',
  'ISO 27001',
  'NIST',
  'PCI-DSS',
] */

export default function CreateFramework({ jurisdictions }: FrameworkCreateProps) {
  const { data, setData, post, processing } = useForm({
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
  const [isJurisdictionModalOpen, setIsJurisdictionModalOpen] = useState(false)
  const [newJurisdiction, setNewJurisdiction] = useState('')

  const [jurisdictionToEdit, setJurisdictionToEdit] = useState<Jurisdiction | null>(null)
  const [editedJurisdictionName, setEditedJurisdictionName] = useState('')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)


  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [jurisdictionToDelete, setJurisdictionToDelete] = useState<Jurisdiction | null>(null)

  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [isMessageOpen, setIsMessageOpen] = useState(false)

  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const [deleteMessageType, setDeleteMessageType] =
    useState<'success' | 'error'>('success')
  const flash = props.flash

  const [tagsListState, setTagsListState] = useState<Tag[]>(props.tags || []);
  const [selectedTags, setSelectedTags] = useState<Tag[]>(data.tags.map((t, i) => ({ id: i + 1, name: t })));

  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);
  const [editedTagName, setEditedTagName] = useState('');

  const openTagsModal = () => setIsTagsModalOpen(true);
  const closeTagsModal = () => {
    setIsTagsModalOpen(false);
    setNewTag('');
    setTagToEdit(null);
    setEditedTagName('');
  }

  // Ajouter un tag
  const addTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;

    // Appel API pour créer le tag
    router.post('/tags', { name: trimmed }, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const createdTag: Tag = page.props.tag;
        if (!tagsListState.find(t => t.id === createdTag.id)) {
          setTagsListState(prev => [...prev, createdTag]);
        }
        // Ajouter dans la sélection
        if (!selectedTags.find(t => t.id === createdTag.id)) {
          const newSelected = [...selectedTags, createdTag];
          setSelectedTags(newSelected); 
      }
        setNewTag('');
           closeTagsModal();
      },
      onError: () => alert('Erreur lors de la création du tag')
    });
  }

  // Sélectionner / désélectionner un tag (multi select)
  const toggleTag = (tag: Tag) => {
    let newSelected: Tag[];
    if (selectedTags.find(t => t.id === tag.id)) {
      newSelected = selectedTags.filter(t => t.id !== tag.id);
    } else {
      newSelected = [...selectedTags, tag];
    }
    setSelectedTags(newSelected);
    setData('tags', newSelected.map(t => t.name));
  }

  // Commencer à éditer un tag
  const startEditTag = (tag: Tag) => {
    setTagToEdit(tag);
    setEditedTagName(tag.name);
  }

  // Confirmer l’édition d’un tag
  const confirmEditTag = () => {
    if (!tagToEdit || !editedTagName.trim()) return;

    const updatedTagsList = tagsListState.map(t =>
      t.id === tagToEdit.id ? { ...t, name: editedTagName.trim() } : t
    );
    setTagsListState(updatedTagsList);

    const updatedSelectedTags = selectedTags.map(t =>
      t.id === tagToEdit.id ? { ...t, name: editedTagName.trim() } : t
    );
    setSelectedTags(updatedSelectedTags);
    setData('tags', updatedSelectedTags.map(t => t.name));

    closeTagsModal();
  }

  // Supprimer un tag
  const deleteTag = (tag: Tag) => {
    const updatedTagsList = tagsListState.filter(t => t.id !== tag.id);
    const updatedSelectedTags = selectedTags.filter(t => t.id !== tag.id);

    setTagsListState(updatedTagsList);
    setSelectedTags(updatedSelectedTags);
    setData('tags', updatedSelectedTags.map(t => t.name));
  }

useEffect(() => {
  if (!props.flash) return;

  if (props.flash.success) {
    setMessageType('success');
    setMessage(props.flash.success);
    setIsMessageOpen(true);
  }

  const timer = setTimeout(() => setIsMessageOpen(false), 5000);
  return () => clearTimeout(timer);
}, [props.flash]);

const submit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('data',data)
    post('/frameworks')
  }
 const openJurisdictionList = () => setIsJurisdictionListOpen(true)
  const closeJurisdictionList = () => setIsJurisdictionListOpen(false)
  const closeJurisdictionModal = () => setIsJurisdictionModalOpen(false)

  const addJurisdiction = () => {
    const trimmed = newJurisdiction.trim();
    if (!trimmed) return;

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
          
          setNewJurisdiction('')
        }
        closeJurisdictionList()
      },
      onError: (errors) => {
        alert(errors.name?.[0] || 'Erreur lors de la création');
      },
    });
  }

  const requestDeleteJurisdiction = (jurisdiction: Jurisdiction) => {
    setJurisdictionToDelete(jurisdiction)
    setIsDeleteModalOpen(true)
    closeJurisdictionList();
  }
  const confirmDeleteJurisdiction = () => {
    if (!jurisdictionToDelete) return

    router.delete(`/jurisdictions/${jurisdictionToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setDeleteMessageType('success')
        setDeleteMessage('Jurisdiction deleted successfully.')
        setJurisdictionsList((prev) =>
          prev.filter((j) => j.id !== jurisdictionToDelete.id)
        )
        setTimeout(() => {
          setIsDeleteModalOpen(false)
          setJurisdictionToDelete(null)
          setDeleteMessage(null)
        }, 1200)
      },
      onError: () => {
        setDeleteMessageType('error')
        setDeleteMessage(
          'Deletion is impossible because this jurisdiction is linked to a framework.'
        )
      },
    })
    closeJurisdictionList()
  }
  const requestEditJurisdiction = (jurisdiction: Jurisdiction) => {
    setJurisdictionToEdit(jurisdiction)
    setEditedJurisdictionName(jurisdiction.name)
    setIsEditModalOpen(true)
    closeJurisdictionList()
  }

  const confirmEditJurisdiction = () => {
    if (!jurisdictionToEdit) return

    router.put(`/jurisdictions/${jurisdictionToEdit.id}`, { name: editedJurisdictionName }, {
      preserveScroll: true,
      onSuccess: (page) => {
        setJurisdictionsList(prev =>
          prev.map(j =>
            j.id === jurisdictionToEdit.id ? { ...j, name: editedJurisdictionName } : j
          )
        )
        setIsEditModalOpen(false)
        setJurisdictionToEdit(null)
        setEditedJurisdictionName('')
      },
      onError: (errors) => {
        alert(errors.name?.[0] || 'Erreur lors de la mise à jour')
      }
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

      {/* Message modal (success / error) */}
      {isMessageOpen && message && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border ${messageType === 'success' ? 'border-green-500' : 'border-red-500'
              }`}
          >
            {<h3
              className={`text-lg font-semibold mb-2 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
            >
              {messageType === 'success' ? 'Succès' : 'Erreur'}
            </h3>}
            <p className="text-gray-700 dark:text-gray-200">{message}</p>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setIsMessageOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && jurisdictionToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border">
            {deleteMessage && (
              <div
                className={`mb-4 rounded px-4 py-2 text-sm ${deleteMessageType === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
              >
                {deleteMessage}
              </div>
            )}

            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Delete jurisdiction
            </h3>
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              Are you sure you want to delete <strong>{jurisdictionToDelete.name}</strong> ?
            </p>
            <div className="flex justify-end gap-3">
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

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Framework</h1>
            <p className="text-muted-foreground">Add a New Framework</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/frameworks">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            <Button variant="outline" onClick={openJurisdictionList}>
              Juridictions
            </Button>

            <Button variant="outline" onClick={openTagsModal}>
              Tags
            </Button>
          </div>
        </div>

        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-6">
              {/* Code & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Code" required>
                  <Input
                    placeholder="ex: ISO27001, GDPR, PCI-DSS"
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value)}
                  />
                </Field>
                <Field label="Name" required>
                  <Input
                    placeholder="ISO/IEC 27001:2022 Information security management systems — Requirements"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                </Field>
              </div>

              {/* Version • Type • Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Version">
                  <Input
                    placeholder="ex: v4.0, 2022, rev.2"
                    value={data.version}
                    onChange={(e) => setData('version', e.target.value)}
                  />
                </Field>
                <Field label="Type" required>
                  <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="regulation">Regulation</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internal_policy">internal policy</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status" required>
                  <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Publisher • Jurisdiction • Scope */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Publisher">
                  <Input
                    placeholder="ex: ISO, CNIL, PCI SSC"
                    value={data.publisher}
                    onChange={(e) => setData('publisher', e.target.value)}
                  />
                </Field>
                <Field label="Juridiction" required>
                  <Select
                    value={data.jurisdiction_id || undefined}
                    onValueChange={(value) => setData('jurisdiction_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a date" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictionsList.map((j) => (
                        <SelectItem key={j.id} value={j.id.toString()}>
                          {j.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Scope">
                  <Input
                    placeholder="Information Security, Privacy, Finance..."
                    value={data.scope}
                    onChange={(e) => setData('scope', e.target.value)}
                  />
                </Field>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Release Date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between text-left">
                        {releaseDate ? format(releaseDate, 'PPP') : 'Select a date'}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={releaseDate}
                        onSelect={(date) => {
                          setReleaseDate(date)
                          setData('release_date', date ? formatDate(date) : '')
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field label="Effective Date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between text-left">
                        {effectiveDate ? format(effectiveDate, 'PPP') : 'Select a date'}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={effectiveDate}
                        onSelect={(date) => {
                          setEffectiveDate(date)
                          setData('effective_date', date ? formatDate(date) : '')
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field label="Retired Date">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between text-left">
                        {retiredDate ? format(retiredDate, 'PPP') : 'Select a date'}
                        <ChevronDownIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={retiredDate}
                        onSelect={(date) => {
                          setRetiredDate(date)
                          setData('retired_date', date ? formatDate(date) : '')
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              </div>

              <Field label="Description">
                <Textarea
                  rows={3}
                  placeholder="Description ou notes d'implémentation..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Language">
                  <Input
                    placeholder="Language"
                    value={data.language}
                    onChange={(e) => setData('language', e.target.value)}
                  />
                </Field>
                <Field label="Url Reference">
                  <Input
                    type="url"
                    placeholder="https://www.iso.org/standard/82875.html"
                    value={data.url_reference}
                    onChange={(e) => setData('url_reference', e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Tags">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.length === 0 && <span className="text-gray-400">No tags selected</span>}
                  {selectedTags.map(tag => (
                    <span
                      key={tag.id}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))}


                </div>
                <Button className="mt-2" onClick={openTagsModal}>Manage Tags</Button>
              </Field>



              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button type="button" variant="outline">
                  Annuler
                </Button>
                <Button type="submit" disabled={processing}>
                  Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal Ajouter Juridiction */}
      {isJurisdictionModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={closeJurisdictionModal}
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-semibold text-center mb-6">Add Jurisdiction</h2>
            <Input
              placeholder="Nouvelle juridiction"
              value={newJurisdiction}
              onChange={(e) => setNewJurisdiction(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeJurisdictionModal}>
                Cancel
              </Button>
              <Button onClick={addJurisdiction}>Add</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Liste des Juridictions */}
      {isJurisdictionListOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="
      bg-gray-900/80
      backdrop-blur-xl
      border border-white/10
      rounded-2xl
      w-full max-w-lg max-h-[80vh]
      overflow-y-auto
      p-6
      shadow-2xl
    ">            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={closeJurisdictionList}
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-semibold text-center mb-2">Juridictions</h2>
            <p className="text-center text-muted-foreground mb-6 text-sm">
              Select or delete a jurisdiction
            </p>

            <ul className="space-y-3 mb-6">
              {jurisdictionsList.length === 0 ? (
                <li className="text-center text-muted-foreground py-8">
                  No jurisdictions available
                </li>
              ) : (
                jurisdictionsList.map((j) => (
                  <li
                    key={j.id}
                    className="
          group flex items-center justify-between
          rounded-xl border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-900
          px-4 py-3
          shadow-sm
          transition-all duration-200
          hover:shadow-md
          hover:bg-gray-50 dark:hover:bg-gray-800
        "
                  >
                    {/* Name */}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {j.name}
                    </span>

                    {/* Actions */}
                    <div className="
          flex gap-2
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
        ">
                      {/* Select */}
                      <Button
                        size="icon"
                        variant="outline"
                        title="Select"
                        onClick={() => {
                          setData('jurisdiction_id', j.id.toString())
                          closeJurisdictionList()
                        }}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>

                      {/* Edit */}
                      <Button
                        size="icon"
                        variant="outline"
                        title="Edit"
                        onClick={() => requestEditJurisdiction(j)}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>

                      {/* Delete */}
                      <Button
                        size="icon"
                        variant="outline"
                        title="Delete"
                        onClick={() => requestDeleteJurisdiction(j)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>


            <div className="flex gap-2">
              <Input
                placeholder="Add New Jurisdiction..."
                value={newJurisdiction}
                onChange={(e) => setNewJurisdiction(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addJurisdiction}>Add</Button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Jurisdiction Modal */}
      {isEditModalOpen && jurisdictionToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">

            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Edit Jurisdiction
            </h3>

            <Input
              value={editedJurisdictionName}
              onChange={(e) => setEditedJurisdictionName(e.target.value)}
              placeholder="Jurisdiction name"
              className="mb-4"
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setJurisdictionToEdit(null)
                }}
              >
                Cancel
              </Button>

              <Button onClick={confirmEditJurisdiction}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      {isTagsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={closeTagsModal}>
              <X size={20} />
            </button>
            <h2 className="text-2xl font-semibold text-center mb-4">Manage Tags</h2>

            {/* Liste des tags */}
            <ul className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {tagsListState.length === 0 ? (
                <li className="text-center text-gray-400 py-4">No tags available</li>
              ) : (
                tagsListState.map(tag => (
                  <li key={tag.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={!!selectedTags.find(t => t.id === tag.id)} onChange={() => toggleTag(tag)} />
                      <span>{tag.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => startEditTag(tag)}>
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => deleteTag(tag)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>

            {/* Ajouter / Éditer */}
            {tagToEdit ? (
              <div className="flex gap-2 mb-4">
                <Input value={editedTagName} onChange={e => setEditedTagName(e.target.value)} className="flex-1" />
                <Button onClick={confirmEditTag}>Save</Button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <Input placeholder="Add new tag" value={newTag} onChange={e => setNewTag(e.target.value)} className="flex-1" />
                <Button onClick={addTag}>Add</Button>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={closeTagsModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}




function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500 text-base leading-none">*</span>}
      </label>
      {children}
    </div>
  )
}