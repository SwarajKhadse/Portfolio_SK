import React, {
  Component,
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
  Line,
  Sky,
  useGLTF,
} from "@react-three/drei";

import * as THREE from "three";

import GatePlatform from "./GatePlatform.jsx";

// Restore the original textured aircraft used in the earlier, better-looking render.
const AIRCRAFT_URL = "/models/aircraft.glb";

const HERO_AIRCRAFT_POSITION = new THREE.Vector3(-5.5, -0.405, 2.8);
// The original textured model points along local -Z; this yaw aligns it with the
// horizontal, left-to-right gate apron shown in the wireframe.
const HERO_AIRCRAFT_ROTATION_Y = -0.10;
// Step back enough to show the terminal, gates and apron around the aircraft.
const HERO_CAMERA = new THREE.Vector3(0, 7.1, 20.5);
const HERO_TARGET = new THREE.Vector3(0, 0.9, -3.2);

const STAGE_PROGRESS = {
  gate: 0.18,
  pushback: 0.27,
  taxi: 0.38,
  uTurn: 0.52,
  runway: 0.72,
  takeoff: 0.88,
};

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const LOCAL_PITCH_AXIS = new THREE.Vector3(0, 0, 1);
const LOCAL_FUSELAGE_AXIS = new THREE.Vector3(1, 0, 0);

function smoothWindow(value, start, end, feather = 0.025) {
  const enter = THREE.MathUtils.smoothstep(value, start, start + feather);
  const leave = 1 - THREE.MathUtils.smoothstep(value, end - feather, end);
  return enter * leave;
}

class AircraftErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error(
      "Airport aircraft model failed to load. The airport scene will remain visible.",
      error
    );
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function applyPrimaryLivery(child) {
  if (!child.material) return;

  const materials = Array.isArray(child.material)
    ? child.material
    : [child.material];

  materials.forEach((material) => {
    if (!material.color) return;

    // The preferred aircraft has a baked livery texture. Preserve it intact.
    if (material.map) {
      material.needsUpdate = true;
      return;
    }

    const name = `${material.name || ""} ${
      child.name || ""
    }`.toLowerCase();

    if (name.includes("bluestripe") || (child.name || "").toLowerCase().includes("bluestripe")) {
      material.color.set("#0879f9");
      material.roughness = 0.34;
      material.needsUpdate = true;
      return;
    }

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
      hsl.l >= 0.2 &&
      hsl.l <= 0.82;

    if (!isBlueLivery) return;

    material.color.set("#176cff");
    material.roughness = 0.3;

    if ("metalness" in material) {
      material.metalness = 0.04;
    }

    material.needsUpdate = true;
  });
}

