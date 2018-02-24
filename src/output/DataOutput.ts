export interface Measurment {
    deviceid: string
    aqiLevel: number
    temperature: number
    humidity: number
    speed: number
}

export interface DataOutput {
    exportData(data: Measurment): Promise<void>
}