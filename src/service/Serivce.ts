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
    private devices: Purifier[]
    private running: false;

    constructor(){
        this.devices = [new MiioPurifier(settings)]
        this.controller = new ProportionalController(25)
        this.output = new NoopOutput()
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

    async stopDevices(){
        if(!this.running) return
        const awaitable: Array<Promise<void>> = []
        for(const device of this.devices){
            awaitable.push(device.off())
        }
        return Promise.all(awaitable)
    } 

    async startDevices(){
        if(this.running) return
        const awaitable: Array<Promise<void>> = []
        for(const device of this.devices){
            awaitable.push(device.on())
        }
        return Promise.all(awaitable)
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
    private provider: RestDataProvider;
    private preconditionInterval: number
    private controlInterval: number
    private process: Process

    constructor(){
        this.provider = new RestDataProvider(restSettings)
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

    private checkPrecondition = async () => {
        const outdoorAqui = await this.provider.getAQI()
        if(outdoorAqui > 50 || outdoorAqui == 0){
            await this.process.startDevices()
            this.controlInterval = setTimeout(this.doInterval, 5000)
        }
        else
        {
            'Stopping devices due to low pollution'
            clearTimeout(this.controlInterval)
            await this.process.stopDevices()
        }
        
    }
    stop(){
        clearTimeout(this.controlInterval)
        clearInterval(this.preconditionInterval)
    }

    async start(){
        if(!settings.ip) {
            return Promise.reject('No ip set')
        }
        await this.process.initProcess()
        console.log('Initialized')
        this.preconditionInterval = setInterval(this.checkPrecondition, 5)
    }
}