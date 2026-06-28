import { useEffect, useRef } from "react";

const lerp = (current, target, factor) => current + (target - current) * factor;

/**
 * Cursor-following glow + optional parallax for page containers.
 * Sets CSS vars: --glow-x/y, --glow-trail-x/y, --parallax-x/y on the container.
 *
 * @param {React.RefObject<HTMLElement | null>} containerRef
 * @param {object} [options]
 * @param {number} [options.parallaxStrength=0] — 0 disables parallax
 * @param {number} [options.glowLerp=0.1]
 * @param {number} [options.trailLerp=0.04]
 * @param {string} [options.activeClass='glow-active']
 */
export default function useCursorGlow(
  containerRef,
  {
    parallaxStrength = 0,
    glowLerp = 0.1,
    trailLerp = 0.04,
    activeClass = "glow-active",
  } = {}
) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const parallaxRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const centerGlow = () => {
      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      mouseRef.current = { x: cx, y: cy };
      glowRef.current = { x: cx, y: cy };
      trailRef.current = { x: cx, y: cy };
      container.style.setProperty("--glow-x", `${cx}px`);
      container.style.setProperty("--glow-y", `${cy}px`);
      container.style.setProperty("--glow-trail-x", `${cx}px`);
      container.style.setProperty("--glow-trail-y", `${cy}px`);
    };

    centerGlow();

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      if (parallaxStrength > 0) {
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        parallaxRef.current = { x: nx * parallaxStrength, y: ny * parallaxStrength };
      }

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        container.classList.add(activeClass);
      }
    };

    let rafId;
    const animate = () => {
      glowRef.current.x = lerp(glowRef.current.x, mouseRef.current.x, glowLerp);
      glowRef.current.y = lerp(glowRef.current.y, mouseRef.current.y, glowLerp);
      trailRef.current.x = lerp(trailRef.current.x, mouseRef.current.x, trailLerp);
      trailRef.current.y = lerp(trailRef.current.y, mouseRef.current.y, trailLerp);

      container.style.setProperty("--glow-x", `${glowRef.current.x}px`);
      container.style.setProperty("--glow-y", `${glowRef.current.y}px`);
      container.style.setProperty("--glow-trail-x", `${trailRef.current.x}px`);
      container.style.setProperty("--glow-trail-y", `${trailRef.current.y}px`);

      if (parallaxStrength > 0) {
        container.style.setProperty("--parallax-x", `${parallaxRef.current.x}px`);
        container.style.setProperty("--parallax-y", `${parallaxRef.current.y}px`);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", centerGlow);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", centerGlow);
    };
  }, [containerRef, parallaxStrength, glowLerp, trailLerp, activeClass]);
}
