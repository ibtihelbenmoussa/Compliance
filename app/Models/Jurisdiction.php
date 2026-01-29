<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jurisdiction  extends Model
{
       protected $table = 'jurisdictions';


    protected $fillable = [
        'name',
    ];
}
