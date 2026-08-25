<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AiChatRequest;
use App\Models\AiConversation;
use App\Services\AiChatService;
use App\Services\AiUserProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiChatController extends Controller
{
    protected AiChatService $chatService;
    protected AiUserProfileService $profileService;

    public function __construct(AiChatService $chatService, AiUserProfileService $profileService)
    {
        $this->chatService = $chatService;
        $this->profileService = $profileService;
    }

    /**
     * Send message to Modo Vibe AI Chef with SSE real-time streaming.
     */
    public function chat(AiChatRequest $request): StreamedResponse|JsonResponse
    {
        $user = $request->user();
        $message = $request->input('message');
        $sessionId = $request->input('session_id');

        // Check if client explicitly asks for non-streamed JSON
        if ($request->header('Accept') === 'application/json' && !$request->boolean('stream', true)) {
            $result = $this->chatService->handleUserMessage($user, $message, $sessionId);
            return response()->json($result);
        }

        return response()->stream(function () use ($user, $message, $sessionId) {
            // Disable output buffering for real-time flushing
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            $generator = $this->chatService->handleUserMessageStream($user, $message, $sessionId);

            foreach ($generator as $event) {
                $eventName = $event['event'] ?? 'message';
                $eventData = json_encode($event['data'] ?? [], JSON_UNESCAPED_UNICODE);

                echo "event: {$eventName}\n";
                echo "data: {$eventData}\n\n";

                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Get unique conversation sessions for the user.
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get the latest message for each session to act as a title/preview
        // Postgres: Use DISTINCT ON (session_id) ordered by session_id, created_at DESC
        $sessions = AiConversation::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->orderBy('session_id')
            ->orderBy('created_at', 'desc')
            ->get(['session_id', 'content', 'created_at'])
            ->unique('session_id')
            ->map(function ($msg) {
                // Generate a short title from the first message or latest message
                $title = mb_substr($msg->content, 0, 40) . (mb_strlen($msg->content) > 40 ? '...' : '');
                return [
                    'session_id' => $msg->session_id,
                    'title' => $title,
                    'updated_at' => $msg->created_at,
                ];
            })
            // Reorder the unique sessions by created_at desc
            ->sortByDesc('updated_at')
            ->values();

        return response()->json([
            'sessions' => $sessions
        ]);
    }

    /**
     * Get recent conversation history and memory profile.
     */
    public function history(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessionId = $request->input('session_id');

        $messages = [];
        
        if ($sessionId) {
            $messages = AiConversation::where('user_id', $user->id)
                ->where('session_id', $sessionId)
                ->where('expires_at', '>', now())
                ->orderBy('created_at', 'asc')
                ->take(50)
                ->get(['id', 'session_id', 'role', 'content', 'is_flagged', 'created_at']);
        }

        $profile = $this->profileService->getProfile($user);

        return response()->json([
            'messages' => $messages,
            'user_profile' => $profile,
            'active_provider' => env('AI_PROVIDER', 'gemini'),
        ]);
    }

    /**
     * Clear user conversation history.
     */
    public function clearHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessionId = $request->input('session_id');

        $query = AiConversation::where('user_id', $user->id);
        if ($sessionId) {
            $query->where('session_id', $sessionId);
        }

        $query->delete();

        return response()->json([
            'message' => 'Histórico de conversas limpo com sucesso.',
        ]);
    }
}