function normalizeAircraft(source, targetLength = 8.2) {
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
        child.material.envMapIntensity = 1.05;
      }
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);

  const longest = Math.max(size.x, size.y, size.z);
  if (!longest || !Number.isFinite(longest)) return model;

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
   * The route is laid out in real scene space rather than passing through the gates:
   * gate apron → broad foreground U-turn → west-side taxiway → runway → climb.
   * The long return lane stays in front of the terminal, then turns outside the
   * west end of the concourse before aligning with the runway.
   */
  function createJourneyCurve() {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-5.5, -0.405, 2.8),
        new THREE.Vector3(-3.6, -0.405, 2.9),
        new THREE.Vector3(-1.2, -0.405, 2.95),
        new THREE.Vector3(1.4, -0.405, 2.9),
        new THREE.Vector3(4.1, -0.405, 2.85),
        new THREE.Vector3(6.4, -0.405, 2.75),
        new THREE.Vector3(8.5, -0.405, 2.65),
        new THREE.Vector3(9.6, -0.405, 3.1),
        new THREE.Vector3(10.35, -0.405, 4.1),
        new THREE.Vector3(10.6, -0.405, 5.4),
        new THREE.Vector3(10.1, -0.405, 6.7),
        new THREE.Vector3(8.9, -0.405, 7.65),
        new THREE.Vector3(7.2, -0.405, 8.2),
        new THREE.Vector3(4.8, -0.405, 8.35),
        new THREE.Vector3(1.8, -0.405, 8.35),
        new THREE.Vector3(-1.5, -0.405, 8.35),
        new THREE.Vector3(-4.8, -0.405, 8.35),
        new THREE.Vector3(-8.1, -0.405, 8.35),
        new THREE.Vector3(-11.2, -0.405, 8.15),
        new THREE.Vector3(-14.2, -0.405, 7.55),
        new THREE.Vector3(-16.8, -0.405, 6.4),
        new THREE.Vector3(-18.8, -0.405, 4.7),
        new THREE.Vector3(-20.1, -0.405, 2.5),
        new THREE.Vector3(-20.8, -0.405, 0.2),
        new THREE.Vector3(-21.0, -0.405, -2.5),
        new THREE.Vector3(-21.0, -0.405, -5.0),
        new THREE.Vector3(-21.0, -0.405, -7.5),
        new THREE.Vector3(-21.0, -0.405, -10.0),
        new THREE.Vector3(-21.0, -0.405, -12.5),
        new THREE.Vector3(-21.0, -0.405, -15.0),
        new THREE.Vector3(-21.0, -0.405, -17.5),
        new THREE.Vector3(-21.0, -0.405, -20.0),
        new THREE.Vector3(-21.0, -0.405, -22.0),
        new THREE.Vector3(-21.0, -0.39, -23.8),
        new THREE.Vector3(-20.9, -0.24, -25.2),
        new THREE.Vector3(-20.7, 0.12, -26.8),
        new THREE.Vector3(-20.4, 0.72, -28.5),
        new THREE.Vector3(-19.9, 1.58, -30.3),
        new THREE.Vector3(-19.2, 2.65, -32.2),
        new THREE.Vector3(-18.4, 3.85, -34.2),
      ],
      false,
      "catmullrom",
      0.16
    );
  }

function getJourneyProgress(scrollPositionRef, journeyRef) {
  const section = journeyRef?.current;
  if (!section) return 0;

  const scroll = scrollPositionRef?.current ?? window.scrollY ?? 0;
  const sectionTop = section.getBoundingClientRect().top + scroll;

  const scrollDistance = Math.max(
    1,
    section.offsetHeight - window.innerHeight
  );

  return THREE.MathUtils.clamp(
    (scroll - sectionTop) / scrollDistance,
    0,
    1
  );
}

