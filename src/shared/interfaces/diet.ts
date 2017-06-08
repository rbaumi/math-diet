export interface IDietMeasurement {
    id: string;
    date: Date;
    weight: number;
}
export interface IDiet {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    startWeight: number;
    endWeight: number;
    measurements: IDietMeasurement[]
}