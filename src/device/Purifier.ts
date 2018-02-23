import miio from 'miio'

export default class Purifier
{
    device: any
    async connect(){
        this.device = miio.device({ address: '192.168.1.2' })
    }

    async on(){
        return this.device.setPower(true)
    }
}