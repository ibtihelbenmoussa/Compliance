<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PredefinedTestsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $tests;

    public function __construct($tests)
    {
        $this->tests = $tests;
    }

    public function collection()
    {
        return $this->tests;
    }

    public function headings(): array
    {
        return [
            'Test Code',
            'Test Name',
            'Objective',
            'Procedure',
            'Requirement Code',
            'Requirement Title',
            'Created At',
        ];
    }

    public function map($test): array
    {
        return [
            $test->test_code,
            $test->test_name,
            $test->objective,
            $test->procedure,
            $test->requirement?->code ?? '—',
            $test->requirement?->title ?? '—',
            $test->created_at->format('Y-m-d H:i'),
        ];
    }
}