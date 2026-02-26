import { Head, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Test {
  id: number
  test_code: string
  status: string
  comment?: string
  evidence?: any // array ou string selon ton cast
  test_date?: string
  validation_status: 'pending' | 'accepted' | 'rejected'
  validation_comment?: string
  created_at: string
  requirement?: {
    code: string
    title: string
  }
}

interface Props {
  tests: {
    data: Test[]
    links: any
    meta: any
  }
}

export default function Validation({ tests }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null)
  const [rejectComment, setRejectComment] = useState('')

  const openModal = (test: Test, type: 'accept' | 'reject') => {
    setSelectedTest(test)
    setActionType(type)
    setRejectComment('')
    setModalOpen(true)
  }

  const handleAction = () => {
    if (!selectedTest || !actionType) return

    if (actionType === 'reject' && !rejectComment.trim()) {
      alert('Le motif du refus est obligatoire')
      return
    }

    const routeName = actionType === 'accept' ? 'requirement-tests.accept' : 'requirement-tests.reject'

    router.patch(route(routeName, selectedTest.id), {
      comment: actionType === 'reject' ? rejectComment : undefined,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setModalOpen(false)
        setSelectedTest(null)
        setActionType(null)
        setRejectComment('')
      },
      onError: (errors) => {
        console.error('Erreur validation:', errors)
        alert('Une erreur est survenue')
      }
    })
  }

  return (
    <AppLayout>
      <Head title="Validation des tests des exigences" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Validation des tests des exigences
          </h1>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-3 text-left font-medium">Statut validation</th>
                  <th className="p-3 text-left font-medium">Code test</th>
                  <th className="p-3 text-left font-medium">Exigence</th>
                  <th className="p-3 text-left font-medium">Statut</th>
                  <th className="p-3 text-left font-medium">Date</th>
                  <th className="p-3 text-left font-medium">Commentaire</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Aucun test en attente de validation
                    </td>
                  </tr>
                ) : (
                  tests.data.map((test) => (
                    <tr key={test.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <Badge
                          variant={
                            test.validation_status === 'pending' ? 'secondary' :
                            test.validation_status === 'accepted' ? 'default' :
                            'destructive'
                          }
                        >
                          {test.validation_status === 'pending' ? 'En attente' :
                           test.validation_status === 'accepted' ? 'Accepté' : 'Refusé'}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono">{test.test_code || '—'}</td>
                      <td className="p-3">{test.requirement?.title || '—'}</td>
                      <td className="p-3">{test.status}</td>
                      <td className="p-3">
                        {test.test_date
                          ? format(new Date(test.test_date), 'dd/MM/yyyy', { locale: fr })
                          : '—'}
                      </td>
                      <td className="p-3 max-w-xs truncate">{test.comment || '—'}</td>
                      <td className="p-3 text-center">
                        {test.validation_status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(test, 'accept')}
                          >
                            Valider
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE VALIDATION - exactement comme ta capture */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Validation de test</DialogTitle>
            </DialogHeader>

            <div className="py-6">
              <div className="text-center mb-8">
                <p className="text-lg font-medium">
                  {selectedTest?.test_code} — {selectedTest?.requirement?.title || 'Test'}
                </p>
              </div>

              <div className="flex justify-center gap-12 mb-8">
                <Button
                  className="h-20 w-40 bg-green-600 hover:bg-green-700 text-white rounded-full"
                  onClick={() => setActionType('accept')}
                >
                  <CheckCircle className="mr-2 h-6 w-6" />
                  Accepter
                </Button>

                <Button
                  variant="outline"
                  className="h-20 w-40 border-red-600 text-red-600 hover:bg-red-950/40 rounded-full"
                  onClick={() => setActionType('reject')}
                >
                  <XCircle className="mr-2 h-6 w-6" />
                  Refuser
                </Button>
              </div>

              {actionType === 'reject' && (
                <div className="space-y-4">
                  <Label>Motif du refus (obligatoire)</Label>
                  <Textarea
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Expliquez pourquoi le test est refusé..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-center">
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 w-40"
                disabled={!actionType}
                onClick={handleAction}
              >
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}