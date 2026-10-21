const STORAGE_KEY = 'quadscorer.game';
const PLAYER_NAMES_KEY = 'quadscorer.player-names';
const STORAGE_VERSION = 1;
const allowedTotalsCache = new Map();
const checkoutCache = new Map();

export function createGame({ players, startingScore, quadro = false }) {
    const score = Number(startingScore);

    if (!Number.isInteger(score) || score < 2 || score > 10001) {
        throw new Error('Starting score must be between 2 and 10001.');
    }

    if (!Array.isArray(players) || players.length !== 2) {
        throw new Error('Exactly two players are required.');
    }

    return {
        version: STORAGE_VERSION,
        settings: {
            players: players.map((name, index) => String(name).trim() || `Player ${index + 1}`),
            startingScore: score,
            quadro: Boolean(quadro),
        },
        players: players.map((name, index) => ({
            name: String(name).trim() || `Player ${index + 1}`,
            score,
            visits: [],
        })),
        currentPlayerIndex: 0,
        winnerIndex: null,
        history: [],
    };
}

export function scoreSegments(quadro = false) {
    const segments = [{ multiplier: 'M', number: 0, value: 0 }];

    for (let number = 1; number <= 20; number += 1) {
        segments.push({ multiplier: 'S', number, value: number });
        segments.push({ multiplier: 'D', number, value: number * 2 });
        segments.push({ multiplier: 'T', number, value: number * 3 });

        if (quadro) {
            segments.push({ multiplier: 'Q', number, value: number * 4 });
        }
    }

    segments.push({ multiplier: 'SB', number: 25, value: 25 });
    segments.push({ multiplier: 'DB', number: 25, value: 50 });

    return segments;
}

export function allowedTotals(quadro = false) {
    const cacheKey = quadro ? 'quadro' : 'standard';

    if (allowedTotalsCache.has(cacheKey)) {
        return allowedTotalsCache.get(cacheKey);
    }

    const values = [...new Set(scoreSegments(quadro).map((segment) => segment.value))];
    const totals = new Set();

    for (const first of values) {
        for (const second of values) {
            for (const third of values) {
                totals.add(first + second + third);
            }
        }
    }

    allowedTotalsCache.set(cacheKey, totals);

    return totals;
}

function routeSegments(quadro) {
    const segments = [];
    const multipliers = quadro ? ['Q', 'T', 'D', 'S'] : ['T', 'D', 'S'];

    for (const multiplier of multipliers) {
        const factor = { S: 1, D: 2, T: 3, Q: 4 }[multiplier];

        for (let number = 20; number >= 1; number -= 1) {
            segments.push({ multiplier, number, value: number * factor });
        }
    }

    segments.push({ multiplier: 'DB', number: 25, value: 50 });
    segments.push({ multiplier: 'SB', number: 25, value: 25 });

    return segments;
}

function doubles() {
    const segments = [{ multiplier: 'DB', number: 25, value: 50 }];

    for (let number = 20; number >= 1; number -= 1) {
        segments.push({ multiplier: 'D', number, value: number * 2 });
    }

    return segments;
}

export function checkoutRoute(score, quadro = false) {
    const numericScore = Number(score);
    const cacheKey = `${quadro ? 'q' : 's'}:${numericScore}`;

    if (checkoutCache.has(cacheKey)) {
        return checkoutCache.get(cacheKey);
    }

    if (!Number.isInteger(numericScore) || numericScore < 2) {
        return null;
    }

    const setupSegments = routeSegments(quadro);

    for (const finish of doubles()) {
        if (finish.value === numericScore) {
            checkoutCache.set(cacheKey, [finish]);

            return [finish];
        }
    }

    for (const first of setupSegments) {
        for (const finish of doubles()) {
            if (first.value + finish.value === numericScore) {
                const route = [first, finish];
                checkoutCache.set(cacheKey, route);

                return route;
            }
        }
    }

    for (const first of setupSegments) {
        for (const second of setupSegments) {
            for (const finish of doubles()) {
                if (first.value + second.value + finish.value === numericScore) {
                    const route = [first, second, finish];
                    checkoutCache.set(cacheKey, route);

                    return route;
                }
            }
        }
    }

    checkoutCache.set(cacheKey, null);

    return null;
}

export function formatSegment(segment) {
    if (segment.multiplier === 'M') {
        return 'Miss';
    }

    if (segment.multiplier === 'SB') {
        return '25';
    }

    if (segment.multiplier === 'DB') {
        return 'Bull';
    }

    return `${segment.multiplier}${segment.number}`;
}

