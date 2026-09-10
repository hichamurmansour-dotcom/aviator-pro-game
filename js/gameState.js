/**
 * فئة حالة اللعبة - تدير جميع متغيرات الحالة
 */
class GameState {
    constructor() {
        this.balance = 100.00;
        this.currentMultiplier = 1.00;
        this.crashPoint = 0;
        this.autoCashoutValue = 0;
        this.isPlaying = false;
        this.currentBet = 0;
        this.flightProgress = 0;
        this.gameInterval = null;
    }

    /**
     * إعادة تعيين الحالة لجولة جديدة
     */
    resetForNewRound() {
        this.currentMultiplier = 1.00;
        this.flightProgress = 0;
        this.crashPoint = (Math.random() < 0.05) ? 1.00 : (1 + Math.random() * 8).toFixed(2);
    }

    /**
     * خصم الرهان من الرصيد
     */
    deductBet(betAmount) {
        this.currentBet = betAmount;
        this.balance -= betAmount;
    }

    /**
     * إضافة الأرباح إلى الرصيد
     */
    addWinnings(amount) {
        this.balance += amount;
    }

    /**
     * حساب مبلغ الفوز
     */
    calculateWinAmount() {
        return this.currentBet * this.currentMultiplier;
    }

    /**
     * التحقق مما إذا كان الرصيد كافياً
     */
    hasEnoughBalance(betAmount) {
        return betAmount > 0 && betAmount <= this.balance;
    }

    /**
     * إيقاف الفاصل الزمني
     */
    stopGameInterval() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }
    }

    /**
     * إعادة تعيين الرصيد
     */
    resetBalance() {
        this.balance = 100.00;
    }
}