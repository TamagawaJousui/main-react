import { BlendFunction } from "postprocessing";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

export const initGUI = (renderer) => {
    const gui = new GUI({ autoPlace: false });
    const params = {
        isPaused: false,
        // Other color presets
        // colorParams: {
        //     color_X_plus: { r: 1.0, g: 0.2745, b: 0.0 }, // Vivid orange-red
        //     color_X_minus: { r: 1.0, g: 0.1961, b: 0.0 }, // Bright red-orange
        //     color_Y_plus: { r: 1.0, g: 0.3333, b: 0.0 }, // Enthusiastic bright orange
        //     color_Y_minus: { r: 1.0, g: 0.1569, b: 0.0 }, // Energetic deep orange-red
        //     color_Z_plus: { r: 1.0, g: 0.4, b: 0.0 }, // Bright orange-red
        //     color_Z_minus: { r: 1.0, g: 0.2353, b: 0.0 }, // Vibrant orange
        // },
        // Other color presets
        colorParams: {
            color_X_plus: { r: 0.8469, g: 0.7991, b: 0.8148 }, // Soft gray-purple
            color_X_minus: { r: 0.8308, g: 0.2747, b: 0.3185 }, // Dark red
            color_Y_plus: { r: 0.8228, g: 0.0437, b: 0.0742 }, // Deep red
            color_Y_minus: { r: 0.9647, g: 0.2016, b: 0.0409 }, // Vivid orange-red
            color_Z_plus: { r: 0.552, g: 0.7305, b: 0.6308 }, // Soft cyan-green
            color_Z_minus: { r: 0.7758, g: 0.5395, b: 0.5906 }, // Soft pink
        },
        afterImage: {
            damp: 0.8,
            enabled: true,
        },
        bloom: {
            luminanceThreshold: 0.3,
            luminanceSmoothing: 0.025,
            intensity: 1.0,
            mipmapBlur: true,
            radius: 0.45,
            opacity: 0.4,
            blendFunction: BlendFunction.ADD,
        },
        particleParams: {
            pointSize: 1.0,
            transparent: 0.4,
            useColor: true,
            colorPattern: "distance",
        },
        noiseParams: {
            seed: Math.floor(Math.random() * 300),
            periodX: 3.0,
            periodY: 3.0,
            periodZ: 3.0,
        },
        noiseMatrix: {
            rotationAngles: { x: 0, y: 0, z: 0 },
            scaleFactors: { x: 0.5, y: 0.5, z: 0.5 },
            translationValues: { x: 0, y: 0, z: 0 },
        },
        backgroundMatrix: {
            rotationAngles: { x: 1.959, y: 3.418, z: 12.8 },
            scaleFactors: { x: 1, y: 1, z: 1 },
            translationValues: { x: 0, y: 0, z: 0 },
        },
        positionMatrix: {
            rotationAngles: { x: -3.526632, y: -6.152985, z: 23.03788 },
            scaleFactors: { x: 1.099204, y: 1.123625, z: 1.087077 },
            translationValues: { x: 0, y: 0, z: 0 },
        },
        saveScreenshot: () => {
            // Get the renderer's canvas content and convert it to a data URL
            const imgData = renderer.domElement.toDataURL("image/png");

            // Create a temporary <a> tag for downloading the image
            const link = document.createElement("a");
            link.href = imgData;
            const date = new Date();
            const [month, day, minute, second] = [
                (date.getMonth() + 1).toString().padStart(2, "0"), // Convert month to two digits
                date.getDate().toString().padStart(2, "0"), // Convert date to two digits
                date.getMinutes().toString().padStart(2, "0"), // Convert minutes to two digits
                date.getSeconds().toString().padStart(2, "0"), // Convert seconds to two digits
            ];
            const fileName = `particle-${month}${day}${minute}${second}`;
            link.download = `${fileName}.png`;
            link.click();

            setTimeout(() => {
                // Save params as a JSON file
                const jsonLink = document.createElement("a");
                const jsonData = new Blob([JSON.stringify(params, null, 2)], {
                    type: "application/json",
                });
                jsonLink.href = URL.createObjectURL(jsonData);
                jsonLink.download = `${fileName}.json`;
                jsonLink.click();
            }, 3000);
        },
    };

    gui.add(params, "isPaused")
        .name("Pause/Resume")
        .onChange((value) => {
            params.isPaused = value;
        });

    const afterImageFolder = gui.addFolder("afterImage parameters");
    afterImageFolder.add(params.afterImage, "damp", 0, 1, 0.001);
    afterImageFolder.add(params.afterImage, "enabled");

    const bloomPara = gui.addFolder("bloom parameters");
    bloomPara.add(params.bloom, "luminanceThreshold", 0, 1, 0.001).name("lumiThreshold");
    bloomPara.add(params.bloom, "luminanceSmoothing", 0, 1, 0.001).name("lumiSmoothing");
    bloomPara.add(params.bloom, "intensity", 0, 10, 0.01);
    bloomPara.add(params.bloom, "radius", 0.0, 1.0, 0.001);
    bloomPara.add(params.bloom, "opacity", 0, 1, 0.001);

    const pointPara = gui.addFolder("point parameters");
    pointPara.add(params.particleParams, "pointSize", 0.1, 10, 0.1);
    pointPara.add(params.particleParams, "transparent", 0, 1, 0.01);
    pointPara.add(params.particleParams, "useColor");
    pointPara.add(params.particleParams, "colorPattern", ["area", "distance"]);
    pointPara.addColor(params.colorParams, "color_X_plus");
    pointPara.addColor(params.colorParams, "color_X_minus");
    pointPara.addColor(params.colorParams, "color_Y_plus");
    pointPara.addColor(params.colorParams, "color_Y_minus");
    pointPara.addColor(params.colorParams, "color_Z_plus");
    pointPara.addColor(params.colorParams, "color_Z_minus");

    const noisePara = gui.addFolder("perling noise parameters");
    noisePara.add(params.noiseParams, "seed", 0, 300, 1);
    noisePara.add(params.noiseParams, "periodX", 1, 10, 1);
    noisePara.add(params.noiseParams, "periodY", 1, 10, 1);
    noisePara.add(params.noiseParams, "periodZ", 1, 10, 1);
    // Use a generic function to create matrix controls
    addMatrixControls(gui, "background transformation matrix", params.backgroundMatrix);
    addMatrixControls(gui, "noise transformation matrix", params.noiseMatrix);
    addMatrixControls(gui, "position transformation matrix", params.positionMatrix);
    // Add button in lil-gui
    gui.add(params, "saveScreenshot").name("Save PNG");
    return params;
};

// Generic function to create matrix-related GUI controls
const addMatrixControls = (gui, folderName, matrixParams) => {
    const folder = gui.addFolder(folderName);

    folder.add(matrixParams.rotationAngles, "x", -30, 30, 0.00001).name("rotationX");
    folder.add(matrixParams.rotationAngles, "y", -30, 30, 0.00001).name("rotationY");
    folder.add(matrixParams.rotationAngles, "z", -30, 30, 0.00001).name("rotationZ");

    folder.add(matrixParams.scaleFactors, "x", 0.5, 1.5, 0.01).name("scaleX");
    folder.add(matrixParams.scaleFactors, "y", 0.5, 1.5, 0.01).name("scaleY");
    folder.add(matrixParams.scaleFactors, "z", 0.5, 1.5, 0.01).name("scaleZ");

    folder.add(matrixParams.translationValues, "x", -1, 1, 0.01).name("translationX");
    folder.add(matrixParams.translationValues, "y", -1, 1, 0.01).name("translationY").listen();
    folder.add(matrixParams.translationValues, "z", -1, 1, 0.01).name("translationZ");

    return folder;
};
