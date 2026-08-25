<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AiUsageLog;

class AiUsageController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        // 1. Total this month
        $startOfMonth = now()->startOfMonth();
        $monthlyUsage = AiUsageLog::where('user_id', $user->id)
            ->where('created_at', '>=', $startOfMonth)
            ->select(
                DB::raw('SUM(total_tokens) as total_tokens'),
                DB::raw('SUM(cost_brl) as total_cost_brl')
            )->first();

        // 2. Global Total
        $globalUsage = AiUsageLog::where('user_id', $user->id)
            ->select(
                DB::raw('SUM(total_tokens) as total_tokens'),
                DB::raw('SUM(cost_brl) as total_cost_brl')
            )->first();

        // 3. Usage by session (last 20 sessions)
        $history = AiUsageLog::where('user_id', $user->id)
            ->select('session_id', DB::raw('SUM(total_tokens) as tokens'), DB::raw('SUM(cost_brl) as cost'), DB::raw('MAX(created_at) as last_activity'))
            ->groupBy('session_id')
            ->orderBy('last_activity', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'monthly' => [
                'tokens' => (int) $monthlyUsage->total_tokens,
                'cost_brl' => (float) $monthlyUsage->total_cost_brl,
            ],
            'global' => [
                'tokens' => (int) $globalUsage->total_tokens,
                'cost_brl' => (float) $globalUsage->total_cost_brl,
            ],
            'history' => $history,
        ]);
    }
}
