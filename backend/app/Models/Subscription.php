<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;
    protected $fillable = [
        "id",
        "start_at",
        "expire_at",
        "duration",
        "price",
        "notice_times",
        "user_id",
        "plan_id",
        "customer_id",
        "pre_notice_times",
        "expire_notice_times",
        "last_notified_at",
    ];
    public function user(){
        return $this->belongsTo(User::class);
    }
    public function plan(){
        return $this->belongsTo(Plan::class);
    }
    public function customer(){
        return $this->belongsTo(Customer::class);
    }
}
