/**
 * فئة الجزيئات - تمثل جزيئات النار والدخان
 */
class Particle {
    constructor(x, y, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.size = Math.random() * 6 + 3;
        this.vx = (Math.random() - 0.5) * 1.5 - 1; // حركة خفيفة للخلف
        this.vy = (Math.random() - 0.5) * 1.5 + 1; // حركة خفيفة للأسفل
        this.alpha = 1;
        
        // تدرج ألوان النار والدخان
        const colors = ['#ffcc00', '#ff6600', '#ff3300', '#888888'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * تحديث موضع وحالة الجزيء
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.04; // معدل تلاشي الجزيء
        if (this.size > 0.3) this.size -= 0.1;
    }

    /**
     * رسم الجزيء على Canvas
     */
    draw() {
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, this.alpha);
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    /**
     * التحقق مما إذا كان الجزيء لا يزال مرئياً
     */
    isAlive() {
        return this.alpha > 0;
    }
}