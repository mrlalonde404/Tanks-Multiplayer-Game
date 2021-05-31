// for now, only clicking on the screen will update the players barrel
function handleClick(player, mx, my) {
    updatePlayerBarrel(player, mx, my);
}

// clicking on the screen will change the angle of the barrel to face where the click was
function updatePlayerBarrel(player, mx, my) {
    // get the previous barrelAngle
    const barrelAngle = player._barrelAngle/180.0 * Math.PI;

    // get the difference in y and x for the mouse and player positions
    const dy = (my - (player._position.y - 2*player._size + player._size * Math.sin(barrelAngle)));
    const dx = (mx - (player._position.x + player._size * Math.cos(barrelAngle)));
    
    // take the atan2 of the dy and dx, then convert to degrees and floor to get a integer degree value
    player._barrelAngle = Math.floor(180 * Math.atan2(dy, dx) / Math.PI);
}

function handleKeyInput(player, key, shells) {
    if (key == "a") { // press the a key to make the tank move to the left and use fuel
        player.move("left");
    }
    if (key == "d") { // press the d key to make the tank move to the right and use fuel
        player.move("right");
    }
    if (key == "ArrowLeft") { // press left arrow to make tank barrel face left
        if (player._barrelAngle > -180) {
            player._barrelAngle -= 1;
        }
    }
    if (key == "ArrowRight") { // press right arrow to make tank barrel face right
        if (player._barrelAngle < 0) {
            player._barrelAngle += 1;
        }
    }
    if (key == "ArrowUp") { // press arrow up to make the power increase
        if (player._power < 100) {
            player._power += 1;
        }
    }
    if (key == "ArrowDown") { // press arrow down to make the power decrease
        if (player._power > 0) {
            player._power -= 1;
        }
    }
    if (key == "Enter" || key == " ") { // press enter or space bar to shoot
        // attributes for the shell that the tank will fire
        let mass = 10;
        let shellSize = 4;
    
        // make the player's tank fire a shell and put it into the array of shells
        shells.push(player.fireShell(mass, shellSize));
    }
    console.log(`Tank angle: ${player._barrelAngle + 90}, Tank power: ${player._power}, Tank fuel: ${player._fuel}`);
}

module.exports = {
    handleClick,
    handleKeyInput,
}