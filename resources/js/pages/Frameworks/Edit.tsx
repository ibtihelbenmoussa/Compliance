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
import { ChevronLeft, ChevronDownIcon } from 'lucide-react'

export default function EditFramework() {
  const { framework, jurisdictions } = usePage<{ 
    framework: any; 
    jurisdictions: { id: number; name: string }[] 
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
    tags: framework.tags?.[0] || '',
  })

  const [releaseDate, setReleaseDate] = useState<Date | undefined>(data.release_date ? new Date(data.release_date) : undefined)
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(data.effective_date ? new Date(data.effective_date) : undefined)
  const [retiredDate, setRetiredDate] = useState<Date | undefined>(data.retired_date ? new Date(data.retired_date) : undefined)

  const [jurisdictionsList] = useState(jurisdictions) 

  const tagsList = [
    'Sécurité de l’information', 'Cybersécurité', 'Conformité', 'Audit', 'Gestion des risques',
    'RGPD', 'Privacy', 'ISO 27001', 'NIST', 'PCI-DSS', 'Gouvernance', 'Contrôle interne',
    'Plan d’action', 'Reporting'
  ]

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

      {/* Message Modal */}
      {isMessageOpen && message && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border ${
              messageType === 'success' ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {messageType === 'success' ? 'Succès' : 'Erreur'}
            </h3>
            <p className="text-gray-700 dark:text-gray-200">{message}</p>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Framework</h1>
            <p className="text-muted-foreground">Modify your framework</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/frameworks">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
        </div>

        <Card className="w-full">
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-6">
              {/* Code & Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Code" required>
                  <Input value={data.code} onChange={e => setData('code', e.target.value)} />
                </Field>
                <Field label="Name" required>
                  <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                </Field>
              </div>

              {/* Version • Type • Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Version">
                  <Input value={data.version} onChange={e => setData('version', e.target.value)} />
                </Field>
                <Field label="Type" required>
                  <Select value={data.type} onValueChange={v => setData('type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="regulation">Regulation</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internal_policy">Internal Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Status" required>
                  <Select value={data.status} onValueChange={v => setData('status', v)}>
                    <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
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
                  <Input value={data.publisher} onChange={e => setData('publisher', e.target.value)} />
                </Field>
               <Field label="Jurisdiction" required>
  <Select
    value={data.jurisdiction_id}
    onValueChange={(v) => setData('jurisdiction_id', v)}
  >
    <SelectTrigger>
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
</Field>

                <Field label="Scope">
                  <Input value={data.scope} onChange={e => setData('scope', e.target.value)} />
                </Field>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DateField label="Release Date" selectedDate={releaseDate} onSelect={d => { setReleaseDate(d); setData('release_date', d ? formatDateString(d.toISOString()) : '') }} />
                <DateField label="Effective Date" selectedDate={effectiveDate} onSelect={d => { setEffectiveDate(d); setData('effective_date', d ? formatDateString(d.toISOString()) : '') }} />
                <DateField label="Retired Date" selectedDate={retiredDate} onSelect={d => { setRetiredDate(d); setData('retired_date', d ? formatDateString(d.toISOString()) : '') }} />
              </div>

              {/* Description */}
              <Field label="Description">
                <Textarea rows={3} value={data.description} onChange={e => setData('description', e.target.value)} />
              </Field>

              {/* Language & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Language">
                  <Input value={data.language} onChange={e => setData('language', e.target.value)} />
                </Field>
                <Field label="Url Reference">
                  <Input type="url" value={data.url_reference} onChange={e => setData('url_reference', e.target.value)} />
                </Field>
              </div>

              {/* Tags */}
              <Field label="Tags">
                <Select value={data.tags} onValueChange={v => setData('tags', v)}>
                  <SelectTrigger><SelectValue placeholder="Select a tag" /></SelectTrigger>
                  <SelectContent>
                    {tagsList.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>

              {/* Submit */}
              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button asChild variant="outline"><Link href="/frameworks">Annuler</Link></Button>
                <Button type="submit" disabled={processing}>Mettre à jour</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

// Composant réutilisable pour les champs
function Field({ label, required, children }: { label: string, required?: boolean, children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium flex items-center gap-1">{label}{required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  )
}

// Composant pour gérer les champs de dates avec calendrier
function DateField({ label, selectedDate, onSelect }: { label: string; selectedDate?: Date; onSelect: (d: Date | undefined) => void }) {
  return (
    <Field label={label}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between text-left">
            {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={selectedDate} onSelect={onSelect} />
        </PopoverContent>
      </Popover>
    </Field>
  )
}
