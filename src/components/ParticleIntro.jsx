import {
  useFrame,
} from "@react-three/fiber";

import {
  useGLTF,
} from "@react-three/drei";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

import gsap from "gsap";


const AIRCRAFT_URL =
  "/models/aircraft.glb";

const PARTICLE_COUNT = 7000;


/* =========================================================
   SPHERE
========================================================= */

function createSphere(
  count,
  radius
) {
  const positions =
    new Float32Array(
      count * 3
    );

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const i3 = i * 3;

    const y =
      1 -
      (i / (count - 1)) * 2;

    const radiusAtY =
      Math.sqrt(
        Math.max(
          0,
          1 - y * y
        )
      );

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


/* =========================================================
   SCATTER
========================================================= */

function createScatter(
  count
) {
  const positions =
    new Float32Array(
      count * 3
    );

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const i3 = i * 3;

    positions[i3] =
      (Math.random() - 0.5) *
      12;

    positions[i3 + 1] =
      (Math.random() - 0.5) *
      8;

    positions[i3 + 2] =
      (Math.random() - 0.5) *
      5;
  }

  return positions;
}


/* =========================================================
   AIRCRAFT SURFACE SAMPLING
   Turns the real local GLB geometry into
   a particle target.
========================================================= */

function sampleAircraftSurface(
  scene,
  count
) {
  scene.updateMatrixWorld(true);

  const triangles = [];
  let totalArea = 0;

  scene.traverse((child) => {
    if (
      !child.isMesh ||
      !child.geometry
    ) {
      return;
    }

    const geometry =
      child.geometry;

    const position =
      geometry.attributes
        ?.position;

    if (!position) {
      return;
    }

    const index =
      geometry.index;

    const matrix =
      child.matrixWorld;

    const readVertex =
      (vertexIndex) => {
        const v =
          new THREE.Vector3(
            position.getX(
              vertexIndex
            ),
            position.getY(
              vertexIndex
            ),
            position.getZ(
              vertexIndex
            )
          );

        return v.applyMatrix4(
          matrix
        );
      };


    const triangleCount =
      index
        ? index.count / 3
        : position.count / 3;


    for (
      let i = 0;
      i < triangleCount;
      i++
    ) {
      const a =
        index
          ? index.getX(i * 3)
          : i * 3;

      const b =
        index
          ? index.getX(i * 3 + 1)
          : i * 3 + 1;

      const c =
        index
          ? index.getX(i * 3 + 2)
          : i * 3 + 2;

      const va =
        readVertex(a);

      const vb =
        readVertex(b);

      const vc =
        readVertex(c);

      const ab =
        new THREE.Vector3()
          .subVectors(
            vb,
            va
          );

      const ac =
        new THREE.Vector3()
          .subVectors(
            vc,
            va
          );

      const area =
        ab
          .cross(ac)
          .length() *
        0.5;

      if (
        area <= 0 ||
        !Number.isFinite(area)
      ) {
        continue;
      }

      totalArea += area;

      triangles.push({
        a: va,
        b: vb,
        c: vc,
        area,
        cumulative:
          totalArea,
      });
    }
  });


  if (
    triangles.length === 0 ||
    totalArea <= 0
  ) {
    return createSphere(
      count,
      2.0
    );
  }


  /* -------------------------------------------------------
     SAMPLE TRIANGLES BY SURFACE AREA
  ------------------------------------------------------- */

  const target =
    new Float32Array(
      count * 3
    );


  const findTriangle =
    (value) => {
      let low = 0;
      let high =
        triangles.length - 1;

      while (low < high) {
        const mid =
          Math.floor(
            (low + high) / 2
          );

        if (
          triangles[mid]
            .cumulative <
          value
        ) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      return triangles[low];
    };


  const p =
    new THREE.Vector3();


  for (
    let i = 0;
    i < count;
    i++
  ) {
    const triangle =
      findTriangle(
        Math.random() *
        totalArea
      );

    let u =
      Math.random();

    let v =
      Math.random();

    if (
      u + v > 1
    ) {
      u = 1 - u;
      v = 1 - v;
    }

    const w =
      1 - u - v;

    p.copy(
      triangle.a
    )
      .multiplyScalar(w)
      .add(
        triangle.b
          .clone()
          .multiplyScalar(u)
      )
      .add(
        triangle.c
          .clone()
          .multiplyScalar(v)
      );


    const i3 = i * 3;

    target[i3] =
      p.x;

    target[i3 + 1] =
      p.y;

    target[i3 + 2] =
      p.z;
  }


  /* -------------------------------------------------------
     NORMALIZE TARGET INTO A SPLASH-SIZED AIRCRAFT
  ------------------------------------------------------- */

  const box =
    new THREE.Box3();

  const point =
    new THREE.Vector3();

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const i3 = i * 3;

    point.set(
      target[i3],
      target[i3 + 1],
      target[i3 + 2]
    );

    box.expandByPoint(
      point
    );
  }


  const size =
    new THREE.Vector3();

  const center =
    new THREE.Vector3();

  box.getSize(size);
  box.getCenter(center);


  /*
    The aircraft is deliberately
    wider than tall, like the
    real model.
  */

  const scale =
    4.2 /
    Math.max(
      size.x,
      size.y,
      size.z
    );


  for (
    let i = 0;
    i < count;
    i++
  ) {
    const i3 = i * 3;

    target[i3] =
      (
        target[i3] -
        center.x
      ) * scale;

    target[i3 + 1] =
      (
        target[i3 + 1] -
        center.y
      ) * scale;

    target[i3 + 2] =
      (
        target[i3 + 2] -
        center.z
      ) * scale;
  }


  /*
    Face the aircraft toward the
    viewer in the same spirit as
    the hero composition.
  */

  const rotation =
    new THREE.Euler(
      0,
      -0.34,
      0
    );

  const rotationMatrix =
    new THREE.Matrix4()
      .makeRotationFromEuler(
        rotation
      );


  for (
    let i = 0;
    i < count;
    i++
  ) {
    const i3 = i * 3;

    point.set(
      target[i3],
      target[i3 + 1],
      target[i3 + 2]
    );

    point.applyMatrix4(
      rotationMatrix
    );

    target[i3] =
      point.x;

    target[i3 + 1] =
      point.y;

    target[i3 + 2] =
      point.z;
  }


  return target;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function ParticleAircraftIntro({
  phase = "splash",
  onAircraftReady,
}) {
  const pointsRef =
    useRef(null);

  const sphereValue =
    useRef({
      value: 0,
    });

  const planeValue =
    useRef({
      value: 0,
    });

  const dissolveValue =
    useRef({
      value: 0,
    });

  const mouse =
    useRef({
      x: 0,
      y: 0,
    });


  const { scene } =
    useGLTF(
      AIRCRAFT_URL
    );


  const particleData =
    useMemo(() => {
      const sphere =
        createSphere(
          PARTICLE_COUNT,
          2.25
        );

      const scatter =
        createScatter(
          PARTICLE_COUNT
        );

      const aircraft =
        sampleAircraftSurface(
          scene,
          PARTICLE_COUNT
        );

      const random =
        new Float32Array(
          PARTICLE_COUNT
        );

      for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
      ) {
        random[i] =
          Math.random();
      }

      return {
        sphere,
        scatter,
        aircraft,
        random,
      };
    }, [scene]);


  const positions =
    useMemo(
      () =>
        particleData.scatter.slice(),
      [particleData]
    );


  const geometry =
    useMemo(() => {
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


  /* =======================================================
     SPHERE BUILD
  ======================================================= */

  useEffect(() => {
    const timeline =
      gsap.timeline();

    timeline
      .to(
        sphereValue.current,
        {
          value: 1,
          duration: 2.35,
          ease: "expo.inOut",
          delay: 0.25,
        }
      );

    return () => {
      timeline.kill();
    };
  }, []);


  /* =======================================================
     SPHERE → AIRCRAFT
  ======================================================= */

  useEffect(() => {
    if (
      phase !==
      "forming-plane"
    ) {
      return;
    }

    const timeline =
      gsap.timeline();


    timeline
      .to(
        planeValue.current,
        {
          value: 1,
          duration: 2.25,
          ease: "power4.inOut",
        }
      )
      .to(
        dissolveValue.current,
        {
          value: 1,
          duration: 0.65,
          ease: "power2.out",
          onComplete:
            onAircraftReady,
        }
      );

    return () => {
      timeline.kill();
    };
  }, [
    phase,
    onAircraftReady,
  ]);


  /* =======================================================
     MOUSE
  ======================================================= */

  useEffect(() => {
    const handleMouse =
      (event) => {
        mouse.current.x =
          (
            event.clientX /
              window.innerWidth -
            0.5
          ) * 2;

        mouse.current.y =
          -(
            event.clientY /
              window.innerHeight -
            0.5
          ) * 2;
      };

    window.addEventListener(
      "mousemove",
      handleMouse
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouse
      );
    };
  }, []);


  /* =======================================================
     ANIMATION
  ======================================================= */

  useFrame((state) => {
    if (!pointsRef.current) {
      return;
    }

    const time =
      state.clock.elapsedTime;

    const current =
      geometry.attributes
        .position.array;

    const sphere =
      sphereValue.current.value;

    const plane =
      planeValue.current.value;

    const dissolve =
      dissolveValue.current.value;


    for (
      let i = 0;
      i < PARTICLE_COUNT;
      i++
    ) {
      const i3 = i * 3;

      const random =
        particleData.random[i];


      /* --------------------------------------------------
         SCATTER → SPHERE
      -------------------------------------------------- */

      let x =
        THREE.MathUtils.lerp(
          particleData.scatter[i3],
          particleData.sphere[i3],
          sphere
        );

      let y =
        THREE.MathUtils.lerp(
          particleData.scatter[i3 + 1],
          particleData.sphere[i3 + 1],
          sphere
        );

      let z =
        THREE.MathUtils.lerp(
          particleData.scatter[i3 + 2],
          particleData.sphere[i3 + 2],
          sphere
        );


      /* --------------------------------------------------
         NATURAL SPHERE MOTION
      -------------------------------------------------- */

      const sphereBreath =
        (
          1 -
          plane
        ) *
        (
          0.012 +
          Math.sin(
            time *
              1.25 +
              random * 25
          ) *
          0.008
        );

      x +=
        Math.sin(
          time * 1.8 +
          random * 25
        ) *
        sphereBreath;

      y +=
        Math.cos(
          time * 1.55 +
          random * 21
        ) *
        sphereBreath;

      z +=
        Math.sin(
          time * 1.3 +
          random * 27
        ) *
        sphereBreath;


      /* --------------------------------------------------
         SPHERE → AIRCRAFT
      -------------------------------------------------- */

      const planeTarget =
        plane;

      /*
        Slight radial compression while
        the sphere starts becoming a plane.
      */

      const compressedX =
        x *
        (
          1 +
          planeTarget *
          0.34
        );

      const compressedY =
        y *
        (
          1 -
          planeTarget *
          0.22
        );

      const compressedZ =
        z *
        (
          1 -
          planeTarget *
          0.10
        );


      const targetX =
        THREE.MathUtils.lerp(
          compressedX,
          particleData.aircraft[i3],
          planeTarget
        );

      const targetY =
        THREE.MathUtils.lerp(
          compressedY,
          particleData.aircraft[i3 + 1],
          planeTarget
        );

      const targetZ =
        THREE.MathUtils.lerp(
          compressedZ,
          particleData.aircraft[i3 + 2],
          planeTarget
        );


      /*
        The plane formation gets
        a small forward sweep,
        giving a "coming together"
        feeling instead of a hard morph.
      */

      const sweep =
        Math.sin(
          (1 - planeTarget) *
          Math.PI
        ) *
        0.18;

      const finalX =
        targetX;

      const finalY =
        targetY;

      const finalZ =
        targetZ +
        sweep *
        (
          0.3 +
          random
        );


      /* --------------------------------------------------
         DISSOLVE / REDUCE PARTICLES
      -------------------------------------------------- */

      const motion =
        1 -
        dissolve *
        0.92;

      const smooth =
        phase ===
        "forming-plane"
          ? 0.075
          : 0.05;


      current[i3] +=
        (
          finalX -
          current[i3]
        ) *
        smooth *
        motion;

      current[i3 + 1] +=
        (
          finalY -
          current[i3 + 1]
        ) *
        smooth *
        motion;

      current[i3 + 2] +=
        (
          finalZ -
          current[i3 + 2]
        ) *
        smooth *
        motion;
    }


    geometry.attributes
      .position
      .needsUpdate = true;


    /* ----------------------------------------------------
       ROTATION
    ---------------------------------------------------- */

    pointsRef.current.rotation.y =
      THREE.MathUtils.lerp(
        pointsRef.current.rotation.y,
        plane > 0.85
          ? -0.15
          : time * 0.12,
        0.025
      );


    pointsRef.current.rotation.x =
      Math.sin(
        time * 0.22
      ) *
      0.035;


    pointsRef.current.rotation.y +=
      mouse.current.x *
      0.002;


    pointsRef.current.rotation.x +=
      mouse.current.y *
      0.001;


    /* ----------------------------------------------------
       SCALE
    ---------------------------------------------------- */

    const scale =
      1 +
      Math.sin(
        time * 1.1
      ) *
      0.01 *
      (1 - plane);

    pointsRef.current.scale.setScalar(
      scale
    );
  });


  return (
    <points
      ref={pointsRef}
      geometry={geometry}
    >

      <pointsMaterial
        color="#ffffff"
        size={0.016}
        sizeAttenuation
        transparent
        opacity={0.82}
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
      />

    </points>
  );
}


useGLTF.preload(
  AIRCRAFT_URL
);
