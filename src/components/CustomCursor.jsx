import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const coarsePointer = window.matchMedia(
      "(pointer: coarse)"
    ).matches;

    if (reduceMotion || coarsePointer) return undefined;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const move = (event) => {
      if (!(event.target instanceof Element)) return;

      target.current.x = event.clientX;
      target.current.y = event.clientY;

      root.classList.add("cursor-is-visible");

      const interactive = event.target.closest(
        "a, button, [role='button'], [data-cursor='interactive']"
      );

      ringRef.current?.classList.toggle(
        "is-hovering",
        Boolean(interactive)
      );

      if (labelRef.current) {
        labelRef.current.textContent =
          interactive?.dataset.cursorLabel || "";
      }

      labelRef.current?.classList.toggle(
        "is-visible",
        Boolean(interactive?.dataset.cursorLabel)
      );
    };

    const down = () => {
      ringRef.current?.classList.add("is-pressed");
    };

    const up = () => {
      ringRef.current?.classList.remove("is-pressed");
    };

    const leave = () => {
      root.classList.remove("cursor-is-visible");

      ringRef.current?.classList.remove(
        "is-hovering",
        "is-pressed"
      );

      labelRef.current?.classList.remove("is-visible");
    };

    let frame;

    const tick = () => {
      current.current.x +=
        (target.current.x - current.current.x) * 0.22;

      current.current.y +=
        (target.current.y - current.current.y) * 0.22;

      const transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;

      if (dotRef.current) {
        dotRef.current.style.transform = transform;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = transform;
      }

      if (labelRef.current) {
        labelRef.current.style.transform = transform;
      }

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move, {
      passive: true,
    });

    window.addEventListener("pointerdown", down, {
      passive: true,
    });

    window.addEventListener("pointerup", up, {
      passive: true,
    });

    window.addEventListener("blur", leave);
    document.addEventListener("pointerleave", leave);

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", leave);

      document.removeEventListener("pointerleave", leave);

      root.classList.remove(
        "has-custom-cursor",
        "cursor-is-visible"
      );
    };
  }, []);

  return (
    <>
      <span
        ref={ringRef}
        className="cursor-ring"
        aria-hidden="true"
      />

      <span
        ref={dotRef}
        className="cursor-dot"
        aria-hidden="true"
      />

      <span
        ref={labelRef}
        className="cursor-label"
        aria-hidden="true"
      />
    </>
  );
}