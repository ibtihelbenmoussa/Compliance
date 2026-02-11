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
    tags: [] as string[],
    deadline: '',
    completion_date: '',
    compliance_level: '',
    attachments: '',
  })

  const [deadlineDate, setDeadlineDate] = useState<Date | undefined>(undefined)
  const [completionDate, setCompletionDate] = useState<Date | undefined>(undefined)

  // Validation complète avant envoi
  const validateForm = () => {
    let isValid = true
    clearErrors()

    // Code (obligatoire + majuscules)
    if (!data.code.trim()) {
      setError('code', 'Le code est obligatoire')
      isValid = false
    } else if (data.code.trim().length < 3) {
      setError('code', 'Le code doit contenir au moins 3 caractères')
      isValid = false
    }

    // Title
    if (!data.title.trim()) {
      setError('title', 'Le titre est obligatoire')
      isValid = false
    }

    // Type
    if (!data.type) {
      setError('type', 'Le type est obligatoire')
      isValid = false
    }

    // Status
    if (!data.status) {
      setError('status', 'Le statut est obligatoire')
      isValid = false
    }

    // Priority
    if (!data.priority) {
      setError('priority', 'La priorité est obligatoire')
      isValid = false
    }

    // Frequency
    if (!data.frequency) {
      setError('frequency', 'La fréquence est obligatoire')
      isValid = false
    }

    // Framework
    if (!data.framework_id) {
      setError('framework_id', 'Le framework est obligatoire')
      isValid = false
    }

    // Compliance Level
    if (!data.compliance_level) {
      setError('compliance_level', 'Le niveau de conformité est obligatoire')
      isValid = false
    }

    // Deadline (optionnel mais si rempli → doit être une date valide)
    if (data.deadline && isNaN(new Date(data.deadline).getTime())) {
      setError('deadline', 'Format de date invalide')
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
        { title: 'Créer', href: '' },
      ]}
    >
      <Head title="Créer une exigence" />

      <div className="space-y-12 p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Créer une exigence</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Ajouter une nouvelle exigence de conformité
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/requirements">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        {/* Formulaire */}
        <Card className="border-none shadow-2xl bg-gradient-to-b from-card to-card/90 backdrop-blur-sm">
          <CardContent className="pt-10 pb-14 px-6 md:px-12 lg:px-16">
            <form onSubmit={submit} className="space-y-16">
              {/* Basic Information */}
              <div className="space-y-10">
                <h2 className="text-2xl font-semibold tracking-tight border-b pb-4">
                  Informations de base
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
                      Titre <span className="text-red-500 text-base">*</span>
                    </label>
                    <Input
                      placeholder="Évaluation d'impact sur la protection des données..."
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
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regulatory">Réglementaire</SelectItem>
                        <SelectItem value="internal">Interne</SelectItem>
                        <SelectItem value="contractual">Contractuel</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-600 text-sm mt-1.5">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Statut <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.status}
                      onValueChange={(v) => {
                        setData('status', v)
                        if (errors.status) clearErrors('status')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.status ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="draft">Brouillon</SelectItem>
                        <SelectItem value="archived">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-600 text-sm mt-1.5">{errors.status}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Priorité <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.priority}
                      onValueChange={(v) => {
                        setData('priority', v)
                        if (errors.priority) clearErrors('priority')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.priority ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Sélectionner la priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && <p className="text-red-600 text-sm mt-1.5">{errors.priority}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Fréquence <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.frequency}
                      onValueChange={(v) => {
                        setData('frequency', v)
                        if (errors.frequency) clearErrors('frequency')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.frequency ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Sélectionner la fréquence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">Ponctuelle</SelectItem>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                        <SelectItem value="quarterly">Trimestrielle</SelectItem>
                        <SelectItem value="yearly">Annuelle</SelectItem>
                        <SelectItem value="continuous">Continue</SelectItem>
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
                        <SelectValue placeholder="Sélectionner le framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks.length > 0 ? (
                          frameworks.map((fw) => (
                            <SelectItem key={fw.id} value={fw.id.toString()}>
                              {fw.code} - {fw.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            Aucun framework disponible
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.framework_id && <p className="text-red-600 text-sm mt-1.5">{errors.framework_id}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Processus</label>
                    <Select
                      value={data.process_id || 'none'}
                      onValueChange={(v) => setData('process_id', v === 'none' ? '' : v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Sélectionner (optionnel)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
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
                  Contexte & Détails
                </h2>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Description détaillée de l'exigence, champ d'application, contexte..."
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="min-h-[140px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      Niveau de conformité <span className="text-red-500 text-base">*</span>
                    </label>
                    <Select
                      value={data.compliance_level}
                      onValueChange={(v) => {
                        setData('compliance_level', v)
                        if (errors.compliance_level) clearErrors('compliance_level')
                      }}
                    >
                      <SelectTrigger className={`h-11 ${errors.compliance_level ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Sélectionner le niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mandatory">Obligatoire</SelectItem>
                        <SelectItem value="Recommended">Recommandé</SelectItem>
                        <SelectItem value="Optional">Optionnel</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.compliance_level && (
                      <p className="text-red-600 text-sm mt-1.5">{errors.compliance_level}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date limite</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full h-11 justify-start text-left font-normal ${
                            errors.deadline ? 'border-red-500' : ''
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadlineDate ? format(deadlineDate, 'dd MMM yyyy') : 'Choisir une date'}
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
                    <label className="text-sm font-medium">Date de complétion</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-11 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {completionDate ? format(completionDate, 'dd MMM yyyy') : 'Optionnel'}
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
                    placeholder="Sélectionner les tags pertinents..."
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Pièces jointes (URLs)</label>
                  <Textarea
                    placeholder="Coller une ou plusieurs URLs (une par ligne)&#10;Exemples :&#10;https://drive.google.com/...&#10;https://company.sharepoint.com/...&#10;https://example.com/politique.pdf"
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
                  <Link href="/requirements">Annuler</Link>
                </Button>

                <Button
                  type="submit"
                  disabled={processing}
                  size="lg"
                  className="min-w-[220px]"
                >
                  {processing ? 'Création en cours...' : 'Créer l\'exigence'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}