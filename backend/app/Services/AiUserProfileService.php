<?php

namespace App\Services;

use App\Models\AiUserProfile;
use App\Models\User;
use Carbon\Carbon;

class AiUserProfileService
{
    /**
     * Get or initialize the user culinary memory profile.
     */
    public function getProfile(User $user): AiUserProfile
    {
        return AiUserProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'preferences' => [
                    'focus_areas' => ['confeitaria', 'panificacao'],
                    'typical_batch_size' => 'médio',
                    'default_profit_target' => 35,
                    'favorite_ingredients' => [],
                ],
                'summary' => 'Perfil inicial: Confeiteiro/Padeiro buscando precisão em custos e margens de lucro.',
                'last_updated_at' => now(),
            ]
        );
    }

    /**
     * Update user profile summary and preferences from conversational learning.
     */
    public function updateFromConversation(User $user, array $extractedProfileUpdates, string $userMessage): void
    {
        $profile = $this->getProfile($user);
        $currentPrefs = $profile->preferences ?? [];

        if (!empty($extractedProfileUpdates)) {
            $updatedPrefs = array_merge($currentPrefs, $extractedProfileUpdates);
            $profile->preferences = $updatedPrefs;
        }

        // Keep summary updated
        if (isset($extractedProfileUpdates['summary_update'])) {
            $profile->summary = $extractedProfileUpdates['summary_update'];
        }

        $profile->last_updated_at = now();
        $profile->save();
    }
}
