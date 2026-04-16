<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'user_id',
        'message',
        'seen_at',
    ];

    protected $casts = [
        'seen_at' => 'datetime',
    ];

    protected $appends = ['is_unread'];

    protected function isUnread(): Attribute
    {
        return Attribute::make(
            get: fn () => is_null($this->seen_at),
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}
