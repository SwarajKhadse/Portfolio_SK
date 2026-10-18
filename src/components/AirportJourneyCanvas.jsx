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
  Environment,
  Line,
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
const HERO_CAMERA = new THREE.Vector3(0, 6.5, 20.5);
// Aim slightly higher in the opening shot so the airport sits lower on screen
// and leaves breathing room beneath the headline; scrolling blends into the route camera.
const HERO_TARGET = new THREE.Vector3(0, 2.0, -3.2);

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
   * gate apron → long outbound taxi lane → circular turnaround → separate parallel
   * return lane → west-side taxi connector → runway approach and climb.
   */
  function createJourneyCurve() {
    // Boarding is complete before the page scroll starts the journey. The aircraft
    // taxis out along the apron, makes a broad 180-degree circular turnaround,
    // returns on a physically separate parallel lane, then curves onto the runway.
    const groundY = -0.405;
    const points = [
      new THREE.Vector3(-5.5, groundY, 2.8),
      new THREE.Vector3(-3.2, groundY, 2.85),
      new THREE.Vector3(-0.5, groundY, 2.9),
      new THREE.Vector3(2.3, groundY, 2.9),
      new THREE.Vector3(5.2, groundY, 2.85),
      new THREE.Vector3(8.5, groundY, 2.8),
    ];

    // Broad circular 180-degree turnaround. A 6.5-unit radius gives the
    // aircraft room to swing around instead of appearing to pivot in place.
    const loopCenterX = 8.5;
    const loopRadius = 6.5;
    const outboundZ = 2.8;
    const loopCenterZ = outboundZ + loopRadius;
    const loopSteps = 20;
    for (let step = 1; step <= loopSteps; step += 1) {
      const angle = (Math.PI * step) / loopSteps;
      points.push(
        new THREE.Vector3(
          loopCenterX + loopRadius * Math.sin(angle),
          groundY,
          loopCenterZ - loopRadius * Math.cos(angle)
        )
      );
    }

    // Separate return lane, 13 units from the outbound lane's centerline.
    // The extra separation avoids overlapping road edges and aircraft wings.
    const returnZ = outboundZ + loopRadius * 2;
    [5.0, 1.5, -2.0, -5.5, -9.0, -12.5, -15.0].forEach((x) => {
      points.push(new THREE.Vector3(x, groundY, returnZ));
    });

    // Wide west-side quarter-circle turns from the return lane into a dedicated
    // connector outside the terminal footprint. Its final tangent points down
    // the runway axis (-Z), so the plane does not cut across the terminal roof.
    const connectorTurnCenterX = -15.0;
    const connectorTurnCenterZ = loopCenterZ;
    const connectorTurnRadius = 6.5;
    const connectorTurnSteps = 14;
    for (let step = 1; step <= connectorTurnSteps; step += 1) {
      const angle = Math.PI / 2 + (Math.PI / 2) * (step / connectorTurnSteps);
      points.push(
        new THREE.Vector3(
          connectorTurnCenterX + connectorTurnRadius * Math.cos(angle),
          groundY,
          connectorTurnCenterZ + connectorTurnRadius * Math.sin(angle)
        )
      );
    }

    const runwayX = -21.5;
    // Approach to the runway threshold at z=-16.25. Hold the same x position
    // through alignment, rather than steering diagonally across the runway.
    [6.0, 2.0, -2.0, -6.0, -10.0, -14.0, -16.25].forEach((z) => {
      points.push(new THREE.Vector3(runwayX, groundY, z));
    });

    // Keep the aircraft on the runway for the full ground roll. It stays level
    // until the far runway end; the climb starts only after clearing the surface.
    [-20.0, -24.0, -28.0, -32.0, -36.0, -40.0, -44.0, -47.0, -49.5].forEach((z) => {
      points.push(new THREE.Vector3(runwayX, groundY, z));
    });

    // Straight, centered climb beyond the runway end. The aircraft follows the
    // same -Z runway heading, with no lateral drift toward/over the terminal.
    [
      [-51.0, -0.39],
      [-52.5, -0.32],
      [-54.0, -0.05],
      [-56.0, 0.45],
      [-58.0, 1.2],
      [-60.5, 2.3],
      [-63.0, 3.8],
      [-66.0, 5.8],
      [-70.0, 8.0],
      [-74.0, 10.6],
    ].forEach(([z, y]) => {
      points.push(new THREE.Vector3(runwayX, y, z));
    });

    return new THREE.CatmullRomCurve3(points, false, "centripetal", 0.16);
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
  // Keep the aircraft parked for the gate hero. Aircraft movement begins at
  // the exact same scroll threshold as the first camera/story hand-off.
  const start = STAGE_PROGRESS.gate;
  return THREE.MathUtils.clamp(
    (pageProgress - start) / (1 - start),
    0,
    1
  );
}

