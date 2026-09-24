/* Motion primitives: a damped spring for hand-driven settling and a timed
   tween for choreographed moves (the cover opening, the riffle). */

export type Motion = {
  /** Advance by dt seconds. Returns the new value and whether it has settled. */
  step(value: number, dt: number): { value: number; done: boolean }
  velocity: number
}

export function spring(target: number, stiffness = 170, damping = 24, velocity = 0): Motion {
  return {
    velocity,
    step(value, dt) {
      const x = value - target
      this.velocity += (-stiffness * x - damping * this.velocity) * dt
      const next = value + this.velocity * dt
      const done = Math.abs(next - target) < 0.0015 && Math.abs(this.velocity) < 0.02
      return { value: done ? target : next, done }
    },
  }
}

export type Ease = (k: number) => number
export const linear: Ease = k => k
export const easeInOut: Ease = k => 0.5 - 0.5 * Math.cos(Math.PI * k)
/** Starts brisk, lands softly: a page dropping onto the stack. */
export const easeOutish: Ease = k => 1 - Math.pow(1 - k, 2.2)

export function tween(from: number, target: number, seconds: number, ease: Ease = easeInOut): Motion {
  let elapsed = 0
  return {
    velocity: 0,
    step(_value, dt) {
      elapsed += dt
      const k = Math.min(1, elapsed / seconds)
      const value = from + (target - from) * ease(k)
      this.velocity = (target - from) / seconds
      return { value, done: k >= 1 }
    },
  }
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
