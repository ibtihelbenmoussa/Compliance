import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { PaginatedData } from '@/types';
import { router } from '@inertiajs/react';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    FileSpreadsheet,
    Search,
    SearchX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DataTableFiltersDropdown } from './server-data-table-filters-dropdown';
import { DataTableViewOptions } from './server-data-table-view-options';
import { EmptyState } from './ui/empty-state';

import type { InitialTableState } from '@tanstack/react-table';


export interface ServerDataTableProps<TData, TValue = unknown> {
    columns: ColumnDef<TData, TValue>[];
    data: PaginatedData<TData> | TData[];           // ← Support des deux formats
    searchPlaceholder?: string;
    searchable?: boolean;
    filters?: React.ReactNode;
    toolbar?: React.ReactNode;
    className?: string;
    onRowClick?: (row: TData) => void;
    initialState?: InitialTableState;
    onExport?: () => void | Promise<void>;
    exportLoading?: boolean;
}


export function ServerDataTable<TData, TValue>({
    columns,
    data,
    searchPlaceholder = 'Rechercher...',
    searchable = true,
    filters,
    toolbar,
    className,
    onRowClick,
    initialState,
    onExport,
    exportLoading = false,
}: ServerDataTableProps<TData, TValue>) {

    const isPaginated = 'data' in data && Array.isArray(data.data);

    // Normalisation des données
    const tableData = isPaginated ? data.data : data as TData[];
    const pageCount = isPaginated ? data.last_page : 1;
    const currentPage = isPaginated ? data.current_page : 1;
    const perPage = isPaginated ? (data.per_page ?? 10) : 999; // grand nombre pour afficher tout localement
    const total = isPaginated ? data.total : tableData.length;
    const from = isPaginated ? (data.from ?? (tableData.length > 0 ? 1 : 0)) : (tableData.length > 0 ? 1 : 0);
    const to = isPaginated ? (data.to ?? total) : total;
    const hasPrev = isPaginated ? !!data.prev_page_url : false;
    const hasNext = isPaginated ? !!data.next_page_url : false;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [searchValue, setSearchValue] = useState('');

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialisation depuis l'URL (uniquement en mode serveur)
    useEffect(() => {
        if (!isPaginated) return;
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search') || '';
        setSearchValue(search);
    }, [isPaginated]);

    const debouncedSearch = useCallback((value: string) => {
        if (!isPaginated) return; // pas de debounce local
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(() => {
            updateServerState({ search: value, page: 1 });
        }, 500);
    }, [isPaginated]);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    };

    // Mise à jour des paramètres serveur (uniquement si paginé)
    const updateServerState = (
        updates: Record<string, string | number | null | undefined>,
    ) => {
        if (!isPaginated) return;

        const params = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });
        router.get(
            `${window.location.pathname}?${params.toString()}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleSortingChange = (
        updater: SortingState | ((old: SortingState) => SortingState),
    ) => {
        if (!isPaginated) {
            setSorting(updater);
            return;
        }

        const newSorting =
            typeof updater === 'function' ? updater(sorting) : updater;
        setSorting(newSorting);

        if (newSorting.length > 0) {
            const sort = newSorting[0];
            const sortParam = sort.desc ? `-${sort.id}` : sort.id;
            updateServerState({ sort: sortParam, page: 1 });
        } else {
            updateServerState({ sort: null, page: 1 });
        }
    };

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: isPaginated,
        manualSorting: isPaginated,
        manualFiltering: isPaginated,
        pageCount: pageCount,
        state: {
            pagination: {
                pageIndex: currentPage - 1,
                pageSize: perPage,
            },
            sorting,
            columnFilters,
            columnVisibility,
        },
        onPaginationChange: (updater) => {
            if (!isPaginated) return;
            // Gestion pagination serveur uniquement
        },
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        initialState,
    });

    const handlePageChange = (page: number) => {
        if (!isPaginated) return;
        if (page >= 1 && page <= pageCount) {
            updateServerState({ page });
        }
    };

    const handlePerPageChange = (perPageStr: string) => {
        if (!isPaginated) return;
        const perPageNum = Number(perPageStr);
        updateServerState({ per_page: perPageNum, page: 1 });
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Barre d'outils */}
            <div className="flex w-full items-center gap-4 md:gap-0">
                <div className="flex min-w-0 flex-grow flex-col justify-between gap-4 md:flex-row md:items-center">
                    {searchable && (
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}

                    <ButtonGroup>
                        {filters && <DataTableFiltersDropdown>{filters}</DataTableFiltersDropdown>}
                        <DataTableViewOptions table={table} />
                        {onExport && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onExport}
                                disabled={exportLoading}
                                className="h-9 gap-2"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                {exportLoading ? 'Export en cours...' : 'Exporter Excel'}
                            </Button>
                        )}
                    </ButtonGroup>
                </div>
                <div className="ml-auto flex items-center gap-2">{toolbar}</div>
            </div>

            {/* Tableau */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const isPinnedRight = cell.column.getIsPinned?.() === 'right';
                                        return (
                                            <TableCell
                                                key={cell.id}
                                                className={cn(
                                                    isPinnedRight && 'sticky right-0 z-10 bg-background shadow-left',
                                                )}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <EmptyState
                                        icon={SearchX}
                                        title="Aucun résultat"
                                        description="Ajustez votre recherche ou vos filtres."
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination – visible uniquement en mode serveur */}
            {isPaginated && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
                    <div>
                        Affichage de {from} à {to} sur {total} résultat{total !== 1 ? 's' : ''}
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Lignes par page</span>
                            <Select
                                value={String(perPage)}
                                onValueChange={handlePerPageChange}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 15, 20, 30, 50].map((size) => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!hasPrev}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <span className="px-2 font-medium">
                                {currentPage} / {pageCount}
                            </span>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!hasNext}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handlePageChange(pageCount)}
                                disabled={currentPage === pageCount}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}