<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Requirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'type',
        'status',
        'priority',
        'frequency',
        'framework_id',
        'process_id',
        'owner_id',
        'tags',
        'deadline',
        'completion_date',
        'compliance_level',
        'attachments',
    ];

    protected $casts = [
        'tags' => 'array',
        'deadline' => 'date',
        'completion_date' => 'date',
    ];
    public function framework()
{
    return $this->belongsTo(Framework::class);
}

public function process()
{
    return $this->belongsTo(Process::class);
}

}

