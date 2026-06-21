"use client";

import Link from "next/link";
import { ArrowUpRight, Radio, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { liveTrades, marketTokens } from "@/data/tokens";

export function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.1, 9.2);

    const root = new THREE.Group();
    scene.add(root);

    const phone = new THREE.Group();
    root.add(phone);

    const phoneBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.05, 5.9, 0.24, 12, 12, 2),
      new THREE.MeshStandardMaterial({
        color: 0x070a12,
        metalness: 0.52,
        roughness: 0.28
      })
    );
    phone.add(phoneBody);

    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.72, 5.34),
      new THREE.MeshBasicMaterial({
        color: 0x08101c,
        transparent: true,
        opacity: 0.96
      })
    );
    screen.position.z = 0.132;
    phone.add(screen);

    const notch = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.12),
      new THREE.MeshBasicMaterial({ color: 0x010308 })
    );
    notch.position.set(0, 2.48, 0.138);
    phone.add(notch);

    const chartPoints = [
      [-1.06, -1.52, 0],
      [-0.86, -0.9, 0],
      [-0.64, -1.14, 0],
      [-0.42, -0.22, 0],
      [-0.22, -0.56, 0],
      [0.02, 0.36, 0],
      [0.24, -0.06, 0],
      [0.48, 0.62, 0],
      [0.76, 0.34, 0],
      [1.02, 1.1, 0]
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z));

    const chartGeometry = new THREE.BufferGeometry().setFromPoints(chartPoints);
    const chartLine = new THREE.Line(
      chartGeometry,
      new THREE.LineBasicMaterial({ color: 0x25f58a, linewidth: 2 })
    );
    chartLine.position.z = 0.152;
    phone.add(chartLine);

    const glowLine = new THREE.Line(
      chartGeometry.clone(),
      new THREE.LineBasicMaterial({
        color: 0x53b7ff,
        transparent: true,
        opacity: 0.45
      })
    );
    glowLine.scale.set(1.02, 1.02, 1);
    glowLine.position.z = 0.151;
    phone.add(glowLine);

    const barMaterial = new THREE.MeshBasicMaterial({
      color: 0x25f58a,
      transparent: true,
      opacity: 0.34
    });
    for (let index = 0; index < 10; index += 1) {
      const height = 0.24 + (index % 4) * 0.12 + index * 0.025;
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.11, height), barMaterial);
      bar.position.set(-1.14 + index * 0.25, -2.0 + height / 2, 0.146);
      phone.add(bar);
    }

    const chipMaterial = new THREE.MeshStandardMaterial({
      color: 0x25f58a,
      emissive: 0x093d24,
      metalness: 0.15,
      roughness: 0.42
    });

    const chipPositions = [
      [-2.15, 1.74, 0.35],
      [2.05, 1.08, 0.18],
      [-2.0, -0.86, 0.28],
      [1.88, -1.56, 0.34]
    ];

    chipPositions.forEach(([x, y, z], index) => {
      const chip = new THREE.Mesh(new THREE.SphereGeometry(0.18 + index * 0.015, 24, 16), chipMaterial);
      chip.position.set(x, y, z);
      root.add(chip);
    });

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.01, 8, 96),
      new THREE.MeshBasicMaterial({
        color: 0x25f58a,
        transparent: true,
        opacity: 0.18
      })
    );
    ring.rotation.x = Math.PI / 2.6;
    root.add(ring);

    const fillLight = new THREE.PointLight(0x25f58a, 18, 9);
    fillLight.position.set(-3, 2.6, 4);
    scene.add(fillLight);

    const blueLight = new THREE.PointLight(0x53b7ff, 10, 8);
    blueLight.position.set(2.8, -1.8, 4);
    scene.add(blueLight);

    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    const pointer = { x: 0, y: 0 };
    const handlePointerMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    wrap.addEventListener("pointermove", handlePointerMove);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    resize();

    let animationFrame = 0;
    const startedAt = performance.now();

    const render = () => {
      const elapsed = (performance.now() - startedAt) / 1000;
      root.rotation.y = -0.28 + Math.sin(elapsed * 0.45) * 0.08 + pointer.x * 0.08;
      root.rotation.x = 0.12 + Math.sin(elapsed * 0.38) * 0.04 - pointer.y * 0.04;
      root.position.y = Math.sin(elapsed * 0.8) * 0.12;
      ring.rotation.z = elapsed * 0.16;
      chartLine.scale.x = 0.92 + Math.sin(elapsed * 1.5) * 0.04;
      glowLine.material.opacity = 0.25 + Math.sin(elapsed * 2.1) * 0.14;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      wrap.removeEventListener("pointermove", handlePointerMove);
      renderer.dispose();
      root.traverse((object) => {
        const item = object as THREE.Mesh | THREE.Line;
        if ("geometry" in item) {
          item.geometry.dispose();
        }
        if ("material" in item) {
          const material = item.material;
          if (Array.isArray(material)) {
            material.forEach((entry) => entry.dispose());
          } else {
            material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      data-reveal
      data-delay="220ms"
      className="relative min-h-[520px] overflow-hidden lg:min-h-[690px]"
    >
      <canvas
        ref={canvasRef}
        aria-label="Animated 3D ChadWallet phone chart"
        className="absolute inset-0 h-full w-full"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,rgba(37,245,138,0.12),transparent_34%),linear-gradient(180deg,transparent,rgba(5,5,5,0.45))]" />

      <div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-chad-black/65 px-4 py-3 backdrop-blur-xl sm:left-8 sm:top-8">
        <p className="text-xs font-black uppercase text-white/42">3D live lobby</p>
        <p className="mt-1 text-sm font-black text-white">Phone, graph, signals</p>
      </div>

      <div className="float-lux absolute right-3 top-24 w-44 rounded-lg border border-chad-lime/25 bg-chad-black/70 p-3 backdrop-blur-xl sm:right-8 sm:w-56">
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-chad-lime">
          <Radio className="h-4 w-4" />
          Chad score
        </div>
        {marketTokens.slice(0, 3).map((token) => (
          <Link
            href={`/trade/${token.symbol.toLowerCase()}`}
            key={token.symbol}
            className="pointer-events-auto mt-2 flex items-center justify-between rounded-md border border-white/8 bg-white/[0.04] px-3 py-2 text-sm transition hover:border-chad-lime/50 hover:bg-chad-lime hover:text-chad-black"
          >
            <span className="font-black">${token.symbol}</span>
            <span className="font-black">{token.score}</span>
          </Link>
        ))}
      </div>

      <div className="float-lux absolute bottom-5 left-4 w-[calc(100%-2rem)] rounded-lg border border-white/10 bg-chad-black/70 p-3 backdrop-blur-xl sm:bottom-8 sm:left-8 sm:w-72">
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-chad-lime">
          <Zap className="h-4 w-4" />
          Live wallet moves
        </div>
        <div className="space-y-2">
          {liveTrades.slice(0, 3).map((trade) => (
            <div
              key={trade}
              className="rounded-md border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white/74"
            >
              {trade}
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/trade/bonk"
        data-magnetic="9"
        className="magnetic absolute bottom-5 right-4 hidden items-center gap-2 rounded-full bg-chad-lime px-5 py-3 text-sm font-black text-chad-black shadow-glow transition hover:bg-chad-mint sm:flex"
      >
        Open BONK
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
