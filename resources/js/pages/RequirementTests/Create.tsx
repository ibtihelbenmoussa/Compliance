import { Head, useForm, router } from '@inertiajs/react'
import { route } from 'ziggy-js'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Framework {
  id: number
  code: string
  name: string
}

interface Requirement {
  id: number
  code: string
  title: string
  framework?: Framework | null
}

interface Props {
  requirement: Requirement
}

export default function Create({ requirement }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    test_code: '',
    name: '',
    objective: '',
    procedure: '',
    status: 'pending',
    result: '',
    evidence: '',
    effective_date: undefined as Date | undefined,
    efficacy: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('requirements.test.store', requirement.id))
  }

  return (
    <AppLayout>
      <Head title="New Compliance Test" />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 shadow-lg border border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  New Compliance Test
                </h1>
                <div className="mt-3 space-y-2">
                  <p className="text-lg text-foreground/90">
                    <span className="font-semibold">{requirement.code}</span> — {requirement.title}
                  </p>
                  {requirement.framework && (
                    <div className="inline-flex items-center gap-3 bg-background/70 px-4 py-2 rounded-full border border-border/60">
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        {requirement.framework.code}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-medium">
                        {requirement.framework.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => router.visit(route('requirement-tests.index'))}
              >
                ← Back to List
              </Button>
            </div>
          </div>

          {/* Main Form */}
          <Card className="border-none shadow-2xl overflow-hidden bg-card">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/20 pb-8 pt-10">
              <CardTitle className="text-2xl md:text-3xl font-semibold text-center md:text-left">
                Test Details
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Row 1: Code + Name */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="test_code" className="text-base font-medium flex items-center gap-1.5">
                      Test Code <span className="text-destructive text-lg">*</span>
                    </Label>
                    <Input
                      id="test_code"
                      placeholder="TEST-2025-001"
                      value={data.test_code}
                      onChange={e => setData('test_code', e.target.value)}
                      className={cn(
                        "h-12 text-base shadow-sm transition-all",
                        errors.test_code && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {errors.test_code && <p className="text-destructive text-sm mt-1.5">{errors.test_code}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-medium flex items-center gap-1.5">
                      Name / Summary <span className="text-destructive text-lg">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Regular backup verification process"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className={cn(
                        "h-12 text-base shadow-sm transition-all",
                        errors.name && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {errors.name && <p className="text-destructive text-sm mt-1.5">{errors.name}</p>}
                  </div>
                </div>

                {/* Objective */}
                <div className="space-y-3">
                  <Label htmlFor="objective" className="text-base font-medium flex items-center gap-1.5">
                    Test Objective <span className="text-destructive text-lg">*</span>
                  </Label>
                  <Textarea
                    id="objective"
                    placeholder="State the purpose, scope, and expected outcome of this test..."
                    value={data.objective}
                    onChange={e => setData('objective', e.target.value)}
                    className={cn(
                      "min-h-[120px] text-base resize-y transition-all shadow-sm",
                      errors.objective && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.objective && <p className="text-destructive text-sm mt-1.5">{errors.objective}</p>}
                </div>

                {/* Procedure */}
                <div className="space-y-3">
                  <Label htmlFor="procedure" className="text-base font-medium flex items-center gap-1.5">
                    Test Procedure <span className="text-destructive text-lg">*</span>
                  </Label>
                  <Textarea
                    id="procedure"
                    placeholder="Provide step-by-step instructions, tools, and expected results..."
                    value={data.procedure}
                    onChange={e => setData('procedure', e.target.value)}
                    className={cn(
                      "min-h-[180px] text-base resize-y transition-all shadow-sm",
                      errors.procedure && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {errors.procedure && <p className="text-destructive text-sm mt-1.5">{errors.procedure}</p>}
                </div>

                {/* 3-column row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-base font-medium flex items-center gap-1.5">
                      Status <span className="text-destructive text-lg">*</span>
                    </Label>
                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                      <SelectTrigger className={cn("h-12 shadow-sm", errors.status && "border-destructive")}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-destructive text-sm mt-1.5">{errors.status}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="result" className="text-base font-medium flex items-center gap-1.5">
                      Result <span className="text-destructive text-lg">*</span>
                    </Label>
                    <Select value={data.result} onValueChange={v => setData('result', v)}>
                      <SelectTrigger className={cn("h-12 shadow-sm", errors.result && "border-destructive")}>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="non_compliant">Non-compliant</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.result && <p className="text-destructive text-sm mt-1.5">{errors.result}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="efficacy" className="text-base font-medium flex items-center gap-1.5">
                      Efficacy <span className="text-destructive text-lg">*</span>
                    </Label>
                    <Select value={data.efficacy} onValueChange={v => setData('efficacy', v)}>
                      <SelectTrigger className={cn("h-12 shadow-sm", errors.efficacy && "border-destructive")}>
                        <SelectValue placeholder="Select efficacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="effective">Effective</SelectItem>
                        <SelectItem value="partially_effective">Partially Effective</SelectItem>
                        <SelectItem value="ineffective">Ineffective</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.efficacy && <p className="text-destructive text-sm mt-1.5">{errors.efficacy}</p>}
                  </div>
                </div>

                {/* Evidence */}
                <div className="space-y-3">
                  <Label htmlFor="evidence" className="text-base font-medium">
                    Evidence / Proof
                  </Label>
                  <Textarea
                    id="evidence"
                    placeholder="Describe collected evidence (documents, screenshots, logs, links...)"
                    value={data.evidence}
                    onChange={e => setData('evidence', e.target.value)}
                    className="min-h-[140px] text-base resize-y shadow-sm transition-all"
                  />
                </div>

                {/* Effective Date */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Effective Test Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 text-base shadow-sm transition-all",
                          !data.effective_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-5 w-5" />
                        {data.effective_date
                          ? format(data.effective_date, 'MMMM d, yyyy')
                          : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={data.effective_date}
                        onSelect={(date) => setData('effective_date', date)}
                        className="rounded-md border shadow-lg"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-12 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-border/70 hover:bg-muted/70 transition-colors"
                    onClick={() => router.visit(route('requirement-tests.index'))}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all shadow-lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                        </svg>
                        Creating...
                      </span>
                    ) : 'Create Test'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}