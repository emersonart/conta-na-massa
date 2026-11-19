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

        return (new MailMessage)
            ->subject('Confirme seu novo e-mail — Conta na Massa')
            ->greeting('Olá, '.$this->accountName.'.')
            ->line('Recebemos uma solicitação para alterar o e-mail da sua conta.')
            ->line('Seu e-mail atual continua ativo até a confirmação do novo endereço.')
            ->action('Confirmar novo e-mail', $url)
            ->line('Por segurança, este link expira em 60 minutos e só pode ser usado uma vez.')
            ->line('Se você não solicitou a alteração, ignore esta mensagem.');
    }
}
