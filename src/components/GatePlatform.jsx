import { Suspense } from "react";
import {
    RoundedBox,
    Text,
  } from "@react-three/drei";
  
  import * as THREE from "three";
  
  
  /* =========================================================
     COLORS
  ========================================================= */
  
  const C = {
    apron: "#b8c3ca",
    runway: "#899eab",
  
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
  
  
  /* =========================================================
     APRON
  ========================================================= */
  
  function Apron() {
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
              60,
              84,
            ]}
          />
  
          <meshStandardMaterial
            color={C.apron}
            roughness={0.9}
            metalness={0.01}
          />
        </mesh>
  
  
        <mesh
          position={[
            0,
            -0.405,
            -1.5,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
        >
          <planeGeometry
            args={[
              20,
              12,
            ]}
          />
  
          <meshPhysicalMaterial
            color="#7f929e"
            roughness={0.36}
            clearcoat={0.35}
            transparent
            opacity={0.045}
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
                color="#777f82"
                transparent
                opacity={0.095}
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
                color="#777f82"
                transparent
                opacity={0.075}
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
  
        <mesh
          position={[
            0,
            -0.412,
            -0.8,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
        >
          <planeGeometry
            args={[
              7.2,
              0.055,
            ]}
          />
  
          <meshBasicMaterial
            color={C.white}
          />
        </mesh>
  
  
        <mesh
          position={[
            -1.0,
            -0.412,
            0.2,
          ]}
          rotation={[
            -Math.PI / 2,
            0,
            0,
          ]}
        >
          <planeGeometry
            args={[
              0.06,
              6,
            ]}
          />
  
          <meshBasicMaterial
            color={C.yellow}
          />
        </mesh>
  
  
        {[-3.1, 2.7].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                -0.412,
                1.2,
              ]}
              rotation={[
                -Math.PI / 2,
                0,
                0,
              ]}
            >
              <planeGeometry
                args={[
                  0.04,
                  4,
                ]}
              />
  
              <meshBasicMaterial
                color={C.white}
                transparent
                opacity={0.6}
              />
            </mesh>
          )
        )}
  
      </group>
    );
  }
  
  
  /* =========================================================
     TAXIWAY
  ========================================================= */
  
  function Taxiway() {
    return (
      <group>
  
        <mesh
          position={[
            -21.0,
            -0.414,
            -14.0,
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
              6.8,
              28,
            ]}
          />
  
          <meshStandardMaterial
            color={C.runway}
            roughness={0.92}
            metalness={0.01}
          />
        </mesh>
  
  
        {Array.from({ length: 10 }).map((_, index) => (
          <mesh
            key={index}
            position={[-21.0, -0.405, -2.0 - index * 2.25]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.12, 0.72]} />
            <meshBasicMaterial color="#f5faff" />
          </mesh>
        ))}

        {[-24.4, -17.6].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                -0.405,
                -14.0,
              ]}
              rotation={[
                -Math.PI / 2,
                0,
                0,
              ]}
            >
              <planeGeometry
                args={[
                  0.05,
                  28,
                ]}
              />
  
              <meshBasicMaterial
                color={C.white}
              />
            </mesh>
          )
        )}
  
  
        {Array.from({
          length: 10,
        }).map((_, index) => {
          const z =
            -2.8 -
            index * 2.35;
  
          return (
            <group key={index}>
              <mesh
                position={[
                  -24.4,
                  -0.385,
                  z,
                ]}
              >
                <sphereGeometry
                  args={[
                    0.045,
                    10,
                    10,
                  ]}
                />
  
                <meshBasicMaterial
                  color="#88b6c6"
                />
              </mesh>
  
              <mesh
                position={[
                  -17.6,
                  -0.385,
                  z,
                ]}
              >
                <sphereGeometry
                  args={[
                    0.045,
                    10,
                    10,
                  ]}
                />
  
                <meshBasicMaterial
                  color="#88b6c6"
                />
              </mesh>
            </group>
          );
        })}
  
      </group>
    );
  }
  
  
  /* =========================================================
     TERMINAL
  ========================================================= */
  
  function TerminalBay({ position, gateLabel, showAirportSign = false }) {
    return (
      <group position={position}>
        <RoundedBox
          args={[8.5, 3.65, 2.15]}
          radius={0.045}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={C.terminal} roughness={0.62} metalness={0.02} />
        </RoundedBox>

        {/* Cool blue curtain wall across each boarding gate. */}
        <mesh position={[-0.35, 0, 1.103]}>
          <boxGeometry args={[7.35, 2.96, 0.05]} />
          <meshPhysicalMaterial
            color="#426f88"
            roughness={0.27}
            metalness={0.08}
            transparent
            opacity={0.68}
            clearcoat={0.45}
            clearcoatRoughness={0.2}
          />
        </mesh>

        {Array.from({ length: 11 }).map((_, index) => {
          const x = -3.85 + index * 0.7;
          return (
            <mesh key={index} position={[x, 0, 1.135]}>
              <boxGeometry args={[0.045, 3.02, 0.055]} />
              <meshStandardMaterial color="#edf7ff" roughness={0.32} metalness={0.08} />
            </mesh>
          );
        })}

        <RoundedBox
          position={[0, 1.9, 0]}
          args={[8.8, 0.17, 2.3]}
          radius={0.03}
          smoothness={4}
          castShadow
        >
          <meshStandardMaterial color={C.terminalTop} roughness={0.3} />
        </RoundedBox>

        {/* Slim blue fascia gives the terminal a designed silhouette rather than a grey block. */}
        <mesh position={[0, 1.72, 1.12]}>
          <boxGeometry args={[8.3, 0.09, 0.08]} />
          <meshStandardMaterial color="#2b83c5" roughness={0.42} metalness={0.04} />
        </mesh>

        <RoundedBox
          position={[-3.05, 0, 1.18]}
          args={[1.18, 3.55, 0.18]}
          radius={0.02}
          smoothness={3}
          castShadow
        >
          <meshStandardMaterial color="#365a73" roughness={0.38} metalness={0.05} />
        </RoundedBox>

        <mesh position={[-3.05, 0.42, 1.30]}>
          <planeGeometry args={[1.06, 0.42]} />
          <meshBasicMaterial color="#1477f8" />
        </mesh>
        <Suspense fallback={null}>
          <Text
            position={[-3.05, 0.42, 1.315]}
            fontSize={0.16}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0}
          >
            {gateLabel}
          </Text>
        </Suspense>

        {[-2.4, -0.8, 0.8, 2.2].map((x) => (
          <mesh key={x} position={[x, 2.08, 0]}>
            <boxGeometry args={[0.6, 0.16, 0.42]} />
            <meshStandardMaterial color="#b7cedf" roughness={0.56} />
          </mesh>
        ))}

        {showAirportSign && (
          <group position={[0, 2.16, 1.16]}>
            <RoundedBox args={[4.7, 0.48, 0.08]} radius={0.05} smoothness={4}>
              <meshStandardMaterial color="#f7fbff" roughness={0.32} />
            </RoundedBox>
            <Suspense fallback={null}>
              <Text
                position={[0, 0, 0.052]}
                fontSize={0.27}
                color="#215a87"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0}
              >
                international airport
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
  
  
        <mesh
          position={[
            0,
            0,
            -0.44,
          ]}
        >
          <boxGeometry
            args={[
              2.7,
              0.45,
              0.025,
            ]}
          />
  
          <meshPhysicalMaterial
            color="#476c82"
            roughness={0.24}
            transparent
            opacity={0.62}
          />
        </mesh>
  
  
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
  
  
        {[-1.0, -0.5, 0, 0.5, 1.0].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                0,
                -0.46,
              ]}
            >
              <boxGeometry
                args={[
                  0.04,
                  0.48,
                  0.05,
                ]}
              />
  
              <meshStandardMaterial
                color="#e7eae7"
                roughness={0.28}
              />
            </mesh>
          )
        )}
  
  
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
  
  
        <mesh
          position={[
            0.85,
            -1.31,
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
              0.145,
              0.145,
              0.10,
              18,
            ]}
          />
  
          <meshStandardMaterial
            color="#373f42"
            roughness={0.68}
          />
        </mesh>
  
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
  