function getTravelProgress(pageProgress) {
  return THREE.MathUtils.clamp(
    (pageProgress - 0.12) / 0.88,
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
    () => normalizeAircraft(scene, 7.7),
    [scene]
  );


  const point = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const yawQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const pitchQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const bankQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const desiredQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const rotationOffset = useMemo(() => {
    const start = journeyCurve.getPointAt(0);
    const next = journeyCurve.getPointAt(0.008);
    const initialDirection = new THREE.Vector3().subVectors(next, start).normalize();
    const initialHeading = Math.atan2(-initialDirection.z, initialDirection.x);
    return HERO_AIRCRAFT_ROTATION_Y - initialHeading;
  }, [journeyCurve]);

  useFrame((state, delta) => {
    const aircraft = aircraftRef.current;
    if (!aircraft) return;

    const pageProgress = getJourneyProgress(
      scrollPositionRef,
      journeyRef
    );

    const travelProgress = getTravelProgress(pageProgress);


    // Arc-length progress keeps aircraft movement proportional to scroll.
    journeyCurve.getPointAt(travelProgress, point);

    journeyCurve.getPointAt(
      Math.min(1, travelProgress + 0.008),
      ahead
    );

    direction.subVectors(ahead, point).normalize();

    const curveYaw = Math.atan2(-direction.z, direction.x);

    // A subtle bank only during the two actual turns: the gate-end U-turn and
    // the west-side alignment onto the runway. Straight taxiing stays level.
    const gateTurn = smoothWindow(travelProgress, 0.15, 0.27);
    const runwayTurn = smoothWindow(travelProgress, 0.49, 0.62);
    const bank = Math.max(gateTurn, runwayTurn) * 0.022;

    // Aircraft pitch follows the 3D route tangent. The extra pitch is introduced
    // only as the aircraft reaches the runway's rotation point.
    const horizontalSpeed = Math.max(0.0001, Math.hypot(direction.x, direction.z));
    const routePitch = Math.atan2(direction.y, horizontalSpeed);
    const rotationProgress = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp((travelProgress - 0.865) / 0.09, 0, 1),
      0,
      1
    );
    const pitch = routePitch + rotationProgress * 0.035;

    const subtleBob = Math.sin(state.clock.elapsedTime * 1.25) * 0.0012;
    desiredPosition.set(point.x, point.y + subtleBob, point.z);

    const positionDamping = 1 - Math.exp(-10 * Math.max(delta, 0.001));
    aircraft.position.lerp(desiredPosition, positionDamping);

    // This GLB's fuselage runs along local +X. Compose yaw, local pitch and
    // local-axis bank so the nose follows the taxi path instead of turning sideways.
    const desiredYaw = curveYaw + rotationOffset;
    yawQuaternion.setFromAxisAngle(WORLD_UP, desiredYaw);
    pitchQuaternion.setFromAxisAngle(LOCAL_PITCH_AXIS, pitch);
    bankQuaternion.setFromAxisAngle(LOCAL_FUSELAGE_AXIS, bank);
    desiredQuaternion.copy(yawQuaternion)
      .multiply(pitchQuaternion)
      .multiply(bankQuaternion);
    aircraft.quaternion.slerp(
      desiredQuaternion,
      1 - Math.exp(-7 * Math.max(delta, 0.001))
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

const CAMERA_KEYFRAMES = [
  // angle 2: low side view, close enough to read the aircraft but not crop its wings.
  { progress: 0.18, side: 8.8, height: 2.7, behind: 4.1, lead: 0.6, aimY: 0.0, fov: 43 },
  // angle 3: pull back to reveal the gate row, apron and taxi markings together.
  { progress: 0.38, side: 10.1, height: 4.1, behind: 5.0, lead: 0.8, aimY: 0.05, fov: 45 },
  // angle 4: wide, elevated view of the full turn; keep the target close to the aircraft.
  { progress: 0.52, side: 10.5, height: 5.8, behind: 5.8, lead: 3.1, aimY: 0.1, fov: 48 },
  // angle 5: elevated three-quarter shot that includes the route and runway entrance.
  { progress: 0.67, side: 6.8, height: 5.0, behind: 5.5, lead: 2.0, aimY: 0.18, fov: 46 },
  // runway alignment: lower and tighten the frame without pushing the aircraft out of view.
  { progress: 0.78, side: 2.7, height: 3.0, behind: 8.4, lead: 3.5, aimY: 0.25, fov: 42 },
  // takeoff: transition into a genuine rear-follow composition with sky above the aircraft.
  { progress: 0.88, side: 0.15, height: 3.0, behind: 9.8, lead: 4.4, aimY: 0.45, fov: 42 },
  { progress: 1.0, side: 0.15, height: 4.0, behind: 12.4, lead: 5.2, aimY: 0.9, fov: 43 },
];

function copyCameraConfig(source, output) {
  output.progress = source.progress;
  output.side = source.side;
  output.height = source.height;
  output.behind = source.behind;
  output.lead = source.lead;
  output.aimY = source.aimY;
  output.fov = source.fov;
  return output;
}

function interpolateCameraConfig(progress, output) {
  if (progress <= CAMERA_KEYFRAMES[0].progress) {
    return copyCameraConfig(CAMERA_KEYFRAMES[0], output);
  }

  for (let index = 0; index < CAMERA_KEYFRAMES.length - 1; index += 1) {
    const start = CAMERA_KEYFRAMES[index];
    const end = CAMERA_KEYFRAMES[index + 1];

    if (progress <= end.progress) {
      const amount = THREE.MathUtils.smoothstep(
        (progress - start.progress) / (end.progress - start.progress),
        0,
        1
      );

      output.progress = progress;
      ["side", "height", "behind", "lead", "aimY", "fov"].forEach((key) => {
        output[key] = THREE.MathUtils.lerp(start[key], end[key], amount);
      });
      return output;
    }
  }

  return copyCameraConfig(CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1], output);
}

function JourneyCamera({ scrollPositionRef, journeyRef, journeyCurve }) {
  const { size } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const currentPosition = useRef(HERO_CAMERA.clone());
  const currentTarget = useRef(HERO_TARGET.clone());

  const aircraftPoint = useMemo(() => new THREE.Vector3(), []);
  const aircraftAhead = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const candidateSide = useMemo(() => new THREE.Vector3(), []);
  const cameraSide = useRef(new THREE.Vector3(0, 0, 1));
  const desired = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAhead = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const rig = useMemo(() => ({
    progress: 0.12,
    side: 4.3,
    height: 2.7,
    behind: 5.4,
    lead: 2.4,
    aimY: 0.24,
    fov: 32,
  }), []);

  useEffect(() => {
    const onMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(({ camera }, delta) => {
    const pageProgress = getJourneyProgress(scrollPositionRef, journeyRef);
    const travelProgress = getTravelProgress(pageProgress);
    const mobile = size.width < 720;

    journeyCurve.getPointAt(travelProgress, aircraftPoint);
    journeyCurve.getPointAt(Math.min(1, travelProgress + 0.012), aircraftAhead);
    tangent.subVectors(aircraftAhead, aircraftPoint).normalize();
    right.crossVectors(tangent, up).normalize();

    // Keep the camera on the same physical side of the path. A raw cross-product
    // flips sign on a U-turn; choosing the nearest orientation prevents the camera
    // from crossing through the terminal or suddenly jumping to the opposite side.
    if (right.lengthSq() > 0.0001) {
      candidateSide.copy(right);
      if (candidateSide.dot(cameraSide.current) < 0) candidateSide.negate();
      const sideDamping = 1 - Math.exp(-5.5 * Math.max(delta, 0.001));
      cameraSide.current.lerp(candidateSide, sideDamping).normalize();
    }

    if (pageProgress <= STAGE_PROGRESS.gate) {
      desired.copy(HERO_CAMERA);
      if (mobile) {
        desired.z += 6.5;
        desired.y += 1.8;
        desired.x += 0.3;
      } else {
        desired.x += mouse.current.x * 0.035;
        desired.y -= mouse.current.y * 0.025;
      }
      target.copy(HERO_TARGET);
      camera.fov = THREE.MathUtils.lerp(camera.fov, mobile ? 51 : 48, 0.08);
    } else {
      interpolateCameraConfig(pageProgress, rig);

      const side = rig.side * (mobile ? 0.42 : 1);
      const behind = rig.behind + (mobile ? 1.8 : 0);
      const height = rig.height * (mobile ? 0.82 : 1);

      desired.copy(aircraftPoint)
        .addScaledVector(cameraSide.current, side)
        .addScaledVector(tangent, -behind);
      desired.y = aircraftPoint.y + height;

      lookAhead.copy(aircraftPoint).addScaledVector(tangent, rig.lead);
      lookAhead.y += rig.aimY;
      target.copy(lookAhead);

      // Blend the hero framing into the first camera move without a snap.
      const blend = THREE.MathUtils.smoothstep(
        (pageProgress - STAGE_PROGRESS.gate) / 0.065,
        0,
        1
      );
      if (blend < 1) {
        desired.lerpVectors(HERO_CAMERA, desired, blend);
        target.lerpVectors(HERO_TARGET, lookAhead, blend);
      }

      camera.fov = THREE.MathUtils.lerp(
        camera.fov,
        mobile ? Math.min(rig.fov + 3, 42) : rig.fov,
        0.1
      );
    }

    const positionDamping = 1 - Math.exp(-3.4 * Math.max(delta, 0.001));
    const targetDamping = 1 - Math.exp(-4.6 * Math.max(delta, 0.001));
    currentPosition.current.lerp(desired, positionDamping);
    currentTarget.current.lerp(target, targetDamping);
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentTarget.current);
    camera.updateProjectionMatrix();
  });

  return null;
}

function TaxiGuidance({ journeyCurve }) {
  const { points, arrows } = useMemo(() => {
    const route = [];
    const routeEnd = 0.86;
    for (let index = 0; index <= 100; index += 1) {
      const t = (index / 100) * routeEnd;
      const point = journeyCurve.getPointAt(t);
      point.y = -0.382;
      route.push(point);
    }

    // Small directional chevrons follow the horizontal taxi lane in the hero,
    // matching the arrows drawn in the wireframe without cluttering the runway.
    const arrowSets = [];
    for (let index = 0; index < 8; index += 1) {
      const t = 0.025 + index * 0.022;
      const tip = journeyCurve.getPointAt(t);
      const next = journeyCurve.getPointAt(Math.min(1, t + 0.006));
      const dx = next.x - tip.x;
      const dz = next.z - tip.z;
      const length = Math.max(0.001, Math.hypot(dx, dz));
      const fx = dx / length;
      const fz = dz / length;
      const size = 0.2;
      const wing = 0.13;
      const base = new THREE.Vector3(tip.x - fx * size, -0.379, tip.z - fz * size);
      const perp = new THREE.Vector3(-fz * wing, 0, fx * wing);
      const point = new THREE.Vector3(tip.x, -0.379, tip.z);
      arrowSets.push([
        [base.clone().add(perp), point],
        [base.clone().sub(perp), point],
      ]);
    }

    return { points: route, arrows: arrowSets };
  }, [journeyCurve]);

  return (
    <group renderOrder={4}>
      <Line points={points} color="#f5d36a" lineWidth={1.7} transparent opacity={0.38} />
      <Line points={points} color="#e7b934" lineWidth={1.0} transparent opacity={0.86} />
      {arrows.map((segments, index) => (
        <group key={index}>
          <Line points={segments[0]} color="#e7b934" lineWidth={1.4} transparent opacity={0.82} />
          <Line points={segments[1]} color="#e7b934" lineWidth={1.4} transparent opacity={0.82} />
        </group>
      ))}
    </group>
  );
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
      <color attach="background" args={["#91cfff"]} />
      <fog attach="fog" args={["#bfdef2", 36, 96]} />

      <Sky
        distance={450000}
        sunPosition={[18, 24, 12]}
        turbidity={1.35}
        rayleigh={1.1}
        mieCoefficient={0.004}
        mieDirectionalG={0.76}
      />

      <hemisphereLight
        args={["#eaf8ff", "#6689a8", 1.0]}
      />

      <ambientLight intensity={0.38} />

      <directionalLight
        position={[-14, 10, 12]}
        intensity={2.35}
        color="#fff4e5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
      />

      <directionalLight
        position={[10, 7, -6]}
        intensity={0.48}
        color="#acdfff"
      />

      <GatePlatform />
      <TaxiGuidance journeyCurve={journeyCurve} />

      <AircraftErrorBoundary>
        <Suspense fallback={null}>
          <JourneyAircraft
            scrollPositionRef={scrollPositionRef}
            journeyRef={journeyRef}
            journeyCurve={journeyCurve}
          />
        </Suspense>
      </AircraftErrorBoundary>

      <ContactShadows
        position={[0, -0.415, -0.2]}
        scale={24}
        opacity={0.34}
        blur={2.5}
        far={12}
        resolution={1024}
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
        fov: 48,
        near: 0.1,
        far: 140,
      }}
      dpr={[1, 1.5]}
      shadows
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.92,
      }}
      fallback={
        <div className="journey-canvas-fallback">
          <span>
            Enable WebGL or hardware acceleration to view the
            3D airport journey.
          </span>
        </div>
      }
    >
      <AirportJourneyScene
        scrollPositionRef={scrollPositionRef}
        journeyRef={journeyRef}
      />
    </Canvas>
  );
}

useGLTF.preload(AIRCRAFT_URL);