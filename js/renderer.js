/**
 * مدير الرسم - يدير رسم جميع عناصر اللعبة على Canvas
 */
class GameRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.planeImage = this.loadPlaneImage();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    /**
     * تحميل صورة الطائرة من SVG
     */
    loadPlaneImage() {
        const img = new Image();
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e61c5d"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>';
        return img;
    }

    /**
     * تعديل حجم Canvas ليطابق حجم الحاوية
     */
    resizeCanvas() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    /**
     * حساب نقطة على المنحنى البياني
     */
    getCurvePoint(progress) {
        const x = Math.min(this.canvas.width * 0.85, progress * 15);
        const y = this.canvas.height - Math.min(this.canvas.height * 0.85, Math.pow(progress, 1.2) * 5);
        return { x, y };
    }

    /**
     * إضافة جزيئات جديدة في موضع معين
     */
    addParticles(x, y, count = 4) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, this.ctx));
        }
    }

    /**
     * تحديث جميع الجزيئات وإزالة الجزيئات المتلاشية
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (!this.particles[i].isAlive()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * رسم جميع الجزيئات
     */
    drawParticles() {
        for (let particle of this.particles) {
            particle.draw();
        }
    }

    /**
     * رسم المنحنى البياني الرئيسي
     */
    drawCurve(currentPos, crashed = false) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.quadraticCurveTo(currentPos.x / 2, this.canvas.height, currentPos.x, currentPos.y);
        this.ctx.strokeStyle = crashed ? '#ff3333' : '#e61c5d';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }

    /**
     * رسم صورة الطائرة
     */
    drawPlane(currentPos, prevPos) {
        const dx = currentPos.x - prevPos.x;
        const dy = currentPos.y - prevPos.y;
        const angle = Math.atan2(dy, dx);

        this.ctx.save();
        this.ctx.translate(currentPos.x, currentPos.y);
        this.ctx.rotate(angle + Math.PI / 2);

        const planeSize = 32;
        this.ctx.drawImage(this.planeImage, -planeSize / 2, -planeSize / 2, planeSize, planeSize);
        this.ctx.restore();
    }

    /**
     * رسم المشهد الكامل
     */
    drawScene(progress, isPlaying, crashed = false) {
        // مسح Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const currentPos = this.getCurvePoint(progress);

        // 1. تحديث ورسم الجزيئات
        if (!crashed && isPlaying) {
            this.addParticles(currentPos.x, currentPos.y);
        }
        this.updateParticles();
        this.drawParticles();

        // 2. رسم المنحنى
        this.drawCurve(currentPos, crashed);

        // 3. رسم الطائرة (إذا لم تنهار)
        if (!crashed) {
            const prevPos = this.getCurvePoint(Math.max(0, progress - 0.2));
            this.drawPlane(currentPos, prevPos);
        }
    }

    /**
     * مسح جميع الجزيئات
     */
    clearParticles() {
        this.particles = [];
    }
}