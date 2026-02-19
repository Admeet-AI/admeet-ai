"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollEffects() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const orbs = document.querySelectorAll<HTMLElement>(".parallax-orb");
    const nav = document.querySelector<HTMLElement>(".landing-nav");

    const ctx = gsap.context(() => {
      orbs.forEach((orb, i) => {
        const speed = [0.15, 0.1, 0.2][i] ?? 0.12;
        gsap.to(orb, {
          y: () => window.innerHeight * speed * -1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      });

      if (nav) {
        ScrollTrigger.create({
          start: "top -80",
          onUpdate: (self) => {
            if (self.direction === 1 && self.scroll() > 80) {
              nav.style.backdropFilter = "blur(12px)";
              nav.style.borderBottom = "1px solid rgba(148,163,184,0.1)";
            } else if (self.scroll() <= 80) {
              nav.style.backdropFilter = "blur(0px)";
              nav.style.borderBottom = "1px solid transparent";
            }
          },
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return null;
}
