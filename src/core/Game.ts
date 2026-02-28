import * as PIXI from 'pixi.js';
import { Hero } from '../entities/Hero';
import { Animal } from '../entities/Animal';
import { Yard } from '../entities/Yard';
import { UIManager } from '../managers/UIManager';

export class Game {
    private app: PIXI.Application;
    private hero!: Hero;
    private yard!: Yard;
    private ui!: UIManager;
    private animals: Animal[] = [];
    private group: Animal[] = []; // Max number of animals in the group is 5 [cite: 12]

    constructor() {
        // In PixiJS v8, create the instance first, then call async init()
        this.app = new PIXI.Application();
        this.init();
    }

    private async init(): Promise<void> {
        // v8 initialization: configuration options are passed to init()
        await this.app.init({
            width: 800,
            height: 600,
            backgroundColor: 0x228B22, // Green area for the game field [cite: 6]
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        // AC 1: Add the canvas to the document [cite: 6]
        document.body.appendChild(this.app.canvas);

        // Enable PixiJS DevTools for debugging
        (globalThis as any).__PIXI_APP__ = this.app;

        // AC 3: Destination point (yard - yellow area) [cite: 8]
        this.yard = new Yard(700, 500);
        this.app.stage.addChild(this.yard.view);

        // AC 1: Main Hero (red circle) [cite: 6]
        this.hero = new Hero(400, 300);
        this.app.stage.addChild(this.hero.view);

        // AC 4: Score UI at the top [cite: 9]
        this.ui = new UIManager();
        this.app.stage.addChild(this.ui.view);

        // AC 5: Click on field to move Main Hero [cite: 10]
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = this.app.screen;
        this.app.stage.on('pointerdown', (e) => {
            this.hero.setTarget(e.global.x, e.global.y);
        });

        // AC 2: Spawn random number of animals at random positions [cite: 7]
        this.spawnAnimals(Math.floor(Math.random() * 5) + 5);

        // Start the central game loop
        this.app.ticker.add(() => this.update());
    }

    private spawnAnimals(count: number): void {
        for (let i = 0; i < count; i++) {
            const animal = new Animal(Math.random() * 700, Math.random() * 500);
            this.animals.push(animal);
            this.app.stage.addChild(animal.view);
        }
    }

    private update(): void {
        if (!this.hero) return;

        this.hero.update();

        this.animals.forEach(animal => {
            // Update each animal (checks following state)
            animal.update(this.hero.view.position);

            // AC 6: Collection logic - follow if close and group < 5 [cite: 11, 12]
            if (!animal.isFollowing && this.group.length < 5) {
                if (this.getDistance(this.hero.view, animal.view) < 50) {
                    animal.isFollowing = true;
                    this.group.push(animal);
                }
            }

            // AC 7: Scoring logic - reach yard while following [cite: 13]
            if (animal.isFollowing && this.getDistance(animal.view, this.yard.view) < 40) {
                this.collectAnimal(animal);
            }
        });
    }

    private getDistance(p1: PIXI.PointData, p2: PIXI.PointData): number {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    private collectAnimal(animal: Animal): void {
        this.group = this.group.filter(a => a !== animal);
        this.animals = this.animals.filter(a => a !== animal);
        this.app.stage.removeChild(animal.view);
        // AC 7: Increment score value [cite: 13]
        this.ui.updateScore(1); 
    }
}