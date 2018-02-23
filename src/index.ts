import Purifier from './device/Purifier';
require('dotenv').config()

const settings = {
    ip: process.env.DEVICE_IP
}
if(!settings.ip) {
    console.log('No ip set')
    process.exit(1)
}
const device = new Purifier(settings)
device.connect().then(async () => {
    const temperature = await  device.getTemperature()
    const humid = await  device.getHumidity()
    console.log(temperature)
    console.log(humid)
    await device.setSpeed(1)
})
.then(() => process.exit())
.catch(err => {
    console.log(err)
    process.exit(1)
})