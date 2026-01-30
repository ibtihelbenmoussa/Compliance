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
        'effective_date' => 'date',
        'retired_date' => 'date',
    ];

    // Relation avec Jurisdiction
    public function jurisdiction()
    {
        return $this->belongsTo(Jurisdiction::class);
    }

    // Gestion des tags (reste identique si tu veux garder le CSV)
    public function getTagsAttribute($value)
    {
        if (!$value) return [];
        if (is_array($value)) return $value;
        return explode(',', $value);
    }

    public function setTagsAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['tags'] = implode(',', $value);
        } else {
            $this->attributes['tags'] = $value;
        }
    }
}
