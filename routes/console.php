<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    User::where('is_online', true)
        ->where('last_seen_at', '<', now()->subMinutes(5))
        ->update(['is_online' => false]);
})->everyMinute();
