import AppLayout from '@/layouts/app-layout'
import { Head, Link, router, useForm, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Shield } from 'lucide-react'
import { MultiSelect } from '@/components/ui/multi-select'
import React from 'react'

type Risk = {
    id: number
    name: string
}

type Owner = {
    id: number
    name: string
}

type Control = {
    id: number
    code: string
    name: string
    description?: string
    control_type: string
    control_nature: string
    frequency: string
    owner_id: number
    is_active: boolean
}

export default function EditControl() {
    const { control, risks, owners, selectedRisks } = usePage<{
        control: Control
        risks: Risk[]
        owners: Owner[]
        selectedRisks: number[]
    }>().props

    const { data, setData, put, processing, errors } = useForm({
        code: control.code || '',
        name: control.name || '',
        description: control.description || '',
        control_type: control.control_type || '',
        control_nature: control.control_nature || '',
        frequency: control.frequency || '',
        owner_id: control.owner_id?.toString() || '',
        is_active: control.is_active ?? true,
        risk_ids: selectedRisks.map(String),
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        put(`/controls/${control.id}`)
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Controls', href: '/controls' },
                { title: 'Edit', href: `/controls/${control.id}/edit` },
            ]}
        >
            <Head title="Edit Control" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Control
                        </h1>
                        <p className="text-muted-foreground">
                            Update control information and linked risks
                        </p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href="/controls">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <CardTitle>Control Details</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label>Control Name <span className="text-destructive">*</span></Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Code */}
                            <div className="space-y-2">
                                <Label>Control Code <span className="text-destructive">*</span></Label>
                                <Input
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value.toUpperCase())
                                    }
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">{errors.code}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                            </div>

                            {/* Owner */}
                            <div className="space-y-2">
                                <Label>Control Owner <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.owner_id}
                                    onValueChange={(v) => setData('owner_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {owners.map((o) => (
                                            <SelectItem key={o.id} value={o.id.toString()}>
                                                {o.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <Label>Active</Label>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(v) => setData('is_active', v)}
                                />
                            </div>

                            {/* Selects */}
                            <div className="grid grid-cols-3 gap-4">
                                <SelectField
                                    label="Control Type"
                                    value={data.control_type}
                                    onChange={(v) => setData('control_type', v)}
                                    options={['Preventive', 'Detective', 'Corrective']}
                                />

                                <SelectField
                                    label="Execution Nature"
                                    value={data.control_nature}
                                    onChange={(v) => setData('control_nature', v)}
                                    options={['Automated', 'Manual', 'Semi-automated']}
                                />

                                <SelectField
                                    label="Frequency"
                                    value={data.frequency}
                                    onChange={(v) => setData('frequency', v)}
                                    options={['Annual', 'Quarterly', 'Monthly', 'Daily', 'Hourly']}
                                />
                            </div>

                            {/* Risks */}
                            <div className="space-y-2">
                                <Label>Related Risks <span className="text-destructive">*</span></Label>
                                <MultiSelect
                                    options={risks.map((r) => ({
                                        value: r.id.toString(),
                                        label: r.name,
                                    }))}
                                    defaultValue={data.risk_ids}
                                    onValueChange={(v) => setData('risk_ids', v)}
                                    searchable
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/controls')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Control
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}

function SelectField({ label, value, onChange, options }: any) {
    return (
        <div className="space-y-2">
            <Label>{label} *</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((o: string) => (
                        <SelectItem key={o} value={o}>
                            {o}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
