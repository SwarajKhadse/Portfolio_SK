import {
    RoundedBox,
  } from "@react-three/drei";
  
  import * as THREE from "three";
  
  
  /* =========================================================
     COLORS
  ========================================================= */
  
  const C = {
    apron: "#a8adae",
    runway: "#292f32",
  
    terminal: "#d9d9d5",
    terminalTop: "#eeeeea",
  
    glass: "#66858e",
  
    /*
      Gate reference color.
      Use the same tone on aircraft livery.
    */
    dark: "#2C3847",
  
    metal: "#737d80",
  
    yellow: "#dfc044",
    white: "#eceee9",
  
    blue: "#87afbb",
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
              30,
              34,
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
              24,
              15,
            ]}
          />
  
          <meshPhysicalMaterial
            color="#90999b"
            roughness={0.24}
            clearcoat={0.7}
            transparent
            opacity={0.20}
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
                opacity={0.16}
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
                opacity={0.13}
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
            -0.376,
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
            -0.375,
            -4.2,
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
              7,
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
                -0.375,
                -3,
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
                  5,
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
            -1.15,
            -0.39,
            -12,
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
              9.4,
              18,
            ]}
          />
  
          <meshStandardMaterial
            color={C.runway}
            roughness={0.92}
            metalness={0.01}
          />
        </mesh>
  
  
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <mesh
            key={index}
            position={[
              -1.15,
              -0.365,
              -5.3 -
                index * 1.6,
            ]}
            rotation={[
              -Math.PI / 2,
              0,
              0,
            ]}
          >
            <planeGeometry
              args={[
                0.28,
                0.075,
              ]}
            />
  
            <meshBasicMaterial
              color={C.yellow}
            />
          </mesh>
        ))}
  
  
        {[-5.55, 3.25].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                -0.36,
                -12,
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
                  18,
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
            -5 -
            index * 1.55;
  
          return (
            <group key={index}>
              <mesh
                position={[
                  -5.1,
                  -0.23,
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
                  2.8,
                  -0.23,
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
  
  function Terminal() {
    return (
      <group
        position={[
          5.2,
          0.52,
          -4.0,
        ]}
      >
  
        <RoundedBox
          args={[
            8.5,
            3.65,
            2.15,
          ]}
          radius={0.045}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={C.terminal}
            roughness={0.48}
            metalness={0.03}
          />
        </RoundedBox>
  
  
        <mesh
          position={[
            -0.35,
            0,
            1.10,
          ]}
        >
          <boxGeometry
            args={[
              7.15,
              2.95,
              0.045,
            ]}
          />
  
          <meshPhysicalMaterial
            color={C.glass}
            roughness={0.12}
            metalness={0.08}
            transparent
            opacity={0.64}
          />
        </mesh>
  
  
        {[
          -3.35,
          -2.35,
          -1.35,
          -0.35,
          0.65,
          1.65,
          2.65,
        ].map((x) => (
          <mesh
            key={x}
            position={[
              x,
              0,
              1.13,
            ]}
          >
            <boxGeometry
              args={[
                0.045,
                3,
                0.05,
              ]}
            />
  
            <meshStandardMaterial
              color="#e9ebe8"
              roughness={0.30}
            />
          </mesh>
        ))}
  
  
        <RoundedBox
          position={[
            0,
            1.90,
            0,
          ]}
          args={[
            8.8,
            0.17,
            2.30,
          ]}
          radius={0.03}
          smoothness={4}
        >
          <meshStandardMaterial
            color={C.terminalTop}
            roughness={0.27}
          />
        </RoundedBox>
  
  
        {/* GATE TOWER - EXACT REFERENCE COLOR */}
  
        <RoundedBox
          position={[
            3.05,
            0,
            1.18,
          ]}
          args={[
            1.12,
            3.55,
            0.18,
          ]}
          radius={0.02}
          smoothness={3}
          castShadow
        >
          <meshStandardMaterial
            color={C.dark}
            roughness={0.34}
            metalness={0.06}
          />
        </RoundedBox>
  
  
        <mesh
          position={[
            3.05,
            0.42,
            1.30,
          ]}
        >
          <planeGeometry
            args={[
              0.62,
              0.40,
            ]}
          />
  
          <meshBasicMaterial
            color="#9fc6d3"
          />
        </mesh>
  
  
        {[-2.4, -0.8, 0.8, 2.2].map(
          (x) => (
            <mesh
              key={x}
              position={[
                x,
                2.08,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.60,
                  0.16,
                  0.42,
                ]}
              />
  
              <meshStandardMaterial
                color="#adb5b7"
                roughness={0.58}
              />
            </mesh>
          )
        )}
  
      </group>
    );
  }
  
  
  /* =========================================================
     JET BRIDGE
  ========================================================= */
  
  function JetBridge() {
    return (
      <group
        position={[
          3.2,
          0.98,
          -1.25,
        ]}
      >
  
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
            color="#8e999c"
            roughness={0.38}
            metalness={0.10}
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
            color="#75939c"
            roughness={0.12}
            transparent
            opacity={0.65}
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
            0.14,
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
            0.025,
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
      <group
        position={[
          0,
          -0.42,
          -21,
        ]}
      >
        <RoundedBox
          args={[
            20,
            2.2,
            1.2,
          ]}
          radius={0.04}
          smoothness={4}
        >
          <meshStandardMaterial
            color="#bac2c4"
            roughness={0.85}
            transparent
            opacity={0.35}
          />
        </RoundedBox>
  
  
        <mesh
          position={[
            0,
            0.2,
            0.63,
          ]}
        >
          <boxGeometry
            args={[
              18,
              1.35,
              0.035,
            ]}
          />
  
          <meshPhysicalMaterial
            color="#78949c"
            roughness={0.20}
            transparent
            opacity={0.25}
          />
        </mesh>
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
  
        <JetBridge />
  
  
        <GroundCart
          position={[
            -3.2,
            -0.08,
            -1.3,
          ]}
        />
  
        <GroundCart
          position={[
            -3.8,
            -0.08,
            -2.0,
          ]}
          scale={0.72}
        />
  
  
        <Cone
          position={[
            -2.0,
            -0.25,
            -0.75,
          ]}
        />
  
        <Cone
          position={[
            2.45,
            -0.25,
            0.50,
          ]}
        />
  
      </group>
    );
  }
  