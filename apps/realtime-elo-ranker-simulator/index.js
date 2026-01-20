
const API_SERVER_URL = 'http://localhost:8080'
const BEST_PLAYER_IDS = ['Sunraku', 'OiKaitzo', 'Pencilgon', 'Kirito', 'Asuna', 'Psyger0', 'Meg']
const BASIC_PLAYER_IDS = ['Hikarizsu', 'Alexis', 'Julian', 'Romain', 'test', 'Matthieu', 'Jean', 'Test2', 'Mao']

const INTERVAL_BETWEEN_REQUESTS_MS = 1350;

AJAX = require("axios"); // import axios pour faire des requetes HTTP

function createMatchDTO(winner, loser, draw = false) {
    return {
        winner: winner,
        loser: loser,
        draw: draw
    };
}

async function postMatch(matchDTO) {
    try {
        const response = await AJAX.post(`${API_SERVER_URL}/api/match`, matchDTO);
        console.log(`Match posted: ${matchDTO.winner} vs ${matchDTO.loser} (draw: ${matchDTO.draw})`);
        return response.data;
    } catch (error) {
        console.error('Error posting match:', error.response ? error.response.data : error.message);
    }   
}

// fonction que j'ai repris de mon bot discord : https://github.com/Kyxtaka/Hikaruzs_discord_bot
// fonction dans index.ts
/**
 * @param {number} interval interval en ms
 * @param {Array<Function>} functions List de toute les fonction a appaler a chaque interval
 * @param {string} desc Description de l'action répétée
 */
async function doAlways(
    interval = INTERVAL_BETWEEN_REQUESTS_MS, 
    functions = [], 
    desc = "Do always has been called"
) {
    //print separator line on prompt '='
    console.log("=".repeat(50));
    console.log(desc);
    functions.forEach(async (func) => { await func() });
    setTimeout(() => {  doAlways(interval, functions, desc); }, interval);
}

async function simulateBestVSBasicMatch() {
    // choisir aléatoirement un joueur parmi les meilleurs
    const winner = BEST_PLAYER_IDS[Math.floor(Math.random() * BEST_PLAYER_IDS.length)];
    // choisir aléatoirement un joueur parmi les basiques
    const loser = BASIC_PLAYER_IDS[Math.floor(Math.random() * BASIC_PLAYER_IDS.length)];

    const matchDTO = createMatchDTO(winner, loser, false);
    await postMatch(matchDTO);
}

async function simulateBasicVSBasicDrawMatch() {
    // choisir aléatoirement un joueur parmi les basiques
    const player1 = BASIC_PLAYER_IDS[Math.floor(Math.random() * BASIC_PLAYER_IDS.length)];
    const player2 = BASIC_PLAYER_IDS[Math.floor(Math.random() * BASIC_PLAYER_IDS.length)];

    const matchDTO = createMatchDTO(player1, player2, true);
    await postMatch(matchDTO);
}

async function simulateRandomMatch() {
    const allPlayerIDs = BEST_PLAYER_IDS.concat(BASIC_PLAYER_IDS);
    const player1 = allPlayerIDs[Math.floor(Math.random() * allPlayerIDs.length)];
    let player2 = allPlayerIDs[Math.floor(Math.random() * allPlayerIDs.length)];
    // s'assurer que player2 est différent de player1
    while (player2 === player1) {
        player2 = allPlayerIDs[Math.floor(Math.random() * allPlayerIDs.length)];
    }
    // décider aléatoirement du gagnant
    const isDraw = Math.random() < 0.1; // 10% de chance de match nul
    let winner, loser;
    if (isDraw) {
        winner = player1;
        loser = player2;
    } else {
        if (Math.random() < 0.5) {
            winner = player1;   
            loser = player2;
        } else {
            winner = player2;
            loser = player1;
        }
    }
    const matchDTO = createMatchDTO(winner, loser, isDraw);
    await postMatch(matchDTO);
}


const functionsToCall = [
    simulateBestVSBasicMatch,
    simulateBasicVSBasicDrawMatch,
    simulateRandomMatch
];
doAlways(INTERVAL_BETWEEN_REQUESTS_MS, functionsToCall, "Simulating matches between players...");