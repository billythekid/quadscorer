@extends('layouts.app')
@section('content')
    <div class="format format-invert format-red">
        <h2>Welcome to {{ config('app.name') }}</h2>
        <p class="lead">Set up your game.</p>
    </div>
    <div class="grid grid-cols-1 gap-4 mt-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 class="text-2xl font-bold">x01</h2>
            <p class="text-lg">First to zero wins!</p>
            <form action="{{ route('x01.create') }}" method="POST">
                {{ method_field('POST') }}
                {{ csrf_field() }}
                <div class="flex flex-col space-y-4">
                    <div class="flex flex-col space-y-2">
                        <label for="player1" class="text-lg">Player 1</label>
                        <input type="text" name="player1" id="player1"
                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               value="Player 1">
                    </div>
                    <div class="flex flex-col space-y-2">
                        <label for="player2" class="text-lg">Player 2</label>
                        <input type="text" name="player2" id="player2"
                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                               value="Player 2">
                    </div>
                    <div class="flex flex-col space-y-2">
                        <label for="startingScore" class="text-lg">Starting Score</label>
                        <input type="number" min="2" max="10001" name="starting-score" id="startingScore"
                               class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"                                   value="501">
                    </div>
{{--                    <div class="space-y-2">--}}

{{--                        <label class="inline-flex items-center cursor-pointer">--}}
{{--                            <input type="checkbox" name="double-in" class="sr-only peer">--}}
{{--                            <div--}}
{{--                                class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>--}}
{{--                            <span--}}
{{--                                class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Double in?</span>--}}
{{--                        </label>--}}

{{--                    </div>--}}
{{--                    <div class="space-y-2">--}}
{{--                        <label class="inline-flex items-center cursor-pointer">--}}
{{--                            <input type="checkbox" name="double-out" class="sr-only peer" checked>--}}
{{--                            <div--}}
{{--                                class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>--}}
{{--                            <span--}}
{{--                                class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Double out?</span>--}}
{{--                        </label>--}}
{{--                    </div>--}}
{{--                    <div class="space-y-2">--}}
{{--                        <label class="inline-flex items-center cursor-pointer">--}}
{{--                            <input type="checkbox" name="bullseye-50" class="sr-only peer">--}}
{{--                            <div--}}
{{--                                class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>--}}
{{--                            <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">25 section counts as 50?</span>--}}
{{--                        </label>--}}
{{--                    </div>--}}
                    <div class="space-y-2">
                        <label class="inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="quadro" class="sr-only peer">
                            <div
                                class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                            <span
                                class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Quadro board?</span>
                        </label>
                    </div>
                    {{--                        start game button --}}
                    <div class="space-y-2">
                        <button type="submit" class="w-[calc(100%)] text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Start game</button>
                    </div>

            </form>
        </div>
    </div>
@endsection
