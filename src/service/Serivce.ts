import Purifier from "../device/Purifier";
import MiioPurifier from "../device/MiioPurifier";
import { RestDataProvider } from "../providers/RestProvider";
import Controller from "../controller/Controller";
import { DataOutput } from "../output/DataOutput";
import DataProvider from "../providers/DataProvider";
import ProportionalController from "../controller/ProportionalController";
import ConsoleOutput from "../output/ConsoleOutput";
import DummyPurifier from "../device/DummyPurifier";
require('dotenv').config()

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
    private controller: Controller
    private output: DataOutput
    private provider: DataProvider
    private devices: Purifier[]

    constructor(){
        this.devices = [new DummyPurifier()]
        this.provider = new RestDataProvider(restSettings)
        this.controller = new ProportionalController(20)
        this.output = new ConsoleOutput()
    }

    async initProcess() {
        return this.initDevices()
    }

    private async runOnDevice(device: Purifier){
        const awaitable: Array<Promise<number>> = []
        awaitable.push(device.getHumidity())
        awaitable.push(device.getTemperature())
        awaitable.push(device.getAqui())

        const items = await Promise.all(awaitable)
        const currentMeasurment = {aqiLevel: items[2], temperature: items[1], humidity: items[0]}

        const newSpeed = this.controller.calculateSpeed(currentMeasurment.aqiLevel)

        device.setSpeed(newSpeed)

        await this.output.exportData({...currentMeasurment, deviceid: device.name,  speed: newSpeed})
    }

    async runControlStep() {
        const awaitable: Array<Promise<void>> = []
        for(const device of this.devices){
            awaitable.push(this.runOnDevice(device))
        }
        return Promise.all(awaitable)
    }

    private async initDevices(){
        for(const device of this.devices){
            await device.connect()
        }
    }
}
export default class Service{
   
    private interval: number
    private process: Process

    constructor(){
        this.process = new Process()
    }

    private doInterval = async () => {
        console.log('Runnin control loop step')
        try{
             await this.process.runControlStep()
        }
        catch(err){
            console.log(err)
        }
        setTimeout(this.doInterval, 5000)
    }

    stop(){
        clearTimeout(this.interval)
    }

    async start(){
        if(!settings.ip) {
            return Promise.reject('No ip set')
        }
        await this.process.initProcess()
        console.log('Initialized')
        this.interval = setTimeout(this.doInterval, 500)
    }

}