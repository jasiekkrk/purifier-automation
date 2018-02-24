export interface Temperature{
    value: number
    unit: string
}
export default interface Purifier
{
    name: string

    connect(): Promise<void>

    on(): Promise<void>

    off(): Promise<void>

    powerStatus(): Promise<boolean>

    getTemperature(): Promise<number>

    getHumidity(): Promise<number>

    getAqui(): Promise<number>

    setSpeed(speed: number): Promise<void>

}