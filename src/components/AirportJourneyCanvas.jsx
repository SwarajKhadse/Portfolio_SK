import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  ContactShadows,
  Environment,
  Sky,
  useGLTF,
} from "@react-three/drei";

import * as THREE from "three";

import GatePlatform from "./GatePlatform.jsx";

const AIRCRAFT_URL = "/models/aircraft.glb";

const HERO_AIRCRAFT_POSITION = new THREE.Vector3(
  0,
  -0.405,
  -0.25
);

const HERO_AIRCRAFT_ROTATION_Y = -0.92;

const HERO_CAMERA = new THREE.Vector3(
  4.65,
  1.38,
  8.8
);

const HERO_TARGET = new THREE.Vector3(
  0,
  0.15,
  -0.45
);

function applyPrimaryLivery(child) {
  if (!child.material) return;

  const materials = Array.isArray(child.material)
    ? child.material
    : [child.material];

  materials.forEach((material) => {
    if (!material.color) return;

    const name = `${material.name || ""} ${child.name || ""}`.toLowerCase();

    if (
      name.includes("window") ||
      name.includes("glass") ||
      name.includes("windshield") ||
      name.includes("cockpit") ||
      material.transparent
    ) {
      return;
    }

    const hsl = {};
    material.color.getHSL(hsl);

    const isBlueLivery =
      hsl.h >= 0.47 &&
      hsl.h <= 0.72 &&
      hsl.s >= 0.28 &&
      hsl.l >= 0.20 &&
      hsl.l <= 0.82;

    if (!isBlueLivery) return;

    material.color.set("#2C3847");
    material.roughness = 0.30;

    if ("metalness" in material) {
      material.metalness = 0.04;
    }

    material.needsUpdate = true;
  });
}

