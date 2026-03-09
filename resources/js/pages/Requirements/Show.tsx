// resources/js/pages/Requirements/Show.tsx
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
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Link2,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  ListTodo,
} from 'lucide-react'

interface Framework {
  code: string
  name: string
}

interface Process {
  name: string
}

interface Requirement {
  id: number
  code: string
  title: string
  description?: string | null
  type: string
  status: string
  priority: string
  frequency: string
  framework?: Framework
  process?: Process
  tags_names?: string[]
  deadline?: string | null
  completion_date?: string | null
  compliance_level: string
  attachments?: string | null
  created_at: string
  updated_at: string
}

export default function ShowRequirement() {
  const { requirement } = usePage<{ requirement: Requirement }>().props

  const formatDate = (date?: string | null): string => {
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

  // Fonctions typées correctement pour Badge variant
  const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    const lower = status.toLowerCase()
    switch (lower) {
      case 'active':   return 'default'
      case 'draft':    return 'secondary'
      case 'archived': return 'outline'
      default:         return 'secondary'
    }
  }

  const getPriorityVariant = (priority: string): "default" | "secondary" | "outline" | "destructive" => {
    const lower = priority.toLowerCase()
    switch (lower) {
      case 'high':   return 'destructive'
      case 'medium': return 'secondary'
      case 'low':    return 'default'
      default:       return 'secondary'
    }
  }

  const getComplianceVariant = (level: string): "default" | "secondary" | "outline" | "destructive" => {
    const lower = level.toLowerCase()
    switch (lower) {
      case 'mandatory':   return 'destructive'
      case 'recommended': return 'default'
      case 'optional':    return 'secondary'
      default:            return 'secondary'
    }
  }

  const attachmentUrls: string[] = (requirement.attachments || '')
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line && line.startsWith('http'))

  return (
    <AppLayout>
      <Head title={`Requirement • ${requirement.title}`} />

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.visit('/requirements')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{requirement.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                  {requirement.code}
                </Badge>
                <Badge variant={getStatusVariant(requirement.status)}>
                  {requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.visit(`/requirements/${requirement.id}/edit`)}
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Requirement
          </Button>
        </div>

        {/* Badges rapides */}
        <div className="flex flex-wrap gap-3">
          <Badge variant={getPriorityVariant(requirement.priority)} className="text-base px-4 py-1.5">
            Priority: {requirement.priority.charAt(0).toUpperCase() + requirement.priority.slice(1)}
          </Badge>

          <Badge variant={getComplianceVariant(requirement.compliance_level)} className="text-base px-4 py-1.5">
            {requirement.compliance_level}
          </Badge>

          <Badge variant="outline" className="text-base px-4 py-1.5">
            {requirement.frequency
              .replace('_', ' ')
              .split(' ')
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')}
          </Badge>
        </div>

        <div className="my-6 border-t" />

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {requirement.description ? (
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {requirement.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided.</p>
                )}
              </CardContent>
            </Card>

            {/* General Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <ListTodo className="h-5 w-5 text-primary" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{requirement.type}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Framework</p>
                  <p className="font-medium">
                    {requirement.framework
                      ? `${requirement.framework.code} — ${requirement.framework.name}`
                      : '—'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Process</p>
                  <p className="font-medium">{requirement.process?.name || '—'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                  <p className="font-medium capitalize">
                    {requirement.frequency.replace('_', ' ')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-primary" />
                  Attachments (URLs)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attachmentUrls.length > 0 ? (
                  <div className="space-y-3">
                    {attachmentUrls.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-primary hover:text-primary/80 hover:underline transition-colors group text-sm break-all"
                      >
                        <div className="p-2 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                          <Link2 className="h-4 w-4" />
                        </div>
                        {url}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground py-4">
                    <AlertCircle className="h-5 w-5" />
                    <span>No attachments added</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Deadline
                  </div>
                  <p className="font-medium">{formatDate(requirement.deadline)}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    Completion Date
                  </div>
                  <p className="font-medium">{formatDate(requirement.completion_date)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-primary" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* {requirement.tags_names?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {requirement.tags_names.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No tags assigned</p>
                )} */}

                {requirement.tags.length > 0 ? (
                <ul className="list-disc ml-5 space-y-1">
                  {requirement.tags.map((p) => (
                    <li key={p.id}>
                     
                         {p.name}
                     
                    
                    </li>
                  ))}
                </ul>
              ) : (
                <p>-</p>
              )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}