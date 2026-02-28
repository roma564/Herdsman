import * as PIXI from 'pixi.js';

export class Hero {
    public view: PIXI.Container;
    private walkSprite!: PIXI.AnimatedSprite;
    private idleSprite!: PIXI.AnimatedSprite;
    private currentSprite?: PIXI.AnimatedSprite;
    
    private target: PIXI.Point;
    private speed: number = 4;

    private readonly idleFrames = [
        '/assets/herdsman/herdsman_idle/herdsman_idle_0001.png',
        '/assets/herdsman/herdsman_idle/herdsman_idle_0002.png',
        '/assets/herdsman/herdsman_idle/herdsman_idle_0003.png',
        '/assets/herdsman/herdsman_idle/herdsman_idle_0004.png',
        '/assets/herdsman/herdsman_idle/herdsman_idle_0005.png',
        '/assets/herdsman/herdsman_idle/herdsman_idle_0006.png',
        '/assets/herdsman/herdsman_idle/herdsman_idle_0008.png',
        '/assets/herdsman/herdsman_idle/herdsman_idle_0009.png',
        '/assets/herdsman/herdsman_idle/herdsman_idle_0010.png'
    ];

    private readonly walkFrames = [
        '/assets/herdsman/herdsman_walk/herdsman_walk_0001.png',
        '/assets/herdsman/herdsman_walk/herdsman_walk_0002.png',
        '/assets/herdsman/herdsman_walk/herdsman_walk_0003.png',
        '/assets/herdsman/herdsman_walk/herdsman_walk_0004.png',
        '/assets/herdsman/herdsman_walk/herdsman_walk_0005.png',
        '/assets/herdsman/herdsman_walk/herdsman_walk_0006.png'
    ];

    constructor(x: number, y: number) {
        this.view = new PIXI.Container();
        this.view.position.set(x, y);
        this.target = new PIXI.Point(x, y);
        
        this.initAnimations();
    }

    private async initAnimations(): Promise<void> {
        const allPaths = [...this.idleFrames, ...this.walkFrames];
        await PIXI.Assets.load(allPaths);

        const idleTextures = this.idleFrames.map(path => PIXI.Texture.from(path));
        const walkTextures = this.walkFrames.map(path => PIXI.Texture.from(path));

        this.idleSprite = new PIXI.AnimatedSprite(idleTextures);
        this.walkSprite = new PIXI.AnimatedSprite(walkTextures);

        [this.idleSprite, this.walkSprite].forEach(sprite => {
            sprite.anchor.set(0.5);
            sprite.animationSpeed = 0.15;
            sprite.visible = false;
            this.view.addChild(sprite);
        });

        this.switchAnimation('idle');
    }

    private switchAnimation(type: 'walk' | 'idle'): void {
        const target = type === 'walk' ? this.walkSprite : this.idleSprite;
        
        if (!target || this.currentSprite === target) return;

        // Save the current scale so the new animation faces the same way
        const currentScaleX = this.currentSprite ? this.currentSprite.scale.x : 1;

        if (this.currentSprite) {
            this.currentSprite.visible = false;
            this.currentSprite.stop();
        }

        this.currentSprite = target;
        this.currentSprite.scale.x = currentScaleX; // Apply scale to new sprite
        this.currentSprite.visible = true;
        this.currentSprite.play();
    }

    public setTarget(x: number, y: number): void {
        this.target.set(x, y);
    }

    public update(): void {
        if (!this.currentSprite) return;

        const dx = this.target.x - this.view.x;
        const dy = this.target.y - this.view.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const stopThreshold = this.speed; 

        let isMoving = false;

        if (distance > stopThreshold) {
            // 2. Normal Movement
            const vx = (dx / distance) * this.speed;
            const vy = (dy / distance) * this.speed;
            
            this.view.x += vx;
            this.view.y += vy;
            isMoving = true;

            // 3. Flip Scale based on movement direction
            if (Math.abs(dx) > 0.1) {
                this.currentSprite.scale.x = dx > 0 ? -1 : 1;
            }
        } else {
            // 4. Force Stop: Snap to exact target to kill the jitter
            this.view.x = this.target.x;
            this.view.y = this.target.y;
            isMoving = false;
        }

        // 5. Explicitly switch to idle when not moving
        this.switchAnimation(isMoving ? 'walk' : 'idle');
    }
}