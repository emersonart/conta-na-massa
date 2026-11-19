<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\ConfirmEmailChangeNotification;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Tests\TestCase;

class BrandedAccountEmailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_reset_email_renders_branded_portuguese_html_and_text(): void
    {
        config(['app.frontend_url' => 'https://conta-na-massa.example.test']);

        $user = User::factory()->create([
            'name' => 'Chef Juliana',
            'email' => 'juliana@confeitaria.test',
        ]);

        $mailMessage = (new ResetPassword('token-reset-123'))->toMail($user);

        $this->assertSame('Redefina sua senha — Conta na Massa', $mailMessage->subject);
        $this->assertSame(['emails.account-action', 'emails.account-action-text'], $mailMessage->view);

        $html = view($mailMessage->view[0], $mailMessage->viewData)->render();
        $text = view($mailMessage->view[1], $mailMessage->viewData)->render();

        $expectedUrl = 'https://conta-na-massa.example.test/reset-password?token=token-reset-123&email=juliana%40confeitaria.test';

        $this->assertFileExists(public_path('images/logo-email.png'));
        $this->assertStringContainsString('https://conta-na-massa.example.test/images/logo-email.png', $html);
        $this->assertStringNotContainsString('&#x1F950;', $html);
        $this->assertStringContainsString('Conta na Massa', $html);
        $this->assertStringContainsString('Redefina sua senha', $html);
        $this->assertStringContainsString('Olá, Chef Juliana!', $html);
        $this->assertStringContainsString('Redefinir minha senha', $html);
        $this->assertStringContainsString('#E85D04', $html);
        $this->assertStringContainsString('#F8F6F0', $html);
        $this->assertStringContainsString(e($expectedUrl), $html);
        $this->assertStringContainsString('Todos os direitos reservados.', $html);

        $this->assertStringNotContainsString('Hello!', $html);
        $this->assertStringNotContainsString('Reset Password', $html);
        $this->assertStringNotContainsString('Regards,', $html);
        $this->assertStringNotContainsString('All rights reserved', $html);

        $this->assertStringContainsString('Redefina sua senha', $text);
        $this->assertStringContainsString($expectedUrl, $text);
        $this->assertStringContainsString('Equipe Conta na Massa', $text);
    }

    public function test_confirm_email_change_renders_branded_portuguese_and_escapes_name(): void
    {
        config(['app.frontend_url' => 'https://conta-na-massa.example.test']);

        $notification = new ConfirmEmailChangeNotification('token-change-456', '<b>Chef</b> & Cia');
        $mailMessage = $notification->toMail((object) []);

        $this->assertSame('Confirme seu novo e-mail — Conta na Massa', $mailMessage->subject);
        $this->assertSame(['emails.account-action', 'emails.account-action-text'], $mailMessage->view);

        $html = view($mailMessage->view[0], $mailMessage->viewData)->render();
        $text = view($mailMessage->view[1], $mailMessage->viewData)->render();

        $expectedUrl = 'https://conta-na-massa.example.test/confirm-email-change?token=token-change-456';

        $this->assertStringContainsString('Confirme seu novo e-mail', $html);
        $this->assertStringContainsString('Confirmar novo e-mail', $html);
        $this->assertStringContainsString('&lt;b&gt;Chef&lt;/b&gt; &amp; Cia', $html);
        $this->assertStringNotContainsString('<b>Chef</b>', $html);
        $this->assertStringContainsString(e($expectedUrl), $html);

        $this->assertStringContainsString('Confirme seu novo e-mail', $text);
        $this->assertStringContainsString($expectedUrl, $text);
    }

    public function test_reset_password_token_validation_accepts_active_and_rejects_used_token(): void
    {
        $user = User::factory()->create([
            'email' => 'juliana@confeitaria.test',
        ]);

        $token = Password::broker()->createToken($user);

        $this->postJson('/api/v1/auth/reset-password/validate', [
            'email' => $user->email,
            'token' => $token,
        ])->assertOk()->assertExactJson(['valid' => true]);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NovaSenhaSegura123',
            'password_confirmation' => 'NovaSenhaSegura123',
        ])->assertOk();

        $this->postJson('/api/v1/auth/reset-password/validate', [
            'email' => $user->email,
            'token' => $token,
        ])->assertStatus(422)->assertJson([
            'valid' => false,
        ]);

        $this->postJson('/api/v1/auth/reset-password/validate', [
            'email' => 'desconhecido@confeitaria.test',
            'token' => $token,
        ])->assertStatus(422)->assertJson([
            'valid' => false,
        ]);
    }

    public function test_email_change_token_validation_accepts_active_and_rejects_used_or_expired_token(): void
    {
        $token = Str::random(64);
        $user = User::factory()->create([
            'email' => 'antigo@confeitaria.test',
        ]);
        $user->forceFill([
            'pending_email' => 'novo@confeitaria.test',
            'email_change_token_hash' => hash('sha256', $token),
            'email_change_expires_at' => now()->addMinutes(30),
        ])->save();

        $this->postJson('/api/v1/auth/email-change/validate', [
            'token' => $token,
        ])->assertOk()->assertExactJson(['valid' => true]);

        $this->postJson('/api/v1/auth/email-change/confirm', [
            'token' => $token,
        ])->assertOk();

        $this->postJson('/api/v1/auth/email-change/validate', [
            'token' => $token,
        ])->assertStatus(422)->assertJson([
            'valid' => false,
        ]);
    }
}
