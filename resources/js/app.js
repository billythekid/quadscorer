import '../css/app.css';
import {
    addVisit,
    checkoutRoutes,
    createGame,
    formatSegment,
    restoreGame,
    restorePlayerNames,
    saveGame,
    savePlayerNames,
    undoVisit,
} from './game.js';

const app = document.querySelector('#app');
const savedGame = restoreGame(localStorage);
let knownPlayers = restorePlayerNames(localStorage);

let installPrompt = null;
let state = {
    screen: savedGame ? 'game' : 'setup',
    game: savedGame,
    entryMode: 'total',
    totalInput: '',
    selectedMultiplier: 'S',
    pendingDarts: [],
    notice: '',
};

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const activePlayer = () => state.game.players[state.game.currentPlayerIndex];

const visitAverage = (player) => {
    if (player.visits.length === 0) {
        return '0.0';
    }

    const total = player.visits.reduce((sum, visit) => sum + visit.credited, 0);

    return (total / player.visits.length).toFixed(1);
};

const installButton = () => installPrompt
    ? '<button class="button button-quiet" data-action="install">Install app</button>'
    : '';

function renderSetup() {
    const playerNames = state.game?.settings.players ?? knownPlayers;
    const player1 = playerNames[0] ?? 'Player 1';
    const player2 = playerNames[1] ?? 'Player 2';

    app.innerHTML = `
        <section class="setup-shell">
            <header class="brand">
                <span class="brand-mark" aria-hidden="true">Q</span>
                <div>
                    <h1>Quadscorer</h1>
                    <p>Fast X01 scoring, including Quadro boards.</p>
                </div>
            </header>

            <form class="setup-card" id="setup-form">
                <fieldset>
                    <legend>Players</legend>
                    <div class="player-inputs">
                        <label>
                            <span>Player 1</span>
                            <input name="player1" list="known-players" value="${escapeHtml(player1)}" autocomplete="off" maxlength="24" required>
                        </label>
                        <label>
                            <span>Player 2</span>
                            <input name="player2" list="known-players" value="${escapeHtml(player2)}" autocomplete="off" maxlength="24" required>
                        </label>
                        <datalist id="known-players">
                            ${knownPlayers.map((name) => `<option value="${escapeHtml(name)}"></option>`).join('')}
                        </datalist>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Starting score</legend>
                    <div class="choice-grid">
                        <label class="choice">
                            <input type="radio" name="startingScore" value="301">
                            <span>301</span>
                        </label>
                        <label class="choice">
                            <input type="radio" name="startingScore" value="501" checked>
                            <span>501</span>
                        </label>
                        <label class="choice">
                            <input type="radio" name="startingScore" value="701">
                            <span>701</span>
                        </label>
                    </div>
                    <label class="custom-score">
                        <span>Custom</span>
                        <input type="number" name="customScore" min="2" max="10001" inputmode="numeric" placeholder="e.g. 1001">
                    </label>
                </fieldset>

                <fieldset>
                    <legend>Board</legend>
                    <div class="choice-grid choice-grid-two">
                        <label class="choice">
                            <input type="radio" name="board" value="standard" checked>
                            <span>Standard</span>
                        </label>
                        <label class="choice choice-quadro">
                            <input type="radio" name="board" value="quadro">
                            <span>Quadro</span>
                        </label>
                    </div>
                    <p class="field-note">Double out is always on. Quadro adds Q1 to Q20.</p>
                </fieldset>

                <button class="button button-primary button-large" type="submit">Start game</button>
            </form>

            <div class="setup-actions">
                ${state.game ? '<button class="button button-quiet" data-action="resume">Resume game</button>' : ''}
                ${installButton()}
            </div>
        </section>
    `;
}

function scoreCards() {
    return state.game.players.map((player, index) => {
        const active = index === state.game.currentPlayerIndex && state.game.winnerIndex === null;
        const winner = index === state.game.winnerIndex;
        const lastVisit = player.visits.at(-1);

        return `
            <article class="score-card ${active ? 'is-active' : ''} ${winner ? 'is-winner' : ''}">
                <div class="score-card-top">
                    <strong>${escapeHtml(player.name)}</strong>
                    ${active ? '<span class="throwing">Throwing</span>' : ''}
                    ${winner ? '<span class="throwing">Winner</span>' : ''}
                </div>
                <div class="score">${player.score}</div>
                <div class="score-meta">
                    <span>Avg ${visitAverage(player)}</span>
                    <span>Last ${lastVisit ? escapeHtml(lastVisit.label) : '-'}</span>
                </div>
            </article>
        `;
    }).join('');
}

