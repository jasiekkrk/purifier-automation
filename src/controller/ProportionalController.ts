import Controller from "./Controller";

export default class ProportionalController implements Controller {
    private expectedValue: number
    private mult = 5

    constructor(expectedValue: number) {
        this.expectedValue = expectedValue
    }
    calculateSpeed(currentValue: number): number {
        const ratio = currentValue / this.expectedValue
        
        const speed = Math.ceil(ratio * this.mult)
        if(speed < 1) return 1
        if(speed > 16) return 16
        return speed
    }
}