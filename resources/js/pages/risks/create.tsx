import { CardUpload, type FileUploadItem } from '@/components/card-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Process, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ChevronLeft, FileText, Shield } from 'lucide-react';

interface RiskCreateProps {
    owners: User[];
    processes: Process[];
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
];

// Removed unused likelihoodLevels and impactLevels

export default function RiskCreate({ owners, processes }: RiskCreateProps) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        code: string;
        description: string;
        category: string;
        inherent_likelihood?: number;
        inherent_impact?: number;
        residual_likelihood?: number;
        residual_impact?: number;
        owner_id?: string;
        process_ids: string[];
        is_active: boolean;
        documents?: File[];
        document_categories?: (string | null)[];
        document_descriptions?: (string | null)[];
    }>({
        name: '',
        code: '',
        description: '',
        category: '',
        process_ids: [],
        is_active: true,
    });

    const handleFilesChange = (files: FileUploadItem[]) => {
        setData({
            ...data,
            documents: files.map((f) => f.file),
            document_categories: files.map(() => null),
            document_descriptions: files.map(() => null),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/risks', {
            forceFormData: true, 
           
        });
    };

    const inherentScore =
        typeof data.inherent_likelihood === 'number' &&
            typeof data.inherent_impact === 'number'
            ? data.inherent_likelihood * data.inherent_impact
            : undefined;

    const residualScore =
        typeof data.residual_likelihood === 'number' &&
            typeof data.residual_impact === 'number'
            ? data.residual_likelihood * data.residual_impact
            : undefined;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Risks', href: '/risks' },
                { title: 'Create', href: '' },
            ]}
        >
            <Head title="Create Risk" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Create Risk
                        </h1>
                        <p className="text-muted-foreground">
                            Add a new risk to your organization's risk registry
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/risks">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Risk Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Data breach risk"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Code */}
                            <div className="space-y-2">
                                <Label htmlFor="code">
                                    Code{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData(
                                            'code',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="RISK-001"
                                    maxLength={50}
                                    required
                                />
                                {errors.code && (
                                    <p className="text-sm text-destructive">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Brief description of the risk"
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={data.category}
                                    onValueChange={(value) =>
                                        setData('category', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {riskCategories.map((category) => (
                                            <SelectItem
                                                key={category}
                                                value={category}
                                            >
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category && (
                                    <p className="text-sm text-destructive">
                                        {errors.category}
                                    </p>
                                )}
                            </div>

                            {/* Owner */}
                            <div className="space-y-2">
                                <Label htmlFor="owner_id">Risk Owner</Label>
                                <Select
                                    value={data.owner_id}
                                    onValueChange={(value) =>
                                        setData('owner_id', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a risk owner" />
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

                            {/* Related Processes */}
                            <div className="space-y-2">
                                <Label htmlFor="process_ids">
                                    Related Processes
                                </Label>
                                <MultiSelect
                                    options={processes.map((process) => ({
                                        value: process.id.toString(),
                                        label: `${process.code} - ${process.name}`,
                                    }))}
                                    defaultValue={data.process_ids}
                                    onValueChange={(selected) =>
                                        setData('process_ids', selected)
                                    }
                                    placeholder="Select related processes"
                                />
                                {errors.process_ids && (
                                    <p className="text-sm text-destructive">
                                        {errors.process_ids}
                                    </p>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">
                                        Active Status
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Set whether this risk is currently
                                        active
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
                            {errors.is_active && (
                                <p className="text-sm text-destructive">
                                    {errors.is_active}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Risk Assessment */}
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

                    {/* Documents Section */}
                    <Card className="my-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Documents (Optional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label>Upload Documents</Label>
                                <p className="text-sm text-muted-foreground">
                                    Attach relevant documents related to this
                                    risk
                                </p>
                                <CardUpload
                                    maxFiles={10}
                                    maxSize={10 * 1024 * 1024} // 10MB
                                    accept="*"
                                    multiple={true}
                                    simulateUpload={true}
                                    onFilesChange={handleFilesChange}
                                    labels={{
                                        dropzone:
                                            'Drag & drop files here, or click to select',
                                        browse: 'Browse files',
                                        maxSize: 'Max file size: 10MB',
                                        filesCount: 'files uploaded',
                                        addFiles: 'Add more files',
                                        removeAll: 'Remove all',
                                    }}
                                />
                                {errors.documents && (
                                    <p className="text-sm text-destructive">
                                        {errors.documents}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/risks">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Risk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
