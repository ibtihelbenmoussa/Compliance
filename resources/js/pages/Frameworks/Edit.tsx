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
    // Convert numbers → strings (most MultiSelect components want string values)
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
      setError('code', 'Le code est requis')
      isValid = false
    }
    if (!data.name.trim()) {
      setError('name', 'Le nom est requis')
      isValid = false
    }
    if (!data.type) {
      setError('type', 'Le type est requis')
      isValid = false
    }
    if (!data.status) {
      setError('status', 'Le statut est requis')
      isValid = false
    }
    if (data.jurisdictions.length === 0) {
      setError('jurisdictions', 'Au moins une juridiction est requise')
      isValid = false
    }

    // Date coherence
    if (data.release_date && data.effective_date) {
      if (new Date(data.effective_date) < new Date(data.release_date)) {
        setError('effective_date', "Doit être ≥ à la date de publication")
        isValid = false
      }
    }
    if (data.effective_date && data.retired_date) {
      if (new Date(data.retired_date) < new Date(data.effective_date)) {
        setError('retired_date', "Doit être ≥ à la date d'entrée en vigueur")
        isValid = false
      }
    }

    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Optional: you can convert back to numbers here if your backend validation strictly wants integers
    // But Inertia + Laravel usually casts them correctly when you use pluck('id')
    put(`/frameworks/${framework.id}`, {
      preserveScroll: true,
    })
  }

  const createNewTag = () => {
    const name = prompt("Nom du nouveau tag :")?.trim()
    if (!name) return

    router.post('/tags', { name }, {
      preserveScroll: true,
      onSuccess: () => router.reload({ only: ['tags'] }),
      onError: (err) => alert(err?.name?.[0] || 'Erreur lors de la création du tag'),
    })
  }

  const createNewJurisdiction = () => {
    const name = prompt("Nom de la nouvelle juridiction :")?.trim()
    if (!name) return

    router.post('/jurisdictions', { name }, {
      preserveScroll: true,
      onSuccess: () => router.reload({ only: ['jurisdictions'] }),
      onError: (err) => alert(err?.name?.[0] || 'Erreur lors de la création de la juridiction'),
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

      <div className="p-6 lg:p-10 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold">Modifier le Framework</h1>
            <p className="text-muted-foreground mt-1">Mettre à jour les informations du cadre</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/frameworks">
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="pt-8 pb-12 px-6 md:px-10 lg:px-14">
            <form onSubmit={handleSubmit} className="space-y-16">

              {/* Informations principales */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Informations principales</h2>
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
                    <label className="text-sm font-medium">Nom <span className="text-red-500">*</span></label>
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
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Juridictions <span className="text-red-500">*</span>
                      </label>
                      <Button variant="ghost" size="sm" onClick={createNewJurisdiction}>
                        + Nouvelle juridiction
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
                    <label className="text-sm font-medium">Portée / Scope</label>
                    <Input value={data.scope} onChange={e => setData('scope', e.target.value)} />
                  </div>
                </div>
              </section>

              {/* Dates importantes */}
              <section className="space-y-8">
                <h2 className="text-2xl font-semibold border-b pb-3">Dates importantes</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Publication */}
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
                            setReleaseDate(date ?? undefined)
                            setData('release_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Effective */}
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
                            setEffectiveDate(date ?? undefined)
                            setData('effective_date', date ? format(date, 'yyyy-MM-dd') : '')
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Retired */}
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
                            setRetiredDate(date ?? undefined)
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
                        + Nouveau tag
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
                  <Link href="/frameworks">Annuler</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={processing}
                  size="lg"
                  className="min-w-48"
                >
                  {processing ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}