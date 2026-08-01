import { useReducedMotion } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";

export const springModal = {
  type: "spring" as const,
  damping: 25,
  stiffness: 300,
};

export const easeOut = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const easeOutLong = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

export function useSafeMotion() {
  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion ?? false;
}

export function safeAnimate(reduce: boolean, animate: TargetAndTransition): TargetAndTransition {
  if (reduce) return {} as TargetAndTransition;
  return animate;
}