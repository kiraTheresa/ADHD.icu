export class Animation {
    constructor(state) {
        this.state = state;
        this.activeAnimations = new Map();
        this.lowPerformance = false;
    }

    setLowPerformance(enabled) {
        this.lowPerformance = enabled;
    }

    applyAnimation(element, card) {
        if (this.lowPerformance) {
            this.applyStaticStyle(element, card);
            return;
        }

        const animationType = card.animationType;
        const speed = card.speed;

        const animationId = `anim-${card.id}`;
        
        if (this.activeAnimations.has(animationId)) {
            this.removeAnimation(animationId);
        }

        const animationData = {
            element,
            type: animationType,
            speed,
            startTime: performance.now(),
            shapes: []
        };

        const shapes = element.querySelectorAll('.card-shape');
        shapes.forEach((shape, index) => {
            const shapeData = card.shapes[index];
            animationData.shapes.push({
                element: shape,
                baseX: shapeData.x,
                baseY: shapeData.y,
                baseSize: shapeData.size,
                delay: shapeData.delay
            });
        });

        this.activeAnimations.set(animationId, animationData);
        this.runAnimation(animationId);
    }

    runAnimation(animationId) {
        const anim = this.activeAnimations.get(animationId);
        if (!anim) return;

        const animate = (currentTime) => {
            if (!this.activeAnimations.has(animationId)) return;

            const elapsed = (currentTime - anim.startTime) / 1000;
            const adjustedSpeed = anim.speed * (1 + this.state.stimulus);

            anim.shapes.forEach((shape, index) => {
                const time = elapsed + shape.delay;
                this.updateShape(shape, anim.type, time, adjustedSpeed);
            });

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    updateShape(shape, type, time, speed) {
        let transform = '';
        let opacity = 1;

        switch (type) {
            case 'float':
                const floatY = Math.sin(time * speed) * 10;
                const floatRotate = Math.sin(time * speed * 0.5) * 5;
                transform = `translateY(${floatY}px) rotate(${floatRotate}deg)`;
                break;

            case 'pulse':
                const scale = 1 + Math.sin(time * speed) * 0.1;
                opacity = 0.8 + Math.sin(time * speed) * 0.2;
                transform = `scale(${scale})`;
                break;

            case 'morph':
                const morphProgress = (Math.sin(time * speed) + 1) / 2;
                const borderRadius = this.interpolateBorderRadius(morphProgress);
                shape.element.style.borderRadius = borderRadius;
                break;

            case 'drift':
                const driftX = Math.sin(time * speed * 0.7) * 15;
                const driftY = Math.cos(time * speed * 0.5) * 15;
                transform = `translate(${driftX}px, ${driftY}px)`;
                break;
        }

        shape.element.style.transform = transform;
        shape.element.style.opacity = opacity;
    }

    interpolateBorderRadius(progress) {
        const radiuses = [
            { tl: 50, tr: 50, br: 50, bl: 50 },
            { tl: 30, tr: 70, br: 70, bl: 30 }
        ];
        
        const r1 = radiuses[0];
        const r2 = radiuses[1];
        
        const tl = r1.tl + (r2.tl - r1.tl) * progress;
        const tr = r1.tr + (r2.tr - r1.tr) * progress;
        const br = r1.br + (r2.br - r1.br) * progress;
        const bl = r1.bl + (r2.bl - r1.bl) * progress;
        
        return `${tl}% ${tr}% ${br}% ${bl}% / ${tl}% ${tr}% ${br}% ${bl}%`;
    }

    removeAnimation(animationId) {
        this.activeAnimations.delete(animationId);
    }

    applyStaticStyle(element, card) {
        const shapes = element.querySelectorAll('.card-shape');
        shapes.forEach((shape, index) => {
            const shapeData = card.shapes[index];
            shape.style.opacity = shapeData.opacity;
        });
    }

    updateAllAnimations() {
        this.activeAnimations.forEach((anim, id) => {
            anim.speed = anim.speed * (1 + this.state.stimulus * 0.5);
        });
    }

    pauseAll() {
        this.activeAnimations.forEach((anim, id) => {
            anim.paused = true;
        });
    }

    resumeAll() {
        this.activeAnimations.forEach((anim, id) => {
            anim.paused = false;
        });
    }

    clearAll() {
        this.activeAnimations.clear();
    }
}
