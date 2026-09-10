/**
 * فئة اللعبة الرئيسية
 */
class AviatorGame {
    constructor() {
        // عناصر DOM
        this.elements = {
            canvas: document.getElementById('gameCanvas'),
            multiplierEl: document.getElementById('multiplier'),
            balanceEl: document.getElementById('balance'),
            profitEl: document.getElementById('profit'),
            actionBtn: document.getElementById('actionBtn'),
            betInput: document.getElementById('betAmount'),
            autoCashoutInput: document.getElementById('autoCashout'),
            logEl: document.getElementById('log'),
            historyEl: document.getElementById('history')
        };

        // تهيئة الحالة والمدير
        this.state = new GameState();
        this.renderer = new GameRenderer(this.elements.canvas);
    }

    /**
     * تعديل الرسالة في السجل
     */
    updateLog(message, type = 'normal') {
        this.elements.logEl.innerText = message;
        this.elements.logEl.className = `log ${type}`;
    }

    /**
     * تحديث عرض الرصيد
     */
    updateBalance() {
        this.elements.balanceEl.innerText = this.state.balance.toFixed(2);
    }

    /**
     * تحديث عرض الأرباح
     */
    updateProfit(profit) {
        this.elements.profitEl.innerText = profit.toFixed(2);
    }

    /**
     * تحديث عرض المضاعف
     */
    updateMultiplier(value) {
        this.state.currentMultiplier = value;
        this.elements.multiplierEl.innerText = value.toFixed(2) + 'x';
    }

    /**
     * إضافة عنصر إلى السجل التاريخي
     */
    addHistory(value, isWin) {
        const item = document.createElement('div');
        item.className = `history-item ${isWin ? 'win' : 'loss'}`;
        item.innerText = value + 'x';
        this.elements.historyEl.prepend(item);
        
        // الاحتفاظ فقط بآخر 7 عناصر
        if (this.elements.historyEl.children.length > 7) {
            this.elements.historyEl.removeChild(this.elements.historyEl.lastChild);
        }
    }

    /**
     * التحقق من صحة الرهان
     */
    validateBet() {
        const betAmount = parseFloat(this.elements.betInput.value);
        
        if (isNaN(betAmount) || betAmount <= 0) {
            this.updateLog('مبلغ الرهان يجب أن يكون أكبر من الصفر!', 'error');
            return null;
        }
        
        if (!this.state.hasEnoughBalance(betAmount)) {
            this.updateLog('الرصيد غير كافٍ للرهان!', 'error');
            return null;
        }
        
        return betAmount;
    }

    /**
     * الحصول على قيمة السحب الآلي
     */
    getAutoCashoutValue() {
        const value = parseFloat(this.elements.autoCashoutInput.value);
        return (isNaN(value) || value <= 1.00) ? 0 : value;
    }

    /**
     * بدء جولة جديدة
     */
    startRound() {
        // التحقق من صحة الرهان
        const betAmount = this.validateBet();
        if (betAmount === null) return;

        // إعداد الحالة
        this.state.deductBet(betAmount);
        this.state.autoCashoutValue = this.getAutoCashoutValue();
        this.state.resetForNewRound();
        this.state.isPlaying = true;

        // تحديث الواجهة
        this.updateBalance();
        this.elements.multiplierEl.classList.remove('crashed');
        this.elements.actionBtn.innerText = 'سحب الأرباح';
        this.elements.actionBtn.className = 'btn-cashout';
        
        const autoCashoutText = this.state.autoCashoutValue > 0 
            ? `(مفعل السحب الآلي عند ${this.state.autoCashoutValue.toFixed(2)}x)`
            : '';
        this.updateLog(`الطائرة تطير الآن... ${autoCashoutText}`);

        // مسح الجزيئات القديمة
        this.renderer.clearParticles();

        // بدء حلقة اللعبة
        this.state.gameInterval = setInterval(() => this.gameLoop(), 100);
    }

    /**
     * حلقة اللعبة الرئيسية
     */
    gameLoop() {
        this.state.flightProgress += 0.5;
        this.state.currentMultiplier += 0.03 + (this.state.currentMultiplier * 0.01);
        
        this.updateMultiplier(this.state.currentMultiplier);
        this.renderer.drawScene(this.state.flightProgress, this.state.isPlaying);

        // التحقق من السحب الآلي
        if (this.state.autoCashoutValue > 0 && 
            this.state.currentMultiplier >= this.state.autoCashoutValue && 
            this.state.currentMultiplier < this.state.crashPoint) {
            this.cashOut(true);
            return;
        }

        // التحقق من الانفجار
        if (this.state.currentMultiplier >= this.state.crashPoint) {
            this.gameOver();
        }
    }

    /**
     * سحب الأرباح
     */
    cashOut(isAuto = false) {
        this.state.stopGameInterval();
        this.state.isPlaying = false;
        
        audioManager.playWinSound();
        
        const winAmount = this.state.calculateWinAmount();
        this.state.addWinnings(winAmount);
        
        this.updateBalance();
        this.updateProfit(winAmount - this.state.currentBet);
        
        const autoText = isAuto ? 'آلياً ' : '';
        const message = `🎉 تم السحب ${autoText}بنجاح عند ${this.state.currentMultiplier.toFixed(2)}x وربحت $${winAmount.toFixed(2)}`;
        this.updateLog(message, 'success');
        this.addHistory(this.state.currentMultiplier.toFixed(2), true);
        
        this.elements.actionBtn.innerText = 'إبدأ الجولة';
        this.elements.actionBtn.className = 'btn-bet';
    }

    /**
     * نهاية اللعبة (انفجار الطائرة)
     */
    gameOver() {
        this.state.stopGameInterval();
        this.state.isPlaying = false;
        
        audioManager.playCrashSound();
        
        this.elements.multiplierEl.innerText = this.state.crashPoint.toFixed(2) + 'x';
        this.elements.multiplierEl.classList.add('crashed');
        
        this.renderer.drawScene(this.state.flightProgress, this.state.isPlaying, true);
        
        const message = `💥 انفجرت الطائرة عند ${this.state.crashPoint.toFixed(2)}x. خسرت الرهان.`;
        this.updateLog(message, 'error');
        this.addHistory(this.state.crashPoint.toFixed(2), false);
        
        this.elements.actionBtn.innerText = 'إبدأ الجولة';
        this.elements.actionBtn.className = 'btn-bet';
    }

    /**
     * معالج الحدث الرئيسي
     */
    handleAction() {
        if (!this.state.isPlaying) {
            this.startRound();
        } else {
            this.cashOut();
        }
    }

    /**
     * إعادة تعيين الرصيد
     */
    resetBalance() {
        if (!this.state.isPlaying) {
            this.state.resetBalance();
            this.updateBalance();
            this.updateProfit(0);
            this.updateLog('تمت إعادة شحن الرصيد إلى $100.00', 'success');
        }
    }
}

// إنشاء مثيل من اللعبة عند تحميل الصفحة
const game = new AviatorGame();