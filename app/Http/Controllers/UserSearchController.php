<?php

namespace App\Http\Controllers;

use App\Services\UserSearchService;
use Illuminate\Http\Request;

class UserSearchController extends Controller
{
    public function __construct(protected UserSearchService $userSearchService) {}

    public function search(Request $request)
    {
        return response()->json($this->userSearchService->search($request));
    }
}
