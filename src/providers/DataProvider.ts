export default interface DataProvider {
    getAQI(): Promise<number>
}