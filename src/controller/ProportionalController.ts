import Controller from "./Controller";

export default class ProportionalController implements Controller {
    private expectedValue: number
    private mult = 0.5

    constructor(expectedValue: number) {
        this.expectedValue = expectedValue
    }
    calculateSpeed(currentValue: number): number {
        const ratio = currentValue - this.expectedValue
        if(ratio < -10) return 1
        if(ratio < -5 ) return 2
        if(ratio < 0) return 3

        const speed = Math.ceil(3+ (ratio * this.mult))
        if(speed < 1) return 1
        if(speed > 16) return 16
        return speed
    }
}