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
  jurisdiction: string[] | string | null
  scope?: string | null
  release_date?: string | null
  effective_date?: string | null
  retired_date?: string | null
  description?: string | null
  language?: string | null
  url_reference?: string | null
  tags?: string | null
}

export default function ShowFramework() {
  const { framework } = usePage<{ framework: Framework }>().props

  const parseArray = (value: any) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
      return JSON.parse(value)
    } catch {
      return [value]
    }
  }
 const formatDate = (date?: string | null) => {
  if (!date) return '-'
  const d = new Date(date) // parse string ISO ou datetime
  // Formater en YYYY-MM-DD
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}



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
            <h1 className="text-2xl font-bold">
              {framework.name}
            </h1>
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

        {/* BASIC INFO */}
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
              value={parseArray(framework.jurisdiction).join(', ')}
            />
            <Field label="Scope" value={framework.scope} />
            <Field label="Language" value={framework.language} />
          </CardContent>
        </Card>

        {/* DATES */}
<Field
  label="Release Date"
  value={formatDate(framework.release_date)}
/>
<Field
  label="Effective Date"
  value={formatDate(framework.effective_date)}
/>
<Field
  label="Retired Date"
  value={formatDate(framework.retired_date)}
/>


        {/* REFERENCES */}
        <Card>
          <CardHeader>
            <CardTitle>References</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Tags" value={framework.tags} />

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
      </div>
    </AppLayout>
  )
}
