import { Head, router } from '@inertiajs/react'
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
  FileCheck,
  MessageSquare,
  Link2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface RequirementTest {
  id: number
  requirement: {
    id: number
    code: string
    title: string
    framework?: { code: string; name: string } | null
  }
  user: { name: string } | null
  test_date: string | null
  status: 'compliant' | 'non_compliant' | 'partial' | 'na'
  comment?: string | null
  evidence?: string[] | null
  created_at: string
  updated_at?: string | null
  validation_status?: 'pending' | 'accepted' | 'rejected' | null
  validation_comment?: string | null
}

interface Props {
  test: RequirementTest
}

export default function ShowRequirementTest({ test }: Props) {
  const formatDate = (date?: string | null) => {
    if (!date) return '—'
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return date
      return format(d, 'dd MMMM yyyy', { locale: fr })
    } catch {
      return date
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      compliant: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300',
      non_compliant: 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300',
      partial: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300',
      na: 'bg-slate-500/10 text-slate-700 border-slate-500/30 dark:bg-slate-900/40 dark:text-slate-300',
    }
    return colors[status.toLowerCase()] || 'bg-gray-500/10 text-gray-700 border-gray-500/30 dark:bg-gray-800/40 dark:text-gray-300'
  }

  const getValidationColor = (status?: string | null) => {
    if (!status) return 'bg-gray-500/10 text-gray-700 border-gray-500/30 dark:bg-gray-800/40 dark:text-gray-300'
    const colors: Record<string, string> = {
      accepted: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300',
      rejected: 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300',
      pending: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300',
    }
    return colors[status.toLowerCase()] || 'bg-gray-500/10 text-gray-700 border-gray-500/30 dark:bg-gray-800/40 dark:text-gray-300'
  }

  const hasEvidence = test.evidence && test.evidence.length > 0

  return (
    <AppLayout>
      <Head title={`Test • ${test.requirement.code} - ${test.requirement.title}`} />

      <div className="p-6 lg:p-10 space-y-10 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="rounded-full hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                {test.requirement.code} — {test.requirement.title}
              </h1>
              <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                <Badge variant="outline" className="font-mono text-sm px-3 py-1 bg-muted/50">
                  Test ID: {test.id}
                </Badge>
                {test.requirement.framework && (
                  <Badge variant="outline" className="text-sm px-3 py-1 bg-muted/50">
                    {test.requirement.framework.code}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.visit(`/requirement-tests/${test.id}/edit`)}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all"
            size="lg"
          >
            <Pencil className="h-4 w-4" />
            Modifier le test
          </Button>
        </div>

        {/* Badges principaux */}
        <div className="flex flex-wrap gap-3">
          <Badge
            className={`px-5 py-1.5 text-base font-medium rounded-full border ${getStatusColor(test.status)}`}
          >
            {test.status === 'non_compliant'
              ? 'Non conforme'
              : test.status === 'partial'
              ? 'Partiellement conforme'
              : test.status === 'na'
              ? 'Non applicable'
              : 'Conforme'}
          </Badge>

          {test.validation_status && (
            <Badge
              className={`px-5 py-1.5 text-base font-medium rounded-full border ${getValidationColor(test.validation_status)}`}
            >
              {test.validation_status === 'accepted'
                ? 'Validé'
                : test.validation_status === 'rejected'
                ? 'Rejeté'
                : 'En attente'}
            </Badge>
          )}

          <Badge variant="secondary" className="px-5 py-1.5 text-base">
            Testé le {formatDate(test.test_date)}
          </Badge>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations générales */}
            <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileCheck className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Détails du test</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Exigence" value={test.requirement.title} />
                <Field label="Code exigence" value={test.requirement.code} />
                <Field label="Framework" value={test.requirement.framework?.name || '—'} />
                <Field label="Testeur" value={test.user?.name || '—'} icon={<User className="h-4 w-4" />} />
                <Field label="Date du test" value={formatDate(test.test_date)} icon={<Calendar className="h-4 w-4" />} />
                <Field label="Créé le" value={formatDate(test.created_at)} icon={<Clock className="h-4 w-4" />} />
              </CardContent>
            </Card>

            {/* Commentaire */}
            {test.comment && (
              <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold">Commentaire / Observations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {test.comment}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Preuves / Evidence */}
            <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Preuves / Évidences</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {hasEvidence ? (
                  <div className="space-y-3">
                    {test.evidence?.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-primary hover:text-primary/80 hover:underline transition-all group text-base break-all"
                      >
                        <div className="p-1.5 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                          <Link2 className="h-4 w-4" />
                        </div>
                        <span>Preuve {index + 1}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-muted-foreground py-4">
                    <AlertCircle className="h-5 w-5" />
                    <span>Aucune preuve jointe</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Validation */}
            <Card className="border border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Validation</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Field
                  label="Statut validation"
                  value={
                    test.validation_status
                      ? test.validation_status === 'accepted'
                        ? 'Accepté'
                        : test.validation_status === 'rejected'
                        ? 'Rejeté'
                        : 'En attente'
                      : '—'
                  }
                  icon={<CheckCircle2 className="h-4 w-4" />}
                />
                {test.validation_comment && (
                  <Field
                    label="Commentaire validation"
                    value={test.validation_comment}
                    icon={<MessageSquare className="h-4 w-4" />}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Field({
  label,
  value,
  icon,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2.5">
        {icon}
        {label}
      </p>
      <p className="font-medium text-base text-foreground break-words">
        {value || '—'}
      </p>
    </div>
  )
}