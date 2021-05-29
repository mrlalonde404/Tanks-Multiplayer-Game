const { WORLD_SIZE } = require("./constants.js");
let Shell = require("./Shell.js");

class Tank {
    constructor(tx, ty, ba) {
        // the center of the position of the tank
        this._position = {
            x: tx,
            y: ty
        };

        // how much the player can move per unit of fuel
        this._moveSpeed = 3;

        // the angle the barrel is pointing towards, store this angle in degrees
        this._barrelAngle = ba;

        // how much the body of the tank is tilting
        this._tiltAngle = 0;

        // what the power is currently set to
        this._power = 75;

        // how much health the tank has
        this._health = 100;

        // how many pixels the tank can move per turn
        this._fuel = 500;

        // how big the tank is
        this._size = 20;
    }

    get position() {
        return this._position;
    }

    get moveSpeed() {
        return this._moveSpeed;
    }

    get barrelAngle() {
        return this._barrelAngle;
    }

    get tiltAngle() {
        return this._tiltAngle;
    }

    get power() {
        return this._power;
    }

    get health() {
        return this._health;
    }

    get fuel() {
        return this._fuel;
    }

    get size() {
        return this._size;
    }

    set position(pos) {
        this._position = pos;
    }

    set moveSpeed(ms) {
        this._moveSpeed = ms;
    }

    set barrelAngle(ba) {
        this._barrelAngle = ba;
    }

    set tiltAngle(ta) {
        this._tiltAngle = ta;
    }

    set power(p) {
        this._power = p;
    }

    set health(h) {
        this._health = h;
    }

    set fuel(f) {
        this._fuel = f;
    }

    set size(s) {
        this._size = s;
    }

    fireShell(mass, shellSize) {
        // convert the angle from degrees to radians for the math functions
        let angle = this.barrelAngle/180.0 * Math.PI;

        // adjust the shell to start at the tip of the tank barrel
        return new Shell(this.position.x + this.size * Math.cos(angle), this.position.y + 1.72 * this.size * Math.sin(angle), angle, this.power, mass, shellSize);
    }

    move(direction) {
        if (this.fuel > 0) {
            if (direction == "left") {
                if (this.position.x - this.size - this.moveSpeed > 0) {
                    this.position.x -= this.moveSpeed;
                }
            }
            else if (direction == "right") {
                if (this.position.x + this.size + this.moveSpeed < WORLD_SIZE.width) {
                    this.position.x += this.moveSpeed;
                }
            }
            this.fuel -= 1;
        }
    }

    update(terrain) {
        // points for the line segment that the tank is resting on
        let p1 = null;
        let p2 = null;

        // get the start and end points that the 
        for (let i = 0; i < terrain.terrainPoints.length; i++) {
            // if the tank is looking at the last terrain point, it is in between the second to last and last terrain points 
            if (i === terrain.terrainPoints.length - 1) {
                p1 = terrain.terrainPoints[i-1];
                p2 = terrain.terrainPoints[i];
                break;
            }
            // if the p1 point hasn't been found yet and the tank is in between the current point and the next point, set the terrain points
            if (p1 === null && terrain.terrainPoints[i].x < this.position.x && this.position .x <= terrain.terrainPoints[i+1].x) {
                p1 = terrain.terrainPoints[i];
                p2 = terrain.terrainPoints[i+1];
                break;
            }
        }

        // get the difference in between the x's and y's for the segment between between p1 and p2
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const slope = dy/dx;

        // get the height of the tank using slopt intercept
        this.position.y = (slope * (this.position.x - p1.x)) + p1.y;
        this.position.y -= this.size/2;

        // change the tilt of the tank according to the slope of the segment it is resting on
        this.tiltAngle = Math.atan2(dy, dx);
    }
}

module.exports = Tank;