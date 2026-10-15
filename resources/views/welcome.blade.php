<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Dating Loili — Special Proposal & Love Questionnaire 💖</title>
    <meta name="description" content="Aplikasi interaktif romantis dengan pertanyaan seru, transisi animasi bouncy Framer Motion, dan ledakan confetti canvas!">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Sacramento&family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Favicon -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22%200%20100%20100%22><text y=%22.9em%22 font-size=%2290%22>💖</text></svg>">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 min-h-screen text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
    <div id="root"></div>
</body>
</html>
