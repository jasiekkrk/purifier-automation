import Purifier from "./Purifier";

const miio = require('miio');

export interface PurifierSettings {
    ip: string
    name: string
}

export default class MiioPurifier implements Purifier {
    private settings: PurifierSettings
    private currentSped?: number = undefined

    constructor(settings: PurifierSettings) {
        this.settings = settings
    }
    device: any
    get name() {
        return this.settings.name
    }

    async connect() {
        console.log(`Trying to connect to ${this.settings.ip}`)
        this.device = await miio.device({ address: this.settings.ip })
        console.log(`Trying to connect to ${this.settings.ip}`)
    }

    async on() {
        try {
            console.log(`Device ${this.name} will start`)
            await this.device.setPower(true)
            console.log(`Device ${this.name} is running`)
        }
        catch (err) {
            console.log(err)
        }
    }

    async off() {
        try {
            console.log(`Device ${this.name} will shut down`)
            await this.device.setPower(false)
            console.log(`Device ${this.name} shut down`)
        }
        catch (err) {
            console.log(err)
        }
    }

    async powerStatus() {
        return this.device.power()
    }

    async getTemperature() {
        return this.device.temperature()
    }

    async getHumidity() {
        return this.device.relativeHumidity()
    }

    async setFavourite() {
        return this.device.setMode('favorite')
    }

    async setSpeed(speed: number) {
        if (speed > 16 || speed < 0) return Promise.reject('Speed must be between 0 and 16')

        const currentMode = await this.device.mode()
        if (currentMode !== 'favorite') {
            console.log(currentMode)
            await this.setFavourite()
        }
        if (this.currentSped != speed) {
            this.currentSped = speed
            return this.device.favoriteLevel(speed)
        }
    }

    async auto() {
        return this.device.setMode('auto')
    }

    async getAqui(): Promise<number> {
        return this.device.pm2_5()
    }
}