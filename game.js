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
    for (let i = 0; i < state.shells.length; i++) {
        // update the shell
        state.shells[i].update(delta);

        // if the shell is off the screen to the left or right or is past the bottom of the screen, remove it from the shells array
        const shellSize = state.shells[i].size;
        if (state.shells[i].position.x - shellSize < 0 || state.shells[i].position.x + shellSize > state.worldSize.width || state.shells[i].position.y + shellSize > state.worldSize.height) {
            state.shells.splice(i, 1);
            i--;
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