import { CardUpload, type FileUploadItem } from '@/components/card-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import AppLayout from '@/layouts/app-layout'
import { Process, User } from '@/types'
import { Head, Link, useForm } from '@inertiajs/react'
import { AlertTriangle, ChevronLeft, FileText, Shield } from 'lucide-react'
import { router } from '@inertiajs/react'


interface RiskEditProps {
    risk: {
        id: number
        name: string
        code: string
        description?: string | null
        category?: string | null
        inherent_likelihood: number
        inherent_impact: number
        residual_likelihood: number
        residual_impact: number
        owner_id?: number | null
        is_active: boolean
        processes: { id: number }[]
    }
    owners: User[]
    processes: Process[]
}

const riskCategories = [
    'Operational',
    'Financial',
    'Strategic',
    'Compliance',
    'Reputational',
    'Technology',
    'Environmental',
    'Legal',
]

export default function Edit({ risk, owners, processes }: RiskEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: risk.name,
        code: risk.code,
        description: risk.description ?? '',
        category: risk.category ?? '',

        inherent_likelihood: risk.inherent_likelihood ?? 1,
        inherent_impact: risk.inherent_impact ?? 1,
        residual_likelihood: risk.residual_likelihood ?? 1,
        residual_impact: risk.residual_impact ?? 1,

        owner_id: risk.owner_id ? String(risk.owner_id) : '',
        process_ids: risk.processes.map((p) => String(p.id)),
        is_active: Boolean(risk.is_active),

        documents: [] as File[],
        document_categories: [] as (string | null)[],
        document_descriptions: [] as (string | null)[],
    })

    /* =======================
       File upload
    ======================== */
    const handleFilesChange = (files: FileUploadItem[]) => {
        setData({
            ...data,
            documents: files.map((f) => f.file),
            document_categories: files.map(() => null),
            document_descriptions: files.map(() => null),
        })
    }

    /* =======================
       Submit
    ======================== */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        console.log('Form Data:', data)

        router.put(`/risks/${risk.id}`, data, {
            forceFormData: true,
            preserveScroll: true,
        })
    }
    /* =======================
       Scores
    ======================== */
    const inherentScore =
        data.inherent_likelihood * data.inherent_impact

    const residualScore =
        data.residual_likelihood * data.residual_impact

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Risks', href: '/risks' },
                { title: 'Edit', href: '' },
            ]}
        >
            <Head title="Edit Risk" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Risk
                        </h1>
                        <p className="text-muted-foreground">
                            Update an existing risk
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/risks">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* =======================
                        Risk Details
                    ======================== */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Risk Details
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <span className="text-destructive">*</span>
                                <Input
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Code</Label>
                                <span className="text-destructive">*</span>
                                <Input
                                    value={data.code}
                                    onChange={(e) =>
                                        setData(
                                            'code',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={data.category}
                                    onValueChange={(v) =>
                                        setData('category', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {riskCategories.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Risk Owner</Label>
                                <Select
                                    value={data.owner_id}
                                    onValueChange={(v) =>
                                        setData('owner_id', v)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {owners.map((o) => (
                                            <SelectItem
                                                key={o.id}
                                                value={String(o.id)}
                                            >
                                                {o.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Related Processes</Label>
                                <MultiSelect
                                    options={processes.map((p) => ({
                                        value: String(p.id),
                                        label: `${p.code} - ${p.name}`,
                                    }))}
                                    defaultValue={data.process_ids}
                                    onValueChange={(selected) => setData('process_ids', selected)}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <Label>Active Status</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable or disable this risk
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(v) =>
                                        setData('is_active', v)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* =======================
                        Risk Assessment
                    ======================== */}
                    <Card className="my-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Risk Assessment (Optional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Inherent Risk */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">
                                        Inherent Risk Assessment
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Risk level before considering controls
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="inherent_likelihood">
                                            Likelihood
                                        </Label>
                                        <Slider
                                            min={1}
                                            max={5}
                                            step={1}
                                            value={[
                                                data.inherent_likelihood ?? 1,
                                            ]}
                                            onValueChange={([val]) =>
                                                setData(
                                                    'inherent_likelihood',
                                                    val,
                                                )
                                            }
                                            className="w-full"
                                        />
                                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                            <span>Very Low</span>
                                            <span>Low</span>
                                            <span>Medium</span>
                                            <span>High</span>
                                            <span>Very High</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="inherent_impact">
                                            Impact
                                        </Label>
                                        <Slider
                                            min={1}
                                            max={5}
                                            step={1}
                                            value={[data.inherent_impact ?? 1]}
                                            onValueChange={([val]) =>
                                                setData('inherent_impact', val)
                                            }
                                            className="w-full"
                                        />
                                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                            <span>Very Low</span>
                                            <span>Low</span>
                                            <span>Medium</span>
                                            <span>High</span>
                                            <span>Very High</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Risk Score</Label>
                                        <div
                                            className={`rounded-md border px-3 py-2 text-center font-medium ${inherentScore
                                                ? inherentScore >= 15
                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                    : inherentScore >= 9
                                                        ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                                        : 'border-green-200 bg-green-50 text-green-700'
                                                : 'bg-gray-50 text-gray-500'
                                                }`}
                                        >
                                            {inherentScore || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Residual Risk */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">
                                        Residual Risk Assessment
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Risk level after considering controls
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="residual_likelihood">
                                            Likelihood
                                        </Label>
                                        <Slider
                                            min={1}
                                            max={5}
                                            step={1}
                                            value={[
                                                data.residual_likelihood ?? 1,
                                            ]}
                                            onValueChange={([val]) =>
                                                setData(
                                                    'residual_likelihood',
                                                    val,
                                                )
                                            }
                                            className="w-full"
                                        />
                                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                            <span>Very Low</span>
                                            <span>Low</span>
                                            <span>Medium</span>
                                            <span>High</span>
                                            <span>Very High</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="residual_impact">
                                            Impact
                                        </Label>
                                        <Slider
                                            min={1}
                                            max={5}
                                            step={1}
                                            value={[data.residual_impact ?? 1]}
                                            onValueChange={([val]) =>
                                                setData('residual_impact', val)
                                            }
                                            className="w-full"
                                        />
                                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                            <span>Very Low</span>
                                            <span>Low</span>
                                            <span>Medium</span>
                                            <span>High</span>
                                            <span>Very High</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Risk Score</Label>
                                        <div
                                            className={`rounded-md border px-3 py-2 text-center font-medium ${residualScore
                                                ? residualScore >= 15
                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                    : residualScore >= 9
                                                        ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                                        : 'border-green-200 bg-green-50 text-green-700'
                                                : 'bg-gray-50 text-gray-500'
                                                }`}
                                        >
                                            {residualScore || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* =======================
                        Documents
                    ======================== */}
                    <Card className="my-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardUpload
                                multiple
                                maxFiles={10}
                                maxSize={10 * 1024 * 1024}
                                simulateUpload
                                onFilesChange={handleFilesChange}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/risks">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
