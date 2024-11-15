import { WebGLRenderer } from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";

import { positionComputeFragmentShader, colorComputeFragmentShader } from "./foregroundShaders";

export const initGPUComputationRenderer = (points: Float32Array, renderer: WebGLRenderer) => {
    const numPoints = points.length / 3;
    const size = Math.ceil(Math.sqrt(numPoints));
    const gpuCompute = new GPUComputationRenderer(size, size, renderer);

    const pointsTexture = convertPointsToTextureData(points);
    const initialPosition = gpuCompute.createTexture();
    initialPosition.image.data.set(pointsTexture);
    const currentPosition = gpuCompute.createTexture();
    currentPosition.image.data.set(pointsTexture);

    const colorTexture = whiteColorTextureData(numPoints);
    const initialColor = gpuCompute.createTexture();
    initialColor.image.data.set(colorTexture);

    const positionVariable = gpuCompute.addVariable(
        "position",
        positionComputeFragmentShader,
        initialPosition
    );
    positionVariable.material.uniforms.initialPosition = { value: initialPosition };

    const colorVariable = gpuCompute.addVariable("color", colorComputeFragmentShader, initialColor);
    colorVariable.material.uniforms.initialPosition = { value: initialPosition };

    gpuCompute.setVariableDependencies(positionVariable, [positionVariable, colorVariable]);
    gpuCompute.setVariableDependencies(colorVariable, [colorVariable, positionVariable]);

    // Check for shader errors
    const error = gpuCompute.init();
    if (error !== null) {
        console.error(error);
    }

    return {
        size,
        gpuCompute,
        positionVariable,
        colorVariable,
    };
};

const convertPointsToTextureData = (points: Float32Array): Float32Array => {
    const numPoints = points.length / 3;
    const textureData = new Float32Array(numPoints * 4);

    for (let i = 0, j = 0; i < points.length; i += 3, j += 4) {
        textureData[j] = points[i]; // x
        textureData[j + 1] = points[i + 1]; // y
        textureData[j + 2] = points[i + 2]; // z
        textureData[j + 3] = 1; // w, size, set to 1
    }

    return textureData;
};

const whiteColorTextureData = (numPoints: number): Float32Array =>
    new Float32Array(numPoints * 4).fill(1);
