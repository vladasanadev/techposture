"use client";

/**
 * Actual skeletal page-turn adaptation of David McBacon's Framer 3D Magazine.
 * Copyright remains with its creator; see docs/MAGAZINE.md for provenance.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { easing } from "maath";
import {
  Bone,
  BoxGeometry,
  Group,
  MathUtils,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
} from "three";
import {
  createPageGeometry,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  SEGMENT_WIDTH,
} from "./pageGeometry";
import type { MagazinePage } from "./data";

type PageProps = {
  number: number;
  front: MagazinePage;
  back: MagazinePage;
  page: number;
  opened: boolean;
  bookClosed: boolean;
  onTurn: (page: number) => void;
};

export default function Page({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  onTurn,
}: PageProps) {
  const textures = useTexture([front.src, back.src]);
  const group = useRef<Group>(null);
  const meshRef =
    useRef<
      SkinnedMesh<BoxGeometry, (MeshStandardMaterial | MeshBasicMaterial)[]>
    >(null);
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
  const initialOpened = useRef(opened);
  const [hovered, setHovered] = useState(false);

  const mesh = useMemo(() => {
    const pageTextures = textures.map((source) => {
      const texture = source.clone();
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 4;
      return texture;
    });
    const bones: Bone[] = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i += 1) {
      const bone = new Bone();
      bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
      bones.push(bone);
      if (i > 0) bones[i - 1].add(bone);
    }
    const skeleton = new Skeleton(bones);
    const materials = [
      new MeshStandardMaterial({ color: "#fff8e9", roughness: 0.86 }),
      new MeshStandardMaterial({ color: "#a42c35", roughness: 0.7 }),
      new MeshStandardMaterial({ color: "#fff8e9", roughness: 0.86 }),
      new MeshStandardMaterial({ color: "#fff8e9", roughness: 0.86 }),
      new MeshBasicMaterial({
        color: "white",
        map: pageTextures[0],
        toneMapped: false,
      }),
      new MeshBasicMaterial({
        color: "white",
        map: pageTextures[1],
        toneMapped: false,
      }),
    ];
    const result = new SkinnedMesh(createPageGeometry(), materials);
    result.castShadow = true;
    result.receiveShadow = true;
    result.frustumCulled = false;
    result.add(skeleton.bones[0]);
    result.bind(skeleton);
    return result;
  }, [textures]);

  useLayoutEffect(() => {
    const currentMesh = meshRef.current;
    if (!group.current || !currentMesh) return;
    const angle =
      (initialOpened.current ? -Math.PI / 2 : Math.PI / 2) +
      MathUtils.degToRad(number * 0.12);
    group.current.rotation.y = angle;
    for (let i = 1; i < PAGE_SEGMENTS; i++) {
      const inside = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outside = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      currentMesh.skeleton.bones[i].rotation.y =
        0.009 * inside * angle - 0.004 * outside * angle;
    }
  }, [mesh, number]);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      mesh.skeleton.dispose();
      mesh.material[4].map?.dispose();
      mesh.material[5].map?.dispose();
      mesh.material.forEach((material) => material.dispose());
      // useTexture owns its shared texture cache; do not dispose those here.
    },
    [mesh],
  );

  useFrame((_, frameDelta) => {
    const currentMesh = meshRef.current;
    if (!group.current || !currentMesh) return;
    const delta = Math.min(frameDelta, 0.05);
    currentMesh.material[4].color.set(hovered ? "#fffdf9" : "white");
    currentMesh.material[5].color.set(hovered ? "#fffdf9" : "white");
    if (lastOpened.current !== opened) {
      turnedAt.current = performance.now();
      lastOpened.current = opened;
    }
    const turningProgress =
      Math.min(650, performance.now() - turnedAt.current) / 650;
    const turningCurve = Math.sin(turningProgress * Math.PI);
    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) targetRotation += MathUtils.degToRad(number * 0.12);
    const bones = currentMesh.skeleton.bones;

    for (let i = 0; i < PAGE_SEGMENTS; i += 1) {
      const target = i === 0 ? group.current : bones[i];
      const insideCurve = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurve = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin((i * Math.PI) / bones.length) * turningCurve;
      let rotation =
        i === 0
          ? targetRotation
          : 0.009 * insideCurve * targetRotation -
            0.004 * outsideCurve * targetRotation +
            0.12 * turningIntensity * targetRotation;
      let foldRotation = MathUtils.degToRad(Math.sign(targetRotation) * 2);
      if (bookClosed) {
        rotation = i === 0 ? targetRotation : 0;
        foldRotation = 0;
      }
      easing.dampAngle(target.rotation, "y", rotation, 0.35, delta);
      const foldIntensity =
        i > 8 ? Math.sin((i * Math.PI) / bones.length - 0.5) * turningCurve : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotation * foldIntensity,
        0.25,
        delta,
      );
    }
  });

  function turn(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    // R3F's click delta distinguishes a page tap from dragging the camera.
    if (event.delta > 5) return;
    onTurn(opened ? number : number + 1);
    setHovered(false);
  }

  return (
    <group
      ref={group}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onClick={turn}
    >
      <primitive
        object={mesh}
        ref={meshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
        dispose={null}
      />
    </group>
  );
}
