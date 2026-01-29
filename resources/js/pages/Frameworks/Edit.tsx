import React from 'react'
import { Head, useForm, usePage, Link } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export default function EditFramework() {
  const { framework } = usePage<{ framework: any }>().props

  const formatDate = (date: string | null) => {
    if (!date) return ''
    // Laravel renvoie souvent "2026-01-23T00:00:00.000000Z"
    return date.split('T')[0]
  }

  const { data, setData, put, processing, errors } = useForm({
    code: framework.code || '',
    name: framework.name || '',
    version: framework.version || '',
    type: framework.type || 'standard',
    publisher: framework.publisher || '',
   jurisdiction: framework.jurisdiction || [],

    scope: framework.scope || '',
    status: framework.status || 'active',
    release_date: formatDate(framework.release_date),
    effective_date: formatDate(framework.effective_date),
    retired_date: formatDate(framework.retired_date),
    description: framework.description || '',
    language: framework.language || '',
    url_reference: framework.url_reference || '',
    tags: framework.tags || [],

  })

  const jurisdictionsList = [
    'International',
    'Union Européenne',
    'États-Unis',
    'Tunisie',
  ]

  const tagsList = [
    'Sécurité de l’information',
    'Cybersécurité',
    'Conformité',
    'Audit',
    'Gestion des risques',
    'RGPD',
    'Privacy',
    'ISO 27001',
    'NIST',
    'PCI-DSS',
    'Gouvernance',
    'Contrôle interne',
    'Plan d’action',
    'Reporting',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting data:', data)
    put(`/frameworks/${framework.id}`)
  }

  return (
    <AppLayout>
      <Head title="Modifier Framework" />

      <div className="p-6 max-w-4xl space-y-4">
        <h1 className="text-xl font-bold">Modifier le Framework</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label>Code</label>
            <input
              type="text"
              value={data.code}
              onChange={e => setData('code', e.target.value)}
              className="border p-2 w-full"
              required
            />
            {errors.code && <div className="text-red-500">{errors.code}</div>}
          </div>

          {/* Name */}
          <div>
            <label>Nom</label>
            <input
              type="text"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              className="border p-2 w-full"
              required
            />
            {errors.name && <div className="text-red-500">{errors.name}</div>}
          </div>

          {/* Version */}
          <div>
            <label>Version</label>
            <input
              type="text"
              value={data.version}
              onChange={e => setData('version', e.target.value)}
              className="border p-2 w-full"
            />
          </div>

          {/* Type */}
          <div>
            <label>Type</label>
            <Select value={data.type} onValueChange={v => setData('type', v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="regulation">Regulation</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internal_policy">Internal Policy</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <div className="text-red-500">{errors.type}</div>}
          </div>

          {/* Publisher */}
          <div>
            <label>Publisher</label>
            <input
              type="text"
              value={data.publisher}
              onChange={e => setData('publisher', e.target.value)}
              className="border p-2 w-full"
            />
          </div>

          {/* Jurisdiction */}
          <div>
            <label>Jurisdiction</label>
            <Select
              value={data.jurisdiction[0] || ''}
              onValueChange={v => setData('jurisdiction', v ? [v] : [])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                {jurisdictionsList.map(j => (
                  <SelectItem key={j} value={j}>
                    {j}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jurisdiction && (
              <div className="text-red-500">{errors.jurisdiction}</div>
            )}
          </div>

          {/* Scope */}
          <div>
            <label>Scope</label>
            <textarea
              value={data.scope}
              onChange={e => setData('scope', e.target.value)}
              className="border p-2 w-full"
            />
          </div>

          {/* Status */}
          <div>
            <label>Status</label>
            <Select
              value={data.status}
              onValueChange={v => setData('status', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <div className="text-red-500">{errors.status}</div>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label>Release Date</label>
              <input
                type="date"
                value={data.release_date}
                onChange={e => setData('release_date', e.target.value)}
                className="border p-2 w-full"
              />
              {errors.release_date && (
                <div className="text-red-500">{errors.release_date}</div>
              )}
            </div>
            <div>
              <label>Effective Date</label>
              <input
                type="date"
                value={data.effective_date}
                onChange={e => setData('effective_date', e.target.value)}
                className="border p-2 w-full"
              />
              {errors.effective_date && (
                <div className="text-red-500">{errors.effective_date}</div>
              )}
            </div>
            <div>
              <label>Retired Date</label>
              <input
                type="date"
                value={data.retired_date}
                onChange={e => setData('retired_date', e.target.value)}
                className="border p-2 w-full"
              />
              {errors.retired_date && (
                <div className="text-red-500">{errors.retired_date}</div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label>Description</label>
            <textarea
              value={data.description}
              onChange={e => setData('description', e.target.value)}
              className="border p-2 w-full"
            />
          </div>

          {/* Language */}
          <div>
            <label>Language</label>
            <input
              type="text"
              value={data.language}
              onChange={e => setData('language', e.target.value)}
              className="border p-2 w-full"
            />
          </div>

          {/* URL Reference */}
          <div>
            <label>URL Reference</label>
            <input
              type="text"
              value={data.url_reference}
              onChange={e => setData('url_reference', e.target.value)}
              className="border p-2 w-full"
            />
          </div>

          {/* Tags */}
          <div>
            <label>Tags</label>
            <Select
              value={data.tags[0] || ''}
              onValueChange={v => setData('tags', v ? [v] : [])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tags" />
              </SelectTrigger>
              <SelectContent>
                {tagsList.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={processing}>
              Mettre à jour
            </Button>
            <Link href="/frameworks" className="text-blue-500">
              Annuler
            </Link>
          </div>

          {/* Affichage des erreurs Laravel */}
          {Object.keys(errors).length > 0 && (
            <div className="text-red-500 text-sm">
              {Object.entries(errors).map(([field, message]: any) => (
                <div key={field}>{message}</div>
              ))}
            </div>
          )}
        </form>
      </div>
    </AppLayout>
  )
}
