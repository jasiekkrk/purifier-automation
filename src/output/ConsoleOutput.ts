import { DataOutput, Measurment } from "./DataOutput";

export default class ConsoleOutput implements DataOutput {
    exportData(data: Measurment): Promise<void> {
        console.log(data)
        return Promise.resolve()
    }
}