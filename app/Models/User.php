<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'password',
        'profile_photo',
        'cover_photo',
        'is_online',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected $appends = [
        'profile_photo_url',
        'cover_photo_url',
        'avatar',
        'full_name',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_seen_at' => 'datetime',
        ];
    }

    public function setOnline(bool $status): void
    {
        $this->is_online = $status;
        $this->last_seen_at = now();
        $this->save();
    }

    public function getPresenceAttribute(): array
    {
        return [
            'is_online' => $this->is_online,
            'last_seen_at' => $this->last_seen_at?->toIso8601String(),
        ];
    }

    public function getProfilePhotoUrlAttribute(): ?string
    {
        if ($this->profile_photo) {
            return Storage::url($this->profile_photo);
        }

        return null;
    }

    public function getCoverPhotoUrlAttribute(): ?string
    {
        if ($this->cover_photo) {
            return Storage::url($this->cover_photo);
        }

        return null;
    }

    public function getAvatarAttribute(): ?string
    {
        return $this->profile_photo_url;
    }

    public function getFullNameAttribute(): string
    {
        $first = $this->first_name ?? '';
        $last = $this->last_name ?? '';

        return trim("{$first} {$last}") ?: $this->name ?? '';
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_users');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