function isValidSegment(segment, quadro) {
    return scoreSegments(quadro).some((allowed) => (
        allowed.multiplier === segment.multiplier
        && allowed.number === segment.number
        && allowed.value === segment.value
    ));
}

export function addVisit(game, visit) {
    if (game.winnerIndex !== null) {
        return { ok: false, error: 'Start a rematch before scoring again.' };
    }

    const hasSegments = Array.isArray(visit.segments);
    const segments = hasSegments ? visit.segments : null;

    if (segments && (segments.length < 1 || segments.length > 3)) {
        return { ok: false, error: 'Enter between one and three darts.' };
    }

    if (segments && !segments.every((segment) => isValidSegment(segment, game.settings.quadro))) {
        return { ok: false, error: 'That dart is not available on this board.' };
    }

    const total = segments
        ? segments.reduce((sum, segment) => sum + segment.value, 0)
        : Number(visit.total);

    if (!Number.isInteger(total) || !allowedTotals(game.settings.quadro).has(total)) {
        return { ok: false, error: 'That total cannot be scored with three darts.' };
    }

    const playerIndex = game.currentPlayerIndex;
    const player = game.players[playerIndex];
    const scoreAfterThrow = player.score - total;
    const finishingSegment = segments?.at(-1);
    const validSegmentFinish = !segments
        || finishingSegment.multiplier === 'D'
        || finishingSegment.multiplier === 'DB';
    const validTotalFinish = checkoutRoute(player.score, game.settings.quadro) !== null;
    const bust = scoreAfterThrow < 0
        || scoreAfterThrow === 1
        || (scoreAfterThrow === 0 && (!validSegmentFinish || !validTotalFinish));
    const scoreAfter = bust ? player.score : scoreAfterThrow;
    const label = segments ? segments.map(formatSegment).join(' + ') : String(total);
    const recordedVisit = {
        playerIndex,
        scoreBefore: player.score,
        scoreAfter,
        total,
        credited: bust ? 0 : total,
        label: bust ? `${label} (bust)` : label,
        bust,
        segments,
    };
    const nextGame = structuredClone(game);

    nextGame.players[playerIndex].score = scoreAfter;
    nextGame.players[playerIndex].visits.push(recordedVisit);
    nextGame.history.push(recordedVisit);

    if (scoreAfter === 0) {
        nextGame.winnerIndex = playerIndex;
    } else {
        nextGame.currentPlayerIndex = (playerIndex + 1) % nextGame.players.length;
    }

    return { ok: true, game: nextGame, visit: recordedVisit };
}

export function undoVisit(game) {
    if (game.history.length === 0) {
        return game;
    }

    const nextGame = structuredClone(game);
    const visit = nextGame.history.pop();
    const player = nextGame.players[visit.playerIndex];

    player.score = visit.scoreBefore;
    player.visits.pop();
    nextGame.currentPlayerIndex = visit.playerIndex;
    nextGame.winnerIndex = null;

    return nextGame;
}

export function saveGame(storage, game) {
    storage.setItem(STORAGE_KEY, JSON.stringify(game));
}

export function restoreGame(storage) {
    const saved = storage.getItem(STORAGE_KEY);

    if (!saved) {
        return null;
    }

    try {
        const game = JSON.parse(saved);

        if (
            game.version !== STORAGE_VERSION
            || !Array.isArray(game.players)
            || !Array.isArray(game.history)
            || game.players.length !== 2
        ) {
            storage.removeItem(STORAGE_KEY);

            return null;
        }

        return game;
    } catch {
        storage.removeItem(STORAGE_KEY);

        return null;
    }
}

export function savePlayerNames(storage, names) {
    const existingNames = restorePlayerNames(storage);
    const uniqueNames = [];

    for (const name of [...names, ...existingNames]) {
        const trimmedName = String(name).trim();

        if (
            trimmedName
            && !uniqueNames.some((existingName) => existingName.toLowerCase() === trimmedName.toLowerCase())
        ) {
            uniqueNames.push(trimmedName);
        }
    }

    const savedNames = uniqueNames.slice(0, 20);
    storage.setItem(PLAYER_NAMES_KEY, JSON.stringify(savedNames));

    return savedNames;
}

export function restorePlayerNames(storage) {
    const saved = storage.getItem(PLAYER_NAMES_KEY);

    if (!saved) {
        return [];
    }

    try {
        const names = JSON.parse(saved);

        return Array.isArray(names)
            ? names.filter((name) => typeof name === 'string' && name.trim()).slice(0, 20)
            : [];
    } catch {
        storage.removeItem(PLAYER_NAMES_KEY);

        return [];
    }
}
