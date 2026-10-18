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
    apron: "#34353b",
    runway: "#34353b",
  
    terminal: "#dfe7ec",
    terminalTop: "#f5f8fa",
  
    glass: "#426b83",
  
    /*
      Gate reference color.
      Use the same tone on aircraft livery.
    */
    dark: "#2C3847",
  
    metal: "#82929d",
  
    yellow: "#e7b934",
    white: "#f5f8fa",
  
    blue: "#1477f8",
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
        const value = 49 + broad + grain;
        const index = (y * size + x) * 4;
        image.data[index] = Math.max(26, Math.min(75, value - 1));
        image.data[index + 1] = Math.max(27, Math.min(76, value));
        image.data[index + 2] = Math.max(32, Math.min(83, value + 5));
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
      const shade = random() > 0.5 ? "63, 64, 70" : "29, 30, 35";
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
        const value = 185 + mottling + grain;
        const index = (y * size + x) * 4;
        image.data[index] = Math.max(160, Math.min(205, value - 3));
        image.data[index + 1] = Math.max(165, Math.min(210, value));
        image.data[index + 2] = Math.max(170, Math.min(215, value + 4));
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
     APRON
  ========================================================= */
  
  function Apron() {
    const concreteTexture = useMemo(() => createConcreteTexture(4, 6, 117), []);
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
              64,
              84,
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
                color="#8b8e95"
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
                color="#8b8e95"
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
    const runwayCenterX = -21.0;
    const runwayCenterZ = -33.0;
    const runwayLength = 33.5;
    const runwayWidth = 17.0;
    const runwayStartZ = runwayCenterZ + runwayLength / 2;
    const runwayEdgeX = runwayWidth / 2;

    const pavementPatches = [];
    const patchColors = ["#414148", "#2d2e34", "#393a40", "#4a4b51"];
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
          position={[-21.0, -0.414, -9.0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[7.2, 24.0]} />
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
            position={[runwayCenterX + side * (runwayEdgeX + 0.95), -0.412, runwayCenterZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[1.9, runwayLength + 0.2]} />
            <meshStandardMaterial color="#969d20" roughness={1} metalness={0} />
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
            <meshBasicMaterial color="#ffb45d" />
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
                  <meshStandardMaterial color="#f5f1e9" roughness={0.72} />
                </mesh>
                <mesh position={[0, 0.17, 0]}>
                  <cylinderGeometry args={[0.042, 0.042, 0.055, 8]} />
                  <meshStandardMaterial color="#ffb45d" emissive="#8a4219" emissiveIntensity={0.12} />
                </mesh>
              </group>
            );
          })
        )}

        {/* Subtle taxi connector edge dashes remain visible approaching the threshold. */}
        {Array.from({ length: 7 }, (_, index) => -1.6 - index * 2.35).map((z, index) => (
          <mesh key={`connector-dash-${index}`} position={[-21.0, -0.405, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 0.68]} />
            <meshBasicMaterial color="#f5f2ec" transparent opacity={0.78} />
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
          <meshStandardMaterial color="#d9e3e9" roughness={0.72} metalness={0.025} />
        </mesh>
        {[-4.12, 4.12].map((x) => (
          <mesh key={`end-wall-${x}`} position={[x, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 3.62, 2.05]} />
            <meshStandardMaterial color="#dfe7ec" roughness={0.66} metalness={0.025} />
          </mesh>
        ))}

        {/* Interior floor, structural depth and warm practical lighting. */}
        <mesh position={[0, -1.43, -0.04]} receiveShadow>
          <boxGeometry args={[8.12, 0.08, 1.74]} />
          <meshStandardMaterial color="#aebfc9" roughness={0.86} />
        </mesh>
        <mesh position={[0, -1.382, 0.12]}>
          <boxGeometry args={[7.85, 0.018, 1.34]} />
          <meshPhysicalMaterial color="#dbe7ed" roughness={0.28} metalness={0.04} clearcoat={0.42} />
        </mesh>
        <mesh position={[0, 1.28, -0.08]}>
          <boxGeometry args={[7.95, 0.12, 1.75]} />
          <meshStandardMaterial color="#dce5ea" roughness={0.62} />
        </mesh>
        {/* Interior columns with metallic pressure caps. */}
        {[-3.15, -1.55, 0.05, 1.65, 3.2].map((x) => (
          <group key={`interior-column-${x}`} position={[x, -0.05, -0.48]}>
            <mesh castShadow>
              <boxGeometry args={[0.09, 2.62, 0.10]} />
              <meshStandardMaterial color="#8fa7b5" roughness={0.38} metalness={0.24} />
            </mesh>
            <mesh position={[0, 0, 0.056]}>
              <boxGeometry args={[0.018, 2.54, 0.012]} />
              <meshStandardMaterial color="#dbe8ee" roughness={0.28} metalness={0.3} />
            </mesh>
          </group>
        ))}
        {/* Recessed linear ceiling luminaires with a warm light diffuser. */}
        {[-3.25, -2.15, -1.05, 0.05, 1.15, 2.25, 3.35].map((x) => (
          <group key={`ceiling-light-${x}`} position={[x, 1.205, 0.55]}>
            <mesh>
              <boxGeometry args={[0.66, 0.055, 0.09]} />
              <meshStandardMaterial color="#8fa4b0" roughness={0.58} />
            </mesh>
            <mesh position={[0, -0.029, 0.006]}>
              <boxGeometry args={[0.56, 0.012, 0.075]} />
              <meshBasicMaterial color="#fff0d2" toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* Waiting seats sit on the interior floor and provide scale behind the glass. */}
        {[-2.75, -1.0, 0.85, 2.55].map((x, index) => (
          <group key={`waiting-seat-${index}`} position={[x, -1.29, -0.16]}>
            <RoundedBox position={[0, 0.02, 0]} args={[0.54, 0.11, 0.40]} radius={0.035} smoothness={3}>
              <meshStandardMaterial color={index % 2 ? "#607f92" : "#7897a8"} roughness={0.62} />
            </RoundedBox>
            <RoundedBox position={[0, 0.22, -0.145]} args={[0.52, 0.32, 0.075]} radius={0.025} smoothness={3}>
              <meshStandardMaterial color="#6d8da0" roughness={0.64} />
            </RoundedBox>
            {[-0.19, 0.19].map((legX) => (
              <mesh key={legX} position={[legX, -0.075, 0.04]}>
                <boxGeometry args={[0.035, 0.12, 0.035]} />
                <meshStandardMaterial color="#687d88" roughness={0.45} metalness={0.35} />
              </mesh>
            ))}
          </group>
        ))}
        {/* A grounded gate-service counter sits deeper inside the concourse. */}
        <group position={[0, -1.39, -0.64]}>
          <RoundedBox position={[0, 0.37, 0]} args={[1.55, 0.74, 0.34]} radius={0.035} smoothness={3} castShadow>
            <meshStandardMaterial color="#c9d6de" roughness={0.46} />
          </RoundedBox>
          <mesh position={[0, 0.75, 0.015]}>
            <boxGeometry args={[1.42, 0.025, 0.30]} />
            <meshStandardMaterial color="#f3f7f9" roughness={0.32} />
          </mesh>
          <mesh position={[0.39, 0.86, -0.03]}>
            <boxGeometry args={[0.34, 0.17, 0.022]} />
            <meshPhysicalMaterial color="#244b65" roughness={0.22} metalness={0.05} clearcoat={0.8} />
          </mesh>
        </group>

        {/* Individual insulated glass panes with alternating cool reflections */}
        {windowCenters.map((x, index) => (
          <mesh key={`glass-pane-${index}`} position={[x, 0, 1.095]}>
            <planeGeometry args={[0.755, 2.82]} />
            <meshPhysicalMaterial
              color={index % 3 === 0 ? "#9fc7dc" : index % 3 === 1 ? "#709fba" : "#b6d3e1"}
              roughness={0.12}
              metalness={0.08}
              transparent
              opacity={0.48}
              transmission={0.16}
              thickness={0.075}
              ior={1.46}
              clearcoat={1}
              clearcoatRoughness={0.045}
              envMapIntensity={1.9}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {/* Broad soft sky bands give the glazing a readable reflected environment. */}
        <mesh position={[0, 0.76, 1.129]} rotation={[0, 0, -0.035]}>
          <planeGeometry args={[7.7, 0.42]} />
          <meshBasicMaterial color="#f4fbff" transparent opacity={0.105} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, -0.52, 1.129]} rotation={[0, 0, 0.025]}>
          <planeGeometry args={[7.55, 0.22]} />
          <meshBasicMaterial color="#8ec4e0" transparent opacity={0.075} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>

        {/* Soft diagonal sky reflections across selected panes break up the flat blue grid. */}
        {[-3.15, -1.58, -0.02, 1.55, 3.12].map((x, index) => (
          <group key={`glass-sky-reflection-${index}`} position={[x, 0.02, 1.132]} rotation={[0, 0, -0.16]}>
            <mesh>
              <planeGeometry args={[0.16, 2.48]} />
              <meshBasicMaterial color="#f2fbff" transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.09, 0.05, 0.0005]}>
              <planeGeometry args={[0.05, 2.34]} />
              <meshBasicMaterial color="#b9e5f7" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* Exterior curtain-wall mullions */}
        {frameCenters.map((x, index) => (
          <group key={`curtain-frame-${index}`}>
            <mesh position={[x, 0, 1.135]}>
              <boxGeometry args={[0.045, 3.0, 0.085]} />
              <meshStandardMaterial color="#d7e5ec" roughness={0.31} metalness={0.28} />
            </mesh>
            <mesh position={[x + 0.027, 0, 1.18]}>
              <boxGeometry args={[0.012, 2.88, 0.012]} />
              <meshStandardMaterial color="#547c94" roughness={0.3} metalness={0.18} />
            </mesh>
          </group>
        ))}
        {[-1.38, 0.02, 1.38].map((y) => (
          <mesh key={`transom-${y}`} position={[0, y, 1.14]}>
            <boxGeometry args={[7.82, 0.035, 0.085]} />
            <meshStandardMaterial color="#c5d8e2" roughness={0.34} metalness={0.22} />
          </mesh>
        ))}

        {/* Structural pressure joints at the bay edges add real curtain-wall depth. */}
        {[-4.02, 4.02].map((x) => (
          <group key={`facade-edge-joint-${x}`} position={[x, 0, 1.205]}>
            <mesh>
              <boxGeometry args={[0.09, 2.98, 0.09]} />
              <meshStandardMaterial color="#6c8b9c" roughness={0.4} metalness={0.22} />
            </mesh>
            <mesh position={[x < 0 ? 0.055 : -0.055, 0, 0.012]}>
              <boxGeometry args={[0.016, 2.82, 0.012]} />
              <meshStandardMaterial color="#edf5f9" roughness={0.3} metalness={0.18} />
            </mesh>
          </group>
        ))}

        {/* Foundation / sill and structural head frame */}
        <RoundedBox position={[0, -1.66, 0.18]} args={[8.62, 0.26, 2.12]} radius={0.025} smoothness={3} castShadow>
          <meshStandardMaterial color="#c8d4dc" roughness={0.58} metalness={0.06} />
        </RoundedBox>
        <RoundedBox position={[0, 1.58, 0.12]} args={[8.68, 0.22, 2.22]} radius={0.035} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#e5edf2" roughness={0.36} metalness={0.08} />
        </RoundedBox>
        <mesh position={[0, 1.465, 1.17]}>
          <boxGeometry args={[8.3, 0.045, 0.075]} />
          <meshStandardMaterial color="#247fc0" roughness={0.36} metalness={0.12} />
        </mesh>
        <mesh position={[0, -1.51, 1.15]}>
          <boxGeometry args={[8.15, 0.035, 0.07]} />
          <meshStandardMaterial color="#f2f7fa" roughness={0.36} metalness={0.14} />
        </mesh>

        {/* Roof cap: layered metal coping and fine panel seams */}
        <RoundedBox position={[0, 1.91, 0]} args={[8.92, 0.18, 2.32]} radius={0.035} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#f3f7f9" roughness={0.32} metalness={0.08} />
        </RoundedBox>
        <mesh position={[0, 2.006, -0.03]}>
          <boxGeometry args={[8.84, 0.025, 2.25]} />
          <meshStandardMaterial color="#aabac4" roughness={0.45} metalness={0.24} />
        </mesh>
        {roofPanelLines.map((x) => (
          <mesh key={`roof-seam-${x}`} position={[x, 2.023, -0.03]}>
            <boxGeometry args={[0.018, 0.012, 1.94]} />
            <meshStandardMaterial color="#e8eef2" roughness={0.42} metalness={0.2} />
          </mesh>
        ))}
        {/* Metal coping, a shallow rain channel and a recessed soffit light. */}
        <mesh position={[0, 2.075, 0.99]}>
          <boxGeometry args={[8.78, 0.055, 0.12]} />
          <meshStandardMaterial color="#c0cdd5" roughness={0.3} metalness={0.28} />
        </mesh>
        <mesh position={[0, 1.795, 1.14]}>
          <boxGeometry args={[8.25, 0.025, 0.035]} />
          <meshBasicMaterial color="#fbe8c8" toneMapped={false} />
        </mesh>
        {[-3.8, -2.55, -1.25, 0, 1.25, 2.55, 3.8].map((x) => (
          <mesh key={`roof-drain-${x}`} position={[x, 1.78, 1.15]}>
            <boxGeometry args={[0.055, 0.12, 0.07]} />
            <meshStandardMaterial color="#aebdc6" roughness={0.42} metalness={0.32} />
          </mesh>
        ))}

        {/* Low-profile rooftop ventilation units, each with visible vent slats */}
        {[-2.85, 0.1, 2.75].map((x) => (
          <group key={`roof-vent-${x}`} position={[x, 2.11, -0.26]}>
            <RoundedBox args={[0.92, 0.19, 0.64]} radius={0.035} smoothness={3}>
              <meshStandardMaterial color="#b7c5ce" roughness={0.5} metalness={0.16} />
            </RoundedBox>
            {[-0.22, -0.11, 0, 0.11, 0.22].map((z) => (
              <mesh key={z} position={[0, 0, z + 0.02]}>
                <boxGeometry args={[0.72, 0.12, 0.022]} />
                <meshStandardMaterial color="#718996" roughness={0.48} metalness={0.12} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Gate pier with inset sign panel and slim metallic edge trims */}
        <RoundedBox position={[-3.05, 0, 1.19]} args={[1.18, 3.48, 0.22]} radius={0.025} smoothness={4} castShadow>
          <meshStandardMaterial color="#244a63" roughness={0.36} metalness={0.1} />
        </RoundedBox>
        {[-3.62, -2.48].map((x) => (
          <mesh key={`pier-trim-${x}`} position={[x, 0, 1.315]}>
            <boxGeometry args={[0.025, 3.40, 0.025]} />
            <meshStandardMaterial color="#afc5d1" roughness={0.32} metalness={0.3} />
          </mesh>
        ))}
        <RoundedBox position={[-3.05, 0.43, 1.34]} args={[1.08, 0.42, 0.045]} radius={0.018} smoothness={3}>
          <meshStandardMaterial color="#087de0" roughness={0.28} metalness={0.04} emissive="#064b9c" emissiveIntensity={0.12} />
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
              <meshStandardMaterial color="#7b909c" metalness={0.24} roughness={0.36} />
            </mesh>
            <mesh position={[1.72, -0.31, -0.06]}>
              <boxGeometry args={[0.035, 0.23, 0.055]} />
              <meshStandardMaterial color="#7b909c" metalness={0.24} roughness={0.36} />
            </mesh>
            <RoundedBox args={[4.7, 0.48, 0.09]} radius={0.035} smoothness={4} castShadow>
              <meshStandardMaterial color="#f7fbff" roughness={0.28} metalness={0.04} />
            </RoundedBox>
            <mesh position={[0, -0.205, 0.047]}>
              <boxGeometry args={[4.5, 0.018, 0.015]} />
              <meshStandardMaterial color="#b7ccd9" roughness={0.38} />
            </mesh>
            <Suspense fallback={null}>
              <Text
                position={[0, 0, 0.058]}
                fontSize={0.27}
                color="#215a87"
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
            color="#cfd9df"
            roughness={0.46}
            metalness={0.06}
          />
        </RoundedBox>
  
  
        {[-0.44, 0.44].map((z) => (
          <mesh key={`bridge-glazing-${z}`} position={[0, 0.015, z]}>
            <boxGeometry args={[2.68, 0.43, 0.022]} />
            <meshPhysicalMaterial
              color="#7298ad"
              roughness={0.16}
              metalness={0.08}
              transparent
              opacity={0.56}
              clearcoat={1}
              clearcoatRoughness={0.055}
              envMapIntensity={1.55}
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
            color="#dfe1de"
            roughness={0.28}
          />
        </mesh>
  
  
        {[-1.0, -0.5, 0, 0.5, 1.0].map((x) => (
          <group key={`bridge-rib-${x}`}>
            {[-0.455, 0.455].map((z) => (
              <mesh key={z} position={[x, 0.015, z]}>
                <boxGeometry args={[0.035, 0.49, 0.032]} />
                <meshStandardMaterial color="#e7edf0" roughness={0.26} metalness={0.22} />
              </mesh>
            ))}
          </group>
        ))}
        {/* Flexible accordion seal at the terminal end of the passenger bridge. */}
        {[-1.43, -1.36, -1.29, -1.22].map((x, index) => (
          <mesh key={`bridge-bellows-${x}`} position={[x, 0, 0]}>
            <boxGeometry args={[0.035, 0.68 - index * 0.015, 0.9 - index * 0.015]} />
            <meshStandardMaterial color={index % 2 ? "#687d87" : "#9eacb4"} roughness={0.72} metalness={0.05} />
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
            color="#7d888b"
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
              <meshStandardMaterial color="#373f42" roughness={0.68} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.058, 0.058, 0.105, 16]} />
              <meshStandardMaterial color="#9baab1" roughness={0.38} metalness={0.42} />
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
            color="#c8cdcf"
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
                color="#3c4447"
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
            color="#efbd3e"
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
            color="#363c3f"
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
            <meshStandardMaterial color="#d5e0e7" roughness={0.68} metalness={0.025} />
          </RoundedBox>

          <mesh position={[0, 1.45, 0.865]}>
            <boxGeometry args={[40.8, 2.05, 0.045]} />
            <meshPhysicalMaterial
              color="#426b83"
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
              <meshStandardMaterial color="#edf4f8" roughness={0.38} metalness={0.04} />
            </mesh>
          ))}

          <RoundedBox
            position={[0, 2.93, -0.02]}
            args={[42.8, 0.15, 2.05]}
            radius={0.035}
            smoothness={4}
            castShadow
          >
            <meshStandardMaterial color="#f5f8fa" roughness={0.38} />
          </RoundedBox>

          <mesh position={[0, 2.58, 0.88]}>
            <boxGeometry args={[41.2, 0.07, 0.055]} />
            <meshStandardMaterial color="#2b83c5" roughness={0.42} />
          </mesh>

          {[-16, -10, -4, 2, 8, 14].map((x) => (
            <mesh key={x} position={[x, 3.08, -0.12]}>
              <boxGeometry args={[1.55, 0.18, 0.72]} />
              <meshStandardMaterial color="#b5c5cf" roughness={0.62} />
            </mesh>
          ))}
        </group>

        {/* Control tower: narrow shaft, glazed cab and a thin roof. */}
        <group position={[20.5, -0.42, -32]}>
          <RoundedBox position={[0, 2.1, 0]} args={[0.72, 4.2, 0.82]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color="#d5e0e7" roughness={0.6} />
          </RoundedBox>
          <RoundedBox position={[0, 4.35, 0]} args={[1.95, 0.72, 1.25]} radius={0.045} smoothness={5}>
            <meshStandardMaterial color="#e5edf2" roughness={0.36} metalness={0.04} />
          </RoundedBox>
          <mesh position={[0, 4.36, 0.64]}>
            <boxGeometry args={[1.68, 0.43, 0.035]} />
            <meshPhysicalMaterial color="#345f78" roughness={0.2} metalness={0.08} transparent opacity={0.82} />
          </mesh>
          <RoundedBox position={[0, 4.76, 0]} args={[2.08, 0.1, 1.38]} radius={0.025} smoothness={4}>
            <meshStandardMaterial color="#f5f8fa" roughness={0.34} />
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
  