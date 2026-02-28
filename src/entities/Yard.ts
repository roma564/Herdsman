// src/entities/Yard.ts
import * as PIXI from 'pixi.js';

export class Yard {
    public view: PIXI.Graphics;

    constructor(x: number, y: number) {
        this.view = new PIXI.Graphics();
        this.view.beginFill(0xFFFF00); // Yellow area 
        this.view.drawRect(0, 0, 100, 100);
        this.view.endFill();
        this.view.position.set(x, y);
    }
}