/**
 * Spring solver — adapted from JellySwitch.zip src/spring.ts
 *
 * Euler-integrated damped harmonic oscillator.
 * F_spring = -stiffness * (value - target)
 * F_damp   = -damping * velocity
 * acceleration = (F_spring + F_damp) / mass
 *
 * Adapted for portfolio: dt cap at 33ms, sub-stepping up to 10 steps,
 * setDamping(ratio) method for ζ-based parameter setting.
 *
 * Source boundary: this file lives in anchors/lib/ only.
 * No TypeGPU dependency — pure JavaScript math.
 */

const MAX_DT = 0.033; // 33ms cap
const MAX_SUB_STEPS = 10;

export class Spring {
  value: number;
  velocity: number;
  target: number;
  stiffness: number;
  damping: number;
  mass: number;

  constructor(
    initial: number = 0,
    stiffness: number = 600,
    damping: number = 42,
    mass: number = 1.0,
  ) {
    this.value = initial;
    this.velocity = 0;
    this.target = initial;
    this.stiffness = stiffness;
    this.damping = damping;
    this.mass = mass;
  }

  /**
   * Set spring parameters from a target damping ratio ζ.
   * ζ = damping / (2 * sqrt(stiffness * mass))
   * Given ζ and stiffness, computes damping.
   */
  setDamping(zeta: number): void {
    this.damping = zeta * 2 * Math.sqrt(this.stiffness * this.mass);
  }

  /**
   * Get current damping ratio ζ.
   */
  getDampingRatio(): number {
    return this.damping / (2 * Math.sqrt(this.stiffness * this.mass));
  }

  /**
   * Advance the spring by dt seconds.
   * dt is capped at MAX_DT per sub-step, with up to MAX_SUB_STEPS.
   * Excess time beyond MAX_DT * MAX_SUB_STEPS is discarded.
   */
  update(dt: number): void {
    const totalDt = Math.min(dt, MAX_DT * MAX_SUB_STEPS);
    let remaining = totalDt;

    while (remaining > 0.0001) {
      const stepDt = Math.min(remaining, MAX_DT);
      remaining -= stepDt;

      const displacement = this.value - this.target;
      const springForce = -this.stiffness * displacement;
      const dampForce = -this.damping * this.velocity;
      const acceleration = (springForce + dampForce) / this.mass;

      this.velocity += acceleration * stepDt;
      this.value += this.velocity * stepDt;
    }
  }

  /**
   * Check if the spring has settled (within threshold of target).
   */
  isSettled(threshold: number = 0.005): boolean {
    return (
      Math.abs(this.value - this.target) < threshold &&
      Math.abs(this.velocity) < threshold
    );
  }

  /**
   * Snap to target immediately, zero velocity.
   */
  snap(): void {
    this.value = this.target;
    this.velocity = 0;
  }
}
