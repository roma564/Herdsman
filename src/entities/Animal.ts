import * as PIXI from 'pixi.js';

export class Animal {
    public view: PIXI.Container;
    public isFollowing: boolean = false;
    
    private walkSprite?: PIXI.AnimatedSprite;
    private idleSprite?: PIXI.AnimatedSprite;
    private currentSprite?: PIXI.AnimatedSprite;
    
    private patrolTarget: PIXI.Point;
    private moveSpeed: number = 2;

    private patrolWaitTimer: number = 0;
    private isWaiting: boolean = false;

    constructor(x: number, y: number) {
        this.view = new PIXI.Container();
        this.view.position.set(x, y);
        this.patrolTarget = new PIXI.Point(x, y);
        
        this.initAnimations();
    }

    private async initAnimations(): Promise<void> {
        // Animal frames from assets
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
            // Load textures from cache (pre-loaded in Game.ts)
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
            // Follow the Main Hero
            this.moveTo(heroPos.x, heroPos.y, this.moveSpeed + 1);
        } else {
            // Additional AC: Patrol logic
            this.patrol();
        }

        // Determine if walking or idle based on movement
        const isMoving = Math.abs(this.view.x - prevX) > 0.1 || Math.abs(this.view.y - prevY) > 0.1;
        this.switchAnimation(isMoving ? 'walk' : 'idle');
    }

    private moveTo(tx: number, ty: number, speed: number): void {
        const dx = tx - this.view.x;
        const dy = ty - this.view.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Keep a distance buffer from the target
        if (dist > 40) {
            this.view.x += (dx / dist) * speed;
            this.view.y += (dy / dist) * speed;

            // Flip sprite for right-left view
            if (this.currentSprite) {
                this.currentSprite.scale.x = dx > 0 ? -1 : 1;
            }
        }
    }

   private patrol(): void {
    const dist = Math.sqrt(
        Math.pow(this.patrolTarget.x - this.view.x, 2) + 
        Math.pow(this.patrolTarget.y - this.view.y, 2)
    );

    // 1. Check if we reached the current destination
    if (dist < 5) {
        if (!this.isWaiting) {
            // Start waiting: Set a random interval between 1 and 4 seconds
            // (Assuming 60 FPS, so 60 to 240 frames)
            this.isWaiting = true;
            this.patrolWaitTimer = Math.floor(Math.random() * 180) + 60; 
        }

        // 2. Countdown the wait timer
        if (this.patrolWaitTimer > 0) {
            this.patrolWaitTimer--;
        } else {
            // 3. Timer finished! Pick a new random target and stop waiting
            this.isWaiting = false;
            this.patrolTarget.set(
                Math.max(50, Math.min(750, Math.random() * 800)),
                Math.max(50, Math.min(550, Math.random() * 600))
            );
        }
    } else {
        // 4. Move toward the target if we aren't there yet
        this.moveTo(this.patrolTarget.x, this.patrolTarget.y, this.moveSpeed);
    }
}
}