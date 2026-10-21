import test from 'node:test';
import assert from 'node:assert/strict';
import {
    addVisit,
    allowedTotals,
    checkoutRoute,
    createGame,
    restoreGame,
    restorePlayerNames,
    saveGame,
    savePlayerNames,
    undoVisit,
} from '../resources/js/game.js';

test('standard and Quadro boards expose the correct maximum visit', () => {
    assert.equal(allowedTotals(false).has(180), true);
    assert.equal(allowedTotals(false).has(181), false);
    assert.equal(allowedTotals(true).has(240), true);
});

test('scores a standard visit and advances the player', () => {
    const game = createGame({ players: ['Alice', 'Bob'], startingScore: 501 });
    const result = addVisit(game, { total: 100 });

    assert.equal(result.ok, true);
    assert.equal(result.game.players[0].score, 401);
    assert.equal(result.game.currentPlayerIndex, 1);
});

test('records a bust without changing the score', () => {
    const game = createGame({ players: ['Alice', 'Bob'], startingScore: 32 });
    const result = addVisit(game, { total: 31 });

    assert.equal(result.ok, true);
    assert.equal(result.visit.bust, true);
    assert.equal(result.game.players[0].score, 32);
    assert.equal(result.game.currentPlayerIndex, 1);
});

test('requires a double to finish a dart-by-dart visit', () => {
    const game = createGame({ players: ['Alice', 'Bob'], startingScore: 40 });
    const result = addVisit(game, {
        segments: [{ multiplier: 'S', number: 20, value: 20 }, { multiplier: 'S', number: 20, value: 20 }],
    });

    assert.equal(result.ok, true);
    assert.equal(result.visit.bust, true);
    assert.equal(result.game.winnerIndex, null);
});

test('accepts a double-out finish and identifies the winner', () => {
    const game = createGame({ players: ['Alice', 'Bob'], startingScore: 40 });
    const result = addVisit(game, {
        segments: [{ multiplier: 'D', number: 20, value: 40 }],
    });

    assert.equal(result.ok, true);
    assert.equal(result.game.players[0].score, 0);
    assert.equal(result.game.winnerIndex, 0);
});

test('supports quadruple segments only on a Quadro board', () => {
    const segment = [{ multiplier: 'Q', number: 20, value: 80 }];
    const standard = addVisit(
        createGame({ players: ['Alice', 'Bob'], startingScore: 501 }),
        { segments: segment },
    );
    const quadro = addVisit(
        createGame({ players: ['Alice', 'Bob'], startingScore: 501, quadro: true }),
        { segments: segment },
    );

    assert.equal(standard.ok, false);
    assert.equal(quadro.ok, true);
    assert.equal(quadro.game.players[0].score, 421);
});

test('finds standard and Quadro checkout routes', () => {
    assert.deepEqual(
        checkoutRoute(170, false).map(({ multiplier, number }) => [multiplier, number]),
        [['T', 20], ['T', 20], ['DB', 25]],
    );
    assert.equal(checkoutRoute(200, false), null);
    assert.equal(checkoutRoute(200, true).reduce((sum, segment) => sum + segment.value, 0), 200);
});

test('undo restores the previous player and score', () => {
    const game = createGame({ players: ['Alice', 'Bob'], startingScore: 501 });
    const scored = addVisit(game, { total: 100 }).game;
    const undone = undoVisit(scored);

    assert.equal(undone.players[0].score, 501);
    assert.equal(undone.players[0].visits.length, 0);
    assert.equal(undone.currentPlayerIndex, 0);
    assert.equal(undone.history.length, 0);
});

test('persists and restores a game', () => {
    const values = new Map();
    const storage = {
        getItem: (key) => values.get(key) ?? null,
        removeItem: (key) => values.delete(key),
        setItem: (key, value) => values.set(key, value),
    };
    const game = createGame({ players: ['Alice', 'Bob'], startingScore: 301, quadro: true });

    saveGame(storage, game);

    assert.deepEqual(restoreGame(storage), game);
});

test('stores recent player names without case-insensitive duplicates', () => {
    const values = new Map();
    const storage = {
        getItem: (key) => values.get(key) ?? null,
        removeItem: (key) => values.delete(key),
        setItem: (key, value) => values.set(key, value),
    };

    savePlayerNames(storage, ['Alice', 'Bob']);
    const names = savePlayerNames(storage, ['bob', 'Charlie']);

    assert.deepEqual(names, ['bob', 'Charlie', 'Alice']);
    assert.deepEqual(restorePlayerNames(storage), names);
});
