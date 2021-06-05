// the desired FPS that we want in the game
const FRAME_RATE = 30;

// if showing 2 clients on the same screen
const splitScreen = false;

let screenWidth = 1920;
if (splitScreen) {
    screenWidth = Math.floor(screenWidth/2);
}

// how big the world should be so that browser size doesn't determine how big everything is drawn
const WORLD_SIZE = {
    width: screenWidth,
    height: 1080
};

const NUM_TERRAIN_POINTS = 10;

// export the constants so that they can be used in the world
module.exports = {
    FRAME_RATE, 
    WORLD_SIZE,
    NUM_TERRAIN_POINTS
};