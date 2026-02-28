import * as PIXI from 'pixi.js';

export class Animal {
    public view: PIXI.Container;
    public isFollowing: boolean = false;
    
    private walkSprite!: PIXI.AnimatedSprite;
    private idleSprite!: PIXI.AnimatedSprite;
    private currentSprite?: PIXI.AnimatedSprite;
    
    private patrolTarget: PIXI.Point;
    private moveSpeed: number = 2;
    private patrolIntervalId?: number;

    constructor(x: number, y: number) {
        this.view = new PIXI.Container();
        this.view.position.set(x, y);
        this.patrolTarget = new PIXI.Point(x, y);
        
        this.initAnimations();
        this.startPatrolLoop(); // Start the infinite loop
    }

    private startPatrolLoop(): void {
        // Pick a new target every 4-6 seconds infinitely
        this.patrolIntervalId = window.setInterval(() => {
            if (!this.isFollowing) {
                this.pickNewTarget();
            }
        }, 4000 + Math.random() * 2000);
    }

    private pickNewTarget(): void {
        this.patrolTarget.set(
            50 + Math.random() * 700,
            50 + Math.random() * 500
        );
    }

    private async initAnimations(): Promise<void> {
        const walkFrames = [
            '/assets/sheep/sheep_walk/sheep_walk_left_0001.png',
            '/assets/sheep/sheep_walk/sheep_walk_left_0002.png',
            '/assets/sheep/sheep_walk/sheep_walk_left_0003.png',
            '/assets/sheep/sheep_walk/sheep_walk_left_0004.png',
            '/assets/sheep/sheep_walk/sheep_walk_left_0005.png',
            '/assets/sheep/sheep_walk/sheep_walk_left_0006.png'
        ];

        const idleFrames = [
            '/assets/sheep/sheep_idle/sheep_Idle_0001.png',
            '/assets/sheep/sheep_idle/sheep_Idle_0002.png',
            '/assets/sheep/sheep_idle/sheep_Idle_0003.png',
            '/assets/sheep/sheep_idle/sheep_Idle_0004.png'
        ];

        try {
            const walkTextures = await Promise.all(walkFrames.map(f => PIXI.Assets.load(f)));
            const idleTextures = await Promise.all(idleFrames.map(f => PIXI.Assets.load(f)));

            this.walkSprite = new PIXI.AnimatedSprite(walkTextures);
            this.idleSprite = new PIXI.AnimatedSprite(idleTextures);

            [this.walkSprite, this.idleSprite].forEach(sprite => {
                sprite.anchor.set(0.5);
                sprite.animationSpeed = 0.15;
                sprite.visible = false;
                this.view.addChild(sprite);
            });

            this.switchAnimation('idle');
        } catch (error) {
            console.error("Failed to decode sheep textures:", error);
        }
    }

    private switchAnimation(type: 'walk' | 'idle'): void {
        const target = type === 'walk' ? this.walkSprite : this.idleSprite;
        if (!target || this.currentSprite === target) return;

        if (this.currentSprite) {
            this.currentSprite.visible = false;
            this.currentSprite.stop();
        }

        this.currentSprite = target;
        this.currentSprite.visible = true;
        this.currentSprite.play();
    }

    public update(heroPos: PIXI.PointData): void {
        const prevX = this.view.x;
        const prevY = this.view.y;

        if (this.isFollowing) {
            // Follow the hero with a 40px buffer
            this.moveToward(heroPos.x, heroPos.y, this.moveSpeed + 1, 40);
        } else {
            // Move toward the target chosen by the setInterval
            this.moveToward(this.patrolTarget.x, this.patrolTarget.y, this.moveSpeed, 2);
        }

        // Animation triggers automatically if position changed
        const isMoving = Math.abs(this.view.x - prevX) > 0.1 || Math.abs(this.view.y - prevY) > 0.1;
        this.switchAnimation(isMoving ? 'walk' : 'idle');
    }

    private moveToward(tx: number, ty: number, speed: number, buffer: number): void {
        const dx = tx - this.view.x;
        const dy = ty - this.view.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > buffer) {
            this.view.x += (dx / dist) * speed;
            this.view.y += (dy / dist) * speed;

            if (this.currentSprite) {
                this.currentSprite.scale.x = dx > 0 ? -1 : 1;
            }
        }
    }

    // Clean up memory if the animal is removed
    public destroy(): void {
        if (this.patrolIntervalId) clearInterval(this.patrolIntervalId);
        this.view.destroy({ children: true });
    }
}