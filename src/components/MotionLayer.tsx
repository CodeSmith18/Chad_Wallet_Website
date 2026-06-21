"use client";

import { useEffect } from "react";

export function MotionLayer() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    revealItems.forEach((item, index) => {
      item.style.setProperty(
        "--reveal-delay",
        item.dataset.delay ?? `${Math.min(index * 80, 420)}ms`
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    revealItems.forEach((item) => observer.observe(item));

    const magneticItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-magnetic]")
    );

    const handlePointerMove = (event: PointerEvent) => {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const strength = Number(target.dataset.magnetic || 8);
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * strength;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * strength;

      target.style.setProperty("--magnet-x", `${x}px`);
      target.style.setProperty("--magnet-y", `${y}px`);
    };

    const resetMagnet = (event: PointerEvent) => {
      const target = event.currentTarget as HTMLElement;
      target.style.setProperty("--magnet-x", "0px");
      target.style.setProperty("--magnet-y", "0px");
    };

    magneticItems.forEach((item) => {
      item.addEventListener("pointermove", handlePointerMove);
      item.addEventListener("pointerleave", resetMagnet);
    });

    const parallaxItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    );
    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const viewportHeight = window.innerHeight || 1;

      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const speed = Number(item.dataset.parallax || 0.16);
        const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        const offset = Math.max(-42, Math.min(42, progress * speed * -120));
        item.style.setProperty("--parallax-y", `${offset}px`);
      });
    };

    const requestParallax = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);

    return () => {
      observer.disconnect();
      root.classList.remove("motion-ready");
      magneticItems.forEach((item) => {
        item.removeEventListener("pointermove", handlePointerMove);
        item.removeEventListener("pointerleave", resetMagnet);
      });
      window.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", requestParallax);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
