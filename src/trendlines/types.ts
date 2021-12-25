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
