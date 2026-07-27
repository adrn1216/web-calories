"use client";

import { useEffect, useState } from "react";

export function useKeyboardInset(active: boolean) {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!active || !window.visualViewport) {
      setInset(0);
      return;
    }

    const viewport = window.visualViewport;
    const update = () => {
      const coveredHeight = window.innerHeight - viewport.height - viewport.offsetTop;
      setInset(Math.max(0, Math.round(coveredHeight)));
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [active]);

  return inset;
}
