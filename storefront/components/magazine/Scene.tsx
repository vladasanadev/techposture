"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { easing } from "maath";
import { Group } from "three";
import Page from "./Page";
import { LEAF_COUNT, MAGAZINE_PAGES } from "./data";
import { PAGE_WIDTH } from "./pageGeometry";

type SceneProps = {
  page: number;
  active: boolean;
  onTurn: (page: number) => void;
  onReady: () => void;
  onUnavailable: () => void;
};

function ResponsiveCamera() {
  const { size } = useThree();
  return (
    <OrthographicCamera
      makeDefault
      position={[size.width < 500 ? -PAGE_WIDTH / 2 : 0, 0, 6]}
      zoom={Math.min(
        size.width / (size.width < 500 ? 1.17 : 2.25),
        size.height / 1.55,
      )}
      near={0.1}
      far={30}
    />
  );
}

function ResponsiveControls() {
  const { size } = useThree();
  return (
    <OrbitControls
      makeDefault
      target={[size.width < 500 ? -PAGE_WIDTH / 2 : 0, 0, 0]}
      enablePan={false}
      enableZoom={false}
      enableDamping
      dampingFactor={0.075}
      rotateSpeed={0.42}
      minAzimuthAngle={-0.42}
      maxAzimuthAngle={0.42}
      minPolarAngle={1.12}
      maxPolarAngle={1.64}
    />
  );
}

function ContextWatch({ onUnavailable }: Pick<SceneProps, "onUnavailable">) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    function onContextLost(event: Event) {
      event.preventDefault();
      onUnavailable();
    }
    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => canvas.removeEventListener("webglcontextlost", onContextLost);
  }, [gl, onUnavailable]);
  return null;
}

function Book({
  page,
  onTurn,
  onReady,
}: Pick<SceneProps, "page" | "onTurn" | "onReady">) {
  const [animatedPage, setAnimatedPage] = useState(page);
  const centered = useRef<Group>(null);

  useEffect(() => {
    if (animatedPage === page) return;
    const timeout = window.setTimeout(
      () => {
        setAnimatedPage((current) => current + Math.sign(page - current));
      },
      Math.abs(page - animatedPage) > 2 ? 90 : 180,
    );
    return () => window.clearTimeout(timeout);
  }, [animatedPage, page]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useFrame((_, delta) => {
    if (!centered.current) return;
    const x =
      animatedPage === 0
        ? -PAGE_WIDTH / 2
        : animatedPage === LEAF_COUNT
          ? PAGE_WIDTH / 2
          : 0;
    easing.damp(centered.current.position, "x", x, 0.35, Math.min(delta, 0.05));
  });

  return (
    <group ref={centered} rotation={[0, -Math.PI / 2, 0]}>
      {Array.from({ length: LEAF_COUNT }, (_, number) => (
        <Page
          key={number}
          number={number}
          front={MAGAZINE_PAGES[number * 2]}
          back={MAGAZINE_PAGES[number * 2 + 1]}
          page={animatedPage}
          opened={animatedPage > number}
          bookClosed={animatedPage === 0 || animatedPage === LEAF_COUNT}
          onTurn={onTurn}
        />
      ))}
    </group>
  );
}

export default function Scene({
  page,
  active,
  onTurn,
  onReady,
  onUnavailable,
}: SceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 6], zoom: 250, near: 0.1, far: 30 }}
      dpr={[1, 1.6]}
      frameloop={active ? "always" : "demand"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      fallback="Interactive magazine. Use the resource selector and arrow controls to browse, or Read a sample for larger pages."
      style={{ background: "transparent", touchAction: "pan-y" }}
    >
      <ResponsiveCamera />
      <ContextWatch onUnavailable={onUnavailable} />
      <ambientLight intensity={1.65} color="#fffaf4" />
      <directionalLight position={[-2, 5, 5]} intensity={1.7} color="#ffffff" />
      <directionalLight position={[4, 2, 3]} intensity={0.65} color="#f3f6ff" />
      <directionalLight
        position={[-3, 1, -2]}
        intensity={0.25}
        color="#fff1df"
      />
      <Suspense fallback={null}>
        <group rotation={[-0.55, 0, 0]}>
          <Book page={page} onTurn={onTurn} onReady={onReady} />
        </group>
      </Suspense>
      <ResponsiveControls />
    </Canvas>
  );
}
