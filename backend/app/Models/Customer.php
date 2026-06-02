<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;
    protected $fillable = [
        "id",
        "name",
        "adresse",
        "email",
        "cin",
        "phone",
        "sexe",
        "birthday",
        "state",
        "user_id",
    ];
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function insurances(){
        return $this->hasMany(Insurance::class);
    }
    public function subscriptions(){
        return $this->hasMany(Subscription::class);
    }

}
