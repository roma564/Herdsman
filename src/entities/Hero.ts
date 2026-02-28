import * as PIXI from 'pixi.js';

export class Hero {
    public view: PIXI.Graphics;
    private target: PIXI.Point;
    private speed: number = 4;

    constructor(x: number, y: number) {
        this.view = new PIXI.Graphics()
            .circle(0, 0, 15)
            .fill(0xFF0000); // Red circle
        
        this.view.position.set(x, y);
        this.target = new PIXI.Point(x, y);
    }

    public setTarget(x: number, y: number): void {
        this.target.set(x, y);
    }

    public update(): void {
        const dx = this.target.x - this.view.x;
        const dy = this.target.y - this.view.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
            this.view.x += (dx / distance) * this.speed;
            this.view.y += (dy / distance) * this.speed;
        }
    }
}