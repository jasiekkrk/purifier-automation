export interface RestDataProviderSettings{
    token: string
    sensorId: number
    url: string
}

export class RestDataProvider{
    private settings: RestDataProviderSettings
    constructor(settings: RestDataProviderSettings)
    {
        this.settings = settings
    }
}