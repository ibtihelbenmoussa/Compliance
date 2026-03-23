<?php

namespace App\Exports;

use App\Models\Framework;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class FrameworksExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        return Framework::select('code','name','version','type','status','publisher','jurisdiction','scope','release_date','effective_date','retired_date')->get();
    }

    public function headings(): array
    {
        return ['Code','Name','Version','Type','Status','Publisher','Jurisdiction','Scope','Release Date','Effective Date','Retired Date'];
    }
}
