export default class Shell {
    constructor(sx, sy, angle, power, mass, size) {
        // position of the shell in the air
        this._position = {
            x: sx,
            y: sy
        };

        // the angle of the shell as it is flying
        this._angle = angle;

        // how fast the shell is moving
        this._velocity = {
            x: Math.cos(this._angle) * 5 * power,
            y: Math.sin(this._angle) * 5 * power
        };

        // the mass of the shell
        this._mass = mass;

        // size of the shell
        this._size = size;
    }

    get position() {
        return this._position;
    }

    get angle() {
        return this._angle;
    }

    get velocity() {
        return this._velocity;
    }

    get mass() {
        return this._mass;
    }

    get size() {
        return this._size;
    }

    set position(pos) {
        this._position = pos;
    }

    set angle(a) {
        this._angle = a;
    }

    set velocity(vel) {
        this._velocity = vel;
    }

    set mass(m) {
        this._mass = m;
    }

    set size(s) {
        this._size = s;
    }

    update(delta) {
        // if the first frame, skip since delta would cause a divide by zero
        if(!delta) return;

        // apply gravity to the y velocity of the shell
        let gravity = this.mass * (-9.8 / delta);
        this.velocity.y -= gravity;
        
        // update the position by the velocity times the delta
        this.position.x += this.velocity.x / delta;
        this.position.y += this.velocity.y / delta;

        // update the angle that the shell is flying in
        this.angle = Math.atan2(this.velocity.y, this.velocity.x);
    }

    draw(ctx) {
        // save the state before the translate and rotate so that the context can be restored to this point
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "black";

        // translate to the center of the shell and then rotate it by the shell's angle
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);

        // draw the back rectangle end of the shell
        ctx.fillRect(-this.size*2, -this.size, this.size*2, this.size*2);

        // draw the front of the shell that will rotate according to the angle of the shell
        ctx.arc(0, 0, this.size, -Math.PI/2, Math.PI/2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}