
import Shell from "./Shell.js";
export default class Tank {
    constructor(tx, ty, ba) {
        // the center of the position of the tank
        this._position = {
            x: tx,
            y: ty
        };

        // the angle the barrel is pointing towards, store this angle in degrees
        this._barrelAngle = ba;

        // what the power is currently set to
        this._power = 75;

        // how much health the tank has
        this._health = 100;

        // how many pixels the tank can move per turn
        this._fuel = 100;

        // how big the tank is
        this._size = 20;
    }

    get position() {
        return this._position;
    }

    get barrelAngle() {
        return this._barrelAngle;
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

    set barrelAngle(ba) {
        this._barrelAngle = ba;
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
        let angle = this.barrelAngle/180.0 * Math.PI;
        // adjust the shell to start at the tip of the tank barrel
        return new Shell(this.position.x + this.size * Math.cos(angle), this.position.y + 1.72 * this.size * Math.sin(angle), angle, this.power, mass, shellSize);
    }

    move(direction) {
        if (this.fuel > 0) {
            if (direction == "left") {
                this.position.x -= 1;
            }
            else if (direction == "right") {
                this.position.x += 1;
            }
            this.fuel -= 1;
        }
    }

    draw(ctx) {
        // draw the barrel for the tank that tilts according to the barrelAngle
        ctx.save();
        ctx.beginPath()
        ctx.fillStyle = "blue";
        ctx.translate(this.position.x, this.position.y - this.size/2);
        ctx.rotate(this.barrelAngle/180 * Math.PI);
        ctx.fillRect(-this.size/4, -this.size/4, 2 * this.size, this.size/2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        // draw the rectangles for the tanks such that the center is in the middle
        ctx.beginPath()
        ctx.fillStyle = "red";
        ctx.fillRect(this.position.x - this.size, this.position.y - this.size/2, 2*this.size, this.size);
        ctx.fill();
        ctx.closePath();

        // draw the center point of the tank
        ctx.beginPath()
        ctx.fillStyle = "black";
        ctx.arc(this.position.x, this.position.y, 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}