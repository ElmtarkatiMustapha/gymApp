<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;
    protected $fillable = [
        "id",
        "title",
        "duration",
        "price",
        "color",
        "description",
        "user_id",
    ];
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function customers(){
        return $this->hasMany(Customer::class);
    }
}
