<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conta na Massa — Custos & Fichas Técnicas</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    @viteReactRefresh
    @vite(['resources/js/index.css', 'resources/js/main.tsx'])
</head>
<body class="bg-[#F8F6F0] text-[#212529] font-sans antialiased h-full">
    <div
        id="root"
        class="h-full"
        data-sentry-dsn="{{ config('sentry.dsn') }}"
        data-sentry-environment="{{ config('sentry.environment') ?: config('app.env') }}"
        data-sentry-release="{{ config('sentry.release') }}"
        data-sentry-traces-sample-rate="{{ config('sentry.traces_sample_rate') ?? 0.01 }}"
    ></div>
</body>
</html>
