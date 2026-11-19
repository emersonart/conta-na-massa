<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ConfirmEmailChangeNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $token,
        private readonly string $accountName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim((string) config('app.frontend_url'), '/')
            .'/confirm-email-change?token='.urlencode($this->token);
        $name = trim($this->accountName);
        $greeting = $name !== '' ? "Olá, {$name}!" : 'Olá!';

        return (new MailMessage)
            ->subject('Confirme seu novo e-mail — Conta na Massa')
            ->view(['emails.account-action', 'emails.account-action-text'], [
                'preheader' => 'Confirme seu novo endereço de e-mail no Conta na Massa.',
                'badge' => 'Confirmação de e-mail',
                'title' => 'Confirme seu novo e-mail',
                'greeting' => $greeting,
                'introLines' => [
                    'Recebemos uma solicitação para atualizar o endereço de e-mail da sua conta no Conta na Massa.',
                    'Seu e-mail atual continua ativo até você confirmar o novo endereço pelo botão abaixo.',
                ],
                'actionText' => 'Confirmar novo e-mail',
                'actionUrl' => $url,
                'securityNote' => 'Por segurança, este link expira em 60 minutos e só pode ser usado uma vez.',
                'outroLines' => [
                    'Se você não solicitou essa alteração, ignore esta mensagem — nada será alterado na sua conta.',
                ],
            ]);
    }
}
