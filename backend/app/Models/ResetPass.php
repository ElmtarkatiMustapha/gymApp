<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResetPass extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'code',
        'expiration',
        "created_at",
    ];
}
