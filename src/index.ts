import miio from 'miio'
import Purifier from './device/Purifier';

const device = new Purifier()
device.connect().then(() => device.on())