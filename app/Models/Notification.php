<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'sender_id',
        'type',
        'notifiable_id',
        'notifiable_type',
        'data',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function sender() {
        return $this->belongsTo(User::class, 'sender_id');
    }
    public function notifiable(): MorphTo {
        return $this->morphTo();
    }
    public function markasRead(): void {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }
    public function scopeUnread($query) {
        return $query->whereNull('read_at');
    }
}
