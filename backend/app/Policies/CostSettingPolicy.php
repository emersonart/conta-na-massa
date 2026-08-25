<?php

namespace App\Policies;

use App\Models\CostSetting;
use App\Models\User;

class CostSettingPolicy
{
    public function view(User $user, CostSetting $costSetting): bool
    {
        return $user->id === $costSetting->user_id;
    }

    public function update(User $user, CostSetting $costSetting): bool
    {
        return $user->id === $costSetting->user_id;
    }
}
