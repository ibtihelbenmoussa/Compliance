import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface RiskLevel {
    name: string;
    color: string;
    min_score: number;
    max_score: number;
    order: number;
}

interface FormData {
    name: string;
    matrix_dimensions: {
        rows: number;
        columns: number;
    };
    scoring_configuration: {
        number_of_levels: number;
        levels: RiskLevel[];
    };
    metadata: {
        is_custom: boolean;
        preset_used?: string;
    };
    is_active: boolean;
}

const defaultColors = [
    '#22c55e', // Green
    '#eab308', // Yellow
    '#f97316', // Orange
    '#ef4444', // Red
    '#7c2d12', // Dark Red
    '#3b82f6', // Blue
];

const matrixPresets = [
    { name: '3×3', rows: 3, columns: 3 },
    { name: '3×5', rows: 3, columns: 5 },
    { name: '5×5', rows: 5, columns: 5 },
];

export default function CreateRiskMatrix() {
    const [selectedPreset, setSelectedPreset] = useState<string>('3x3');

    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        matrix_dimensions: {
            rows: 3,
            columns: 3,
        },
        scoring_configuration: {
            number_of_levels: 3,
            levels: [
                {
                    name: 'Low',
                    color: '#22c55e',
                    min_score: 1,
                    max_score: 3,
                    order: 1,
                },
                {
                    name: 'Medium',
                    color: '#eab308',
                    min_score: 4,
                    max_score: 6,
                    order: 2,
                },
                {
                    name: 'High',
                    color: '#ef4444',
                    min_score: 7,
                    max_score: 9,
                    order: 3,
                },
            ],
        },
        metadata: {
            is_custom: false,
        },
        is_active: false,
    });

    const handlePresetChange = (presetName: string) => {
        setSelectedPreset(presetName);
        const preset = matrixPresets.find((p) => p.name === presetName);
        if (preset) {
            setData({
                ...data,
                matrix_dimensions: {
                    rows: preset.rows,
                    columns: preset.columns,
                },
                metadata: {
                    ...data.metadata,
                    preset_used: presetName,
                },
            });
        }
    };

    const handleLevelsChange = (numberOfLevels: number) => {
        const currentLevels = data.scoring_configuration.levels;
        let newLevels: RiskLevel[] = [];

        if (numberOfLevels > currentLevels.length) {
            // Add new levels
            newLevels = [...currentLevels];
            for (let i = currentLevels.length; i < numberOfLevels; i++) {
                const maxScore =
                    data.matrix_dimensions.rows *
                    data.matrix_dimensions.columns;
                const scoreRange = Math.ceil(maxScore / numberOfLevels);
                const minScore = i * scoreRange + 1;
                const levelMaxScore = Math.min((i + 1) * scoreRange, maxScore);

                newLevels.push({
                    name: `Level ${i + 1}`,
                    color: defaultColors[i % defaultColors.length],
                    min_score: minScore,
                    max_score: levelMaxScore,
                    order: i + 1,
                });
            }
        } else {
            // Remove levels
            newLevels = currentLevels.slice(0, numberOfLevels);
        }

        setData({
            ...data,
            scoring_configuration: {
                number_of_levels: numberOfLevels,
                levels: newLevels,
            },
        });
    };

    const updateLevel = (
        index: number,
        field: keyof RiskLevel,
        value: string | number,
    ) => {
        const newLevels = [...data.scoring_configuration.levels];
        newLevels[index] = { ...newLevels[index], [field]: value };

        setData({
            ...data,
            scoring_configuration: {
                ...data.scoring_configuration,
                levels: newLevels,
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/risks/matrix', {
            onSuccess: () => {
                // Handle success
            },
            onError: () => {
                // Handle error
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Risks', href: '/risks' },
                {
                    title: 'Matrix Configurations',
                    href: '/risks/matrix',
                },
                { title: 'Create', href: '/risks/matrix/create' },
            ]}
        >
            <Head title="Create Risk Matrix Configuration" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/risks/matrix">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Create Risk Matrix Configuration
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Set up a new risk assessment matrix for your
                            organization
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Provide basic details for your risk matrix
                                configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Configuration Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g., Default Risk Matrix"
                                    className={
                                        errors.name ? 'border-red-500' : ''
                                    }
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked as boolean)
                                    }
                                />
                                <Label htmlFor="is_active">
                                    Set as active configuration
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Matrix Dimensions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Matrix Dimensions</CardTitle>
                            <CardDescription>
                                Choose the size of your risk assessment matrix
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Matrix Size Preset</Label>
                                <Select
                                    value={selectedPreset}
                                    onValueChange={handlePresetChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {matrixPresets.map((preset) => (
                                            <SelectItem
                                                key={preset.name}
                                                value={preset.name}
                                            >
                                                {preset.name} ({preset.rows}{' '}
                                                rows × {preset.columns} columns)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rows">
                                        Rows (Probability)
                                    </Label>
                                    <Input
                                        id="rows"
                                        type="number"
                                        min="2"
                                        max="10"
                                        value={data.matrix_dimensions.rows}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                matrix_dimensions: {
                                                    ...data.matrix_dimensions,
                                                    rows:
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 3,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="columns">
                                        Columns (Impact)
                                    </Label>
                                    <Input
                                        id="columns"
                                        type="number"
                                        min="2"
                                        max="10"
                                        value={data.matrix_dimensions.columns}
                                        onChange={(e) =>
                                            setData({
                                                ...data,
                                                matrix_dimensions: {
                                                    ...data.matrix_dimensions,
                                                    columns:
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 3,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="text-sm text-gray-600">
                                Max Score:{' '}
                                {data.matrix_dimensions.rows *
                                    data.matrix_dimensions.columns}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Levels Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Levels</CardTitle>
                            <CardDescription>
                                Configure the risk levels and their scoring
                                ranges
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Number of Risk Levels</Label>
                                <Select
                                    value={data.scoring_configuration.number_of_levels.toString()}
                                    onValueChange={(value) =>
                                        handleLevelsChange(parseInt(value))
                                    }
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2, 3, 4, 5, 6].map((num) => (
                                            <SelectItem
                                                key={num}
                                                value={num.toString()}
                                            >
                                                {num} levels
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                {data.scoring_configuration.levels.map(
                                    (level, index) => (
                                        <div
                                            key={index}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                                <div className="space-y-2">
                                                    <Label>Level Name</Label>
                                                    <Input
                                                        value={level.name}
                                                        onChange={(e) =>
                                                            updateLevel(
                                                                index,
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g., Low"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Color</Label>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="color"
                                                            value={level.color}
                                                            onChange={(e) =>
                                                                updateLevel(
                                                                    index,
                                                                    'color',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-10 w-10 rounded border border-gray-300"
                                                        />
                                                        <Input
                                                            value={level.color}
                                                            onChange={(e) =>
                                                                updateLevel(
                                                                    index,
                                                                    'color',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Min Score</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={level.min_score}
                                                        onChange={(e) =>
                                                            updateLevel(
                                                                index,
                                                                'min_score',
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 1,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Max Score</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={level.max_score}
                                                        onChange={(e) =>
                                                            updateLevel(
                                                                index,
                                                                'max_score',
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 1,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button variant="outline" asChild>
                            <Link href="/risks/matrix">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Creating...'
                                : 'Create Configuration'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
