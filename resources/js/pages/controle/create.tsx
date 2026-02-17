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
    code?: string
}
type Owner = {
    id: number
    name: string
}
export default function CreateControl() {
    const { risks, owners } = usePage<{
        risks: Risk[]
        owners: Owner[]
    }>().props

    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        description: '',
        control_type: '',
        control_nature: '',
        frequency: '',
        owner_id: '',

        is_active: true,
        risk_ids: [] as string[],
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/controls')
    }

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Controls', href: '/controls' },
                { title: 'Create', href: '/controls/create' },
            ]}
        >
            <Head title="Create Control" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Create Control
                        </h1>
                        <p className="text-muted-foreground">
                            Define a new control and link it to related risks
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
                                <Label>
                                    Control Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Control Name ..."
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Code */}
                            <div className="space-y-2">
                                <Label>
                                    Control Code <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value.toUpperCase())
                                    }
                                    placeholder="CTRL-001"
                                    maxLength={50}
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">
                                        {errors.code}
                                    </p>
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
                                    placeholder="Provide a detailed description of the control objective and scope..."
                                />
                            </div>
                            {/* Owner */}
                            <div className="space-y-2">
                                <Label htmlFor="owner_id">Control Owner <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.owner_id}
                                    onValueChange={(value) =>
                                        setData('owner_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a control owner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {owners.map((owner) => (
                                            <SelectItem
                                                key={owner.id}
                                                value={owner.id.toString()}
                                            >
                                                {owner.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.owner_id && (
                                    <p className="text-sm text-destructive">
                                        {errors.owner_id}
                                    </p>
                                )}
                            </div>
                            {/* Active Switch */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">
                                        Active Status
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable or disable this control
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                            </div>

                            {/* Selects */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* Type */}
                                <div className="space-y-2">
                                    <Label>
                                        Control Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.control_type}
                                        onValueChange={(v) =>
                                            setData('control_type', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select control type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Preventive">
                                                Preventive
                                            </SelectItem>
                                            <SelectItem value="Detective">
                                                Detective
                                            </SelectItem>
                                            <SelectItem value="Corrective">
                                                Corrective
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Nature */}
                                <div className="space-y-2">
                                    <Label>
                                        Execution Nature <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.control_nature}
                                        onValueChange={(v) =>
                                            setData('control_nature', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select execution nature" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Automated">
                                                Automated
                                            </SelectItem>
                                            <SelectItem value="Manual">
                                                Manual
                                            </SelectItem>
                                            <SelectItem value="Semi-automated">
                                                Semi-automated
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Frequency */}
                                <div className="space-y-2">
                                    <Label>
                                        Execution Frequency <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.frequency}
                                        onValueChange={(v) =>
                                            setData('frequency', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select execution frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Annual">Annual</SelectItem>
                                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                                            <SelectItem value="Monthly">Monthly</SelectItem>
                                            <SelectItem value="Daily">Daily</SelectItem>
                                            <SelectItem value="Hourly">Hourly</SelectItem>
                                            <SelectItem value="Not applicable">
                                                Not applicable
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Risks MultiSelect */}
                            <div className="space-y-2">
                                <Label>
                                    Related Risks <span className="text-destructive">*</span>
                                </Label>

                                <MultiSelect
                                    options={risks.map((risk) => ({
                                        value: risk.id.toString(),
                                        label: `${risk.code ? risk.code + ' - ' : ''}${risk.name}`,
                                    }))}
                                    defaultValue={data.risk_ids}
                                    onValueChange={(selected) =>
                                        setData('risk_ids', selected)
                                    }
                                    placeholder="Search and select related risks..."
                                    searchable
                                />

                                {errors.risk_ids && (
                                    <p className="text-sm text-destructive">
                                        {errors.risk_ids}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/controls')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Control
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
