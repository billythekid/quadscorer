@extends('layouts.app')
@section('content')
    <div>

        <div class="format"><a href="/">Home</a></div>

        <div class="grid grid-cols-1 my-4">
            <div class="inline-flex space-x-2 w-full">
                <div class="flex flex-col flex-grow space-y-2">
                    <label for="player1" class="format text-lg">{{$game['player1']}} Score Remaining</label>
                    <input readonly type="text" name="player1" id="player1"
                           class="border-4 border-white format text-5xl bg-gray-50 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white"
                           value="{{ $game['starting_score'] }}">
                </div>
                <div class="flex flex-col flex-grow space-y-2">
                    <label for="player2" class="format text-lg">{{$game['player2']}} Score Remaining</label>
                    <input readonly type="text" name="player2" id="player2"
                           class="opacity-70 scale-90 format text-5xl bg-gray-50 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white"
                           value="{{ $game['starting_score'] }}">
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 space-x-2 mb-4">
            <div class="relative">
                <input type="number" inputmode="decimal" id="scored"
                       class="text-3xl block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="Enter score" required/>
                <button type="submit" id="score-submit"
                        class="text-white absolute end-2 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-3xl px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Enter!
                </button>
            </div>
            <div id="darts-hit" class="format text-2xl text-gray-900 bg-white/50 rounded-full content-center text-center"></div>
            <p class="lead lg:col-span-1">-OR- Enter segments hit...</p>
        </div>

        <div class="grid @if($game['quadro']) grid-cols-1 lg:grid-cols-2 @else grid-cols-2 @endif">
            @foreach ( range(20,1) as $i)
                <div class="inline-flex m-2 rounded-md shadow-xs font-mono" role="group">
                    @if(in_array($i, [1, 4, 5, 6, 9, 11, 15, 16, 17, 19]))
                        <button value="{{$i}}"
                                type="button"
                                class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-300 hover:text-gray-700 focus:z-10 focus:ring-4 focus:ring-gray-200">
                            {{$i}}
                        </button>
                        <button value="{{$i * 2}}"
                                type="button"
                                class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-green-500 border-t border-b border-green-200 hover:bg-green-300 focus:z-10 focus:ring-4 focus:ring-green-700 focus:text-green-700 dark:bg-green-800 dark:border-green-700 dark:text-white dark:hover:text-white dark:hover:bg-green-700 dark:focus:ring-green-500 dark:focus:text-white">
                            D{{$i}}
                        </button>
                        @if($game['quadro'])
                            <button value="{{$i * 3}}"
                                    type="button"
                                    class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-green-500 border border-green-200 hover:bg-green-300 focus:z-10 focus:ring-4 focus:ring-green-700 focus:text-green-700 dark:bg-green-800 dark:border-green-700 dark:text-white dark:hover:text-white dark:hover:bg-green-700 dark:focus:ring-green-500 dark:focus:text-white">
                                T{{$i}}
                            </button>
                            <button value="{{$i * 4}}"
                                    type="button"
                                    class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-green-500 border border-green-200 rounded-e-lg hover:bg-green-300 focus:z-10 focus:ring-4 focus:ring-green-700 focus:text-green-700 dark:bg-green-800 dark:border-green-700 dark:text-white dark:hover:text-white dark:hover:bg-green-700 dark:focus:ring-green-500 dark:focus:text-white">
                                Q{{$i}}
                            </button>
                        @else
                            <button value="{{$i * 3}}"
                                    type="button"
                                    class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-green-500 border border-green-200 rounded-e-lg hover:bg-green-300 focus:z-10 focus:ring-4 focus:ring-green-700 focus:text-green-700 dark:bg-green-800 dark:border-green-700 dark:text-white dark:hover:text-white dark:hover:bg-green-700 dark:focus:ring-green-500 dark:focus:text-white">
                                T{{$i}}
                            </button>
                        @endif
                    @else
                        <button value="{{$i}}"
                            type="button"
                                class="flex-grow px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-200 rounded-s-lg hover:bg-gray-300 hover:text-gray-700 focus:z-10 focus:ring-4 focus:ring-gray-200">
                            {{$i}}
                        </button>
                        <button value="{{$i * 2}}"
                                type="button"
                                class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-red-600 border-t border-b border-red-200 hover:bg-red-300 focus:z-10 focus:ring-4 focus:ring-red-700 focus:text-red-700 dark:bg-red-800 dark:border-red-700 dark:text-white dark:hover:text-white dark:hover:bg-red-700 dark:focus:ring-red-500 dark:focus:text-white">
                            D{{$i}}
                        </button>
                        @if($game['quadro'])
                            <button value="{{$i * 3}}"
                                    type="button"
                                    class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-red-600 border border-red-200 hover:bg-red-300 focus:z-10 focus:ring-4 focus:ring-red-700 focus:text-red-700 dark:bg-red-800 dark:border-red-700 dark:text-white dark:hover:text-white dark:hover:bg-red-700 dark:focus:ring-red-500 dark:focus:text-white">
                                T{{$i}}
                            </button>
                            <button value="{{$i * 4}}"
                                    type="button"
                                    class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-red-600 border border-red-200 rounded-e-lg hover:bg-red-300 focus:z-10 focus:ring-4 focus:ring-red-700 focus:text-red-700 dark:bg-red-800 dark:border-red-700 dark:text-white dark:hover:text-white dark:hover:bg-red-700 dark:focus:ring-red-500 dark:focus:text-white">
                                Q{{$i}}
                            </button>
                        @else
                            <button value="{{$i * 3}}"
                                    type="button"
                                    class="flex-grow px-4 py-2 text-sm font-medium text-gray-900 bg-red-600 border border-red-200 rounded-e-lg hover:bg-red-300 focus:z-10 focus:ring-4 focus:ring-red-700 focus:text-red-700 dark:bg-red-800 dark:border-red-700 dark:text-white dark:hover:text-white dark:hover:bg-red-700 dark:focus:ring-red-500 dark:focus:text-white">
                                T{{$i}}
                            </button>
                        @endif
                    @endif
                </div>
            @endforeach
        </div>
        <div class="mx-1 flex flex-row space-x-2">
            <button value="0"
                type="submit"
                    class="w-[calc(100%)] text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                0
            </button>
            <button value="25"
                type="submit"
                    class="w-[calc(100%)] text-gray-900 bg-green-500 hover:bg-green-300 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-800 dark:hover:bg-green-700 dark:text-white dark:hover:text-white dark:focus:ring-green-500">
                25
            </button>
            <button value="50"
                type="submit"
                    class="w-[calc(100%)] text-gray-900 bg-red-600 hover:bg-red-300 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-800 dark:hover:bg-red-700 dark:focus:ring-red-800 dark:text-white">
                Bullseye
            </button>
        </div>
    </div>
