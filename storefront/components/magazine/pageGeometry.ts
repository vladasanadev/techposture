/**
 * Adapted for the Vladasana end product from 3D Magazine by David McBacon.
 * Source and Limited Commercial License details: docs/MAGAZINE.md.
 */
import {
  BoxGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  Vector3,
} from "three";

export const PAGE_WIDTH = 0.98;
export const PAGE_HEIGHT = 1.386;
export const PAGE_DEPTH = 0.007;
export const PAGE_SEGMENTS = 30;
export const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

export function createPageGeometry() {
  const geometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENTS,
    2,
  );
  geometry.translate(PAGE_WIDTH / 2, 0, 0);
  const position = geometry.attributes.position;
  const vertex = new Vector3();
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];

  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    // Clamp the terminal vertex so both referenced bones exist.
    const positionInSegments = Math.max(
      0,
      Math.min(PAGE_SEGMENTS, vertex.x / SEGMENT_WIDTH),
    );
    const skinIndex = Math.min(
      PAGE_SEGMENTS - 1,
      Math.floor(positionInSegments),
    );
    const skinWeight = positionInSegments - skinIndex;
    skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4),
  );
  return geometry;
}
