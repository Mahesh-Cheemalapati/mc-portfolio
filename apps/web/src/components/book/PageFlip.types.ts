export type FlipDirection = 'forward' | 'backward'

export interface FlipState {
  isFlipping: boolean
  direction: FlipDirection | null
  fromPage: number
  toPage: number
  progress: number
}

export interface FlipConfig {
  duration: number
  easing: (t: number) => number
}
