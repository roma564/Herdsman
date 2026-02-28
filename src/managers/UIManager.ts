import * as PIXI from 'pixi.js';

export class UIManager {
    public view: PIXI.Text;
    private score: number = 0;

    constructor() {
        // Player can see the score value at the Top UI
        this.view = new PIXI.Text({
            text: 'Score: 0',
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xffffff,
                align: 'left',
            }
        });

        this.view.position.set(10, 10);
    }

    /**
     * Increases the score and updates the visual display.
     * @param points - The number of points to add (default is 1)
     */
    public updateScore(points: number = 1): void {
        this.score += points;
        // Update text when an animal reaches the yard
        this.view.text = `Score: ${this.score}`;
    }

    public getScore(): number {
        return this.score;
    }
}