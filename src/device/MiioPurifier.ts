import Purifier from "./Purifier";

const miio = require('miio');

export interface PurifierSettings {
    ip: string
    name: string
}

export default class MiioPurifier implements Purifier {
    private settings: PurifierSettings
    constructor(settings: PurifierSettings) {
        this.settings = settings
    }
    device: any
    get name() {
        return this.settings.name
    }

    async connect() {
        this.device = await miio.device({ address: this.settings.ip })
    }

    async on() {
        return this.device.setPower(true)
    }

    async off() {
        return this.device.setPower(false)
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
        return this.device.favoriteLevel(speed)
    }

    async auto() {
        return this.device.setMode('auto')
    }

    async getAqui(): Promise<number> {
        return this.device.pm2_5()
    }
}