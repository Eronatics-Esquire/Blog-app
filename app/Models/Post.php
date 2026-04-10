<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'post',
        'image_path',
    ];


    public function comments(){
        return $this->hasMany(Comment::class);
    }

    public function reactions(){
        return $this->hasMany(Reaction::class);
    }

    public function images()
    {
        return $this->hasMany(PostImage::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
}
