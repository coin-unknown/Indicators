import { LineEvent, LineDirective, Point } from './types'

/**
 * Trend state Model
 * The trendModel object
 */
export interface TrendStateModel {
    in: 'flat' | 'rise' | 'fall' | 'squeeze'    // longer state
    is: 'flat' | 'rise' | 'fall'                // current state
    with: number                                // longer state changing speed
    was: 'flat' | 'rise' | 'fall'               // prevues state
    at: number                                  // time ago of the prevues state
}
