<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class FrameworksExport implements FromCollection, WithHeadings, WithMapping
{
    protected $frameworks;

    /**
     * Receive the filtered collection from the controller
     */
    public function __construct(Collection $frameworks)
    {
        $this->frameworks = $frameworks;
    }

    /**
     * Return the filtered data (passed from controller)
     */
    public function collection()
    {
        return $this->frameworks;
    }

    /**
     * Excel column headers (sans ID et Created At)
     */
    public function headings(): array
    {
        return [
            'Code',
            'Name',
            'Version',
            'Type',
            'Publisher',
            'Jurisdiction',
            'Status',
            'Tags',
            'Scope',
            'Release Date',
            'Effective Date',
            'Retired Date',
        ];
    }

    /**
     * Map each row (custom formatting) - sans ID et Created At
     */
    public function map($framework): array
    {
        return [
            $framework->code,
            $framework->name,
            $framework->version ?? '-',
            ucfirst($framework->type),
            $framework->publisher ?? '-',
            $framework->jurisdiction?->name ?? '-',
            ucfirst($framework->status),
            implode(', ', $framework->tags_names ?? []),
            $framework->scope ?? '-',
            $framework->release_date ? $framework->release_date->format('Y-m-d') : '-',
            $framework->effective_date ? $framework->effective_date->format('Y-m-d') : '-',
            $framework->retired_date ? $framework->retired_date->format('Y-m-d') : '-',
        ];
    }
}