@endsection

@section('scripts')
    <script>
        const allowedScores = {{ collect($game['allowedScores']) }};
        const allowedCheckouts = {{ collect($game['allowedCheckouts']) }};
        const scoreInput = document.getElementById('scored');
        const scoreSubmit = document.getElementById('score-submit');
        const player1Score = document.getElementById('player1');
        const player2Score = document.getElementById('player2');
        let currentPlayer = 'player1';

        const dartsHit = document.getElementById('darts-hit');
        const dartButtons = document.querySelectorAll('button[value]');

        scoreSubmit.addEventListener('click', () => {
            if (scoreInput.value === "") {
                scoreInput.value = '0';
            }
            const score = parseInt(scoreInput.value);
            if (!allowedScores.includes(score)) {
                alert('Invalid score for this game');
                return;
            }
            const playerScore = currentPlayer === 'player1' ? player1Score : player2Score;
            const newScore = playerScore.value - score;
            if (newScore === 1 || newScore < 0 ) {
                alert('Bust!');
            } else if (newScore === 0 && !allowedCheckouts.includes(newScore)) {
                alert('Invalid checkout!');
            }
            else {
                playerScore.value = newScore;
            }
            currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
            scoreInput.value = '';

            player1Score.classList.toggle('opacity-70')
            player2Score.classList.toggle('opacity-70')
            player1Score.classList.toggle('scale-90')
            player2Score.classList.toggle('scale-90')
            player1Score.classList.toggle('border-4')
            player2Score.classList.toggle('border-4')

            dartsHit.innerHTML = '';
        });

        let darts = 0;
        dartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const value = parseInt(event.target.value);
                if (dartsHit.innerHTML === '') {
                    dartsHit.innerHTML = value;
                } else {
                    dartsHit.innerHTML = dartsHit.innerHTML + ' + ' + value;
                }
                dartScores = dartsHit.innerHTML.split(' + ').map(Number);
                darts = dartScores.reduce((a, b) => a + b, 0);
                scoreInput.value = darts;
            });
        });
    </script>
@endsection
