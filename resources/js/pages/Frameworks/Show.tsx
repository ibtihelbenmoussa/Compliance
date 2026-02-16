import React from 'react'
import { Head, router, usePage } from '@inertiajs/react'   // ← added usePage here
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil, Calendar, Link2, Tag, FileText } from 'lucide-react'

// Define interfaces (you can move them to a shared types file later)
interface Jurisdiction {
  id: number
  name: string
}

interface Framework {
  id: number
  code: string
  name: string
  version?: string | null
  type: string
  status: string
  publisher?: string | null
  jurisdictions?: Jurisdiction[] | null
  jurisdiction_name?: string | null     
  scope?: string | null
  release_date?: string | null
  effective_date?: string | null
  retired_date?: string | null
  description?: string | null
  language?: string | null
  url_reference?: string | null
  tags_names?: string[] | string | null
}

// Define props shape
interface PageProps {
  framework: Framework
  [key: string]: any;
}

export default function ShowFramework() {
  const { framework } = usePage<PageProps>().props

  // Helpers
  const formatDate = (date?: string | null): string => {
    if (!date) return '—'
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return date
      return d.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return date || '—'
    }
  }

  const getStatusVariant = (status: string): string => {
    const s = status.toLowerCase()
    if (s === 'active') return 'success'
    if (s === 'draft') return 'warning'
    if (s === 'deprecated' || s === 'archived') return 'secondary'
    return 'default'
  }

  const getTypeLabel = (type: string): string => {
    const map: Record<string, string> = {
      standard: 'Standard',
      regulation: 'Réglementation',
      contract: 'Contrat',
      internal_policy: 'Politique interne',
    }
    return map[type] || type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Normalize jurisdictions
  const jurisdictions = framework.jurisdictions?.length
    ? framework.jurisdictions.map((j: Jurisdiction) => j.name)
    : framework.jurisdiction_name
      ? [framework.jurisdiction_name]
      : []

  // Normalize tags
  const tags: string[] = Array.isArray(framework.tags_names)
    ? framework.tags_names
    : typeof framework.tags_names === 'string'
      ? framework.tags_names.split(',').map((t: string) => t.trim()).filter(Boolean)
      : []

  return (
    <AppLayout>
      <Head title={`Framework • ${framework.name}`} />

      <div className="p-6 lg:p-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.visit('/frameworks')}
              className="h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {framework.name}
              </h1>
              <div className="flex items-center gap-3 mt-1.5 text-muted-foreground">
                <code className="text-sm bg-muted px-2.5 py-1 rounded font-mono">
                  {framework.code}
                </code>
                {framework.version && <span className="text-sm">v{framework.version}</span>}
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.visit(`/frameworks/${framework.id}/edit`)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-3">
          <Badge
            variant={getStatusVariant(framework.status) as any}
            className="text-base px-5 py-1.5 capitalize"
          >
            {framework.status}
          </Badge>
          <Badge variant="outline" className="text-base px-5 py-1.5">
            {getTypeLabel(framework.type)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <FileText className="h-6 w-6" />
                  Informations principales
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <Field label="Code" value={framework.code} />
                <Field label="Éditeur" value={framework.publisher || '—'} />
                <Field label="Portée" value={framework.scope || '—'} />
                <Field label="Langue" value={framework.language || '—'} />
                <Field
                  label="Juridiction(s)"
                  value={
                    jurisdictions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {jurisdictions.map((name: string) => (
                          <Badge key={name} variant="secondary">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    ) : '—'
                  }
                />
              </CardContent>
            </Card>

            {framework.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <FileText className="h-6 w-6" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {framework.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Calendar className="h-6 w-6" />
                  Dates importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Field label="Date de publication" value={formatDate(framework.release_date)} />
                <Field label="Date d'entrée en vigueur" value={formatDate(framework.effective_date)} />
                <Field label="Date de retrait" value={formatDate(framework.retired_date)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Tag className="h-6 w-6" />
                  Tags & Référence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Tags</p>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Aucun tag</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Lien de référence officiel
                  </p>
                  {framework.url_reference ? (
                    <a
                      href={framework.url_reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all block text-sm"
                    >
                      {framework.url_reference}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Non disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground mb-1">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}