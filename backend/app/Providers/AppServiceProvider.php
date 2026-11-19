<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $buildResetUrl = static function (User $user, string $token): string {
            $query = http_build_query([
                'token' => $token,
                'email' => $user->email,
            ]);

            return rtrim((string) config('app.frontend_url'), '/').'/reset-password?'.$query;
        };

        ResetPassword::createUrlUsing($buildResetUrl);

        ResetPassword::toMailUsing(function (User $user, string $token) use ($buildResetUrl): MailMessage {
            $url = $buildResetUrl($user, $token);
            $expiresInMinutes = (int) config('auth.passwords.'.config('auth.defaults.passwords', 'users').'.expire', 60);
            $name = trim((string) $user->name);
            $greeting = $name !== '' ? "Olá, {$name}!" : 'Olá!';

            return (new MailMessage)
                ->subject('Redefina sua senha — Conta na Massa')
                ->view(['emails.account-action', 'emails.account-action-text'], [
                    'preheader' => 'Recebemos um pedido para redefinir a senha da sua conta no Conta na Massa.',
                    'badge' => 'Recuperação de senha',
                    'title' => 'Redefina sua senha',
                    'greeting' => $greeting,
                    'introLines' => [
                        'Recebemos uma solicitação para redefinir a senha da sua conta no Conta na Massa.',
                        'Clique no botão abaixo para escolher uma nova senha com segurança e voltar ao seu painel de receitas e custos.',
                    ],
                    'actionText' => 'Redefinir minha senha',
                    'actionUrl' => $url,
                    'securityNote' => "Por segurança, este link expira em {$expiresInMinutes} minutos e só pode ser usado uma vez.",
                    'outroLines' => [
                        'Se você não solicitou a redefinição de senha, pode ignorar este e-mail com tranquilidade — sua senha atual continua protegida.',
                    ],
                ]);
        });
    }
}
