const { WORLD_SIZE, FRAME_RATE } = require("./constants.js");

function createGameState(p1, p2, terrain, shells) {
    return {
        worldSize: WORLD_SIZE,
        player1: p1,
        player2: p2, 
        terrain: terrain,
        shells: shells
    };
}

function updateGame(state, delta) {
    // if we are not given a state, do not loop
    if(!state) {
        return;
    }

    // handle the shells
    if (state.shells.length > 0){
        for (let i = 0; i < state.shells.length; i++) {
            // update the shell
            state.shells[i].update(delta);

            // see if the shell hit the other player
            // get the player that the shell was shot from
            const from  = state.shells[i].fromPlayer;

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
        }
    }

    // update the terrain
    state.terrain.update(state.shells);

    // update the players such that their body tilt matches the slope of the terrain they are on and their movements keeps their heights right on top of the terrain
    state.player1.update(state.terrain);
    state.player2.update(state.terrain);

    // handle win condition logic
    if (state.player1._life <= 0) {
        // player 2 won by defeating player 1
        return 2;
    } else if (state.player2._life <= 0) {
        // player 1 won by defeating player 2
        return 1;
    }
    // no player has won yet, keep playing
    return 0;
}

module.exports = {
    createGameState,
    updateGame,
};