import * as THREE from "three";
import { createRoot } from "react-dom/client";
import {
  Suspense,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { SVGLoader } from "three-stdlib";
import { MapControls, Text } from "@react-three/drei";
import "./style.css";

const hoveredCursor =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXBhdGg9InVybCgjY2xpcDApIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyNi41IiBmaWxsPSJibGFjayIgc3Ryb2tlPSJibGFjayIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzIgMzJMMzIgNDVIMzNMMzMgMzJINDVWMzFIMzNWMTlIMzJWMzFIMTlWMzJIMzJaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0xLjk2MjMxIDEuOTYyMzFMMTMuNzAzMyA1LjEwODI5TDUuMTA4MjkgMTMuNzAzM0wxLjk2MjMxIDEuOTYyMzFaIiBmaWxsPSJibGFjayIvPjwvZz48ZGVmcz48Y2xpcFBhdGggaWQ9ImNsaXAwIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IndoaXRlIi8+PC9jbGlwUGF0aD48L2RlZnM+PC9zdmc+";
const defaultCursor =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBjbGlwLXBhdGg9InVybCgjY2xpcDApIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyNi41IiBzdHJva2U9ImJsYWNrIi8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zMiAzMkw0MS4xOTI0IDQxLjE5MjRMNDEuODk5NSA0MC40ODUzTDMyLjcwNzEgMzEuMjkyOUw0MS4xOTI0IDIyLjgwNzZMNDAuNDg1MyAyMi4xMDA1TDMyIDMwLjU4NThMMjMuNTE0NyAyMi4xMDA1TDIyLjgwNzYgMjIuODA3NkwzMS4yOTI5IDMxLjI5MjlMMjIuMTAwNSA0MC40ODUzTDIyLjgwNzYgNDEuMTkyNEwzMiAzMloiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTUuMzY3MTEgMTIuNzM3M0wyLjY2OTQyIDIuNjY5NDJMMTIuNzM3MyA1LjM2NzExTDUuMzY3MTEgMTIuNzM3M1oiIHN0cm9rZT0iYmxhY2siLz48L2c+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwMCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSJ3aGl0ZSIvPjwvY2xpcFBhdGg+PC9kZWZzPjwvc3ZnPg==";

function Cell({ color, shape, fillOpacity, setClickedPosition, textInput }) {
  const [hovered, hover] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered
      ? `url('${hoveredCursor}'), pointer`
      : `url('${defaultCursor}'), auto`;
  }, [hovered]);

  const handleClick = (event) => {
    setClickedPosition({
      x: event.point.x,
      y: event.point.y,
    });
  };

  return (
    <group>
      <mesh
        onPointerOver={(e) => hover(true)}
        onPointerOut={() => hover(false)}
        onClick={handleClick}
      >
        <meshBasicMaterial
          color={hovered ? "hotpink" : color}
          opacity={fillOpacity}
          depthWrite={false}
          transparent
        />
        <shapeBufferGeometry args={[shape]} />
      </mesh>
    </group>
  );
}

function Svg({ url, textInput, setClickedPosition }) {
  const { paths } = useLoader(SVGLoader, url);
  const shapes = useMemo(
    () =>
      paths.flatMap((p) =>
        p.toShapes(true).map((shape) => ({
          shape,
          color: p.color,
          fillOpacity: p.userData.style.fillOpacity,
        }))
      ),
    [paths]
  );

  const ref = useRef();
  useLayoutEffect(() => {
    const sphere = new THREE.Box3()
      .setFromObject(ref.current)
      .getBoundingSphere(new THREE.Sphere());
    ref.current.position.set(-sphere.center.x, -sphere.center.y, 0);
  }, []);

  return (
    <group ref={ref}>
      {shapes.map((props, index) => (
        <Cell
          key={props.shape.uuid}
          {...props}
          textInput={textInput}
          setClickedPosition={setClickedPosition}
        />
      ))}
    </group>
  );
}

function App() {
  const [textInput, setTextInput] = useState();
  const [clickedPosition, setClickedPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="canvas">
      <Canvas
        frameloop="demand"
        orthographic
        camera={{ position: [0, 0, 50], zoom: 2, up: [0, 0, 1], far: 10000 }}
      >
        <Suspense fallback={null}>
          <Text
            scale={[100, 100, 1]}
            color="white"
            position={[clickedPosition.x, clickedPosition.y, 1]}
          >
            {textInput}
          </Text>
          <Svg
            url="/map.svg"
            setClickedPosition={setClickedPosition}
            textInput={textInput}
          />
        </Suspense>
        <MapControls enableRotate={false} />
      </Canvas>

      <input
        type="text"
        className="input"
        style={{
          position: "absolute",
          left: clickedPosition.x,
          top: clickedPosition.y,
        }}
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
