<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user is authenticated and has admin role
        if (!$user || !$user->role || $user->role->title !== 'admin') {
            return response(['message' => 'Unauthorized. Admin access required.'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