function getClosestCurveProgress(curve, target, samples = 1200) {
  const probe = new THREE.Vector3();
  let bestProgress = 0;
  let bestDistance = Infinity;

  for (let index = 0; index <= samples; index += 1) {
    const progress = index / samples;
    curve.getPointAt(progress, probe);
    const distance = probe.distanceToSquared(target);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestProgress = progress;
    }
  }

  return bestProgress;
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
  const behind = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const rotationRange = useMemo(() => {
    // Begin rotating near the end of the runway and finish the rotation point
    // just before the aircraft clears the pavement.
    const start = getClosestCurveProgress(
      journeyCurve,
      new THREE.Vector3(-21.5, -0.405, -44.0)
    );
    const end = getClosestCurveProgress(
      journeyCurve,
      new THREE.Vector3(-21.5, -0.405, -49.3)
    );
    return { start, end: Math.max(end, start + 0.001) };
  }, [journeyCurve]);
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

    const tangentWindow = 0.012;
    journeyCurve.getPointAt(Math.max(0, travelProgress - tangentWindow), behind);
    journeyCurve.getPointAt(Math.min(1, travelProgress + tangentWindow), ahead);
    direction.subVectors(ahead, behind).normalize();
    if (direction.lengthSq() < 0.000001) direction.set(1, 0, 0);

    const curveYaw = Math.atan2(-direction.z, direction.x);

    // A subtle bank only during the two actual turns: the gate-end U-turn and
    // the west-side alignment onto the runway. Straight taxiing stays level.
    const gateTurn = smoothWindow(travelProgress, 0.10, 0.26, 0.035);
    const runwayTurn = smoothWindow(travelProgress, 0.41, 0.52, 0.03);
    const bank = Math.max(gateTurn, runwayTurn) * 0.022;

    // Aircraft pitch follows the 3D route tangent. The extra pitch is introduced
    // only as the aircraft reaches the runway's rotation point.
    const horizontalSpeed = Math.max(0.0001, Math.hypot(direction.x, direction.z));
    const routePitch = Math.atan2(direction.y, horizontalSpeed);
    const rotationProgress = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp(
        (travelProgress - rotationRange.start) / (rotationRange.end - rotationRange.start),
        0,
        1
      ),
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
  // Side follow while taxiing away from the gate and around the circular loop.
  { progress: 0.18, side: 8.8, height: 4.0, behind: 5.5, lead: 0.6, aimY: 2.2, fov: 43 },
  { progress: 0.34, side: 10.1, height: 4.8, behind: 6.2, lead: 0.8, aimY: 2.3, fov: 45 },
  { progress: 0.48, side: 10.5, height: 6.2, behind: 6.0, lead: 3.1, aimY: 2.8, fov: 48 },
  // Keep the connector and runway entry in frame while the aircraft straightens.
  { progress: 0.67, side: 6.8, height: 5.2, behind: 5.5, lead: 2.0, aimY: 2.0, fov: 46 },
  { progress: 0.78, side: 2.7, height: 3.8, behind: 8.4, lead: 3.5, aimY: 1.1, fov: 43 },
  // Settle behind the aircraft before the rotation point; retain runway context.
  { progress: 0.84, side: 1.1, height: 3.7, behind: 9.4, lead: 4.2, aimY: 1.0, fov: 44 },
  { progress: 0.89, side: 0.18, height: 4.3, behind: 11.8, lead: 5.1, aimY: 1.1, fov: 45 },
  // Wider rear-follow framing prevents the aircraft from filling/cropping the screen.
  { progress: 0.95, side: 0.12, height: 5.2, behind: 14.5, lead: 6.4, aimY: 1.35, fov: 46 },
  { progress: 1.0, side: 0.12, height: 6.0, behind: 17.0, lead: 7.2, aimY: 1.6, fov: 47 },
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
  const aircraftBehind = useMemo(() => new THREE.Vector3(), []);
  const aircraftAhead = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const candidateSide = useMemo(() => new THREE.Vector3(), []);
  const cameraSide = useRef(new THREE.Vector3(0, 0, 1));
  const outerApronSide = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const desiredSide = useMemo(() => new THREE.Vector3(), []);
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
    const tangentWindow = 0.012;
    journeyCurve.getPointAt(Math.max(0, travelProgress - tangentWindow), aircraftBehind);
    journeyCurve.getPointAt(Math.min(1, travelProgress + tangentWindow), aircraftAhead);
    tangent.subVectors(aircraftAhead, aircraftBehind).normalize();
    if (tangent.lengthSq() < 0.000001) tangent.set(1, 0, 0);
    right.crossVectors(tangent, up).normalize();

    // Keep the camera on the open apron side while the aircraft passes the gates
    // and completes its U-turn. Only after the aircraft clears the terminal's west
    // end do we blend toward a tangent-relative side for runway/takeoff framing.
    if (right.lengthSq() > 0.0001) {
      candidateSide.copy(right);
      if (candidateSide.dot(outerApronSide) < 0) candidateSide.negate();

      const runwaySideBlend = THREE.MathUtils.smoothstep(
        (pageProgress - 0.78) / 0.12,
        0,
        1
      );
      desiredSide.copy(outerApronSide).lerp(candidateSide, runwaySideBlend).normalize();

      const sideDamping = 1 - Math.exp(-4.4 * Math.max(delta, 0.001));
      cameraSide.current.lerp(desiredSide, sideDamping).normalize();
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

function createTaxiwayAsphaltTexture() {
  if (typeof document === "undefined") return null;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = context.createImageData(size, size);
  let seed = 2309;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const broad = Math.sin((x / size) * Math.PI * 9) * 2.2
        + Math.cos((y / size) * Math.PI * 8) * 1.8
        + Math.sin(((x + y) / size) * Math.PI * 13) * 1.2;
      const grain = (random() - 0.5) * 17;
      const value = 48 + broad + grain;
      const index = (y * size + x) * 4;
      image.data[index] = Math.max(26, Math.min(76, value - 2));
      image.data[index + 1] = Math.max(27, Math.min(78, value));
      image.data[index + 2] = Math.max(32, Math.min(84, value + 5));
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  // A few low-contrast repairs add scale without making the lane look noisy.
  for (let i = 0; i < 14; i += 1) {
    const x = random() * size;
    const y = random() * size;
    const width = 26 + random() * 80;
    const height = 12 + random() * 28;
    context.fillStyle = random() > 0.5
      ? "rgba(118, 121, 129, 0.055)"
      : "rgba(12, 14, 20, 0.06)";
    context.fillRect(x, y, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function TaxiGuidance({ journeyCurve }) {
  const asphaltTexture = useMemo(() => createTaxiwayAsphaltTexture(), []);
  const { points, arrows, roadGeometry, edgeGeometries } = useMemo(() => {
    // Sample the painted route densely so both the asphalt strip and markings
    // flow as one road through the circular turnaround and the parallel lane.
    const route = [];
    const segmentCount = 280;
    const runwayThresholdZ = -16.25;
    const searchSteps = 1600;
    let routeEnd = 0.72;
    for (let sample = 1; sample <= searchSteps; sample += 1) {
      const t = sample / searchSteps;
      const point = journeyCurve.getPointAt(t);
      // Find the first point where the west-side connector reaches the runway
      // threshold, rather than drawing taxi-lane edge lines over the runway.
      if (point.z <= runwayThresholdZ && point.x < -18.0) {
        routeEnd = Math.min(1, t + 1.0 / journeyCurve.getLength());
        break;
      }
    }
    for (let index = 0; index <= segmentCount; index += 1) {
      const t = (index / segmentCount) * routeEnd;
      const point = journeyCurve.getPointAt(t);
      point.y = -0.402;
      route.push(point);
    }

    const roadHalfWidth = 2.45;
    const markingInset = 0.17;
    const leftEdge = [];
    const rightEdge = [];
    const roadPositions = [];
    const roadUvs = [];
    const roadIndices = [];

    route.forEach((point, index) => {
      const previous = route[Math.max(0, index - 1)];
      const next = route[Math.min(route.length - 1, index + 1)];
      const dx = next.x - previous.x;
      const dz = next.z - previous.z;
      const length = Math.max(0.001, Math.hypot(dx, dz));
      const normalX = -dz / length;
      const normalZ = dx / length;

      // The asphalt road sits only a few millimetres above the apron concrete.
      roadPositions.push(
        point.x + normalX * roadHalfWidth, -0.412, point.z + normalZ * roadHalfWidth,
        point.x - normalX * roadHalfWidth, -0.412, point.z - normalZ * roadHalfWidth
      );
      const v = (index / (route.length - 1)) * 14;
      roadUvs.push(0, v, 1, v);

      const lineOffset = roadHalfWidth - markingInset;
      leftEdge.push(new THREE.Vector3(
        point.x + normalX * lineOffset,
        -0.402,
        point.z + normalZ * lineOffset
      ));
      rightEdge.push(new THREE.Vector3(
        point.x - normalX * lineOffset,
        -0.402,
        point.z - normalZ * lineOffset
      ));

      if (index > 0) {
        const previousPair = (index - 1) * 2;
        const currentPair = index * 2;
        roadIndices.push(
          previousPair, previousPair + 1, currentPair,
          previousPair + 1, currentPair + 1, currentPair
        );
      }
    });

    const roadGeometry = new THREE.BufferGeometry();
    roadGeometry.setAttribute("position", new THREE.Float32BufferAttribute(roadPositions, 3));
    roadGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(roadUvs, 2));
    roadGeometry.setIndex(roadIndices);
    roadGeometry.computeVertexNormals();

    // Build the edge stripes as narrow strips in world space (not screen-space lines)
    // so their width stays consistent and the curved road remains clean at any camera angle.
    const makeStripeGeometry = (edgePoints, stripeWidth = 0.075) => {
      const positions = [];
      const indices = [];
      const halfStripe = stripeWidth / 2;

      edgePoints.forEach((point, index) => {
        const previous = edgePoints[Math.max(0, index - 1)];
        const next = edgePoints[Math.min(edgePoints.length - 1, index + 1)];
        const dx = next.x - previous.x;
        const dz = next.z - previous.z;
        const length = Math.max(0.001, Math.hypot(dx, dz));
        const normalX = -dz / length;
        const normalZ = dx / length;

        positions.push(
          point.x + normalX * halfStripe, -0.401, point.z + normalZ * halfStripe,
          point.x - normalX * halfStripe, -0.401, point.z - normalZ * halfStripe
        );

        if (index > 0) {
          const previousPair = (index - 1) * 2;
          const currentPair = index * 2;
          indices.push(
            previousPair, previousPair + 1, currentPair,
            previousPair + 1, currentPair + 1, currentPair
          );
        }
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    };

    const edgeGeometries = [makeStripeGeometry(leftEdge), makeStripeGeometry(rightEdge)];

    // Small yellow direction chevrons stay on the outbound lane only; fewer and
    // lighter arrows keep the road from feeling like a schematic overlay.
    const arrowSets = [];
    for (let index = 0; index < 6; index += 1) {
      const t = 0.035 + index * 0.026;
      const tip = journeyCurve.getPointAt(t);
      const next = journeyCurve.getPointAt(Math.min(1, t + 0.006));
      const dx = next.x - tip.x;
      const dz = next.z - tip.z;
      const length = Math.max(0.001, Math.hypot(dx, dz));
      const fx = dx / length;
      const fz = dz / length;
      tip.y = -0.400;
      const size = 0.16;
      const wing = 0.085;
      const base = new THREE.Vector3(tip.x - fx * size, -0.400, tip.z - fz * size);
      const perp = new THREE.Vector3(-fz * wing, 0, fx * wing);
      arrowSets.push([
        [base.clone().add(perp), tip.clone()],
        [base.clone().sub(perp), tip.clone()],
      ]);
    }

    return { points: route, arrows: arrowSets, roadGeometry, edgeGeometries };
  }, [journeyCurve]);

  useEffect(() => () => {
    roadGeometry.dispose();
    edgeGeometries.forEach((geometry) => geometry.dispose());
    asphaltTexture?.dispose();
  }, [roadGeometry, edgeGeometries, asphaltTexture]);

  return (
    <group>
      {/* Continuous charcoal pavement makes the taxi path feel like a physical road. */}
      <mesh geometry={roadGeometry} renderOrder={2} frustumCulled={false}>
        <meshStandardMaterial
          map={asphaltTexture || undefined}
          color="#ffffff"
          roughness={0.98}
          metalness={0}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Twin warm-white edge lines sit just inside the asphalt road boundaries. */}
      {edgeGeometries.map((geometry, index) => (
        <mesh
          key={`taxi-edge-${index}`}
          geometry={geometry}
          renderOrder={5}
          frustumCulled={false}
        >
          <meshBasicMaterial
            color="#f7f6f0"
            transparent
            opacity={0.94}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Taxiway center guidance stays amber and subtle. */}
      <Line points={points} color="#e7b934" lineWidth={1.2} transparent opacity={0.78} />
      {arrows.map((segments, index) => (
        <group key={`taxi-chevron-${index}`}>
          <Line points={segments[0]} color="#e7b934" lineWidth={1.1} transparent opacity={0.64} />
          <Line points={segments[1]} color="#e7b934" lineWidth={1.1} transparent opacity={0.64} />
        </group>
      ))}
    </group>
  );
}

function JourneyHeadlineBackdrop({ scrollPositionRef, journeyRef }) {
  const headlineRef = useRef(null);

  // Keep the outlined headline visible on the opening gate shot and fade it
  // away as the user scrolls into the taxi / U-turn sequence.
  useEffect(() => {
    let frame = 0;
    const updateOpacity = () => {
      const progress = getJourneyProgress(scrollPositionRef, journeyRef);
      const fade = THREE.MathUtils.smoothstep(progress, 0.025, 0.19);
      if (headlineRef.current) {
        headlineRef.current.style.opacity = String(0.7 * (1 - fade));
      }
      frame = window.requestAnimationFrame(updateOpacity);
    };

    updateOpacity();
    return () => window.cancelAnimationFrame(frame);
  }, [scrollPositionRef, journeyRef]);

  return (
    <svg
      ref={headlineRef}
      className="journey-headline-backdrop"
      aria-hidden="true"
      viewBox="0 0 1920 420"
      preserveAspectRatio="none"
      style={{
        opacity: 0.7,
        transition: "opacity 120ms linear",
        transform: "translateY(-20px)",
        willChange: "opacity, transform",
      }}
    >
      <defs>
        {/* Visible, translucent blue-grey fill inspired by the drone reference. The airport stays legible through the letters. */}
        <linearGradient id="headline-text-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d9e8f1" stopOpacity="0.64" />
          <stop offset="27%" stopColor="#b9d8ef" stopOpacity="0.56" />
          <stop offset="55%" stopColor="#94c4e8" stopOpacity="0.48" />
          <stop offset="78%" stopColor="#bedcf0" stopOpacity="0.53" />
          <stop offset="100%" stopColor="#edf6fc" stopOpacity="0.43" />
        </linearGradient>
        {/* Fade the whole headline vertically: crisp at the top, dissolving toward the bottom. */}
        <linearGradient id="headline-vertical-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="38%" stopColor="white" stopOpacity="1" />
          <stop offset="54%" stopColor="white" stopOpacity="0.72" />
          <stop offset="70%" stopColor="white" stopOpacity="0.28" />
          <stop offset="86%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="headline-outline-mask">
          <rect width="1920" height="420" fill="url(#headline-vertical-fade)" />
        </mask>
      </defs>
      <text
        x="960"
        y="310"
        textAnchor="middle"
        textLength="1770"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="Inter, Arial, Helvetica, sans-serif"
        fontSize="270"
        fontWeight="500"
        letterSpacing="-10"
        fill="url(#headline-text-gradient)"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeOpacity="0.96"
        mask="url(#headline-outline-mask)"
      >
        Ideas Take Flight
      </text>
    </svg>
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
      {/* Keep the renderer's clear pixels transparent. The CSS sky and headline
          sit behind this scene, so terminal geometry naturally masks the type. */}
      <fog attach="fog" args={["#c9e4f6", 36, 96]} />

      <hemisphereLight
        args={["#eaf8ff", "#6689a8", 0.82]}
      />

      <ambientLight intensity={0.24} />

      <directionalLight
        position={[-14, 10, 12]}
        intensity={2.15}
        color="#fff4e5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
      />

      <directionalLight
        position={[10, 7, -6]}
        intensity={0.56}
        color="#acdfff"
      />

      {/* Soft frontal sky fill lifts the curtain wall without flattening shadows. */}
      <directionalLight
        position={[7, 5, 10]}
        intensity={0.38}
        color="#e3f5ff"
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

      {/* City HDRI adds broad sky/building reflections to the glass and metal. */}
      <Environment
        preset="city"
        environmentIntensity={0.78}
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
    <div
      className="airport-scene-composite"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "linear-gradient(180deg, #c9e6fa 0%, #e5f3fc 46%, #d5eafa 100%)",
      }}
    >
      <JourneyHeadlineBackdrop
        scrollPositionRef={scrollPositionRef}
        journeyRef={journeyRef}
      />
      <Canvas
        className="journey-canvas"
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
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
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.92,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
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
    </div>
  );
}

useGLTF.preload(AIRCRAFT_URL);