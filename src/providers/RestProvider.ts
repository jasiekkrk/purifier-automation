import DataProvider from "./DataProvider";

export interface RestDataProviderSettings{
    token: string
    sensorId: number
    url: string
}

export class RestDataProvider implements DataProvider {
    private settings: RestDataProviderSettings
    private requestUrl: string
    constructor(settings: RestDataProviderSettings)
    {
        this.settings = settings
        this.requestUrl = `https://airapi.airly.eu/v1/sensor/measurements?sensorId=${settings.sensorId}`
    }

    async getAQI() {
        const request =  {headers: {
            apikey: this.settings.token,
            Accept: 'application/json'
        }}
        const response = await fetch(this.requestUrl, request)
        if(!response) {
            console.log('No response from API')
            return 0
        }
        const responseBody = await response.json()
        if(!responseBody) {
            console.log('No response from API')
            return 0
        }
        return Number(responseBody.currentMeasurements.airQualityIndex)
    }
}