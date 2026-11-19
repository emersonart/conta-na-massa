@extends('emails.layout')

@section('content')
    @if (! empty($badge))
        <div style="margin:0 0 14px 0;">
            <span style="display:inline-block;padding:5px 12px;border-radius:999px;background-color:#FDFBF7;border:1px solid #F0EAE1;color:#E85D04;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
                {{ $badge }}
            </span>
        </div>
    @endif

    <h1 style="margin:0 0 16px 0;font-family:'Outfit','DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;font-weight:800;color:#212529;letter-spacing:-0.015em;line-height:1.25;">
        {{ $title }}
    </h1>

    <p style="margin:0 0 14px 0;font-size:15px;font-weight:600;color:#212529;line-height:1.6;">
        {{ $greeting }}
    </p>

    @foreach ($introLines as $line)
        <p style="margin:0 0 14px 0;font-size:15px;color:#495057;line-height:1.65;">
            {{ $line }}
        </p>
    @endforeach

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td align="center" style="border-radius:10px;background-color:#E85D04;">
                            <a href="{{ $actionUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:10px;background-color:#E85D04;">
                                {{ $actionText }}
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    @if (! empty($securityNote))
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">
            <tr>
                <td style="background-color:#FDFBF7;border:1px solid #F0EAE1;border-left:3px solid #2D6A4F;border-radius:10px;padding:13px 16px;font-size:13px;color:#343A40;line-height:1.55;">
                    {{ $securityNote }}
                </td>
            </tr>
        </table>
    @endif

    @foreach ($outroLines as $line)
        <p style="margin:0 0 14px 0;font-size:14px;color:#495057;line-height:1.6;">
            {{ $line }}
        </p>
    @endforeach

    <p style="margin:20px 0 0 0;font-size:14px;color:#343A40;line-height:1.6;">
        Um abra&ccedil;o,<br>
        <strong style="color:#212529;">Equipe Conta na Massa</strong>
    </p>

    <!-- Fallback URL -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0 0;border-top:1px solid #F0EAE1;">
        <tr>
            <td style="padding:18px 0 0 0;font-size:12px;color:#6C757D;line-height:1.6;">
                Se tiver dificuldade para clicar no bot&atilde;o &ldquo;{{ $actionText }}&rdquo;, copie e cole o endere&ccedil;o abaixo no seu navegador:
                <div style="margin-top:8px;word-break:break-all;">
                    <a href="{{ $actionUrl }}" target="_blank" rel="noopener noreferrer" style="color:#2D6A4F;text-decoration:underline;font-size:12px;">
                        {{ $actionUrl }}
                    </a>
                </div>
            </td>
        </tr>
    </table>
@endsection
