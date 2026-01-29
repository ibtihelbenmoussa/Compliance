import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { RiskConfiguration } from '@/types/risk-configuration';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Settings } from 'lucide-react';

// Progressive color scheme based on risk level count
const getProgressiveColors = (count: number): string[] => {
    const colorSchemes = {
        2: ['#10b981', '#ef4444'], // Green, Red
        3: ['#10b981', '#f59e0b', '#ef4444'], // Green, Yellow, Red
        4: ['#10b981', '#f59e0b', '#f97316', '#ef4444'], // Green, Yellow, Orange, Red
        5: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626'], // Green, Yellow, Orange, Red, Dark Red
        6: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b'], // Green, Yellow, Orange, Red, Dark Red, Darker Red
        7: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d'], // Green, Yellow, Orange, Red, Dark Red, Darker Red, Darkest Red
        8: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#450a0a'], // Green, Yellow, Orange, Red, Dark Red, Darker Red, Darkest Red, Black
        9: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#450a0a', '#000000'], // Green, Yellow, Orange, Red, Dark Red, Darker Red, Darkest Red, Black, Pure Black
        10: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#450a0a', '#000000', '#000000'], // Green, Yellow, Orange, Red, Dark Red, Darker Red, Darkest Red, Black, Pure Black, Pure Black
    };
    
    return colorSchemes[count as keyof typeof colorSchemes] || colorSchemes[3]; // Default to 3-color scheme
};

interface Props {
    configuration: RiskConfiguration;
}

export default function RiskConfigurationShow({ configuration }: Props) {
    const getCalculationMethodBadge = (method: string) => {
        switch (method) {
            case 'avg':
                return <Badge variant="secondary">Average</Badge>;
            case 'max':
                return <Badge variant="outline">Maximum</Badge>;
            default:
                return <Badge variant="outline">{method}</Badge>;
        }
    };

    const getCriteriaBadge = (useCriterias: boolean) => {
        return useCriterias ? (
            <Badge variant="default">With Criteria</Badge>
        ) : (
            <Badge variant="secondary">Simple</Badge>
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Risk Management', href: '/risks' },
                { title: 'Risk Configurations', href: '/risk-configurations' },
                { title: configuration.name, href: `/risk-configurations/${configuration.id}` },
            ]}
        >
            <Head title={`${configuration.name} - Risk Configuration`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {configuration.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Risk assessment configuration details
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/risk-configurations/${configuration.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Configuration parameters and settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Calculation Method</span>
                                {getCalculationMethodBadge(configuration.calculation_method)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Assessment Type</span>
                                {getCriteriaBadge(configuration.use_criterias)}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Impact Scale</span>
                                <span className="text-sm text-muted-foreground">
                                    {configuration.impact_scale_max} levels
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Probability Scale</span>
                                <span className="text-sm text-muted-foreground">
                                    {configuration.probability_scale_max} levels
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Matrix Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Matrix Preview</CardTitle>
                            <CardDescription>
                                {configuration.impact_scale_max}×{configuration.probability_scale_max} Risk Matrix
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Matrix visualization would be displayed here
                                </p>
                                <Button variant="outline" className="mt-4" asChild>
                                    <Link href="/risks/matrix">View Matrix</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Impact Levels */}
                <Card>
                    <CardHeader>
                        <CardTitle>Impact Levels</CardTitle>
                        <CardDescription>
                            Defined impact levels and their scores
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {configuration.impacts.map((impact, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{impact.label}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                Order: {impact.order}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            {impact.score}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Score
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Probability Levels */}
                <Card>
                    <CardHeader>
                        <CardTitle>Probability Levels</CardTitle>
                        <CardDescription>
                            Defined probability levels and their scores
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {configuration.probabilities.map((probability, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">{probability.label}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                Order: {probability.order}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            {probability.score}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Score
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Score Levels */}
                {configuration.score_levels && configuration.score_levels.length > 0 && (
                    <Card className="border-2 border-rose-200 dark:border-rose-800 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
                                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                Risk Score Levels
                            </CardTitle>
                            <CardDescription className="text-rose-700 dark:text-rose-300">
                                Color-coded risk levels with their score ranges
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {configuration.score_levels.map((level: any, index: number) => {
                                    // Use progressive colors if no color is stored, otherwise use stored color
                                    const progressiveColors = getProgressiveColors(configuration.score_levels!.length);
                                    const color = level.color || progressiveColors[index] || '#6b7280';
                                    
                                    return (
                                        <div key={index} className="flex items-center justify-between p-4 border-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className="w-6 h-6 rounded-full shadow-sm border-2 border-white dark:border-slate-800"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                                                        {level.label}
                                                    </div>
                                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                                        Level {index + 1} • Order: {level.order}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                                    {level.min} - {level.max}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    Score Range
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Criteria (if enabled) */}
                {configuration.use_criterias && configuration.criterias && configuration.criterias.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Criteria</CardTitle>
                            <CardDescription>
                                Multi-dimensional assessment criteria
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {configuration.criterias.map((criteria, criteriaIndex) => (
                                    <div key={criteriaIndex} className="space-y-4">
                                        <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                    {criteriaIndex + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{criteria.name || '[No name]'}</h4>
                                                    {criteria.description && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                            {criteria.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                                                {criteria.impacts.map((impact, impactIndex) => (
                                                    <div key={impactIndex} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 border rounded-lg">
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{impact.label}</span>
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                            {impact.score}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {criteriaIndex < (configuration.criterias?.length || 0) - 1 && (
                                            <Separator />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
