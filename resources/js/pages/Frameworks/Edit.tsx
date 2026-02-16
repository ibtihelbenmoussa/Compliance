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

interface PageProps {
  framework: Framework
  jurisdictions: Jurisdiction[]
  tags: Tag[]
  selectedTagIds: string[]
  selectedJurisdictionIds: string[]
  flash?: { success?: string; error?: string }
  [key: string]: any;

}

export default function EditFramework() {
  const { props } = usePage<PageProps>()
  const {
    framework,
    jurisdictions: allJurisdictions,
    tags: allTags,
    selectedTagIds = [],
    selectedJurisdictionIds = []
  } = props

  const { data, setData, put, processing, errors, setError, clearErrors } = useForm({
    code: framework.code || '',
    name: framework.name || '',
    version: framework.version || '',
    type: framework.type || '',
    status: framework.status || '',
    publisher: framework.publisher || '',
    jurisdictions: selectedJurisdictionIds,
    scope: framework.scope || '',
    release_date: framework.release_date ? framework.release_date.split('T')[0] : '',
    effective_date: framework.effective_date ? framework.effective_date.split('T')[0] : '',
    retired_date: framework.retired_date ? framework.retired_date.split('T')[0] : '',
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

  useEffect(() => {
    setReleaseDate(data.release_date ? new Date(data.release_date) : undefined)
    setEffectiveDate(data.effective_date ? new Date(data.effective_date) : undefined)
    setRetiredDate(data.retired_date ? new Date(data.retired_date) : undefined)
  }, [data.release_date, data.effective_date, data.retired_date])

  const [isJurisdictionModalOpen, setIsJurisdictionModalOpen] = useState(false)
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false)

  const [flashMessage, setFlashMessage] = useState<string | null>(null)
  const [flashType, setFlashType] = useState<'success' | 'error'>('success')
  const [showFlash, setShowFlash] = useState(false)

  useEffect(() => {
    if (props.flash?.success) {
      setFlashType('success')
      setFlashMessage(props.flash.success)
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 5000)
    }
    if (props.flash?.error) {
      setFlashType('error')
      setFlashMessage(props.flash.error)
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 5000)
    }
  }, [props.flash])

  const validateForm = () => {
    clearErrors()
    let valid = true

    if (!data.code.trim()) { setError('code', 'Le code est requis'); valid = false }
    if (!data.name.trim()) { setError('name', 'Le nom est requis'); valid = false }
    if (!data.type) { setError('type', 'Le type est requis'); valid = false }
    if (!data.status) { setError('status', 'Le statut est requis'); valid = false }
    if (data.jurisdictions.length === 0) {
      setError('jurisdictions', 'Au moins une juridiction est requise')
      valid = false
    }

    return valid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    put(`/frameworks/${framework.id}`)
  }


  const [selectedTagsLocal, setSelectedTagsLocal] = useState<Tag[]>(
    allTags.filter(t => selectedTagIds.includes(t.id.toString()))
  )

  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTagsLocal.some(t => t.id === tag.id)
    const updated = isSelected
      ? selectedTagsLocal.filter(t => t.id !== tag.id)
      : [...selectedTagsLocal, tag]

    setSelectedTagsLocal(updated)
    setData('tags', updated.map(t => t.id.toString()))
  }

  const [newTagName, setNewTagName] = useState('')
  const [tagBeingEdited, setTagBeingEdited] = useState<Tag | null>(null)
  const [editedTagName, setEditedTagName] = useState('')

  const addNewTag = () => {
    const name = newTagName.trim()
    if (!name) return

    router.post('/tags', { name }, {
      preserveScroll: true,
      onSuccess: () => {
        setNewTagName('')

        // 🔥 Recharge uniquement les tags depuis le serveur
        router.reload({ only: ['tags'] })
      },
      onError: (err: any) => {
        alert(err?.name?.[0] || 'Erreur lors de la création du tag')
      }
    })
  }

  const startEditingTag = (tag: Tag) => {
    setTagBeingEdited(tag)
    setEditedTagName(tag.name)
  }

  const saveEditedTag = () => {
    if (!tagBeingEdited || !editedTagName.trim()) return

    router.put(`/tags/${tagBeingEdited.id}`, { name: editedTagName.trim() }, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedTagsLocal(prev =>
          prev.map(t => t.id === tagBeingEdited.id ? { ...t, name: editedTagName.trim() } : t)
        )



        setTagBeingEdited(null)
        setEditedTagName('')
      },
      onError: (err) => alert('Erreur lors de la mise à jour du tag')
    })
  }
  const deleteTag = (tag: Tag) => {
    router.delete(`/tags/${tag.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedTagsLocal(prev => prev.filter(t => t.id !== tag.id))
        setData('tags', data.tags.filter(id => id !== tag.id.toString()))
      }
    })
  }


  const toggleJurisdiction = (jur: Jurisdiction) => {
    const idStr = jur.id.toString()
    const updated = data.jurisdictions.includes(idStr)
      ? data.jurisdictions.filter(id => id !== idStr)
      : [...data.jurisdictions, idStr]

    setData('jurisdictions', updated)
  }

  const [newJurisdictionName, setNewJurisdictionName] = useState('')
  const addNewJurisdiction = () => {
    const name = newJurisdictionName.trim()
    if (!name) return

    router.post('/jurisdictions', { name }, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const refreshed = page.props?.jurisdictions as Jurisdiction[] | undefined
        if (refreshed) {
          const created = refreshed.find(j => j.name === name)
          if (created) {
            setData('jurisdictions', [...data.jurisdictions, created.id.toString()])
          }
        }
        setNewJurisdictionName('')
      },
      onError: err => alert(err?.name?.[0] || 'Erreur création juridiction')
    })
  }



  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Frameworks', href: '/frameworks' },
        { title: framework.name || 'Édition', href: '' },
      ]}
    >
      <Head title={`Modifier ${framework.name || 'Framework'}`} />

      {/* Flash message overlay */}
      {showFlash && flashMessage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-900 border rounded-xl p-6 max-w-md w-full ${flashType === 'success' ? 'border-green-600' : 'border-red-600'}`}>
            <h3 className={`text-xl font-bold ${flashType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {flashType === 'success' ? 'Succès' : 'Erreur'}
            </h3>
            <p className="text-gray-300 mt-3">{flashMessage}</p>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setShowFlash(false)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold">Modifier le Framework</h1>
            <p className="text-muted-foreground mt-1">Mettre à jour les informations du cadre</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/frameworks">
                <ChevronLeft className="mr-2 h-4 w-4" /> Retour
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setIsJurisdictionModalOpen(true)}>
              Gérer les juridictions
            </Button>
            <Button variant="outline" onClick={() => setIsTagsModalOpen(true)}>
              Gérer les tags
            </Button>
          </div>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="pt-8 pb-12 px-6 md:px-10 lg:px-14">
            <form onSubmit={handleSubmit} className="space-y-16">
              {/* Informations de base */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Informations principales</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code <span className="text-red-500">*</span></label>
                    <Input value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())} />
                    {errors.code && <p className="text-red-600 text-sm">{errors.code}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom <span className="text-red-500">*</span></label>
                    <Input value={data.name} onChange={e => setData('name', e.target.value)} />
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
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="regulation">Réglementation</SelectItem>
                        <SelectItem value="contract">Contrat</SelectItem>
                        <SelectItem value="internal_policy">Politique interne</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-600 text-sm">{errors.type}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Statut <span className="text-red-500">*</span></label>
                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                      <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="deprecated">Déprécié</SelectItem>
                        <SelectItem value="archived">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-600 text-sm">{errors.status}</p>}
                  </div>
                </div>
              </section>

              {/* Contexte */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Contexte</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Éditeur / Publieur</label>
                    <Input value={data.publisher} onChange={e => setData('publisher', e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Juridictions <span className="text-red-500">*</span></label>
                    <MultiSelect
                      options={allJurisdictions.map(j => ({
                        value: j.id.toString(),
                        label: j.name
                      }))}
                      value={data.jurisdictions}
                      onValueChange={(vals) => setData('jurisdictions', vals)}
                      placeholder="Sélectionner une ou plusieurs juridictions..."
                    />
                    {errors.jurisdictions && <p className="text-red-600 text-sm">{errors.jurisdictions}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Portée / Scope</label>
                    <Input value={data.scope} onChange={e => setData('scope', e.target.value)} />
                  </div>
                </div>
              </section>

              {/* Dates importantes */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Dates importantes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date de publication</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {releaseDate ? format(releaseDate, 'PPP') : <span>Choisir une date</span>}
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
                    <label className="text-sm font-medium">Date d'entrée en vigueur</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {effectiveDate ? format(effectiveDate, 'PPP') : <span>Choisir une date</span>}
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
                    <label className="text-sm font-medium">Date de retrait</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {retiredDate ? format(retiredDate, 'PPP') : <span>Optionnel</span>}
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
              </section>

              {/* Détails supplémentaires */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Détails supplémentaires</h2>

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
                    <label className="text-sm font-medium">Langue</label>
                    <Select value={data.language} onValueChange={v => setData('language', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">Anglais</SelectItem>
                        <SelectItem value="French">Français</SelectItem>
                        <SelectItem value="Arabic">Arabe</SelectItem>
                        <SelectItem value="Other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Lien de référence officiel</label>
                    <Input type="url" value={data.url_reference} onChange={e => setData('url_reference', e.target.value)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Tags</label>
                  <MultiSelect
                    options={allTags.map(tag => ({ value: tag.id.toString(), label: tag.name }))}
                    value={data.tags}
                    onValueChange={vals => {
                      setData('tags', vals)
                      setSelectedTagsLocal(allTags.filter(t => vals.includes(t.id.toString())))
                    }}
                    placeholder="Sélectionner ou chercher des tags..."
                  />
                </div>
              </section>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-4 pt-10 border-t">
                <Button type="button" variant="outline" size="lg" asChild>
                  <Link href="/frameworks">Annuler</Link>
                </Button>
                <Button type="submit" disabled={processing} size="lg" className="min-w-48">
                  {processing ? 'Mise à jour...' : 'Mettre à jour le framework'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal Gestion Juridictions (simplifié ici – tu peux étendre) */}
      {isJurisdictionModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800 relative">
              <h2 className="text-2xl font-semibold">Gérer les juridictions</h2>
              <button
                onClick={() => setIsJurisdictionModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-5 border-b border-gray-800">
              <div className="flex gap-3">
                <Input
                  placeholder="Nouvelle juridiction (ex: Tunisie, RGPD...)"
                  value={newJurisdictionName}
                  onChange={e => setNewJurisdictionName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNewJurisdiction())}
                />
                <Button onClick={addNewJurisdiction} disabled={!newJurisdictionName.trim()}>
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="p-5 max-h-[50vh] overflow-y-auto">
              {allJurisdictions.map(j => (
                <div
                  key={j.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-900/50 mb-1"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={data.jurisdictions.includes(j.id.toString())}
                      onChange={() => toggleJurisdiction(j)}
                      className="h-5 w-5 rounded border-gray-600 text-rose-600 focus:ring-rose-600/30"
                    />
                    <span>{j.name}</span>
                  </div>
                  {/* Tu peux ajouter boutons edit/delete ici si besoin */}
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-800 flex justify-end">
              <Button variant="outline" onClick={() => setIsJurisdictionModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gestion Tags – version simplifiée */}
      {isTagsModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800 relative">
              <h2 className="text-2xl font-semibold">Gérer les tags</h2>
              <button
                onClick={() => setIsTagsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-5 border-b border-gray-800">
              <div className="flex gap-3">
                <Input
                  placeholder="Nouveau tag (ex: Cybersécurité, ISO...)"
                  value={newTagName}
                  onChange={e => setNewTagName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                />
                <Button onClick={addNewTag} disabled={!newTagName.trim()}>
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="p-5 max-h-[50vh] overflow-y-auto">
              {allTags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-900/50 mb-1"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedTagsLocal.some(t => t.id === tag.id)}
                      onChange={() => toggleTag(tag)}
                      className="h-5 w-5 rounded border-gray-600 text-rose-600 focus:ring-rose-600/30"
                    />
                    <span>{tag.name}</span>
                  </div>
                  {/* Tu peux ajouter boutons edit/delete ici */}
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-gray-800 flex justify-end">
              <Button variant="outline" onClick={() => setIsTagsModalOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}