CONTA NA MASSA
Precificação para Confeitaria & Panificação
------------------------------------------------------------

{!! $title !!}

{!! $greeting !!}

@foreach ($introLines as $line)
{!! $line !!}

@endforeach
{!! $actionText !!}:
{!! $actionUrl !!}

@if (! empty($securityNote))
{!! $securityNote !!}

@endif
@foreach ($outroLines as $line)
{!! $line !!}

@endforeach
Um abraço,
Equipe Conta na Massa

------------------------------------------------------------
© {{ date('Y') }} Conta na Massa. Todos os direitos reservados.
