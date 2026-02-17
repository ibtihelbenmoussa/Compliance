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

export default function PredefinedTests( ) {
    
    return (
        <AppLayout breadcrumbs={[{ title: 'PredefinedTests', href: '/controls' }]}>
            <Head title="PredefinedTests" />

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
                        Add Test
                    </Button>
                </div>


               
            </div>


        </AppLayout>
    )
}
