<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Sentry\Laravel\Facade as Sentry;
use Sentry\State\Scope;

class SetSentryUserContext
{
    public function handle(Request $request, Closure $next): mixed
    {
        return Sentry::withScope(function (Scope $scope) use ($request, $next) {
            if ($user = $request->user()) {
                // An opaque ID links backend events without sending name/email.
                $scope->setUser(['id' => (string) $user->getAuthIdentifier()]);
            }

            return $next($request);
        });
    }
}
