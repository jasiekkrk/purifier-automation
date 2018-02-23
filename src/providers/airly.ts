export interface AirlyProviderSettings{
    token: string
    sensorId: number
    url: string
}

export class AirlyProvider{
    private settings: AirlyProviderSettings
    constructor(settings: AirlyProviderSettings)
    {
        this.settings = settings
    }
}