function checkoutHint() {
    const player = activePlayer();
    const pendingTotal = state.entryMode === 'darts'
        ? state.pendingDarts.reduce((sum, dart) => sum + dart.value, 0)
        : 0;
    const score = player.score - pendingTotal;
    const dartsRemaining = state.entryMode === 'darts' ? 3 - state.pendingDarts.length : 3;
    const finishingDart = state.pendingDarts.at(-1);

    if (score === 0) {
        const validFinish = finishingDart?.multiplier === 'D' || finishingDart?.multiplier === 'DB';

        return `<span>${validFinish ? 'Checkout complete' : 'Bust: finish on a double'}</span>`;
    }

    if (score < 2) {
        return '<span>Bust</span>';
    }

    const routes = checkoutRoutes(score, state.game.settings.quadro, dartsRemaining, 3);

    if (routes.length === 0) {
        return `<span>${dartsRemaining ? 'No checkout this visit' : 'Visit complete'}</span>`;
    }

    return `
        <span class="checkout-label">Checkout ${score}</span>
        <div class="checkout-options">
            ${routes.map((route, index) => `
                <span class="${index === 0 ? 'is-primary' : ''}">${route.map(formatSegment).join(' ')}</span>
            `).join('')}
        </div>
    `;
}

function totalEntry() {
    const quickScores = state.game.settings.quadro
        ? [26, 41, 60, 80, 100, 140, 180, 200, 240]
        : [26, 41, 60, 81, 100, 140, 180];

    return `
        <section class="entry-panel">
            <div class="total-display" aria-live="polite">${state.totalInput || '0'}</div>
            <div class="quick-scores">
                ${quickScores.map((score) => `<button data-action="quick-score" data-score="${score}">${score}</button>`).join('')}
            </div>
            <div class="keypad">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => `<button data-action="digit" data-digit="${number}">${number}</button>`).join('')}
                <button class="keypad-muted" data-action="clear-total">Clear</button>
                <button data-action="digit" data-digit="0">0</button>
                <button class="keypad-muted" data-action="backspace" aria-label="Delete last digit">Delete</button>
            </div>
            <button class="button button-primary score-button" data-action="submit-total">
                Score ${state.totalInput || '0'}
            </button>
        </section>
    `;
}

function dartEntry() {
    const multipliers = state.game.settings.quadro ? ['S', 'D', 'T', 'Q'] : ['S', 'D', 'T'];
    const pendingTotal = state.pendingDarts.reduce((sum, dart) => sum + dart.value, 0);

    return `
        <section class="entry-panel">
            <div class="dart-summary">
                <div class="dart-chips">
                    ${state.pendingDarts.length
                        ? state.pendingDarts.map((dart, index) => `<button data-action="remove-dart" data-index="${index}">${formatSegment(dart)}</button>`).join('')
                        : '<span>Tap up to three darts</span>'}
                </div>
                <strong>${pendingTotal}</strong>
            </div>
            <div class="multipliers ${state.game.settings.quadro ? 'multipliers-quadro' : ''}" role="group" aria-label="Multiplier">
                ${multipliers.map((multiplier) => `
                    <button
                        class="${state.selectedMultiplier === multiplier ? 'is-selected' : ''}"
                        data-action="multiplier"
                        data-multiplier="${multiplier}"
                    >${multiplier}</button>
                `).join('')}
            </div>
            <div class="numbers">
                ${Array.from({ length: 20 }, (_, index) => 20 - index).map((number) => `
                    <button data-action="dart" data-number="${number}">${number}</button>
                `).join('')}
                <button data-action="miss">Miss</button>
                <button data-action="bull">25 / Bull</button>
            </div>
            <button class="button button-primary score-button" data-action="submit-darts" ${state.pendingDarts.length ? '' : 'disabled'}>
                Score visit
            </button>
        </section>
    `;
}

function renderGame() {
    const boardName = state.game.settings.quadro ? 'Quadro' : 'Standard';

    app.innerHTML = `
        <section class="game-shell">
            <header class="game-header">
                <button class="wordmark" data-action="home" aria-label="Game setup">
                    <span class="brand-mark brand-mark-small" aria-hidden="true">Q</span>
                    <span>Quadscorer</span>
                </button>
                <span class="game-type">${state.game.settings.startingScore} / ${boardName}</span>
                <button class="icon-button" data-action="open-history">History</button>
            </header>

            <div class="scoreboard">${scoreCards()}</div>

            ${state.game.winnerIndex === null ? `
                <div class="checkout-hint">${checkoutHint()}</div>
                <div class="mode-tabs" role="tablist" aria-label="Score entry mode">
                    <button class="${state.entryMode === 'total' ? 'is-selected' : ''}" data-action="mode" data-mode="total">Total</button>
                    <button class="${state.entryMode === 'darts' ? 'is-selected' : ''}" data-action="mode" data-mode="darts">Darts</button>
                </div>
                ${state.notice ? `<p class="notice" role="alert">${escapeHtml(state.notice)}</p>` : ''}
                ${state.entryMode === 'total' ? totalEntry() : dartEntry()}
            ` : `
                <section class="winner-panel">
                    <p>${escapeHtml(state.game.players[state.game.winnerIndex].name)} wins</p>
                    <button class="button button-primary button-large" data-action="rematch">Play again</button>
                </section>
            `}

            <footer class="game-footer">
                <button data-action="undo" ${state.game.history.length ? '' : 'disabled'}>Undo last visit</button>
                <button data-action="new-game">New game</button>
            </footer>
        </section>

        <dialog id="history-dialog">
            <div class="dialog-header">
                <h2>Visit history</h2>
                <button class="icon-button" data-action="close-history">Close</button>
            </div>
            <div class="history-list">
                ${state.game.history.length
                    ? [...state.game.history].reverse().map((visit) => `
                        <div class="history-row">
                            <span>${escapeHtml(state.game.players[visit.playerIndex].name)}</span>
                            <strong>${escapeHtml(visit.label)}</strong>
                            <span>${visit.scoreBefore} to ${visit.scoreAfter}</span>
                        </div>
                    `).join('')
                    : '<p>No visits yet.</p>'}
            </div>
        </dialog>
    `;
}

