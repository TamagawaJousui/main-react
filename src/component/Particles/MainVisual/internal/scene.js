import debounce from "debounce";
import * as THREE from "three";

export const initScene = (canvas) => {
    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // camera.position.x = 1;
    // camera.position.y = 1;
    camera.position.z = 1;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Set pixel ratio
    renderer.setClearColor(0x000000, 0);
    canvas.appendChild(renderer.domElement);

    //     // Set canvas background to gradient
    //     renderer.domElement.style.background = `linear-gradient(
    //   to bottom,
    //   rgb(237, 231, 233) 0%,
    //   rgb(109, 170, 214) 15%,
    //   rgb(103, 100, 120) 65%,
    //   rgb(69, 60, 60) 85%,
    //   rgb(20, 20, 20) 100%
    // )`;

    const handleResize = debounce(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio); // Ensure pixel ratio is set on resize)
    }, 300);

    window.addEventListener("resize", () => {
        handleResize();
    });

    return { scene, camera, renderer };
};
