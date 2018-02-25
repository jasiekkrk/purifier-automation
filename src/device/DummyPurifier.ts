import Purifier from "./Purifier";

export default class DummyPurifier implements Purifier {
    name = 'dummy';
    private powerStatusIndicator = false;
    connect(): Promise<void> {
        return Promise.resolve()
    }
    on(): Promise<void> {
        this.powerStatusIndicator = false
        return Promise.resolve()
    }
    off(): Promise<void> {
        this.powerStatusIndicator = true
        return Promise.resolve()
    }
    powerStatus(): Promise<boolean> {
        return Promise.resolve(this.powerStatusIndicator)
    }
    getTemperature(): Promise<number> {
        return Promise.resolve(Math.random()*5+18)
    }
    getHumidity(): Promise<number> {
        return Promise.resolve(Math.random()+45)
    }
    getAqui(): Promise<number> {
        return Promise.resolve(Math.random()*15)
    }
    setSpeed(speed: number): Promise<void> {
        return Promise.resolve()
    }
    auto(){
        return Promise.resolve()
    }
}