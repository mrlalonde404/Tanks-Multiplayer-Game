const { WORLD_SIZE, NUM_TERRAIN_POINTS } = require("./constants.js");
let Terrain = require("./Terrain.js");

function updateGame(state, delta) {
    // if we are not given a state, do not loop
    if(!state) {
        return;
    }

    // handle the shells
    if (state.shells.length > 0) {
        for (let i = 0; i < state.shells.length; i++) {
            // update the shell
            state.shells[i].update(delta);

            // see if the shell hit the other player
            // get the player that the shell was shot from
            const from = state.shells[i].fromPlayer;

            // get the other player to see if they were hit with the shell
            let playerToCheck;
            if(from === state.player1.playerId) {
                playerToCheck = state.player2;
            } else if(from === state.player2.playerId) {
                playerToCheck = state.player1;
            }

            // check if the playerToCheck was hit by the shell
            const dx = playerToCheck.position.x - state.shells[i].position.x;
            const dy = playerToCheck.position.y - state.shells[i].position.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < playerToCheck.size + state.shells[i].size) {
                // remove health from the player that was hit
                playerToCheck.health -= 25;
                console.log(`${playerToCheck.playerId} was hit with a shell`);

                console.log(`Player 1 health: ${state.player1.health}, Player 2 health: ${state.player2.health}`);

                // remove the shell from the state's shells list
                state.shells.splice(i, 1);

                // stop looking at the shells since there was a collision
                break;
            }

            // if the shell is off the screen to the left or right or is past the bottom of the screen, remove it from the shells array
            const shellSize = state.shells[i].size;
            if (state.shells[i].position.x - shellSize < 0 || state.shells[i].position.x + shellSize > state.worldSize.width || state.shells[i].position.y + shellSize > state.worldSize.height) {
                state.shells.splice(i, 1);
                i--;
            }

            // set the turn to the playerToCheck's player id
            state.turn = playerToCheck.playerId;
        }
    }

    // update the terrain
    state.terrain.update(state.shells);

    // update the players such that their body tilt matches the slope of the terrain they are on and their movements keeps their heights right on top of the terrain
    state.player1.update(state.terrain);
    state.player2.update(state.terrain);

    // handle win condition logic
    if (state.player1.health <= 0) {
        // player 2 won by defeating player 1
        return 2;
    } else if (state.player2.health <= 0) {
        // player 1 won by defeating player 2
        return 1;
    }
    // no player has won yet, keep playing
    return 0;
}

// make a new game with the world size, null players, a new terrain, and an empty list for the shells
function initGame() {
    return {
        worldSize: WORLD_SIZE,
        player1: null,
        player2: null, 
        terrain: new Terrain(NUM_TERRAIN_POINTS),
        shells: [], 
        turn: null
    };
}

module.exports = {
    updateGame,
    initGame
};