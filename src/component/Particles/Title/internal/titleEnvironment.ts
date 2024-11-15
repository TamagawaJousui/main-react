import debounce from "debounce";
import * as THREE from "three";
import { SVGResult } from "three/addons/loaders/SVGLoader.js";

import { ParticleData } from "@/component/Particles/types";

import { particleSystem } from "./titleParticleSystem";

// クラスベースのEnvironmentの定義
export class Environment {
    svg: SVGResult;
    particle: THREE.Texture;
    container: HTMLElement;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera | undefined;
    renderer: THREE.WebGLRenderer | undefined;
    particleSystem: particleSystem | undefined;
    particleOptions: ParticleData;
    constructor(
        svg: SVGResult,
        particle: THREE.Texture,
        titleDivRef: React.RefObject<HTMLDivElement>,
        particleOptions: ParticleData
    ) {
        this.svg = svg;
        this.particle = particle;
        if (titleDivRef.current) {
            this.container = titleDivRef.current;
        } else {
            throw new Error("titleDivRef.current is null");
        }
        this.particleOptions = particleOptions;
        this.scene = new THREE.Scene();
        this.createCamera();
        this.createRenderer();
        this.setup();
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener("resize", debounce(this.onWindowResize.bind(this), 300));
    }

    setup() {
        if (!this.camera || !this.renderer) {
            throw new Error("Camera or Renderer is not initialized");
        }
        this.particleSystem = new particleSystem(
            this.scene,
            this.svg,
            this.particle,
            this.camera,
            this.renderer,
            this.particleOptions,
            this.container
        );
    }

    render() {
        if (!this.particleSystem || !this.renderer || !this.camera) {
            throw new Error("ParticleSystem, Renderer, or Camera is not initialized");
        }
        this.particleSystem.render();
        this.renderer.render(this.scene, this.camera);
    }

    caculateFrustum() {
        if (!this.camera) {
            throw new Error("Camera is not initialized");
        }
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const fovRad = (this.camera.fov / 2) * (Math.PI / 180);
        const dist = this.camera.position.z;
        const frustumHeight = 2 * dist * Math.tan(fovRad);
        const frustumWidth = frustumHeight * aspect;
        return frustumWidth;
    }

    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 100);

        const frustumWidth = this.caculateFrustum();

        this.camera.position.set(frustumWidth / 2, 0, 100);
        this.camera.lookAt(frustumWidth / 2, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);

        this.renderer.setAnimationLoop(() => {
            this.render();
        });
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) {
            throw new Error("Camera or Renderer is not initialized");
        }
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        const frustumWidth = this.caculateFrustum();
        this.camera.position.set(frustumWidth / 2, 0, 100);
        this.camera.lookAt(frustumWidth / 2, 0, 0);
    }
}
