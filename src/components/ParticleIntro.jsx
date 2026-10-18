import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

// Keep the original, textured aircraft that gave the earlier intro its best silhouette.
const AIRCRAFT_URL = "/models/aircraft.glb";

function prepareAircraft(source) {
  const model = source.clone(true);
  const animatedMaterials = [];

  model.traverse((child) => {
    if (!child.isMesh) return;

    child.castShadow = true;
    child.receiveShadow = true;

    const cloneForReveal = (material) => {
      const clone = material.clone();
      clone.transparent = true;
      clone.opacity = 0;
      clone.depthWrite = false;
      clone.needsUpdate = true;
      animatedMaterials.push(clone);
      return clone;
    };

    child.material = Array.isArray(child.material)
      ? child.material.map(cloneForReveal)
      : cloneForReveal(child.material);
  });

  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  const longestSide = Math.max(size.x, size.y, size.z) || 1;
  const scale = 3.55 / longestSide;

  model.scale.setScalar(scale);
  model.position.set(
    -center.x * scale,
    -center.y * scale,
    -center.z * scale
  );

  return { model, animatedMaterials };
}

export default function ParticleIntro({ phase = "splash" }) {
  const aircraftGroupRef = useRef(null);
  const progressRef = useRef({ value: 0 });
  const reducedMotionRef = useRef(false);

  const { scene } = useGLTF(AIRCRAFT_URL);
  const aircraft = useMemo(() => prepareAircraft(scene), [scene]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = query.matches;

    const onChange = (event) => {
      reducedMotionRef.current = event.matches;
    };

    query.addEventListener?.("change", onChange);
    return () => query.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (phase !== "forming-plane") return undefined;

    if (reducedMotionRef.current) {
      progressRef.current.value = 1;
      return undefined;
    }

    const tween = gsap.to(progressRef.current, {
      value: 1,
      duration: 2.15,
      ease: "power3.inOut",
    });

    return () => tween.kill();
  }, [phase]);

  useEffect(() => () => {
    aircraft.animatedMaterials.forEach((material) => material.dispose());
  }, [aircraft]);

  useFrame(({ clock }) => {
    const amount = THREE.MathUtils.clamp(progressRef.current.value, 0, 1);
    const reveal = THREE.MathUtils.smoothstep(amount, 0.02, 0.9);
    const time = reducedMotionRef.current ? 0 : clock.elapsedTime;

    if (aircraftGroupRef.current) {
      aircraftGroupRef.current.scale.setScalar(0.025 + reveal * 0.975);
      aircraftGroupRef.current.position.set(
        -0.25 + reveal * 0.48,
        0.18 + Math.sin(time * 0.5) * 0.012,
        0
      );
      aircraftGroupRef.current.rotation.set(
        Math.sin(time * 0.25) * 0.004,
        -0.34 + Math.sin(time * 0.18) * 0.008,
        Math.sin(time * 0.3) * 0.004
      );
    }

    aircraft.animatedMaterials.forEach((material) => {
      material.opacity = reveal;
      material.depthWrite = reveal > 0.98;
    });
  });

  return (
    <>
      <hemisphereLight args={["#ffffff", "#204c9e", 1.2]} />
      <ambientLight intensity={0.38} />
      <directionalLight position={[3.5, 4.5, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, 1.5, -3]} intensity={1.2} color="#67c7ff" />
      <pointLight position={[-1.5, 2, 3]} intensity={0.45} color="#ff9c78" />

      {/* Aircraft only: no unrelated 3D orb or sphere reveal. */}
      <group ref={aircraftGroupRef} scale={0.025} rotation={[0, -0.34, 0]}>
        <primitive object={aircraft.model} />
      </group>
    </>
  );
}

useGLTF.preload(AIRCRAFT_URL);
