import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

function createSphere(count, radius) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const y =
      1 - (i / (count - 1)) * 2;

    const radiusAtY =
      Math.sqrt(1 - y * y);

    const theta =
      Math.PI *
      (3 - Math.sqrt(5)) *
      i;

    positions[i3] =
      Math.cos(theta) *
      radiusAtY *
      radius;

    positions[i3 + 1] =
      y * radius;

    positions[i3 + 2] =
      Math.sin(theta) *
      radiusAtY *
      radius;
  }

  return positions;
}

function createScatter(count) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    positions[i3] =
      (Math.random() - 0.5) * 14;

    positions[i3 + 1] =
      (Math.random() - 0.5) * 9;

    positions[i3 + 2] =
      (Math.random() - 0.5) * 6;
  }

  return positions;
}

function createField(count) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    positions[i3] =
      (Math.random() - 0.5) * 12;

    positions[i3 + 1] =
      (Math.random() - 0.5) * 7;

    positions[i3 + 2] =
      (Math.random() - 0.5) * 5 - 1;
  }

  return positions;
}

function ParticleIntro({ phase }) {
  const pointsRef = useRef(null);

  const formation = useRef({
    value: 0,
  });

  const distortion = useRef({
    value: 0,
  });

  const spread = useRef({
    value: 0,
  });

  const mouse = useRef({
    x: 0,
    y: 0,
  });

  const particleData = useMemo(() => {
    const count = 7000;

    const sphere = createSphere(
      count,
      2.15
    );

    const scatter = createScatter(
      count
    );

    const field = createField(
      count
    );

    const random = new Float32Array(
      count
    );

    for (let i = 0; i < count; i++) {
      random[i] = Math.random();
    }

    return {
      count,
      sphere,
      scatter,
      field,
      random,
    };
  }, []);

  const positions = useMemo(
    () =>
      particleData.scatter.slice(),
    [particleData]
  );

  const geometry = useMemo(() => {
    const geo =
      new THREE.BufferGeometry();

    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    return geo;
  }, [positions]);

  /* -----------------------------
     SPHERE FORMATION
  ----------------------------- */

  useEffect(() => {
    const timeline =
      gsap.timeline({
        delay: 0.3,
      });

    timeline
      .to(formation.current, {
        value: 0.15,
        duration: 0.8,
        ease: "power2.out",
      })
      .to(formation.current, {
        value: 1,
        duration: 3.8,
        ease: "expo.inOut",
      });

    return () => {
      timeline.kill();
    };
  }, []);

  /* -----------------------------
     SPHERE DISTORTION
  ----------------------------- */

  useEffect(() => {
    if (phase !== "distorting") {
      return;
    }

    const timeline =
      gsap.timeline();

    timeline
      .to(distortion.current, {
        value: 1,
        duration: 1.8,
        ease: "power3.inOut",
      })
      .to(
        spread.current,
        {
          value: 1,
          duration: 2.4,
          ease: "expo.inOut",
        },
        "-=0.5"
      );

    return () => {
      timeline.kill();
    };
  }, [phase]);

  /* -----------------------------
     MOUSE
  ----------------------------- */

  useEffect(() => {
    const handleMouseMove = (
      event
    ) => {
      mouse.current.x =
        (event.clientX /
          window.innerWidth -
          0.5) *
        2;

      mouse.current.y =
        -(
          event.clientY /
            window.innerHeight -
          0.5
        ) *
        2;
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  /* -----------------------------
     ANIMATION LOOP
  ----------------------------- */

  useFrame((state) => {
    if (!pointsRef.current) {
      return;
    }

    const time =
      state.clock.elapsedTime;

    const current =
      geometry.attributes.position.array;

    const formationValue =
      formation.current.value;

    const distortionValue =
      distortion.current.value;

    const spreadValue =
      spread.current.value;

    for (
      let i = 0;
      i < particleData.count;
      i++
    ) {
      const i3 = i * 3;

      const random =
        particleData.random[i];

      /* SCATTER → SPHERE */

      let x =
        THREE.MathUtils.lerp(
          particleData.scatter[i3],
          particleData.sphere[i3],
          formationValue
        );

      let y =
        THREE.MathUtils.lerp(
          particleData.scatter[i3 + 1],
          particleData.sphere[i3 + 1],
          formationValue
        );

      let z =
        THREE.MathUtils.lerp(
          particleData.scatter[i3 + 2],
          particleData.sphere[i3 + 2],
          formationValue
        );

      /* NATURAL MOTION */

      x +=
        Math.sin(
          time * 2 +
          random * 30
        ) *
        0.015;

      y +=
        Math.cos(
          time * 1.7 +
          random * 25
        ) *
        0.015;

      /* DISTORTION */

      if (distortionValue > 0) {
        const noise =
          Math.sin(
            time * 2 +
            random * 20
          );

        const noise2 =
          Math.cos(
            time * 1.5 +
            random * 25
          );

        x +=
          noise *
          distortionValue *
          1.3;

        y +=
          noise2 *
          distortionValue *
          1.0;

        z +=
          Math.sin(
            time * 2.4 +
            random * 15
          ) *
          distortionValue *
          1.5;
      }

      /* SPHERE → FIELD */

      x =
        THREE.MathUtils.lerp(
          x,
          particleData.field[i3],
          spreadValue
        );

      y =
        THREE.MathUtils.lerp(
          y,
          particleData.field[i3 + 1],
          spreadValue
        );

      z =
        THREE.MathUtils.lerp(
          z,
          particleData.field[i3 + 2],
          spreadValue
        );

      /* FIELD MOVEMENT */

      const movement =
        0.025 +
        spreadValue * 0.04;

      x +=
        Math.sin(
          time +
          random * 20
        ) *
        movement;

      y +=
        Math.cos(
          time * 1.3 +
          random * 30
        ) *
        movement;

      /* SMOOTH MOVEMENT */

      current[i3] +=
        (x -
          current[i3]) *
        0.06;

      current[i3 + 1] +=
        (y -
          current[i3 + 1]) *
        0.06;

      current[i3 + 2] +=
        (z -
          current[i3 + 2]) *
        0.06;
    }

    geometry.attributes.position.needsUpdate =
      true;

    /* ROTATION */

    pointsRef.current.rotation.y +=
      phase === "distorting"
        ? 0.004
        : 0.0018;

    pointsRef.current.rotation.x =
      Math.sin(time * 0.3) *
      0.05;

    /* MOUSE */

    pointsRef.current.rotation.y +=
      mouse.current.x *
      0.0005;

    pointsRef.current.rotation.x +=
      mouse.current.y *
      0.0003;

    /* BREATHING */

    const breathing =
      1 +
      Math.sin(time * 1.2) *
      0.015;

    pointsRef.current.scale.setScalar(
      breathing
    );
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
    >
      <pointsMaterial
        color="#ffffff"
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
      />
    </points>
  );
}

export default ParticleIntro;