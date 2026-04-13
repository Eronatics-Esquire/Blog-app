<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
     {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            
            // Use foreignId() for simple foreign keys, or foreignIdFor() with model classes
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            
            $table->string('type'); // 'new_post', 'comment', 'comment_reply', 'post_like', 'comment_like'
            $table->morphs('notifiable'); // Creates notifiable_id and notifiable_type
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
