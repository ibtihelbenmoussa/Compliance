import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { RiskConfiguration } from '@/types/risk-configuration';
import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    Edit,
    Eye,
    MoreHorizontal,
    Plus,
    Settings,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    configurations: RiskConfiguration[];
    canManageRiskConfigurations: boolean;
}

export default function RiskConfigurationsIndex({
    configurations,
    canManageRiskConfigurations,
}: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDeleteClick = (configId: number) => {
        setDeletingId(configId);
    };

    const handleConfirmDelete = () => {
        if (deletingId) {
            router.delete(`/risk-configurations/${deletingId}`, {
                onSuccess: () => {
                    setDeletingId(null);
                },
                onError: () => {
                    setDeletingId(null);
                },
            });
        }
    };

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
            ]}
        >
            <Head title="Risk Configurations" />
            
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Risk Configurations
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your organization's risk assessment configurations
                        </p>
                    </div>
                    {canManageRiskConfigurations && (
                        <Button asChild>
                            <Link href="/risk-configurations/create">
                                <Plus className="mr-2 h-4 w-4" />
                                New Configuration
                            </Link>
                        </Button>
                    )}
                </div>

                {configurations.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                No Risk Configurations
                            </h3>
                            <p className="text-muted-foreground text-center mb-6">
                                Create your first risk configuration to start assessing risks
                                with your organization's specific criteria.
                            </p>
                            {canManageRiskConfigurations && (
                                <Button asChild>
                                    <Link href="/risk-configurations/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Configuration
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {configurations.map((config) => (
                            <Card key={config.id} className="relative">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">
                                                {config.name}
                                            </CardTitle>
                                            <CardDescription>
                                                {config.impact_scale_max}×{config.probability_scale_max} Matrix
                                            </CardDescription>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/risk-configurations/${config.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                {canManageRiskConfigurations && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/risk-configurations/${config.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDeleteClick(config.id!)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                Calculation Method
                                            </span>
                                            {getCalculationMethodBadge(config.calculation_method)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                Assessment Type
                                            </span>
                                            {getCriteriaBadge(config.use_criterias)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                Impact Levels
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {config.impacts.length}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                Probability Levels
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {config.probabilities.length}
                                            </span>
                                        </div>
                                        {config.use_criterias && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    Criteria
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {config.criterias?.length || 0}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <AlertDialog
                    open={deletingId !== null}
                    onOpenChange={() => setDeletingId(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this risk configuration?
                                This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmDelete}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
