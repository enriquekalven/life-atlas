import React, { useLayoutEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface SafeHtml3DProps {
  position?: [number, number, number] | THREE.Vector3;
  center?: boolean;
  occlude?: boolean;
  zIndexRange?: [number, number];
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

/**
 * React 19 + @react-three/fiber safe 3D HTML callout projection overlay.
 *
 * Replaces @react-three/drei's `<Html>`, whose internal `target.removeChild(el)`
 * and shared `useState(document.createElement)` collide with React 19 StrictMode
 * and Canvas teardown (`NotFoundError: Failed to execute 'removeChild' on 'Node'`).
 */
export const SafeHtml3D: React.FC<SafeHtml3DProps> = ({
  position = [0, 0, 0],
  center = false,
  occlude = false,
  zIndexRange = [15, 0],
  style,
  className,
  children,
}) => {
  const { gl, camera, size } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const domRootRef = useRef<Root | null>(null);
  const worldPos = useRef(new THREE.Vector3());
  const projected = useRef(new THREE.Vector3());
  const toCam = useRef(new THREE.Vector3());

  // Create & attach a fresh DOM node per mount; safely detach via Element.remove()
  useLayoutEffect(() => {
    const host = gl.domElement.parentElement;
    if (!host) return;

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.transformOrigin = '0 0';
    container.style.pointerEvents = 'none';
    container.style.willChange = 'transform';

    host.appendChild(container);
    const root = createRoot(container);
    containerRef.current = container;
    domRootRef.current = root;

    return () => {
      if (containerRef.current === container) {
        containerRef.current = null;
      }
      if (domRootRef.current === root) {
        domRootRef.current = null;
      }
      // Element.remove() is idempotent and never throws if host was already torn down
      container.remove();
      queueMicrotask(() => {
        try {
          root.unmount();
        } catch {
          // Ignore unmount race if document already closed
        }
      });
    };
  }, [gl]);

  // Sync React children into the detached DOM root
  useLayoutEffect(() => {
    const root = domRootRef.current;
    if (!root) return;
    root.render(
      <div
        className={className}
        style={{
          position: 'absolute',
          transform: center ? 'translate3d(-50%, -50%, 0)' : 'none',
          pointerEvents: 'auto',
          ...style,
        }}
      >
        {children}
      </div>
    );
  });

  useFrame(() => {
    const group = groupRef.current;
    const container = containerRef.current;
    if (!group || !container) return;

    group.updateWorldMatrix(true, false);
    worldPos.current.setFromMatrixPosition(group.matrixWorld);

    // Check if behind camera
    projected.current.copy(worldPos.current).project(camera);
    let isVisible = projected.current.z <= 1;

    // Optional origin-sphere front-hemisphere check (used for 3D Globe pins)
    if (isVisible && occlude) {
      toCam.current.copy(camera.position).sub(worldPos.current);
      if (worldPos.current.dot(toCam.current) < -0.15) {
        isVisible = false;
      }
    }

    container.style.display = isVisible ? 'block' : 'none';
    if (!isVisible) return;

    const x = (projected.current.x * 0.5 + 0.5) * size.width;
    const y = (-projected.current.y * 0.5 + 0.5) * size.height;
    container.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

    const [maxZ, minZ] = zIndexRange;
    const dist = camera.position.distanceTo(worldPos.current);
    const t = THREE.MathUtils.clamp(
      (dist - camera.near) / Math.max(0.001, camera.far - camera.near),
      0,
      1
    );
    const zIdx = Math.round(maxZ - t * (maxZ - minZ));
    container.style.zIndex = String(zIdx);
  });

  return <group ref={groupRef} position={position} />;
};
