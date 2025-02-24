<?php

namespace App\Http\Controllers;

use Ds\Set;
use Illuminate\Http\Request;

class X01Controller extends Controller
{

   //create a new game
    public function __invoke(Request $request)
    {
        $game = [
            'player1' => $request->input('player1'),
            'player2' => $request->input('player2'),
            'starting_score' => $request->input('starting-score'),
            'double_in' => $request->input('double-in'),
            'double_out' => $request->input('double-out'),
            '25_bullseye' => $request->input('bullseye-50'),
            'quadro' => $request->input('quadro'),
        ];
        $allowedScoresPerDart = $this->getAllowedScoresPerDart($request);
        $allowedScores = $this->getAllowedScores($request);
        $allowedCheckouts = $this->getAllowedCheckouts($request);

        $allowedScoresPerDart->sort();
        $allowedScores->sort();
        $allowedCheckouts->sort();

        $game['allowedScoresPerDart'] = $allowedScoresPerDart;
        $game['allowedScores'] = $allowedScores;
        $game['allowedCheckouts'] = $allowedCheckouts;


//redirect to the game view with the variables
        return response()->view('game', [
            'game' => $game
        ]);
    }

    private function getAllowedScoresPerDart(Request $request)
    {
        $allowedScores = new Set();
        $allowedScores->add(0);
        $allowedScores->add(25);
        $allowedScores->add(50);
        for ($i = 1; $i <= 20; $i++) {
            $allowedScores->add($i);
            $allowedScores->add($i * 2);
            $allowedScores->add($i * 3);
            if ($request->input('quadro')) {
                $allowedScores->add($i * 4);
            }
        }
        return $allowedScores;
    }

    private function getAllowedScores(Request $request)
    {
        $allowedScoresPerDart = $this->getAllowedScoresPerDart($request);
        $allowedScoresWith3Darts = new Set();
        foreach ($allowedScoresPerDart as $score1) {
            foreach ($allowedScoresPerDart as $score2) {
                $allowedScoresWith3Darts->add($score1 + $score2);
                foreach ($allowedScoresPerDart as $score3) {
                    $allowedScoresWith3Darts->add($score1 + $score2 + $score3);
                }
            }
        }
        return $allowedScoresWith3Darts;
    }

    private function getAllowedCheckouts(Request $request)
    {
        $allowedCheckouts = new Set();

        // these can all be hit with 1 dart...
        for ($i = 1; $i <= 20; $i++) {
            $allowedCheckouts->add($i * 2);
        }
        $allowedCheckouts->add(50);

        // ...but other checkouts will require 2 or 3 darts
        $allowedScoresPerDart = $this->getAllowedScoresPerDart($request);

        foreach ($allowedCheckouts as $checkout) {
            foreach ($allowedScoresPerDart as $score) {
                $allowedCheckouts->add($checkout + $score);
                foreach ($allowedScoresPerDart as $score2) {
                    $allowedCheckouts->add($checkout + $score + $score2);
                }
            }
        }

        return $allowedCheckouts;
    }

}
