import * as THREE from "three";
import { GPUComputationRenderer, SVGResult, Variable } from "three/examples/jsm/Addons.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

import { ParticleData } from "@/component/Particles/types";
import { initGPUComputationRenderer } from "@/utils/foregroundParticles/foregroundGpgpu";
// @ts-expect-error written in javascript
import { initParticle } from "@/utils/foregroundParticles/foregroundParticle";

export class particleSystem {
    scene: THREE.Scene;
    svg: SVGResult;
    xLength: number = 0;
    yLength: number = 0;
    startTime: number = 0;
    particleImg: THREE.Texture;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    colorChange: THREE.Color;
    mouseDown: boolean;
    particleOptions: ParticleData;
    container: HTMLElement;
    planeArea: THREE.Mesh = new THREE.Mesh();
    particles: THREE.Points = new THREE.Points();
    outlineContours: THREE.Group<THREE.Object3DEventMap> = new THREE.Group();
    planeParticles: THREE.Points = new THREE.Points();
    planeParticlesGeometryCopy: THREE.BufferGeometry = new THREE.BufferGeometry();
    colorStops: THREE.Color[] = [
        // new THREE.Color(0xede7e9),
        new THREE.Color(0xea3b4d),
        new THREE.Color(0xfb7c39),
        new THREE.Color(0xc4ded0),
        new THREE.Color(0xe4c2ca),
        new THREE.Color(0xe4c2ca),
    ];
    gpuCompute: GPUComputationRenderer | null = null;
    positionVariable: Variable | null = null;
    colorVariable: Variable | null = null;
    constructor(
        scene: THREE.Scene,
        svg: SVGResult,
        particleImg: THREE.Texture,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer,
        particleOptions: ParticleData,
        container: HTMLElement
    ) {
        this.scene = scene;
        this.svg = svg;
        this.particleImg = particleImg;
        this.camera = camera;
        this.renderer = renderer;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(1.3, -1.3);

        this.colorChange = new THREE.Color();

        this.mouseDown = false;

        this.particleOptions = particleOptions;
        this.container = container;

        this.setup();
        this.bindEvents();
    }

