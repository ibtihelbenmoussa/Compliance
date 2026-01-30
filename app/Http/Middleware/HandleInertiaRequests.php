<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        $currentOrganization = null;

        if ($user) {
            $user->load([
                'currentOrganization:id,name,code',
                'organizations:id,name,code'
            ]);
            $currentOrganization = $user->currentOrganization;
        }

        return array_merge(parent::share($request), [
            'name' => config('app.name'),

            'auth' => [
                'user' => $user,
            ],

            'currentOrganization' => $currentOrganization,

            'sidebarOpen' => ! $request->hasCookie('sidebar_state')
                || $request->cookie('sidebar_state') === 'true',

            // ✅ FLASH MESSAGES (LA CLÉ DE TON PROBLÈME)
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
