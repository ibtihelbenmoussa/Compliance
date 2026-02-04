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
import { ArrowLeft, Pencil } from 'lucide-react'
 
interface Framework {
  id: number
  code: string
  name: string
  version?: string | null
  type: string
  status: string
  publisher?: string | null
  jurisdiction?: number | null // un seul ID
  jurisdiction_name?: string | null // nom de la juridiction
  scope?: string | null
  release_date?: string | null
  effective_date?: string | null
  retired_date?: string | null
  description?: string | null
  language?: string | null
  url_reference?: string | null
  tags?: string[] | string | null // tableau JSON côté backend
  tags_names?: string[] | null // noms des tags
}
 
export default function ShowFramework() {
  const { framework } = usePage<{ framework: Framework }>().props
 
  // Convertir JSON en tableau
  const parseArray = (value: any) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
      return JSON.parse(value)
    } catch {
      return [value]
    }
  }
 
  // Formater date en YYYY-MM-DD
  const formatDate = (date?: string | null) => {
    if (!date) return '-'
    const d = new Date(date)
    const year = d.getFullYear()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }
 
  // Composant pour chaque champ
  const Field = ({
    label,
    value,
  }: {
    label: string
    value?: React.ReactNode
  }) => (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
  )
 
  return (
    <AppLayout>
      <Head title={`Framework - ${framework.name}`} />
 
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit('/frameworks')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{framework.name}</h1>
          </div>
 
          <Button
            onClick={() =>
              router.visit(`/frameworks/${framework.id}/edit`)
            }
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
 
        {/* GENERAL INFO */}
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Code" value={framework.code} />
            <Field label="Name" value={framework.name} />
            <Field label="Version" value={framework.version} />
            <Field label="Type" value={framework.type} />
            <Field label="Status" value={framework.status} />
            <Field label="Publisher" value={framework.publisher} />
            <Field
              label="Jurisdiction"
              value={framework.jurisdiction_name || '-'}
            />
            <Field label="Scope" value={framework.scope} />
            <Field label="Language" value={framework.language} />
          </CardContent>
        </Card>
 
        {/* DATES */}
        <Card>
          <CardHeader>
            <CardTitle>Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Release Date" value={formatDate(framework.release_date)} />
            <Field label="Effective Date" value={formatDate(framework.effective_date)} />
            <Field label="Retired Date" value={formatDate(framework.retired_date)} />
          </CardContent>
        </Card>
 
        {/* REFERENCES */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tags affichés comme badges */}
            <div className="flex flex-wrap gap-1">
              {parseArray(framework.tags_names).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
              {(!framework.tags_names || framework.tags_names.length === 0) && (
                <span className="text-gray-500">No tags</span>
              )}
            </div>
 
            {/* Reference URL */}
            <Field
              label="Reference URL"
              value={
                framework.url_reference ? (
                  <a
                    href={framework.url_reference}
                    target="_blank"
                    className="text-primary underline"
                  >
                    {framework.url_reference}
                  </a>
                ) : (
                  '-'
                )
              }
            />
          </CardContent>
        </Card>
 
        {/* DESCRIPTION */}
        {framework.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{framework.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
 