<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name') }}</title>

    <!-- Styles / Scripts -->
    @if (file_exists(public_path('build/manifest.json')) || file_exists(public_path('hot')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else

    @endif
</head>
<body class="font-sans">
<div class="text-black/50 dark:text-white/50 z-10">
    <img src="/images/img-QoN23lUZfEWQ8aPlVBuJ4.jpeg" alt="imge" class="hidden">
    <div class="container mx-auto px-4 py-8">
        @yield('content')
    </div>
</div>
@yield('scripts')
</body>
</html>
