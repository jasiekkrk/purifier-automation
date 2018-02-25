import Controller from "./Controller";

export default class ProportionalController implements Controller {
    private expectedValue: number
    private mult = 0.5
    private averageDiff?: number = undefined;

    constructor(expectedValue: number) {
        this.expectedValue = expectedValue
    }

    calculateSpeed(currentValue: number): number {
        const diff = currentValue - this.expectedValue
        if (this.averageDiff === undefined) {
            this.averageDiff = diff
        }
        else {
            this.averageDiff = Math.ceil((this.averageDiff + diff) / 2)
        }
        if (this.averageDiff < -10) return 0
        if (this.averageDiff < -5) return 1
        if (this.averageDiff < 0) return 2

        const speed = Math.ceil(3 + (this.averageDiff * this.mult))
        if (speed < 1) return 1
        if (speed > 16) return 16
        return speed
    }
}