    setup() {
        const geometry = new THREE.PlaneGeometry(
            this.visibleWidthAtZDepth(100, this.camera),
            this.visibleHeightAtZDepth(100, this.camera)
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
        });
        this.planeArea = new THREE.Mesh(geometry, material);
        this.planeArea.visible = false;
        this.createText();
        if (!this.startTime) {
            this.startTime = performance.now();
        }
    }

    bindEvents() {
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    onMouseMove(event: MouseEvent) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    render() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObject(this.planeArea);

        if (intersects.length === 0) return;

        const mx = intersects[0].point.x;
        const my = intersects[0].point.y;

        if (!this.positionVariable || !this.colorVariable || !this.gpuCompute) return;

        this.positionVariable.material.uniforms.area = { value: this.particleOptions.area };
        this.positionVariable.material.uniforms.ease = { value: this.particleOptions.ease };
        this.positionVariable.material.uniforms.size = { value: this.particleOptions.particleSize };
        this.positionVariable.material.uniforms.mouse = { value: new THREE.Vector2(mx, my) };

        this.colorVariable.material.uniforms.area = { value: this.particleOptions.area };
        this.colorVariable.material.uniforms.ease = { value: this.particleOptions.ease };
        this.colorVariable.material.uniforms.mouse = { value: new THREE.Vector2(mx, my) };

        this.gpuCompute.compute();

        // Get the computed color
        const colorTexture = this.gpuCompute.getCurrentRenderTarget(this.colorVariable).texture;

        // Get the computed texture
        const posTexture = this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;

        const material = this.planeParticles.material as THREE.ShaderMaterial;
        material.uniforms.positionTexture.value = posTexture;
        material.uniforms.colorTexture.value = colorTexture;
    }

    createText() {
        const shapes: THREE.Shape[] = [];
        this.svg.paths.forEach((path) => {
            const shape = SVGLoader.createShapes(path);
            shapes.push(...shape);
        });
        const geometry = new THREE.ShapeGeometry(shapes);
        geometry.computeBoundingBox();

        if (!geometry.boundingBox) {
            throw new Error("Geometry bounding box is null");
        }
        const xLength = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        const yLength = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

        this.xLength = xLength;
        this.yLength = yLength;

        this.outlineContours = this.outlineContour(shapes, xLength, yLength);
        this.planeParticles = this.planeParticle(shapes, xLength, yLength);

        this.particles = this.planeParticles;

        this.scene.add(this.outlineContours);
        this.scene.add(this.planeParticles);

        this.planeParticlesGeometryCopy = new THREE.BufferGeometry();
        this.planeParticlesGeometryCopy.copy(this.particles.geometry);
    }

    outlineContour(shapes: THREE.Shape[], xLength: number, yLength: number) {
        const lineSegments: THREE.LineSegments[] = [];

        for (let x = 0; x < shapes.length; x++) {
            const shape = shapes[x];

            const shapeGeometry = new THREE.ShapeGeometry(shape);
            const edgesGeometry = new THREE.EdgesGeometry(shapeGeometry);

            const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 10 });
            const line = new THREE.LineSegments(edgesGeometry, lineMaterial);

            lineSegments.push(line);
        }

        const outlineGroup = new THREE.Group();
        lineSegments.forEach((segment) => {
            segment.translateX(-xLength - 5);
            segment.translateY(-yLength + 10);
            outlineGroup.add(segment);
        });

        return outlineGroup;
    }

    planeParticle(shapes: THREE.Shape[], xLength: number, yLength: number) {
        const points: THREE.Vector3[] = [];
        const colors: number[] = [];
        const opacities: number[] = [];
        const sizes: number[] = [];

        for (let x = 0; x < shapes.length; x++) {
            const shape = shapes[x];

            // Get contour and holes points
            const { shape: shapeVertices, holes: holeVertices } = shape.extractPoints(12);

            // Triangulate the shape to get the interior points
            const triangles = THREE.ShapeUtils.triangulateShape(shapeVertices, holeVertices);
            const vertices = [...shapeVertices];
            vertices.push(...holeVertices.flat(2));

            // Add points inside the shape
            triangles.forEach((triangle) => {
                const [a, b, c] = triangle.map((index) => vertices[index]);

                // Calculate the area of the triangle
                const area = Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;

                // Determine the number of points based on the area
                const numPoints = Math.floor(this.particleOptions.planeParticleAmount * area);

                // Generate random points inside the triangle
                for (let i = 0; i < numPoints; i++) {
                    const r1 = Math.random();
                    const r2 = Math.random();
                    const sqrtR1 = Math.sqrt(r1);

                    const x = (1 - sqrtR1) * a.x + sqrtR1 * (1 - r2) * b.x + sqrtR1 * r2 * c.x;
                    const y = (1 - sqrtR1) * a.y + sqrtR1 * (1 - r2) * b.y + sqrtR1 * r2 * c.y;

                    const point = new THREE.Vector3(x, y, 0);
                    points.push(point);
                    colors.push(this.colorChange.r, this.colorChange.g, this.colorChange.b);
                    opacities.push(1);
                    sizes.push(1);
                }
            });
        }

        const geoParticles = new THREE.BufferGeometry().setFromPoints(points);

        geoParticles.translate(-xLength - 5, -yLength + 10, 0);

        const translatedPoints = geoParticles.attributes.position.array as Float32Array;

        const { size, gpuCompute, positionVariable, colorVariable } = initGPUComputationRenderer(
            translatedPoints,
            this.renderer
        );
        this.gpuCompute = gpuCompute;
        this.positionVariable = positionVariable;
        this.colorVariable = colorVariable;

        const planeParticles = initParticle(size);

        return planeParticles;
    }

    visibleHeightAtZDepth(depth: number, camera: THREE.PerspectiveCamera) {
        const cameraOffset = camera.position.z;
        if (depth < cameraOffset) depth -= cameraOffset;
        else depth += cameraOffset;

        const vFOV = (camera.fov * Math.PI) / 180;

        return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
    }

    visibleWidthAtZDepth(depth: number, camera: THREE.PerspectiveCamera) {
        const height = this.visibleHeightAtZDepth(depth, camera);
        return height * camera.aspect;
    }

    distance(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    smoothstep(edge0: number, edge1: number, x: number) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    customSmoothstep(edge0: number, edge1: number, x: number) {
        const t = Math.max(-1, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * Math.abs(t));
    }
}
