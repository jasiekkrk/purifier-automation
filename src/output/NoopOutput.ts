import { DataOutput, Measurment } from "./DataOutput";

export default class NoopOutput implements DataOutput {
    exportData(data: Measurment): Promise<void> {
        return Promise.resolve()
    }
}