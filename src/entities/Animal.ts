import * as PIXI from 'pixi.js';

export class Animal {
    public view: PIXI.Graphics;
    public isFollowing: boolean = false;
    private patrolTarget: PIXI.Point;

    constructor(x: number, y: number) {
        this.view = new PIXI.Graphics();
        this.view.beginFill(0xFFFFFF); // White circle [cite: 7]
        this.view.drawCircle(0, 0, 10);
        this.view.endFill();
        this.view.position.set(x, y);
        this.patrolTarget = new PIXI.Point(x, y);
    }

    public update(heroPos: PIXI.PointData): void {
        if (this.isFollowing) {
            // Move towards hero with a slight offset/delay [cite: 11]
            this.moveTo(heroPos.x, heroPos.y, 3);
        } else {
            // Optional: Patrol behavior logic 
            this.patrol();
        }
    }

    private moveTo(tx: number, ty: number, speed: number) {
        const dx = tx - this.view.x;
        const dy = ty - this.view.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 40) { // Keep distance from hero
            this.view.x += (dx / dist) * speed;
            this.view.y += (dy / dist) * speed;
        }
    }

    private patrol() { /* Implementation for random movement */ }
}