import Purifier from "../device/Purifier";
import MiioPurifier from "../device/MiioPurifier";
import { RestDataProvider } from "../providers/RestProvider";
import Controller from "../controller/Controller";
import { DataOutput } from "../output/DataOutput";
import DataProvider from "../providers/DataProvider";
import ProportionalController from "../controller/ProportionalController";
import ConsoleOutput from "../output/ConsoleOutput";
import DummyPurifier from "../device/DummyPurifier";
import NoopOutput from "../output/NoopOutput";
require('dotenv').config()

const preconditionIntervalTime = 5 * 60 * 1000
const settings = {
    ip: process.env.DEVICE_IP,
    name: process.env.DEVICE_NAME || 'default'
}

const restSettings = {
    token: process.env.REST_TOKEN,
    sensorId: process.env.REST_SENSOR_ID,
    url: process.env.REST_ENDPOINT
}

export class Process {
    async dispose() {
        if (!this.running) return
        const awaitable: Array<Promise<void>> = []
        for (const device of this.devices) {
            awaitable.push(device.auto())
        }
        return Promise.all(awaitable)
    }
    private controller: Controller
    private output: DataOutput
    private devices: Purifier[]
    private running: boolean = false;

    constructor() {
        this.devices = [new MiioPurifier(settings)]
        this.controller = new ProportionalController(25)
        this.output = new NoopOutput()
    }

    async initProcess() {
        return this.initDevices()
    }

    private async runOnDevice(device: Purifier) {
        const awaitable: Array<Promise<number>> = []
        awaitable.push(device.getHumidity())
        awaitable.push(device.getTemperature())
        awaitable.push(device.getAqui())

        const items = await Promise.all(awaitable)
        const currentMeasurment = { aqiLevel: items[2], temperature: items[1], humidity: items[0] }

        const newSpeed = this.controller.calculateSpeed(currentMeasurment.aqiLevel)

        await device.setSpeed(newSpeed)

        await this.output.exportData({ ...currentMeasurment, deviceid: device.name, speed: newSpeed })
    }

    async stopDevices() {
        const awaitable: Array<Promise<void>> = []
        for (const device of this.devices) {
            awaitable.push(device.off())
        }
        return Promise.all(awaitable).then(() => this.running = false)
    }

    async startDevices() {
        if (this.running) return
        const awaitable: Array<Promise<void>> = []
        for (const device of this.devices) {
            awaitable.push(device.on())
        }
        return Promise.all(awaitable).then(() => this.running = true)
    }

    async runControlStep() {
        const awaitable: Array<Promise<void>> = []
        for (const device of this.devices) {
            awaitable.push(this.runOnDevice(device))
        }
        return Promise.all(awaitable)
    }

    private async initDevices() {
        for (const device of this.devices) {
            await device.connect()
        }
    }
}
export default class Service {
    private provider: RestDataProvider;
    private preconditionInterval: number
    private controlInterval: number
    private process: Process

    constructor() {
        this.provider = new RestDataProvider(restSettings)
        this.process = new Process()
    }

    private doInterval = async () => {
        try {
            await this.process.runControlStep()
        }
        catch (err) {
            console.log(err)
        }
        setTimeout(this.doInterval, 5000)
    }

    private checkPrecondition = async () => {
        try {
            const outdoorAqui = await this.provider.getAQI()
            if (outdoorAqui > 80 || outdoorAqui == 0) {
                console.log('Starting due to high outdoor pollution')
                await this.process.startDevices()
                this.controlInterval = setTimeout(this.doInterval, 5000)
            }
            else {
                console.log('Stopping devices due to low pollution')
                clearTimeout(this.controlInterval)
                await this.process.stopDevices()
            }
        }
        catch (err) {
            console.log(err)
        }
        this.preconditionInterval = setTimeout(this.checkPrecondition, preconditionIntervalTime)
    }

    async stop() {
        'Stopping service and unregistering devices'
        clearTimeout(this.controlInterval)
        clearInterval(this.preconditionInterval)
        return this.process.dispose()
    }

    async start() {
        if (!settings.ip) {
            return Promise.reject('No ip set')
        }
        await this.process.initProcess()
        console.log('Initialized')
        this.preconditionInterval = setTimeout(this.checkPrecondition, 5)
    }
}