export type LineId = string;
export enum LineEvent {
    'BREAKDOWN',
    'WAIT_SMOOTH',
    'SMOOTH',
    'BOUNCE',
}

export class Point {
    y: number
    x: number
}

export interface LineDirective {
    condition: 'lt' | 'gt' | 'lgt'
    value: number
    action: string
    lineIndex: number
}

export interface Env {
    step: number               // time step in minutes
    minLength: number
    minLeftLeg: number
    maxForks: number
    minLog: number
    maxLog: number
    rollbackLength: number  // Устойчивый откат после пробоя линии тренда
    forkDurationMin: number    // Лимитное значение минимальной длительности волны
    forkDurationMax: number    // Лимитное значение минимальной длительности волны
    deltaModel: 1 | 2          // Модели отсчета. 2 - FTM/USDT, 1 - другие
}