function render() {
    const gameActive = state.screen === 'game' && state.game;
    document.body.classList.toggle('game-active', Boolean(gameActive));

    if (gameActive) {
        renderGame();
    } else {
        renderSetup();
    }
}

function persist() {
    saveGame(localStorage, state.game);
}

function setNotice(message) {
    state.notice = message;
    render();
}

function submitVisit(visit) {
    const result = addVisit(state.game, visit);

    if (!result.ok) {
        setNotice(result.error);

        return;
    }

    state.game = result.game;
    state.totalInput = '';
    state.pendingDarts = [];
    state.notice = result.visit.bust ? 'Bust. Score unchanged.' : '';
    persist();
    render();
}

app.addEventListener('submit', (event) => {
    if (event.target.id !== 'setup-form') {
        return;
    }

    event.preventDefault();
    const form = new FormData(event.target);
    const customScore = Number(form.get('customScore'));
    const startingScore = customScore || Number(form.get('startingScore'));
    const players = [form.get('player1'), form.get('player2')];

    knownPlayers = savePlayerNames(localStorage, players);

    state = {
        ...state,
        screen: 'game',
        game: createGame({
            players,
            startingScore,
            quadro: form.get('board') === 'quadro',
        }),
        entryMode: 'total',
        totalInput: '',
        pendingDarts: [],
        notice: '',
    };
    persist();
    render();
});

app.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');

    if (!button) {
        return;
    }

    const { action } = button.dataset;

    if (action === 'digit') {
        state.totalInput = `${state.totalInput}${button.dataset.digit}`.replace(/^0+(?=\d)/, '').slice(0, 3);
    } else if (action === 'backspace') {
        state.totalInput = state.totalInput.slice(0, -1);
    } else if (action === 'clear-total') {
        state.totalInput = '';
    } else if (action === 'quick-score') {
        state.totalInput = button.dataset.score;
    } else if (action === 'submit-total') {
        submitVisit({ total: Number(state.totalInput || 0) });

        return;
    } else if (action === 'mode') {
        state.entryMode = button.dataset.mode;
        state.notice = '';
    } else if (action === 'multiplier') {
        state.selectedMultiplier = button.dataset.multiplier;
    } else if (action === 'dart' && state.pendingDarts.length < 3) {
        const multiplier = state.selectedMultiplier;
        const number = Number(button.dataset.number);
        const factor = { S: 1, D: 2, T: 3, Q: 4 }[multiplier];
        state.pendingDarts.push({ multiplier, number, value: number * factor });
    } else if (action === 'bull' && state.pendingDarts.length < 3) {
        const double = state.selectedMultiplier === 'D';
        state.pendingDarts.push({ multiplier: double ? 'DB' : 'SB', number: 25, value: double ? 50 : 25 });
    } else if (action === 'miss' && state.pendingDarts.length < 3) {
        state.pendingDarts.push({ multiplier: 'M', number: 0, value: 0 });
    } else if (action === 'remove-dart') {
        state.pendingDarts.splice(Number(button.dataset.index), 1);
    } else if (action === 'submit-darts') {
        submitVisit({ segments: state.pendingDarts });

        return;
    } else if (action === 'undo') {
        state.game = undoVisit(state.game);
        state.notice = '';
        persist();
    } else if (action === 'rematch') {
        state.game = createGame(state.game.settings);
        state.notice = '';
        persist();
    } else if (action === 'new-game') {
        localStorage.removeItem('quadscorer.game');
        state.screen = 'setup';
        state.game = null;
    } else if (action === 'resume') {
        state.screen = 'game';
    } else if (action === 'home') {
        state.screen = 'setup';
    } else if (action === 'open-history') {
        document.querySelector('#history-dialog').showModal();

        return;
    } else if (action === 'close-history') {
        document.querySelector('#history-dialog').close();

        return;
    } else if (action === 'install' && installPrompt) {
        await installPrompt.prompt();
        installPrompt = null;
    }

    render();
});

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    render();
});

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

render();
