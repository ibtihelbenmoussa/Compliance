import React from 'react'
import { Head, usePage, router } from '@inertiajs/react'
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

interface Framework {
  id: number
  code: string
  name: string
  version?: string | null
  type: string
  status: string
  publisher?: string | null
  jurisdiction_name?: string | null
  scope?: string | null
  release_date?: string | null
  effective_date?: string | null
  retired_date?: string | null
  description?: string | null
  language?: string | null
  url_reference?: string | null
  tags_names?: string[] | null
}

export default function ShowFramework() {
  const { framework } = usePage<{ framework: Framework }>().props

  // Helpers
  const formatDate = (date?: string | null) => {
    if (!date) return '—'
    try {
      const d = new Date(date)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return date
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'archived':
      case 'deprecated':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const parseTags = (tags: any) => {
    if (!tags) return []
    if (Array.isArray(tags)) return tags
    try {
      return JSON.parse(tags)
    } catch {
      return typeof tags === 'string' ? [tags] : []
    }
  }

  return (
    <AppLayout>
      <Head title={`Framework • ${framework.name}`} />

      {/* On enlève max-w-7xl pour occuper toute la largeur */}
      <div className="p-6 lg:p-10 space-y-10 min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.visit('/frameworks')}
              className="h-11 w-11 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {framework.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                <span className="font-mono text-sm bg-muted/70 px-2.5 py-1 rounded">
                  {framework.code}
                </span>
                {framework.version && (
                  <span className="text-sm font-medium">v{framework.version}</span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.visit(`/frameworks/${framework.id}/edit`)}
            size="lg"
            className="gap-2 px-6"
          >
            <Pencil className="h-4 w-4" />
            Edit Framework
          </Button>
        </div>

        {/* Status Badge */}
        <div>
          <Badge
            variant="outline"
            className={`text-base px-5 py-2 capitalize font-medium ${getStatusColor(
              framework.status
            )}`}
          >
            {framework.status}
          </Badge>
        </div>

        {/* Contenu principal - full width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale (plus large) */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Information */}
            <Card className="border shadow-md">
              <CardHeader className="pb-5">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary/70" />
                  <CardTitle className="text-2xl">General Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-7">
                <Field label="Code" value={framework.code} icon={<span className="font-mono text-base">ABC</span>} />
                <Field
                  label="Type"
                  value={framework.type.charAt(0).toUpperCase() + framework.type.slice(1)}
                />
                <Field label="Publisher" value={framework.publisher || '—'} />
                <Field label="Jurisdiction" value={framework.jurisdiction_name || '—'} />
                <Field label="Scope" value={framework.scope || '—'} />
                <Field label="Language" value={framework.language || '—'} />
              </CardContent>
            </Card>

            {/* Description */}
            {framework.description && (
              <Card className="border shadow-md">
                <CardHeader className="pb-5">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary/70" />
                    <CardTitle className="text-2xl">Description</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {framework.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-8">
            {/* Dates */}
            <Card className="border shadow-md">
              <CardHeader className="pb-5">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-primary/70" />
                  <CardTitle className="text-2xl">Dates</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Field label="Release Date" value={formatDate(framework.release_date)} />
                <Field label="Effective Date" value={formatDate(framework.effective_date)} />
                <Field label="Retired Date" value={formatDate(framework.retired_date)} />
              </CardContent>
            </Card>

            {/* Tags & Reference */}
            <Card className="border shadow-md">
              <CardHeader className="pb-5">
                <div className="flex items-center gap-3">
                  <Tag className="h-6 w-6 text-primary/70" />
                  <CardTitle className="text-2xl">Tags & Reference</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Tags */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Tags</p>
                  <div className="flex flex-wrap gap-2.5">
                    {parseTags(framework.tags_names).length > 0 ? (
                      parseTags(framework.tags_names).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-base px-4 py-1.5">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No tags assigned</span>
                    )}
                  </div>
                </div>

                {/* URL Reference */}
                <div>
                  <p className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Reference URL
                  </p>
                  {framework.url_reference ? (
                    <a
                      href={framework.url_reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-base break-all block"
                    >
                      {framework.url_reference}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">No reference available</span>
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

function Field({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className="font-medium text-lg text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  )
}