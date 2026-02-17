import DateTimeColumn from '@/components/date-time'
import { ServerDataTable } from '@/components/server-data-table'
import { DataTableColumnHeader } from '@/components/server-data-table-column-header'
import {
    DataTableFacetedFilter,
    type FacetedFilterOption,
} from '@/components/server-data-table-faceted-filter'
import { DataTableRangeDateFilter } from '@/components/server-data-table-range-date-filter'
import {
    DataTableSelectFilter,
    type SelectOption,
} from '@/components/server-data-table-select-filter'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import AppLayout from '@/layouts/app-layout'
import { PaginatedData, User, Control } from '@/types'
import { Head, Link, router } from '@inertiajs/react'
import { ColumnDef } from '@tanstack/react-table'
import {
    CheckCircle2,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    XCircle,
    ShieldCheck,
} from 'lucide-react'
import { useState, useMemo } from 'react'

interface ScoreLevel {
    id: number
    label: string
    min: number
    max: number
    color: string
}
interface Risk {
    id: number
    name: string
    residual_impact?: number | null
    residual_likelihood?: number | null
}
interface ControlsIndexProps {
    controls: PaginatedData<Control>
    stats: {
        total: number
        active: number
        inactive: number
    }
    owners: User[]
    activeConfiguration: {
        calculation_method: string
        score_levels: ScoreLevel[]
    }
}

export default function ControlsIndex({
    controls,
    stats,
    owners,
    activeConfiguration,

}: ControlsIndexProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [controlToDelete, setControlToDelete] = useState<Control | null>(null)
    const [exportLoading, setExportLoading] = useState(false)


    const handleExport = async () => {
        setExportLoading(true)
        try {
            const params = new URLSearchParams(window.location.search)
            const response = await fetch(`/controls/export?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `controls-${new Date().toISOString().split('T')[0]}.xlsx`
                link.click()
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Export error:', error)
        } finally {
            setExportLoading(false)
        }
    }

    const scoreLevels = useMemo(
        () => activeConfiguration?.score_levels ?? [],
        [activeConfiguration]
    )

    const getResidualLevel = (
        impact?: number | null,
        likelihood?: number | null
    ): { score: number; level: ScoreLevel } | null => {
        if (impact == null || likelihood == null) return null

        const score = impact * likelihood

        const level = scoreLevels.find(
            (l) => score >= l.min && score <= l.max
        )

        if (!level) return null

        return { score, level }
    }


    const statusOptions: FacetedFilterOption[] = [
        { label: 'Active', value: 'Active', icon: CheckCircle2 },
        { label: 'Inactive', value: 'Inactive', icon: XCircle },
    ]

    const ownerOptions: SelectOption[] = owners.map((o) => ({
        value: String(o.id),
        label: o.name,
    }))


    const columns: ColumnDef<Control>[] = [
        {
            accessorKey: 'code',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Code" />
            ),
            cell: ({ row }) => (
                <span className="font-mono">{row.getValue('code')}</span>
            ),
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Name" />
            ),
            cell: ({ row }) => (
                <Link
                    href={`/controls/${row.original.id}`}
                    className="font-medium hover:underline"
                >
                    {row.getValue('name')}
                </Link>
            ),
        },
        {
            accessorKey: 'owner.name',
            header: 'Owner',
            cell: ({ row }) => row.original.owner?.name ?? (
                <span className="text-muted-foreground">—</span>
            ),
            enableSorting: false,
        },
        {
            id: 'risks',
            header: 'Risks',
            cell: ({ row }) => {
                const risks: Risk[] = row.original.risks ?? []

                if (!risks.length)
                    return (
                        <span className="text-muted-foreground text-sm">
                            No risks
                        </span>
                    )

                return (
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                        {risks.map((r) => {

                            const impact = r.residual_impact ?? 0
                            const likelihood = r.residual_likelihood ?? 0

                            const result = getResidualLevel(impact, likelihood)

                            const baseColor = result?.level?.color
                            const backgroundColor = baseColor ? `${baseColor}20` : '#e5e7eb'
                            const textColor = baseColor ?? '#374151'
                            const borderColor = baseColor ?? '#e5e7eb'

                            return (
                                <Badge
                                    key={r.id}
                                    style={{
                                        backgroundColor,
                                        color: textColor,
                                        border: `1px solid ${borderColor}`,
                                    }}
                                >
                                    {r.name}


                                </Badge>
                            )
                        })}
                    </div>
                )
            },
        },

        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_active')
                return (
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                )
            },
            enableSorting: false,
        },
        {
            accessorKey: 'updated_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Last Updated" />
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue('updated_at'));
                return <div>{date.toLocaleDateString()}</div>;
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const control = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-4 w-4 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            <DropdownMenuItem
                                onClick={() => router.visit(`/controls/${control.id}`)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => router.visit(`/controls/${control.id}/edit`)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                    setControlToDelete(control)
                                    setDeleteDialogOpen(true)
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
            meta: { pinned: 'right' },
        },
    ]

    const handleDeleteConfirm = () => {
        if (!controlToDelete) return

        router.delete(`/controls/${controlToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogOpen(false)
                setControlToDelete(null)
            },
        })
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Controls', href: '/controls' }]}>
            <Head title="Controls" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Controls</h1>
                        <p className="text-muted-foreground">
                            Manage organizational controls and mitigation measures
                        </p>
                    </div>
                    <Button onClick={() => router.visit('/controls/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Control
                    </Button>
                </div>


                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Total Controls</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Active Controls</p>
                        <p className="text-2xl font-bold">{stats.active}</p>
                    </div>

                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Inactive Controls</p>
                        <p className="text-2xl font-bold">{stats.inactive}</p>
                    </div>
                </div>


                <ServerDataTable
                    columns={columns}
                    data={controls}
                    searchPlaceholder="Search controls..."
                    onExport={handleExport}
                    exportLoading={exportLoading}
                    filters={
                        <>
                            <DataTableFacetedFilter
                                filterKey="status"
                                title="Status"
                                options={statusOptions}
                            />
                            <DataTableSelectFilter
                                filterKey="owner"
                                title="Owner"
                                placeholder="Select owner..."
                                searchPlaceholder="Search owners..."
                                emptyMessage="No owners found."
                                options={ownerOptions}
                                showIcon={false}
                            />
                            <DataTableRangeDateFilter
                                filterFromKey="date_from"
                                filterToKey="date_to"
                                title="Date Range"
                                placeholder="Pick date range"
                            />
                        </>
                    }
                    initialState={{
                        columnPinning: { right: ['actions'] },
                    }}
                />
            </div>


            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Control</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{controlToDelete?.name}"? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    )
}
