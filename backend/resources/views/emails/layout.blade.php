<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>{{ $title ?? 'Conta na Massa' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F6F0;color:#212529;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
@if (! empty($preheader))
    <div style="display:none;font-size:1px;color:#F8F6F0;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        {{ $preheader }}
    </div>
@endif

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8F6F0;width:100%;">
    <tr>
        <td align="center" style="padding:36px 16px 40px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
                <!-- Brand Header -->
                <tr>
                    <td align="center" style="padding:0 0 24px 0;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td align="center" valign="middle" width="44" height="44" style="width:44px;height:44px;border-radius:12px;background-color:#E85D04;background-image:linear-gradient(135deg,#E85D04 0%,#F4A261 100%);text-align:center;vertical-align:middle;font-size:22px;line-height:44px;">
                                    &#x1F950;
                                </td>
                                <td style="padding-left:12px;text-align:left;vertical-align:middle;">
                                    <div style="font-family:'Outfit','DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:21px;font-weight:800;color:#212529;letter-spacing:-0.02em;line-height:1.15;">
                                        Conta na Massa
                                    </div>
                                    <div style="font-size:12px;font-weight:500;color:#6C757D;line-height:1.3;margin-top:2px;">
                                        Precifica&ccedil;&atilde;o para Confeitaria &amp; Panifica&ccedil;&atilde;o
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Main Card -->
                <tr>
                    <td style="background-color:#FFFFFF;border:1px solid #E5DDD0;border-radius:16px;overflow:hidden;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td style="height:4px;line-height:4px;font-size:4px;background-color:#E85D04;background-image:linear-gradient(90deg,#E85D04 0%,#F4A261 100%);">&nbsp;</td>
                            </tr>
                            <tr>
                                <td style="padding:32px 32px 28px 32px;">
                                    @yield('content')
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td align="center" style="padding:24px 16px 0 16px;text-align:center;">
                        <p style="margin:0 0 6px 0;font-size:12px;line-height:1.5;color:#6C757D;">
                            Gest&atilde;o de custos reais e precifica&ccedil;&atilde;o para sua confeitaria ou padaria.
                        </p>
                        <p style="margin:0;font-size:12px;line-height:1.5;color:#868E96;">
                            &copy; {{ date('Y') }} Conta na Massa. Todos os direitos reservados.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
