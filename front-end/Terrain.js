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

    makeTerrainPoints(sy, ey, numTerrainPoints) {
        // the terrain points to be returned
        let tp = [];

        // minimum of at least 5 terrain points
        if (numTerrainPoints < 5) {
            numTerrainPoints = 5;
        }

        // how far each starting point should be spaced apart, the whole window width divided by the number of terrain points requested
        const xSpacing = Math.floor(window.innerWidth / numTerrainPoints);

        // the min and max values for the y, smallest is 100, max is the 3/5 the height of the screen
        const yMin = 0;
        const yMax = Math.floor(3 * window.innerHeight / 5);

        // make the first point with the left border of the window and the start y
        tp.push({x: 0, y: sy});

        for (let i = 1; i < numTerrainPoints; i++) {
            // if the last element, break
            if (i === numTerrainPoints - 1) {
                break;
            }

            // add the point to the end of the points list
            tp.push({x: i*xSpacing, y: window.innerHeight - ((Math.random() * (yMax - yMin)) + yMin)});
        }

        // make the last point with the width of the window and the end y
        tp.push({x: window.innerWidth, y: ey});
        
        // return the new list of terrain points
        return tp;
    }

    update(shells) {

        // loop through the shells and see if there is a collision
        for (let j = 0; j < shells.length; j++) {
            let s = shells[j];

            // only loop from first to second to last, at the last point you cant check for the one past it, so stop
            for (let i = 0; i < this.terrainPoints.length - 1; i++) {
                // get the current and next point to check if the shell is under the line made between them
                let p1 = this.terrainPoints[i];
                let p2 = this.terrainPoints[i+1];
                
                // get the difference in between the x's and y's for the segment between p1 and p2
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const slope = dy/dx;

                if (s.position.y - ((slope * s.position.x) + p1.y) > 0 && (s.position.x >= p1.x && s.position.x <= p2.x)) {
                    // make the crater at the point where the collision happened by adding more terrain points 
                    console.log("----------------------------------------------------------")
                    console.log("crater");
                    console.log(s.position);
                    console.log(p1, p2);
                    console.log(dx, dy, slope);
                    console.log(s.position.y - ((slope * s.position.x) + p1.y));

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