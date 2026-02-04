<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Framework extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'release_date' => 'date',
        'tags' => 'array',
        'effective_date' => 'date',
        'retired_date' => 'date',
    ];

    public function tags()
    {
        return $this->belongsTo(Tag::class);
    }

    public function jurisdiction()
    {
        return $this->belongsTo(Jurisdiction::class);
    }







}