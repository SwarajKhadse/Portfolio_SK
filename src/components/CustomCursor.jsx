import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return undefined;
    }

    document.documentElement.classList.add("has-custom-cursor");

    const move = (event) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;

      const interactive = event.target.closest(
        "a, button, [data-cursor='interactive']"
      );

      ringRef.current?.classList.toggle(
        "is-hovering",
        Boolean(interactive)
      );
    };

    const down = () => {
      ringRef.current?.classList.add("is-pressed");
    };

    const up = () => {
      ringRef.current?.classList.remove("is-pressed");
    };

    let frame;

    const tick = () => {
      current.current.x +=
        (target.current.x - current.current.x) * 0.18;
      current.current.y +=
        (target.current.y - current.current.y) * 0.18;

      const x = `${current.current.x}px`;
      const y = `${current.current.y}px`;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${x}, ${y}, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate3d(${x}, ${y}, 0)`;
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

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.classList.remove(
        "has-custom-cursor"
      );
    };
  }, []);

  return (
    <>
      <span ref={ringRef} className="cursor-ring" />
      <span ref={dotRef} className="cursor-dot" />
    </>
  );
}
