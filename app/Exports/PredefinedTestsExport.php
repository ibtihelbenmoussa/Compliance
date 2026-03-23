<?php

namespace App\Exports;

use App\Models\TestPredefined;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PredefinedTestsExport implements FromCollection, WithHeadings
{
     protected int $orgId;
    protected array $filters;

    public function __construct(int $orgId, array $filters = [])
    {
        $this->orgId = $orgId;
        $this->filters = $filters;
    }

    public function collection()
    {
        $query = TestPredefined::where('organization_id', $this->orgId);

   
        if (!empty($this->filters['filter']['status'])) {
            $status = $this->filters['filter']['status'];
            if ($status === 'Active') {
                $query->where('is_active', true);
            } elseif ($status === 'Inactive') {
                $query->where('is_active', false);
            }
        }

     

        if (!empty($this->filters['filter']['date_from'])) {
            $query->whereDate('created_at', '>=', $this->filters['filter']['date_from']);
        }

        if (!empty($this->filters['filter']['date_to'])) {
            $query->whereDate('created_at', '<=', $this->filters['filter']['date_to']);
        }

        return $query->get()->map(function ($test) {
            return [
                'Code'       => $test->code,
                'Name'       => $test->name,
                'Objective' =>$test->test_objective,
                'Expected Result'=>$test->test_result,
                'Risk'=>$test->risk,
                'Sample'=>$test->echantillon,
                'Status'     => $test->is_active ? 'Active' : 'Inactive',
                'Updated At' => optional($test->updated_at)->format('Y-m-d H:i'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Code',
            'Name',
            'Objective',
            'Expected Result',
             'Risk',
              'Sample',
            'Status',
            'Updated At',
        ];
    }
}