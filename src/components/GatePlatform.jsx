import { Suspense, useMemo } from "react";
import {
    RoundedBox,
    Text,
  } from "@react-three/drei";
  
  import * as THREE from "three";
  
  
  /* =========================================================
     COLORS
  ========================================================= */
  
  const C = {
    // Palette sampled from the supplied airport SVG: teal glass, deep petrol
    // structure, coral-orange accents, soft stone concrete and muted olive green.
    apron: "#DCE0E0",
    runway: "#383142",
    terminal: "#E1EBED",
    terminalTop: "#FDFDFD",
    glass: "#5EB1BE",
    dark: "#003E92",
    metal: "#527884",
    yellow: "#EF592C",
    white: "#FDFDFD",
    blue: "#003E92",
    coral: "#F99374",
    lightTeal: "#97CED3",
    paleTeal: "#C5E9EC",
    olive: "#A2BE5A",
  };
  
  

  /*
   * Procedural charcoal asphalt: fine aggregate grain, gentle mottling, and
   * low-contrast tire/wear marks. This avoids a flat single-color ground plane.
   */
  function createAsphaltTexture(repeatX = 5, repeatY = 7, seed = 1337) {
    if (typeof document === "undefined") return null;

    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return null;

    const image = context.createImageData(size, size);
    let state = seed >>> 0;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        // Low-frequency asphalt mottling blended with fine granular noise.
        const broad =
          Math.sin((x / size) * Math.PI * 8 + 0.7) * 2.2 +
          Math.cos((y / size) * Math.PI * 10 + 1.4) * 1.8 +
          Math.sin(((x + y) / size) * Math.PI * 14) * 1.3;
        const grain = (random() - 0.5) * 19;
        const value = 57 + broad * 0.8 + grain * 0.78;
        const index = (y * size + x) * 4;
        // Muted plum-charcoal like the submitted SVG, rather than blue-black.
        image.data[index] = Math.max(38, Math.min(89, value + 2));
        image.data[index + 1] = Math.max(31, Math.min(77, value - 8));
        image.data[index + 2] = Math.max(42, Math.min(98, value + 8));
        image.data[index + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);

    // Diffuse worn/tire patches; they should be noticed up close, not dominate.
    for (let index = 0; index < 18; index += 1) {
      const x = random() * size;
      const y = random() * size;
      const radius = 14 + random() * 34;
      const gradient = context.createRadialGradient(x, y, 1, x, y, radius);
      const shade = random() > 0.5 ? "83, 66, 86" : "37, 31, 44";
      gradient.addColorStop(0, `rgba(${shade}, ${0.08 + random() * 0.08})`);
      gradient.addColorStop(1, `rgba(${shade}, 0)`);
      context.fillStyle = gradient;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }

  /*
   * Pale, subtly grainy concrete for the gate apron. Keeping the apron lighter
   * than the taxi route makes the dark road read as a continuous paved lane.
   */
  function createConcreteTexture(repeatX = 4, repeatY = 6, seed = 417) {
    if (typeof document === "undefined") return null;
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return null;

    const image = context.createImageData(size, size);
    let state = seed >>> 0;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const mottling = Math.sin((x / size) * Math.PI * 7) * 1.6 + Math.cos((y / size) * Math.PI * 9) * 1.3;
        const grain = (random() - 0.5) * 10;
        const value = 218 + mottling + grain * 0.65;
        const index = (y * size + x) * 4;
        image.data[index] = Math.max(201, Math.min(232, value - 3));
        image.data[index + 1] = Math.max(205, Math.min(235, value));
        image.data[index + 2] = Math.max(207, Math.min(237, value + 1));
        image.data[index + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }

  /* =========================================================
     GRASS VERGES + LANDSCAPED DIVIDERS
     Low curbs and planted islands break up the oversized concrete apron
     without interfering with the aircraft's circular taxi path.
  ========================================================= */

  function createGrassTexture(repeatX = 2, repeatY = 5, seed = 923) {
    if (typeof document === "undefined") return null;

    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) return null;

    const image = context.createImageData(size, size);
    let state = seed >>> 0;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const broad = Math.sin((x / size) * Math.PI * 12) * 3.2 + Math.cos((y / size) * Math.PI * 9) * 2.4;
        const grain = (random() - 0.5) * 25;
        const index = (y * size + x) * 4;
        image.data[index] = Math.max(70, Math.min(136, 94 + broad * 0.42 + grain * 0.32));
        image.data[index + 1] = Math.max(132, Math.min(204, 171 + broad * 0.68 + grain * 0.48));
        image.data[index + 2] = Math.max(40, Math.min(92, 55 + broad * 0.28 + grain * 0.22));
        image.data[index + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);
    // Fine, short blades in low contrast keep the grass readable at portfolio camera distance.
    for (let i = 0; i < 1500; i += 1) {
      const x = random() * size;
      const y = random() * size;
      const light = random() > 0.52;
      context.strokeStyle = light ? "rgba(208, 239, 151, 0.24)" : "rgba(36, 78, 41, 0.20)";
      context.lineWidth = 0.5 + random() * 0.5;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (random() - 0.5) * 2.5, y - 1 - random() * 3.5);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }

  function createSoftGrassGeometry(width, depth, cornerRadius = 1.5) {
    const halfW = width / 2;
    const halfD = depth / 2;
    const radius = Math.min(cornerRadius, halfW, halfD);
    const shape = new THREE.Shape();

    shape.moveTo(-halfW + radius, -halfD);
    shape.lineTo(halfW - radius, -halfD);
    shape.quadraticCurveTo(halfW, -halfD, halfW, -halfD + radius);
    shape.lineTo(halfW, halfD - radius);
    shape.quadraticCurveTo(halfW, halfD, halfW - radius, halfD);
    shape.lineTo(-halfW + radius, halfD);
    shape.quadraticCurveTo(-halfW, halfD, -halfW, halfD - radius);
    shape.lineTo(-halfW, -halfD + radius);
    shape.quadraticCurveTo(-halfW, -halfD, -halfW + radius, -halfD);

    const geometry = new THREE.ShapeGeometry(shape, 12);
    // ShapeGeometry uses local XY coordinates for UVs by default. Normalize them
    // so the procedural grass repeats at a natural, consistent world scale.
    const positions = geometry.getAttribute("position");
    const uvs = geometry.getAttribute("uv");
    for (let index = 0; index < positions.count; index += 1) {
      uvs.setXY(
        index,
        (positions.getX(index) + halfW) / width,
        (positions.getY(index) + halfD) / depth
      );
    }
    uvs.needsUpdate = true;
    return geometry;
  }

  function GrassPatch({ grassTexture, position, width, depth, radius = 1.5 }) {
    const geometry = useMemo(
      () => createSoftGrassGeometry(width, depth, radius),
      [width, depth, radius]
    );

    return (
      <mesh
        geometry={geometry}
        position={position}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          map={grassTexture || undefined}
          color="#ffffff"
          roughness={1}
          metalness={0}
        />
      </mesh>
    );
  }

  // Smooth free-form grass fields use the same x/z ground plane as the taxiway.
  // Coordinates are world [x, z] pairs; the helper maps them onto local XY.
  function createOrganicGrassGeometry(commands) {
    const shape = new THREE.Shape();
    const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
    const point = ([x, z]) => {
      const y = -z;
      bounds.minX = Math.min(bounds.minX, x);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxY = Math.max(bounds.maxY, y);
      return [x, y];
    };

    commands.forEach((command) => {
      if (command.type === "move") {
        const [x, y] = point(command.to);
        shape.moveTo(x, y);
      } else if (command.type === "line") {
        const [x, y] = point(command.to);
        shape.lineTo(x, y);
      } else if (command.type === "curve") {
        const [c1x, c1y] = point(command.c1);
        const [c2x, c2y] = point(command.c2);
        const [x, y] = point(command.to);
        shape.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
      } else if (command.type === "close") {
        shape.closePath();
      }
    });

    const geometry = new THREE.ShapeGeometry(shape, 32);
    const positions = geometry.getAttribute("position");
    const uvs = geometry.getAttribute("uv");
    const width = Math.max(0.001, bounds.maxX - bounds.minX);
    const height = Math.max(0.001, bounds.maxY - bounds.minY);
    for (let index = 0; index < positions.count; index += 1) {
      uvs.setXY(
        index,
        (positions.getX(index) - bounds.minX) / width,
        (positions.getY(index) - bounds.minY) / height
      );
    }
    uvs.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }

  function OrganicGrassField({ grassTexture, commands }) {
    const geometry = useMemo(() => createOrganicGrassGeometry(commands), [commands]);
    return (
      <mesh
        geometry={geometry}
        position={[0, -0.407, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial
          map={grassTexture || undefined}
          color="#ffffff"
          roughness={1}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  }

  function LandscapeCurb({ points }) {
    const geometry = useMemo(() => {
      const curve = new THREE.CatmullRomCurve3(
        points.map(([x, z]) => new THREE.Vector3(x, -0.362, z)),
        false,
        "centripetal",
        0.25
      );
      return new THREE.TubeGeometry(curve, Math.max(48, points.length * 8), 0.045, 6, false);
    }, [points]);

    return (
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#D5DEDE" roughness={0.76} metalness={0.02} />
      </mesh>
    );
  }

  function LandscapeTree({ position, scale = 1, tone = 0 }) {
    const foliageColors = ["#77BD43", "#8BCB4E", "#66AA38", "#9AD45A"];
    const foliage = foliageColors[tone % foliageColors.length];
    const shaded = tone % 2 ? "#4F9235" : "#5A9F36";

    return (
      <group position={position} scale={scale}>
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.095, 1.24, 7]} />
          <meshStandardMaterial color="#8D7554" roughness={1} />
        </mesh>
        <mesh position={[0, 2.0, 0]} scale={[0.82, 0.88, 0.78]} castShadow>
          <icosahedronGeometry args={[0.86, 1]} />
          <meshStandardMaterial color={foliage} roughness={1} />
        </mesh>
        <mesh position={[-0.38, 1.82, 0.08]} scale={[0.66, 0.66, 0.68]} castShadow>
          <icosahedronGeometry args={[0.77, 1]} />
          <meshStandardMaterial color={shaded} roughness={1} />
        </mesh>
        <mesh position={[0.38, 1.86, -0.06]} scale={[0.68, 0.69, 0.65]} castShadow>
          <icosahedronGeometry args={[0.76, 1]} />
          <meshStandardMaterial color={foliage} roughness={1} />
        </mesh>
      </group>
    );
  }

  function ApronLandscaping() {
    const grassTexture = useMemo(() => createGrassTexture(2.6, 6.2, 923), []);

    // These organic lawns change only the areas beside the airport and taxiway;
    // the aircraft path, camera flow, terminal footprint and gates remain fixed.
    const fields = useMemo(() => [
      {
        id: "west-forecourt-meadow",
        commands: [
          { type: "move", to: [-43.5, -4.0] },
          { type: "curve", c1: [-37.8, -4.2], c2: [-31.8, -0.8], to: [-28.2, 6.0] },
          { type: "curve", c1: [-26.8, 9.3], c2: [-26.7, 16.7], to: [-29.6, 22.8] },
          { type: "curve", c1: [-32.6, 29.3], c2: [-38.6, 37.2], to: [-43.2, 42.0] },
          { type: "line", to: [-43.9, 42.0] },
          { type: "line", to: [-43.9, -4.0] },
          { type: "close" },
        ],
      },
      {
        id: "east-forecourt-meadow",
        commands: [
          { type: "move", to: [22.2, -7.5] },
          { type: "curve", c1: [29.2, -7.0], c2: [37.6, -1.4], to: [43.5, 5.0] },
          { type: "line", to: [43.5, 38.5] },
          { type: "curve", c1: [36.8, 34.5], c2: [28.6, 28.8], to: [24.0, 21.0] },
          { type: "curve", c1: [21.4, 15.0], c2: [21.2, 1.4], to: [22.2, -7.5] },
          { type: "close" },
        ],
      },
      // Split far fields around the runway corridor so grass never covers it.
      {
        id: "west-horizon-meadow",
        commands: [
          { type: "move", to: [-44.0, -51.0] },
          { type: "curve", c1: [-41.2, -49.2], c2: [-37.2, -45.0], to: [-33.6, -41.0] },
          { type: "line", to: [-44.0, -40.8] },
          { type: "close" },
        ],
      },
      {
        id: "east-horizon-meadow",
        commands: [
          { type: "move", to: [-8.2, -51.0] },
          { type: "curve", c1: [8.5, -53.1], c2: [28.9, -49.8], to: [43.8, -46.8] },
          { type: "line", to: [43.8, -40.8] },
          { type: "curve", c1: [25.0, -42.3], c2: [6.4, -40.6], to: [-8.2, -41.8] },
          { type: "close" },
        ],
      },
    ], []);

    // A restrained tree line sits behind the terminal with a clear runway gap.
    const trees = useMemo(() => {
      const xPositions = [-41.0, -38.0, -35.2, -7.2, -4.0, -0.5, 3.0, 6.5, 10.0, 13.5, 17.0, 20.8, 24.2, 27.7, 31.2, 34.8, 38.3, 41.0];
      return xPositions.map((x, index) => ({
        x,
        z: -43.5 + (index % 3) * 0.48,
        scale: 0.58 + (index % 4) * 0.10,
        tone: (index * 3) % 4,
      }));
    }, []);

    const median = { x: -1.0, z: 11.1, width: 13.4, depth: 3.15 };
    const shrubs = Array.from({ length: 6 }, (_, index) => ({
      x: median.x - 5.25 + index * 2.1,
      z: median.z + (index % 2 ? 0.09 : -0.09),
      scale: 0.72 + (index % 3) * 0.09,
      tone: index % 4,
    }));

    const westCurbPoints = useMemo(() => [
      [-28.1, 5.5], [-27.0, 9.2], [-26.9, 13.4], [-27.9, 18.1], [-30.2, 23.5], [-33.7, 30.0], [-39.5, 38.0],
    ], []);
    const eastCurbPoints = useMemo(() => [
      [22.1, -6.8], [21.4, -1.5], [21.1, 5.4], [21.5, 12.5], [23.1, 19.6], [27.0, 27.0], [34.2, 34.0], [42.0, 38.3],
    ], []);

    return (
      <group>
        {fields.map((field) => (
          <OrganicGrassField key={field.id} grassTexture={grassTexture} commands={field.commands} />
        ))}

        <LandscapeCurb points={westCurbPoints} />
        <LandscapeCurb points={eastCurbPoints} />

        {trees.map((tree, index) => (
          <LandscapeTree
            key={`horizon-tree-${index}`}
            position={[tree.x, -0.405, tree.z]}
            scale={tree.scale}
            tone={tree.tone}
          />
        ))}

        <GrassPatch
          grassTexture={grassTexture}
          position={[median.x, -0.405, median.z]}
          width={median.width}
          depth={median.depth}
          radius={1.45}
        />
        {[-1, 1].map((side) => (
          <mesh
            key={`median-long-curb-${side}`}
            position={[median.x, -0.353, median.z + side * (median.depth / 2)]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[median.width - 1.8, 0.10, 0.105]} />
            <meshStandardMaterial color="#E0E5E3" roughness={0.72} />
          </mesh>
        ))}
        {[-1, 1].map((side) => (
          <mesh
            key={`median-end-curb-${side}`}
            position={[median.x + side * (median.width / 2 - 0.9), -0.353, median.z]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.105, 0.10, median.depth - 0.12]} />
            <meshStandardMaterial color="#D5DEDE" roughness={0.76} />
          </mesh>
        ))}
        {shrubs.map((shrub, index) => (
          <mesh
            key={`median-shrub-${index}`}
            position={[shrub.x, -0.14, shrub.z]}
            scale={[0.46 * shrub.scale, 0.30 * shrub.scale, 0.38 * shrub.scale]}
            castShadow
          >
            <icosahedronGeometry args={[0.58, 1]} />
            <meshStandardMaterial
              color={["#72B83F", "#88C94B", "#5EA43A", "#A0D45A"][shrub.tone]}
              roughness={1}
            />
          </mesh>
        ))}
      </group>
    );
  }

  function Apron() {
    const concreteTexture = useMemo(() => createConcreteTexture(5.5, 7.2, 117), []);
    return (
      <group>
  
        <mesh
          position={[
            0,
            -0.42,
            -2,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
          receiveShadow
        >
          <planeGeometry
            args={[
              88,
              104,
            ]}
          />
  
          <meshStandardMaterial
            map={concreteTexture || undefined}
            color="#ffffff"
            roughness={0.98}
            metalness={0.0}
          />
        </mesh>
  
  
        {[-9, -5, -1, 3, 7].map(
          (z) => (
            <mesh
              key={`h-${z}`}
              position={[
                0,
                -0.394,
                z,
              ]}
              rotation={[
                -Math.PI / 2,
                0,
                0,
              ]}
            >
              <planeGeometry
                args={[
                  28,
                  0.012,
                ]}
              />
  
              <meshBasicMaterial
                color="#BFCECF"
                transparent
                opacity={0.08}
              />
            </mesh>
          )
        )}
  
  
        {[-10, -5, 0, 5, 10].map(
          (x) => (
            <mesh
              key={`v-${x}`}
              position={[
                x,
                -0.394,
                -2,
              ]}
              rotation={[
                -Math.PI / 2,
                0,
                0,
              ]}
            >
              <planeGeometry
                args={[
                  0.012,
                  32,
                ]}
              />
  
              <meshBasicMaterial
                color="#BFCECF"
                transparent
                opacity={0.055}
              />
            </mesh>
          )
        )}
  
      </group>
    );
  }
  
  
  /* =========================================================
     STAND MARKINGS
  ========================================================= */
  
  function StandMarkings() {
    return (
      <group>
        {/* Keep only the yellow stand lead-in mark. Removing the loose white
            cross-bars makes the taxi route's two edge stripes read as one road. */}
        <mesh
          position={[-1.0, -0.412, 0.2]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.06, 6]} />
          <meshBasicMaterial color={C.yellow} />
        </mesh>
      </group>
    );
  }

    /* =========================================================
     TAXIWAY + RUNWAY
     A darker, broad runway is layered beyond the taxi connector:
     warm amber edge lines, dashed white centerline, subtle asphalt
     repairs and a narrow grass shoulder give it the illustrated reference look.
  ========================================================= */

  function Taxiway() {
    const asphaltTexture = useMemo(() => createAsphaltTexture(2.5, 5, 781), []);
    const connectorTexture = useMemo(() => createAsphaltTexture(1.5, 3, 391), []);
    const runwayGrassTexture = useMemo(() => createGrassTexture(1.5, 5, 411), []);
    const runwayCenterX = -21.0;
    const runwayCenterZ = -33.0;
    const runwayLength = 33.5;
    const runwayWidth = 17.0;
    const runwayStartZ = runwayCenterZ + runwayLength / 2;
    const runwayEdgeX = runwayWidth / 2;

    const pavementPatches = [];
    const patchColors = ["#433849", "#302B39", "#3E3444", "#514351"];
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        // Keep the patches irregular and understated, like repaired asphalt slabs.
        if ((row + col) % 4 === 0) continue;
        pavementPatches.push({
          x: runwayCenterX + (col - 2) * 3.05 + (row % 2 ? 0.36 : -0.22),
          z: runwayStartZ - 2.2 - row * 3.35 + (col % 2 ? 0.55 : 0),
          width: 1.75 + ((row + col) % 3) * 0.42,
          depth: 1.15 + ((row * 2 + col) % 2) * 0.28,
          color: patchColors[(row + col) % patchColors.length],
        });
      }
    }

    const centerDashes = Array.from({ length: 13 }, (_, index) =>
      runwayStartZ - 3.9 - index * 2.25
    );
    const thresholdBars = Array.from({ length: 7 }, (_, index) =>
      runwayCenterX + (index - 3) * 2.15
    );
    const edgeLights = Array.from({ length: 8 }, (_, index) =>
      runwayStartZ - 1.3 - index * 4.25
    );

    return (
      <group>
        {/* Taxi connector remains lighter and narrower than the runway. */}
        <mesh
          position={[-21.0, -0.414, -7.5]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[7.2, 27.0]} />
          <meshStandardMaterial
            map={connectorTexture || undefined}
            color="#ffffff"
            roughness={0.98}
            metalness={0.0}
          />
        </mesh>

        {/* Olive grass shoulders sit just beyond the runway edge. */}
        {[-1, 1].map((side) => (
          <mesh
            key={`runway-grass-${side}`}
            position={[runwayCenterX + side * (runwayEdgeX + 1.45), -0.412, runwayCenterZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[2.9, runwayLength + 0.35]} />
            <meshStandardMaterial map={runwayGrassTexture || undefined} color="#ffffff" roughness={1} metalness={0} />
          </mesh>
        ))}

        {/* Main asphalt body. */}
        <mesh
          position={[runwayCenterX, -0.409, runwayCenterZ]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[runwayWidth, runwayLength]} />
          <meshStandardMaterial
            map={asphaltTexture || undefined}
            color="#ffffff"
            roughness={0.99}
            metalness={0.0}
          />
        </mesh>

        {/* Low-contrast repairs and rectangular asphalt panels. */}
        {pavementPatches.map((patch, index) => (
          <mesh
            key={`runway-patch-${index}`}
            position={[patch.x, -0.404, patch.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[patch.width, patch.depth]} />
            <meshBasicMaterial color={patch.color} transparent opacity={0.25} depthWrite={false} />
          </mesh>
        ))}

        {/* Warm orange edge markings from the reference image. */}
        {[-1, 1].map((side) => (
          <mesh
            key={`runway-edge-${side}`}
            position={[runwayCenterX + side * (runwayEdgeX - 0.34), -0.397, runwayCenterZ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.095, runwayLength - 0.35]} />
            <meshBasicMaterial color="#EF592C" />
          </mesh>
        ))}

        {/* Broken white runway centerline. */}
        {centerDashes.map((z, index) => (
          <mesh
            key={`runway-center-dash-${index}`}
            position={[runwayCenterX, -0.395, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.24, 1.22]} />
            <meshBasicMaterial color="#f7f2e9" />
          </mesh>
        ))}

        {/* Threshold bars at the taxiway-to-runway entry. */}
        {thresholdBars.map((x, index) => (
          <mesh
            key={`runway-threshold-${index}`}
            position={[x, -0.395, runwayStartZ - 0.35]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[1.35, 0.48]} />
            <meshBasicMaterial color="#f7f2e9" />
          </mesh>
        ))}

        {/* A pair of broad aiming-point blocks add depth from the low camera. */}
        {[-1, 1].map((side) => (
          <mesh
            key={`runway-aiming-point-${side}`}
            position={[runwayCenterX + side * 4.35, -0.395, runwayCenterZ + 1.0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.68, 3.6]} />
            <meshBasicMaterial color="#f7f2e9" />
          </mesh>
        ))}

        {/* Small edge lights, spaced along the grassy shoulders. */}
        {edgeLights.flatMap((z, index) =>
          [-1, 1].map((side) => {
            const x = runwayCenterX + side * (runwayEdgeX + 1.72);
            return (
              <group key={`runway-edge-light-${index}-${side}`} position={[x, -0.225, z]}>
                <mesh>
                  <cylinderGeometry args={[0.035, 0.045, 0.37, 8]} />
                  <meshStandardMaterial color="#FDFDFD" roughness={0.72} />
                </mesh>
                <mesh position={[0, 0.17, 0]}>
                  <cylinderGeometry args={[0.042, 0.042, 0.055, 8]} />
                  <meshStandardMaterial color="#EF592C" emissive="#8C311B" emissiveIntensity={0.12} />
                </mesh>
              </group>
            );
          })
        )}

        {/* Subtle taxi connector edge dashes remain visible approaching the threshold. */}
        {Array.from({ length: 7 }, (_, index) => -1.6 - index * 2.35).map((z, index) => (
          <mesh key={`connector-dash-${index}`} position={[-21.0, -0.405, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 0.68]} />
            <meshBasicMaterial color="#FDFDFD" transparent opacity={0.78} />
          </mesh>
        ))}
      </group>
    );
  }


  /* =========================================================
     TERMINAL
  ========================================================= */
  
  function TerminalBay({ position, gateLabel, showAirportSign = false }) {
    const windowCenters = Array.from({ length: 10 }, (_, index) => -3.55 + index * 0.79);
    const frameCenters = Array.from({ length: 11 }, (_, index) => -3.95 + index * 0.79);
    const roofPanelLines = Array.from({ length: 13 }, (_, index) => -3.9 + index * 0.65);

    return (
      <group position={position}>
        {/*
          Build the terminal as a real glazed curtain-wall assembly instead of
          placing glass directly over one solid box. The room shell stays behind
          the glazing so the facade gains depth and reads more like an airport.
        */}
        {/* Rear wall and end walls */}
        <mesh position={[0, 0, -0.97]} castShadow receiveShadow>
          <boxGeometry args={[8.45, 3.58, 0.24]} />
          <meshStandardMaterial color="#E1EBED" roughness={0.72} metalness={0.025} />
        </mesh>
        {[-4.12, 4.12].map((x) => (
          <mesh key={`end-wall-${x}`} position={[x, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 3.62, 2.05]} />
            <meshStandardMaterial color="#E1EBED" roughness={0.66} metalness={0.025} />
          </mesh>
        ))}

        {/* Interior floor, structural depth and warm practical lighting. */}
        <mesh position={[0, -1.43, -0.04]} receiveShadow>
          <boxGeometry args={[8.12, 0.08, 1.74]} />
          <meshStandardMaterial color="#BFCECF" roughness={0.86} />
        </mesh>
        <mesh position={[0, -1.382, 0.12]}>
          <boxGeometry args={[7.85, 0.018, 1.34]} />
          <meshPhysicalMaterial color="#E1EBED" roughness={0.28} metalness={0.04} clearcoat={0.42} />
        </mesh>
        <mesh position={[0, 1.28, -0.08]}>
          <boxGeometry args={[7.95, 0.12, 1.75]} />
          <meshStandardMaterial color="#DCE0E0" roughness={0.62} />
        </mesh>
        {/* Interior columns with metallic pressure caps. */}
        {[-3.15, -1.55, 0.05, 1.65, 3.2].map((x) => (
          <group key={`interior-column-${x}`} position={[x, -0.05, -0.48]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 2.62, 0.10]} />
              <meshStandardMaterial color="#527884" roughness={0.38} metalness={0.24} />
            </mesh>
            <mesh position={[0, 0, 0.056]}>
              <boxGeometry args={[0.018, 2.54, 0.012]} />
              <meshStandardMaterial color="#FDFDFD" roughness={0.28} metalness={0.3} />
            </mesh>
          </group>
        ))}
        {/* Recessed linear ceiling luminaires with a warm light diffuser. */}
        {[-3.25, -2.15, -1.05, 0.05, 1.15, 2.25, 3.35].map((x) => (
          <group key={`ceiling-light-${x}`} position={[x, 1.205, 0.55]}>
            <mesh>
              <boxGeometry args={[0.66, 0.055, 0.09]} />
              <meshStandardMaterial color="#527884" roughness={0.58} />
            </mesh>
            <mesh position={[0, -0.029, 0.006]}>
              <boxGeometry args={[0.56, 0.012, 0.075]} />
              <meshBasicMaterial color="#F8FAFB" toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* Waiting seats sit on the interior floor and provide scale behind the glass. */}
        {[-2.75, -1.0, 0.85, 2.55].map((x, index) => (
          <group key={`waiting-seat-${index}`} position={[x, -1.29, -0.16]}>
            <RoundedBox position={[0, 0.02, 0]} args={[0.54, 0.11, 0.40]} radius={0.035} smoothness={3}>
              <meshStandardMaterial color={index % 2 ? "#5EB1BE" : "#8BBCC6"} roughness={0.62} />
            </RoundedBox>
            <RoundedBox position={[0, 0.22, -0.145]} args={[0.52, 0.32, 0.075]} radius={0.025} smoothness={3}>
              <meshStandardMaterial color="#345662" roughness={0.64} />
            </RoundedBox>
            {[-0.19, 0.19].map((legX) => (
              <mesh key={legX} position={[legX, -0.075, 0.04]}>
                <boxGeometry args={[0.035, 0.12, 0.035]} />
                <meshStandardMaterial color="#345662" roughness={0.45} metalness={0.35} />
              </mesh>
            ))}
          </group>
        ))}
        {/* A grounded gate-service counter sits deeper inside the concourse. */}
        <group position={[0, -1.39, -0.64]}>
          <RoundedBox position={[0, 0.37, 0]} args={[1.55, 0.74, 0.34]} radius={0.035} smoothness={3} castShadow>
            <meshStandardMaterial color="#DCE0E0" roughness={0.46} />
          </RoundedBox>
          <mesh position={[0, 0.75, 0.015]}>
            <boxGeometry args={[1.42, 0.025, 0.30]} />
            <meshStandardMaterial color="#FDFDFD" roughness={0.32} />
          </mesh>
          <mesh position={[0.39, 0.86, -0.03]}>
            <boxGeometry args={[0.34, 0.17, 0.022]} />
            <meshPhysicalMaterial color="#003E92" roughness={0.22} metalness={0.05} clearcoat={0.8} />
          </mesh>
        </group>

        {/* Individual insulated glass panes with alternating cool reflections */}
        {windowCenters.map((x, index) => (
          <mesh key={`glass-pane-${index}`} position={[x, 0, 1.095]}>
            <planeGeometry args={[0.755, 2.82]} />
            <meshPhysicalMaterial
              color={index % 3 === 0 ? "#5EB1BE" : index % 3 === 1 ? "#8BBCC6" : "#97CED3"}
              roughness={0.24}
              metalness={0.025}
              transparent
              opacity={0.61}
              transmission={0.06}
              thickness={0.075}
              ior={1.46}
              clearcoat={1}
              clearcoatRoughness={0.045}
              envMapIntensity={0.72}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {/* Broad soft sky bands give the glazing a readable reflected environment. */}
        <mesh position={[0, 0.76, 1.129]} rotation={[0, 0, -0.035]}>
          <planeGeometry args={[7.7, 0.42]} />
          <meshBasicMaterial color="#E7F7FB" transparent opacity={0.20} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.52, 1.129]} rotation={[0, 0, 0.025]}>
          <planeGeometry args={[7.55, 0.22]} />
          <meshBasicMaterial color="#97CED3" transparent opacity={0.13} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>

        {/* Soft diagonal sky reflections across selected panes break up the flat blue grid. */}
        {[-3.15, -1.58, -0.02, 1.55, 3.12].map((x, index) => (
          <group key={`glass-sky-reflection-${index}`} position={[x, 0.02, 1.132]} rotation={[0, 0, -0.16]}>
            <mesh>
              <planeGeometry args={[0.16, 2.48]} />
              <meshBasicMaterial color="#E7F7FB" transparent opacity={0.22} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.09, 0.05, 0.0005]}>
              <planeGeometry args={[0.05, 2.34]} />
              <meshBasicMaterial color="#C5E9EC" transparent opacity={0.19} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* Exterior curtain-wall mullions */}
        {frameCenters.map((x, index) => (
          <group key={`curtain-frame-${index}`}>
            <mesh position={[x, 0, 1.135]}>
              <boxGeometry args={[0.045, 3.0, 0.085]} />
              <meshStandardMaterial color="#BFCECF" roughness={0.31} metalness={0.28} />
            </mesh>
            <mesh position={[x + 0.027, 0, 1.18]}>
              <boxGeometry args={[0.012, 2.88, 0.012]} />
              <meshStandardMaterial color="#345662" roughness={0.3} metalness={0.18} />
            </mesh>
          </group>
        ))}
        {[-1.38, 0.02, 1.38].map((y) => (
          <mesh key={`transom-${y}`} position={[0, y, 1.14]}>
            <boxGeometry args={[7.82, 0.035, 0.085]} />
            <meshStandardMaterial color="#BFCECF" roughness={0.34} metalness={0.22} />
          </mesh>
        ))}

        {/* Structural pressure joints at the bay edges add real curtain-wall depth. */}
        {[-4.02, 4.02].map((x) => (
          <group key={`facade-edge-joint-${x}`} position={[x, 0, 1.205]}>
            <mesh>
              <boxGeometry args={[0.09, 2.98, 0.09]} />
              <meshStandardMaterial color="#527884" roughness={0.4} metalness={0.22} />
            </mesh>
            <mesh position={[x < 0 ? 0.055 : -0.055, 0, 0.012]}>
              <boxGeometry args={[0.016, 2.82, 0.012]} />
              <meshStandardMaterial color="#FDFDFD" roughness={0.3} metalness={0.18} />
            </mesh>
          </group>
        ))}

        {/* Foundation / sill and structural head frame */}
        <RoundedBox position={[0, -1.66, 0.18]} args={[8.62, 0.26, 2.12]} radius={0.025} smoothness={3} castShadow>
          <meshStandardMaterial color="#BFCECF" roughness={0.58} metalness={0.06} />
        </RoundedBox>
        <RoundedBox position={[0, 1.58, 0.12]} args={[8.68, 0.22, 2.22]} radius={0.035} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#E1EBED" roughness={0.36} metalness={0.08} />
        </RoundedBox>
        <mesh position={[0, 1.465, 1.17]}>
          <boxGeometry args={[8.3, 0.045, 0.075]} />
          <meshStandardMaterial color="#EF592C" roughness={0.36} metalness={0.12} />
        </mesh>
        <mesh position={[0, -1.51, 1.15]}>
          <boxGeometry args={[8.15, 0.035, 0.07]} />
          <meshStandardMaterial color="#FDFDFD" roughness={0.36} metalness={0.14} />
        </mesh>

        {/* Roof cap: layered metal coping and fine panel seams */}
        <RoundedBox position={[0, 1.91, 0]} args={[8.92, 0.18, 2.32]} radius={0.035} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#FDFDFD" roughness={0.32} metalness={0.08} />
        </RoundedBox>
        <mesh position={[0, 2.006, -0.03]}>
          <boxGeometry args={[8.84, 0.025, 2.25]} />
          <meshStandardMaterial color="#BFCECF" roughness={0.45} metalness={0.24} />
        </mesh>
        {roofPanelLines.map((x) => (
          <mesh key={`roof-seam-${x}`} position={[x, 2.023, -0.03]}>
            <boxGeometry args={[0.018, 0.012, 1.94]} />
            <meshStandardMaterial color="#FDFDFD" roughness={0.42} metalness={0.2} />
          </mesh>
        ))}
        {/* Metal coping, a shallow rain channel and a recessed soffit light. */}
        <mesh position={[0, 2.075, 0.99]}>
          <boxGeometry args={[8.78, 0.055, 0.12]} />
          <meshStandardMaterial color="#B2BDC0" roughness={0.3} metalness={0.28} />
        </mesh>
        <mesh position={[0, 1.795, 1.14]}>
          <boxGeometry args={[8.25, 0.025, 0.035]} />
          <meshBasicMaterial color="#F99374" toneMapped={false} />
        </mesh>
        {[-3.8, -2.55, -1.25, 0, 1.25, 2.55, 3.8].map((x) => (
          <mesh key={`roof-drain-${x}`} position={[x, 1.78, 1.15]}>
            <boxGeometry args={[0.055, 0.12, 0.07]} />
            <meshStandardMaterial color="#BFCECF" roughness={0.42} metalness={0.32} />
          </mesh>
        ))}

        {/* Low-profile rooftop ventilation units, each with visible vent slats */}
        {[-2.85, 0.1, 2.75].map((x) => (
          <group key={`roof-vent-${x}`} position={[x, 2.11, -0.26]}>
            <RoundedBox args={[0.92, 0.19, 0.64]} radius={0.035} smoothness={3}>
              <meshStandardMaterial color="#BFCECF" roughness={0.5} metalness={0.16} />
            </RoundedBox>
            {[-0.22, -0.11, 0, 0.11, 0.22].map((z) => (
              <mesh key={z} position={[0, 0, z + 0.02]}>
                <boxGeometry args={[0.72, 0.12, 0.022]} />
                <meshStandardMaterial color="#345662" roughness={0.48} metalness={0.12} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Gate pier with inset sign panel and slim metallic edge trims */}
        <RoundedBox position={[-3.05, 0, 1.19]} args={[1.18, 3.48, 0.22]} radius={0.025} smoothness={4} castShadow>
          <meshStandardMaterial color="#003E92" roughness={0.36} metalness={0.1} />
        </RoundedBox>
        {[-3.62, -2.48].map((x) => (
          <mesh key={`pier-trim-${x}`} position={[x, 0, 1.315]}>
            <boxGeometry args={[0.025, 3.40, 0.025]} />
            <meshStandardMaterial color="#8BBCC6" roughness={0.32} metalness={0.3} />
          </mesh>
        ))}
        <RoundedBox position={[-3.05, 0.43, 1.34]} args={[1.08, 0.42, 0.045]} radius={0.018} smoothness={3}>
          <meshStandardMaterial color="#EF592C" roughness={0.28} metalness={0.04} emissive="#8C311B" emissiveIntensity={0.12} />
        </RoundedBox>
        <Suspense fallback={null}>
          <Text
            position={[-3.05, 0.43, 1.369]}
            fontSize={0.16}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0}
          >
            {gateLabel}
          </Text>
        </Suspense>

        {/* Sign blade above the glazing, with subtle metal brackets */}
        {showAirportSign && (
          <group position={[0, 2.16, 1.18]}>
            <mesh position={[-1.72, -0.31, -0.06]}>
              <boxGeometry args={[0.035, 0.23, 0.055]} />
              <meshStandardMaterial color="#527884" metalness={0.24} roughness={0.36} />
            </mesh>
            <mesh position={[1.72, -0.31, -0.06]}>
              <boxGeometry args={[0.035, 0.23, 0.055]} />
              <meshStandardMaterial color="#527884" metalness={0.24} roughness={0.36} />
            </mesh>
            <RoundedBox args={[4.7, 0.48, 0.09]} radius={0.035} smoothness={4} castShadow>
              <meshStandardMaterial color="#FDFDFD" roughness={0.28} metalness={0.04} />
            </RoundedBox>
            <mesh position={[0, -0.205, 0.047]}>
              <boxGeometry args={[4.5, 0.018, 0.015]} />
              <meshStandardMaterial color="#BFCECF" roughness={0.38} />
            </mesh>
            <Suspense fallback={null}>
              <Text
                position={[0, 0, 0.058]}
                fontSize={0.27}
                color="#345662"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0}
              >
                International Airport
              </Text>
            </Suspense>
          </group>
        )}
      </group>
    );
  }
  function Terminal() {
    return (
      <group>
        <TerminalBay position={[-12.6, 1.405, -4.0]} gateLabel="gate 1" />
        <TerminalBay position={[-4.2, 1.405, -4.0]} gateLabel="gate 2" showAirportSign />
        <TerminalBay position={[4.2, 1.405, -4.0]} gateLabel="gate 3" />
        <TerminalBay position={[12.6, 1.405, -4.0]} gateLabel="gate 4" />
      </group>
    );
  }


  /* =========================================================
     JET BRIDGE
  ========================================================= */
  
  function JetBridge({ position = [2.15, 1.035, -1.25] }) {
    return (
      <group position={position} rotation={[0, Math.PI / 2, 0]}>
  
        <RoundedBox
          args={[
            2.9,
            0.64,
            0.86,
          ]}
          radius={0.04}
          smoothness={4}
          castShadow
        >
          <meshStandardMaterial
            color="#E1EBED"
            roughness={0.46}
            metalness={0.06}
          />
        </RoundedBox>
  
  
        {[-0.44, 0.44].map((z) => (
          <mesh key={`bridge-glazing-${z}`} position={[0, 0.015, z]}>
            <boxGeometry args={[2.68, 0.43, 0.022]} />
            <meshPhysicalMaterial
              color="#5EB1BE"
              roughness={0.16}
              metalness={0.08}
              transparent
              opacity={0.72}
              clearcoat={0.38}
              clearcoatRoughness={0.055}
              envMapIntensity={0.62}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        <mesh
          position={[
            0,
            0.35,
            0,
          ]}
        >
          <boxGeometry
            args={[
              2.95,
              0.055,
              0.90,
            ]}
          />
  
          <meshStandardMaterial
            color="#BFCECF"
            roughness={0.28}
          />
        </mesh>
  
  
        {[-1.0, -0.5, 0, 0.5, 1.0].map((x) => (
          <group key={`bridge-rib-${x}`}>
            {[-0.455, 0.455].map((z) => (
              <mesh key={z} position={[x, 0.015, z]}>
                <boxGeometry args={[0.035, 0.49, 0.032]} />
                <meshStandardMaterial color="#FDFDFD" roughness={0.26} metalness={0.22} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Flexible accordion seal at the terminal end of the passenger bridge. */}
        {[-1.43, -1.36, -1.29, -1.22].map((x, index) => (
          <mesh key={`bridge-bellows-${x}`} position={[x, 0, 0]}>
            <boxGeometry args={[0.035, 0.68 - index * 0.015, 0.9 - index * 0.015]} />
            <meshStandardMaterial color={index % 2 ? "#345662" : "#527884"} roughness={0.72} metalness={0.05} />
          </mesh>
        ))}

        <RoundedBox
          position={[
            -1.55,
            0,
            0,
          ]}
          args={[
            0.28,
            0.80,
            0.88,
          ]}
          radius={0.025}
          smoothness={3}
        >
          <meshStandardMaterial
            color="#345662"
            roughness={0.40}
          />
        </RoundedBox>
  
  
        <mesh
          position={[
            0.85,
            -0.67,
            0,
          ]}
        >
          <cylinderGeometry
            args={[
              0.055,
              0.075,
              1.30,
              16,
            ]}
          />
  
          <meshStandardMaterial
            color={C.metal}
            roughness={0.44}
            metalness={0.18}
          />
        </mesh>
  
  
        {[-0.17, 0.17].map((z) => (
          <group key={`bridge-wheel-${z}`} position={[0.85, -1.31, z]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.145, 0.145, 0.10, 20]} />
              <meshStandardMaterial color="#2C343E" roughness={0.68} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.058, 0.058, 0.105, 16]} />
              <meshStandardMaterial color="#8BBCC6" roughness={0.38} metalness={0.42} />
            </mesh>
          </group>
        ))}

      </group>
    );
  }
  
  
  /* =========================================================
     GROUND EQUIPMENT
  ========================================================= */
  
  function GroundCart({
    position,
    scale = 1,
  }) {
    return (
      <group
        position={position}
        scale={scale}
      >
        <RoundedBox
          position={[
            0,
            0.27,
            0,
          ]}
          args={[
            1.20,
            0.27,
            0.58,
          ]}
          radius={0.03}
          smoothness={3}
        >
          <meshStandardMaterial
            color="#BFCECF"
            roughness={0.5}
          />
        </RoundedBox>
  
  
        {[-0.4, 0.4].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                0.05,
                0,
              ]}
              rotation={[
                Math.PI / 2,
                0,
                0,
              ]}
            >
              <cylinderGeometry
                args={[
                  0.09,
                  0.09,
                  0.08,
                  16,
                ]}
              />
  
              <meshStandardMaterial
                color="#345662"
              />
            </mesh>
          )
        )}
      </group>
    );
  }
  
  
  /* =========================================================
     SAFETY CONE
  ========================================================= */
  
  function Cone({
    position,
  }) {
    return (
      <group
        position={position}
      >
        <mesh
          position={[
            0,
            0.20,
            0,
          ]}
        >
          <coneGeometry
            args={[
              0.10,
              0.34,
              14,
            ]}
          />
  
          <meshStandardMaterial
            color="#F99374"
            roughness={0.5}
          />
        </mesh>
  
  
        <mesh
          position={[
            0,
            0.015,
            0,
          ]}
        >
          <cylinderGeometry
            args={[
              0.14,
              0.14,
              0.03,
              14,
            ]}
          />
  
          <meshStandardMaterial
            color="#383142"
          />
        </mesh>
      </group>
    );
  }
  
  
  /* =========================================================
     BACKGROUND AIRPORT
  ========================================================= */
  
  function BackgroundAirport() {
    return (
      <group>
        {/* A continuous distant concourse gives the airport a believable horizon. */}
        <group position={[0, -0.42, -37.5]}>
          <RoundedBox
            position={[0, 1.45, 0]}
            args={[42, 2.9, 1.7]}
            radius={0.08}
            smoothness={5}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#E1EBED" roughness={0.68} metalness={0.025} />
          </RoundedBox>

          <mesh position={[0, 1.45, 0.865]}>
            <boxGeometry args={[40.8, 2.05, 0.045]} />
            <meshPhysicalMaterial
              color="#5EB1BE"
              roughness={0.3}
              metalness={0.08}
              transparent
              opacity={0.58}
              clearcoat={0.28}
            />
          </mesh>

          {Array.from({ length: 29 }).map((_, index) => (
            <mesh key={index} position={[-19.6 + index * 1.4, 1.45, 0.895]}>
              <boxGeometry args={[0.035, 2.1, 0.045]} />
              <meshStandardMaterial color="#FDFDFD" roughness={0.38} metalness={0.04} />
            </mesh>
          ))}

          <RoundedBox
            position={[0, 2.93, -0.02]}
            args={[42.8, 0.15, 2.05]}
            radius={0.035}
            smoothness={4}
            castShadow
          >
            <meshStandardMaterial color="#F8FAFB" roughness={0.38} />
          </RoundedBox>

          <mesh position={[0, 2.58, 0.88]}>
            <boxGeometry args={[41.2, 0.07, 0.055]} />
            <meshStandardMaterial color="#EF592C" roughness={0.42} />
          </mesh>

          {[-16, -10, -4, 2, 8, 14].map((x) => (
            <mesh key={x} position={[x, 3.08, -0.12]}>
              <boxGeometry args={[1.55, 0.18, 0.72]} />
              <meshStandardMaterial color="#BFCECF" roughness={0.62} />
            </mesh>
          ))}
        </group>

        {/* Control tower: narrow shaft, glazed cab and a thin roof. */}
        <group position={[20.5, -0.42, -32]}>
          <RoundedBox position={[0, 2.1, 0]} args={[0.72, 4.2, 0.82]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color="#E1EBED" roughness={0.6} />
          </RoundedBox>
          <RoundedBox position={[0, 4.35, 0]} args={[1.95, 0.72, 1.25]} radius={0.045} smoothness={5}>
            <meshStandardMaterial color="#E1EBED" roughness={0.36} metalness={0.04} />
          </RoundedBox>
          <mesh position={[0, 4.36, 0.64]}>
            <boxGeometry args={[1.68, 0.43, 0.035]} />
            <meshPhysicalMaterial color="#003E92" roughness={0.2} metalness={0.08} transparent opacity={0.82} />
          </mesh>
          <RoundedBox position={[0, 4.76, 0]} args={[2.08, 0.1, 1.38]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color="#F8FAFB" roughness={0.34} />
          </RoundedBox>
        </group>
      </group>
    );
  }


  /* =========================================================
     WORLD
  ========================================================= */
  
  export default function GatePlatform() {
    return (
      <group>
  
        <Apron />

        <ApronLandscaping />
  
        <StandMarkings />
  
        <Taxiway />
  
        <BackgroundAirport />
  
        <Terminal />
  
        <JetBridge position={[-12.6, 1.035, -1.25]} />
        <JetBridge position={[-4.2, 1.035, -1.25]} />
        <JetBridge position={[4.2, 1.035, -1.25]} />
        <JetBridge position={[12.6, 1.035, -1.25]} />
  
  
        <GroundCart
          position={[
            -13.8,
            -0.38,
            -0.7,
          ]}
        />
  
        <GroundCart
          position={[
            -14.4,
            -0.38,
            -1.4,
          ]}
          scale={0.72}
        />
  
  
        <Cone
          position={[
            -10.8,
            -0.42,
            0.55,
          ]}
        />
  
        <Cone
          position={[
            2.3,
            -0.42,
            1.0,
          ]}
        />
  
      </group>
    );
  }
  