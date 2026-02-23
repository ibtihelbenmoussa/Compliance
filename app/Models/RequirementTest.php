<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequirementTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requirement_id',
        'user_id',
        'framework_id',
        'test_date',
        'status',
        'comment',
        'evidence',
    ];

    protected $casts = [
        'evidence' => 'array',
        'test_date' => 'date',
    ];

    public function requirement()
    {
        return $this->belongsTo(Requirement::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

 public function framework()
{
    return $this->belongsTo(Framework::class);
}
}