function normalizeAircraft(source, targetLength = 6.7) {
  const model = source.clone(true);

  model.traverse((child) => {
    if (!child.isMesh) return;

    child.visible = true;
    child.castShadow = true;
    child.receiveShadow = true;
    applyPrimaryLivery(child);

    if (child.material) {
      child.material.needsUpdate = true;

      if ("envMapIntensity" in child.material) {
        child.material.envMapIntensity = 1.1;
      }
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  const longest = Math.max(size.x, size.y, size.z);

  if (!longest || !Number.isFinite(longest)) {
    return model;
  }

  const scale = targetLength / longest;

  model.scale.setScalar(scale);
  model.position.set(
    -center.x * scale,
    -center.y * scale,
    -center.z * scale
  );

  const grounded = new THREE.Box3().setFromObject(model);
  model.position.y -= grounded.min.y;

  return model;
}

/*
 * The route is deliberately aligned with the yellow airport taxi guidance
 * already present in GatePlatform.jsx.
 *
 * Gate → pushback → broad U-turn → taxiway → runway → takeoff → climb.
 */
function createJourneyCurve() {
  return new THREE.CatmullRomCurve3(
    [
      // Gate / pushback
      new THREE.Vector3(0.00, -0.405, -0.25),
      new THREE.Vector3(0.55, -0.405, 0.18),
      new THREE.Vector3(0.90, -0.405, -0.35),
      new THREE.Vector3(0.45, -0.405, -1.10),

      // Taxi toward the turn
      new THREE.Vector3(-0.35, -0.405, -2.00),
      new THREE.Vector3(-1.45, -0.405, -2.95),
      new THREE.Vector3(-2.60, -0.405, -3.75),

      // Broad, readable U-turn
      new THREE.Vector3(-3.15, -0.405, -4.55),
      new THREE.Vector3(-2.95, -0.405, -5.25),
      new THREE.Vector3(-2.35, -0.405, -5.85),
      new THREE.Vector3(-1.55, -0.405, -6.20),
      new THREE.Vector3(-1.15, -0.405, -6.45),

      // Straight taxiway / runway alignment
      new THREE.Vector3(-1.15, -0.405, -7.80),
      new THREE.Vector3(-1.15, -0.405, -9.50),
      new THREE.Vector3(-1.15, -0.405, -11.30),
      new THREE.Vector3(-1.15, -0.405, -13.20),

      // Runway acceleration
      new THREE.Vector3(-1.12, -0.39, -14.30),
      new THREE.Vector3(-1.08, -0.18, -15.35),

      // Takeoff / climb
      new THREE.Vector3(-1.00, 0.30, -16.50),
      new THREE.Vector3(-0.82, 1.05, -17.80),
      new THREE.Vector3(-0.55, 2.15, -19.25),
      new THREE.Vector3(-0.20, 3.30, -20.80),
      new THREE.Vector3(0.15, 4.45, -22.40),
    ],
    false,
    "catmullrom",
    0.18
  );
}

function getJourneyProgress(scrollPositionRef, journeyRef) {
  const section = journeyRef?.current;

  if (!section) {
    return 0;
  }

  const scroll =
    scrollPositionRef?.current ??
    window.scrollY ??
    0;

  const top =
    section.getBoundingClientRect().top +
    scroll;

  const distance = Math.max(
    1,
    section.offsetHeight - window.innerHeight
  );

  return THREE.MathUtils.clamp(
    (scroll - top) / distance,
    0,
    1
  );
}

function JourneyAircraft({
  scrollPositionRef,
  journeyRef,
  journeyCurve,
}) {
  const aircraftRef = useRef(null);
  const { scene } = useGLTF(AIRCRAFT_URL);

  const model = useMemo(
    () => normalizeAircraft(scene, 6.7),
    [scene]
  );

  const rotationOffset = useMemo(() => {
    const start = journeyCurve.getPointAt(0);
    const next = journeyCurve.getPointAt(0.008);

    const direction = new THREE.Vector3()
      .subVectors(next, start)
      .normalize();

    const curveYaw = Math.atan2(
      direction.x,
      -direction.z
    );

    return HERO_AIRCRAFT_ROTATION_Y - curveYaw;
  }, [journeyCurve]);

  const point = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const ahead = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const direction = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const desiredPosition = useMemo(
    () => new THREE.Vector3(),
    []
  );

  useFrame((state) => {
    const aircraft = aircraftRef.current;

    if (!aircraft) {
      return;
    }

    const pageProgress = getJourneyProgress(
      scrollPositionRef,
      journeyRef
    );

    /*
     * Keep the exact Gate composition for a moment after the splash.
     * The movement then starts gently so the user understands the scene
     * before the aircraft leaves the stand.
     */
    const travelProgress = THREE.MathUtils.clamp(
      (pageProgress - 0.055) / 0.945,
      0,
      1
    );

    const eased = THREE.MathUtils.smoothstep(
      travelProgress,
      0,
      1
    );

    journeyCurve.getPointAt(eased, point);
    journeyCurve.getPointAt(
      Math.min(1, eased + 0.008),
      ahead
    );

    direction
      .subVectors(ahead, point)
      .normalize();

    const curveYaw = Math.atan2(
      direction.x,
      -direction.z
    );

    /* Stronger nose-up motion only once the aircraft is properly airborne. */
    const pitchProgress = THREE.MathUtils.clamp(
      (eased - 0.84) / 0.16,
      0,
      1
    );

    const pitch = THREE.MathUtils.lerp(
      0,
      -0.20,
      THREE.MathUtils.smoothstep(
        pitchProgress,
        0,
        1
      )
    );

    const roll =
      Math.sin(eased * Math.PI) * -0.018;

    const bob =
      Math.sin(state.clock.elapsedTime * 1.25) *
      0.0018;

    desiredPosition.set(
      point.x,
      point.y + bob,
      point.z
    );

    aircraft.position.lerp(
      desiredPosition,
      0.16
    );

    aircraft.rotation.x = THREE.MathUtils.lerp(
      aircraft.rotation.x,
      pitch,
      0.11
    );

    aircraft.rotation.y = THREE.MathUtils.lerp(
      aircraft.rotation.y,
      curveYaw + rotationOffset,
      0.12
    );

    aircraft.rotation.z = THREE.MathUtils.lerp(
      aircraft.rotation.z,
      roll,
      0.10
    );
  });

  return (
    <group
      ref={aircraftRef}
      position={HERO_AIRCRAFT_POSITION}
      rotation={[0, HERO_AIRCRAFT_ROTATION_Y, 0]}
    >
      <primitive object={model} />
    </group>
  );
}

function JourneyCamera({
  scrollPositionRef,
  journeyRef,
  journeyCurve,
}) {
  const { size } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const current = useRef(HERO_CAMERA.clone());

  const aircraftPoint = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const aircraftAhead = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const tangent = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const target = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const desired = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const behindOffset = useMemo(
    () => new THREE.Vector3(),
    []
  );

  useEffect(() => {
    const onMove = (event) => {
      mouse.current.x =
        (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y =
        (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", onMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useFrame(({ camera }) => {
    const pageProgress = getJourneyProgress(
      scrollPositionRef,
      journeyRef
    );

    const mobile = size.width < 720;

    const travelProgress = THREE.MathUtils.clamp(
      (pageProgress - 0.055) / 0.945,
      0,
      1
    );

    journeyCurve.getPointAt(
      travelProgress,
      aircraftPoint
    );

    journeyCurve.getPointAt(
      Math.min(1, travelProgress + 0.01),
      aircraftAhead
    );

    tangent
      .subVectors(aircraftAhead, aircraftPoint)
      .normalize();

    /*
     * 01 Gate — stay close to the proven hero composition.
     */
    if (pageProgress < 0.14) {
      desired.copy(HERO_CAMERA);

      if (!mobile) {
        desired.x += mouse.current.x * 0.08;
        desired.y -= mouse.current.y * 0.04;
      }

      target.copy(HERO_TARGET);
    }
    /*
     * 02 Pushback / taxi — camera follows from behind so the aircraft
     * stays readable instead of disappearing behind the terminal.
     */
    else if (pageProgress < 0.50) {
      const p = THREE.MathUtils.smoothstep(
        (pageProgress - 0.14) / 0.36,
        0,
        1
      );

      const followCamera = new THREE.Vector3(
        5.8,
        3.6,
        8.6
      );

      desired.lerpVectors(
        HERO_CAMERA,
        followCamera,
        p
      );

      target.copy(aircraftPoint);
      target.y += 0.15;
      target.addScaledVector(tangent, 2.8);
    }
    /*
     * 03 Broad U-turn — widen dramatically so the full curve becomes
     * the visual story and the yellow taxi guidance can be read.
     */
    else if (pageProgress < 0.68) {
      const p = THREE.MathUtils.smoothstep(
        (pageProgress - 0.50) / 0.18,
        0,
        1
      );

      const wideCamera = new THREE.Vector3(
        7.2,
        5.6,
        4.6
      );

      desired.lerpVectors(
        new THREE.Vector3(5.8, 3.6, 8.6),
        wideCamera,
        p
      );

      target.copy(aircraftPoint);
      target.y = 0.0;
      target.z -= 1.2;
    }
    /*
     * 04 Runway — move toward a low, centered runway view.
     */
    else if (pageProgress < 0.84) {
      const p = THREE.MathUtils.smoothstep(
        (pageProgress - 0.68) / 0.16,
        0,
        1
      );

      const runwayCamera = new THREE.Vector3(
        3.2,
        2.8,
        3.2
      );

      desired.lerpVectors(
        new THREE.Vector3(7.2, 5.6, 4.6),
        runwayCamera,
        p
      );

      target.copy(aircraftPoint);
      target.y = 0.1;
      target.addScaledVector(tangent, 4.5);
    }
    /*
     * 05 Takeoff / in flight — camera rises and pulls away while looking
     * ahead so the climb reads as one cinematic movement.
     */
    else {
      const p = THREE.MathUtils.smoothstep(
        (pageProgress - 0.84) / 0.16,
        0,
        1
      );

      const flightCamera = new THREE.Vector3(
        5.0,
        5.0,
        -5.2
      );

      desired.lerpVectors(
        new THREE.Vector3(3.2, 2.8, 3.2),
        flightCamera,
        p
      );

      target.copy(aircraftPoint);
      target.y += 0.9;
      target.addScaledVector(tangent, 5.0);
    }

    /* Slight mobile simplification keeps the aircraft centered. */
    if (mobile && pageProgress > 0.14) {
      desired.x *= 0.82;
      desired.z += 1.2;
    }

    current.current.lerp(desired, 0.075);
    camera.position.copy(current.current);
    camera.lookAt(target);

    const wantedFov = mobile ? 36 : 31;
    camera.fov = THREE.MathUtils.lerp(
      camera.fov,
      wantedFov,
      0.08
    );
    camera.updateProjectionMatrix();
  });

  return null;
}

function AirportJourneyScene({
  scrollPositionRef,
  journeyRef,
}) {
  const journeyCurve = useMemo(
    () => createJourneyCurve(),
    []
  );

  return (
    <>
      <color
        attach="background"
        args={["#d4e2e8"]}
      />

      <fog
        attach="fog"
        args={["#d9e6ec", 22, 62]}
      />

      <Sky
        distance={450000}
        sunPosition={[-15, 4, -18]}
        turbidity={2.4}
        rayleigh={0.82}
        mieCoefficient={0.008}
        mieDirectionalG={0.82}
      />

      <hemisphereLight
        args={["#f7fbff", "#59666c", 0.85]}
      />

      <ambientLight intensity={0.20} />

      <directionalLight
        position={[-14, 10, 12]}
        intensity={3.0}
        color="#ffddb8"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
      />

      <directionalLight
        position={[10, 7, -6]}
        intensity={0.40}
        color="#d8edf5"
      />

      <GatePlatform />

      <Suspense fallback={null}>
        <JourneyAircraft
          scrollPositionRef={scrollPositionRef}
          journeyRef={journeyRef}
          journeyCurve={journeyCurve}
        />
      </Suspense>

      <ContactShadows
        position={[0, -0.415, -0.2]}
        scale={24}
        opacity={0.34}
        blur={2.5}
        far={12}
        resolution={1024}
      />

      <Environment
        preset="sunset"
        environmentIntensity={0.22}
      />

      <JourneyCamera
        scrollPositionRef={scrollPositionRef}
        journeyRef={journeyRef}
        journeyCurve={journeyCurve}
      />
    </>
  );
}

export default function AirportJourneyCanvas({
  scrollPositionRef,
  journeyRef,
}) {
  return (
    <Canvas
      className="journey-canvas"
      camera={{
        position: [
          HERO_CAMERA.x,
          HERO_CAMERA.y,
          HERO_CAMERA.z,
        ],
        fov: 31,
        near: 0.1,
        far: 140,
      }}
      dpr={[1, 1.5]}
      shadows
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
      }}
    >
      <AirportJourneyScene
        scrollPositionRef={scrollPositionRef}
        journeyRef={journeyRef}
      />
    </Canvas>
  );
}

useGLTF.preload(AIRCRAFT_URL);
