import DataProvider from "./DataProvider";

export interface RestDataProviderSettings{
    token: string
    sensorId: number
    url: string
}

export class RestDataProvider implements DataProvider {
    private settings: RestDataProviderSettings
    constructor(settings: RestDataProviderSettings)
    {
        this.settings = settings
    }

    async getAQI() {
        return Promise.resolve(70) 
    }
}