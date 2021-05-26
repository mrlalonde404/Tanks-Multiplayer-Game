export default class Terrain {
    // need a start y and an end y for both sides of the screen to make terrain for
    constructor(sy, ey, numTerrainPoints) {
        // list of all the points that make up the terrain
        this._terrainPoints = this.makeTerrainPoints(sy, ey, numTerrainPoints);
    }

    get terrainPoints() {
        return this._terrainPoints;
    }

    set terrainPoints(tp) {
        this._terrainPoints = tp;
    }

    makeTerrainPoints(numTerrainPoints) {
        // the terrain points to be returned
        let tp = [];

        // minimum of at least 5 terrain points
        if (numTerrainPoints < 5) {
            numTerrainPoints = 5;
        }

        // how far each starting point should be spaced apart, the whole window width divided by the number of terrain points requested
        const xSpacing = Math.floor(window.innerWidth / numTerrainPoints);

        // the min and max values for the y, smallest is 100, max is the 3/5 the height of the screen
        const yMin = 200;
        const yMax = Math.floor(3 * window.innerHeight / 5);

        for (let i = 0; i < numTerrainPoints; i++) {
            // add the point to the end of the points list
            tp.push({x: i*xSpacing, y: window.innerHeight - ((Math.random() * (yMax - yMin)) + yMin)});
        }

        // make the last point with the width of the window
        tp[tp.length-1].x = window.innerWidth
        
        // return the new list of terrain points
        return tp;
    }

    shellPointCollision(shell, point) {
        // check if the distance between the point and the shell is less than the length of the radius of the shell, this meaning that the line end point is in the shell
        if (Math.sqrt(Math.pow(point.x - shell.position.x, 2) + Math.pow(point.y - shell.position.y, 2)) < shell.size) {
            return true;
        }
        return false;
    }

    shellLineCollision(shell, p1, p2) {
        // see if either of the end points are in the shell
        if (this.shellPointCollision(shell, p1) || this.shellPointCollision(shell, p2)) {
            return 2;
        }

        // see if the shell is in the line segment
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const segLen = Math.sqrt(dx*dx + dy*dy);

        // get the dot product for the line segment and the shell
        let dot = ((shell.position.x - p1.x)*dx + (shell.position.y - p1.y)*dy) / Math.pow(segLen, 2);

        // get the closest point by using the dot product
        const closestX = p1.x + (dot * dx);
        const closestY = p1.y + (dot * dy);

        // check if th closest point is on the line segment, if not, no collision; buffer is needed because of float comparison
        const buffer = 0.1;
        const d1 = Math.sqrt(Math.pow(closestX - p1.x, 2) + Math.pow(closestY - p1.y, 2));
        const d2 = Math.sqrt(Math.pow(closestX - p2.x, 2) + Math.pow(closestY - p2.y, 2));

        // see if the closest point is on the line segment
        if (d1+d2 >= segLen-buffer && d1+d2 <= segLen+buffer) {
            // if it is here, then it isn't an end point and is on the line segment
            const distX = closestX - shell.position.x;
            const distY = closestY - shell.position.y;
            const distance = Math.sqrt(distX*distX + distY*distY);

            // if the distance between the center of the shell and the line segment is less than the size of the shell, there was a collision
            if (distance <= shell.size) {
                return 1;
            }
        }

        // there was no collision
        return 0;
    }


    update(shells, ctx) {
        // loop through the shells and see if there is a collision
        for (let j = 0; j < shells.length; j++) {
            // only loop from first to second to last, at the last point you cant check for the one past it, so stop
            for (let i = 0; i < this.terrainPoints.length; i++) {
                if (i === this.terrainPoints.length-1) {
                    break;
                }
                // get the current and next point to check if the shell is under the line made between them
                let p1 = this.terrainPoints[i];
                let p2 = this.terrainPoints[i+1];

                // if there is a collision between the shell in between the 2 lines, remove the shell and make the crater
                const collide = this.shellLineCollision(shells[j], p1, p2);
                if (collide === 1 || collide === 2) {
                    const shellX = Math.floor(shells[j].position.x + shells[j].size * Math.cos(shells[j].angle));
                    const shellY = Math.floor(shells[j].position.y + shells[j].size * Math.sin(shells[j].angle));

                    // get the slope in between the 2 points for making the crater
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    const slope = dy/dx;

                    // make the 2 outside crater points
                    const crater1Y = (slope * (shellX - p1.x - 10)) + p1.y;
                    const crater2Y = (slope * (shellX - p1.x + 10)) + p1.y
                    // make the crater at the point where the collision happened by adding more terrain points 
                    this.terrainPoints.splice(i+1, 0, {x: shellX - 10, y: crater1Y});
                    this.terrainPoints.splice(i+2, 0, {x: shellX, y: shellY + (Math.random() * shells[j].mass/2) + shells[j].mass/2});
                    this.terrainPoints.splice(i+3, 0, {x: shellX + 10, y: crater2Y});

                    // make an explosion at the tip of the shell location
                    ctx.fillStyle = "red";
                    ctx.arc(shellX, shellY, shells[j].size*1.5, 0, 2*Math.PI);
                    ctx.fill();

                    // get rid of the shell
                    shells.splice(j, 1);
                    break;
                }
            }
        }
    }

    draw(ctx) {
        ctx.beginPath()
        ctx.fillStyle = "green";

        // for all the terrain points starting from the second, move the canvas pen to the previous point location and draw to the current point location
        ctx.moveTo(this.terrainPoints[0].x, this.terrainPoints[0].y); 
        for (let i = 1; i < this.terrainPoints.length; i++) {
            ctx.lineTo(this.terrainPoints[i].x, this.terrainPoints[i].y);
        }
        // draw to the bottom right corner
        ctx.lineTo(window.innerWidth, window.innerHeight);

        // draw to the bottom left corner
        ctx.lineTo(0, window.innerHeight);

        // draw back to the first point
        ctx.lineTo(this.terrainPoints[0].x, this.terrainPoints[0].y);

        // close the path and fill in the terrain
        ctx.closePath();
        ctx.fill();
    }
}