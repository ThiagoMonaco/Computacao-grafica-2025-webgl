import { createProgramFromSources } from './webgl/shaders.js';
import { createVAOFromData, drawBufferInfo } from './webgl/buffers.js';
import { resizeCanvasToDisplaySize } from './webgl/utils.js';
import { setUniforms } from './webgl/uniforms.js';
import { parseOBJ } from './webgl/parsers/obj-parser.js';
import { parseMTL } from './webgl/parsers/mtl-parser.js';
import { loadTexture } from './webgl/texture.js';
import { getObjectData } from './misc/obj-selector.js';
import { getKeys, startKeys } from './misc/keys.js';
import { getCameraState, startCamera, updateCameraPosition } from './webgl/camera.js';
import { getLights, startLights } from './webgl/lights.js';
import { ObjectTranslation } from './webgl/object-translation.js';


export async function renderObject(obj, shader, initialPosition = [0, 0, 0]) {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return;


    // let objectData = getObjectData('suzanne', 'suzanne');
    let objectData = getObjectData(obj, shader);
    let vs = await fetch('../public/shaders/vertex-shader.vs')
    let fs = await fetch('../public/shaders/fragment-shader.fs')

    vs = await vs.text();
    fs = await fs.text();

    const meshProgramInfo = createProgramFromSources(gl, [vs, fs]);

    const response = await fetch(objectData.obj);
    const text = await response.text();
    const data = parseOBJ(text);

    const mtlName = data.materialsLibs[0];
    const mtlResponse = await fetch(objectData.mtl);
    const mtlText = await mtlResponse.text();
    const materials = parseMTL(mtlText);

    const bufferInfo = createVAOFromData(gl, data, meshProgramInfo.program);

    const texture = loadTexture(gl, objectData.tex);
    // let objectPosition = initialPosition 
    // let selected = false;
    // let movePath = [];
    //
    // function getForwardVector() {
    //     const { cameraRotation } = getCameraState();
    //     return [
    //         Math.cos(cameraRotation.pitch) * Math.sin(cameraRotation.yaw),
    //         Math.sin(cameraRotation.pitch),
    //         Math.cos(cameraRotation.pitch) * Math.cos(cameraRotation.yaw),
    //     ];
    // }
    //
    // function intersectsObject(camPos, dir, objPos, r = 1) {
    //     const toObj = [
    //         objPos[0] - camPos[0],
    //         objPos[1] - camPos[1],
    //         objPos[2] - camPos[2],
    //     ];
    //     const proj = toObj[0]*dir[0] + toObj[1]*dir[1] + toObj[2]*dir[2];
    //     const closest = [
    //         camPos[0] + dir[0]*proj,
    //         camPos[1] + dir[1]*proj,
    //         camPos[2] + dir[2]*proj,
    //     ];
    //     const dSq = (objPos[0]-closest[0])**2+(objPos[1]-closest[1])**2+(objPos[2]-closest[2])**2;
    //     return dSq <= r*r;
    // }

    startKeys()
    startCamera()
    startLights()
    const objectTranslation = new ObjectTranslation(initialPosition)


    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    // canvas.addEventListener('mousedown', () => {
    //     const { cameraPosition } = getCameraState();
    //     const ray = getForwardVector();
    //
    //     if (!selected) {
    //         if (intersectsObject(cameraPosition, ray, objectPosition, 1)) {
    //             selected = true;
    //         }
    //     } else {
    //         const dist = 10;
    //         const target = [
    //             cameraPosition[0] + ray[0]*dist,
    //             cameraPosition[1] + ray[1]*dist,
    //             cameraPosition[2] + ray[2]*dist,
    //         ];
    //         const steps = 60;
    //         movePath.length = 0;
    //         for (let i = 1; i <= steps; i++) {
    //             movePath.push([
    //                 objectPosition[0] + (target[0] - objectPosition[0]) * (i/steps),
    //                 objectPosition[1] + (target[1] - objectPosition[1]) * (i/steps),
    //                 objectPosition[2] + (target[2] - objectPosition[2]) * (i/steps),
    //             ]);
    //         }
    //         selected = false;
    //     }
    // });


    function degToRad(d) {
        return d * Math.PI / 180;
    }

    let lastTime = 0;
    function render(time) {
        time *= 0.001;
        const deltaTime = time - lastTime;
        lastTime = time;
        const lights = getLights()
        const { movePath,objectPosition } = objectTranslation
    
        updateCameraPosition(deltaTime);
        if (movePath.length > 0) {
            const newObjectPosition = movePath.shift()
            objectTranslation.setObjectPosition(newObjectPosition)
        }

        const { cameraPosition, cameraRotation, up, zFar, zNear } = getCameraState();

        resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(degToRad(60), aspect, zNear, zFar);

        const lookDirection = [
            cameraPosition[0] + Math.cos(cameraRotation.pitch) * Math.sin(cameraRotation.yaw),
            cameraPosition[1] + Math.sin(cameraRotation.pitch),
            cameraPosition[2] + Math.cos(cameraRotation.pitch) * Math.cos(cameraRotation.yaw),
        ];


        const cameraMatrix = m4.lookAt(cameraPosition, lookDirection, up);
        const view = m4.inverse(cameraMatrix);


        gl.useProgram(meshProgramInfo.program);
        setUniforms(gl, meshProgramInfo.program, {
            lightDirection: m4.normalize([-1, 3, 5]),
            view: view,
            projection: projection,
            world: m4.translation(...objectPosition),
            diffuse: [1, 0.7, 0.5, 1],
        });
        const mat = materials[mtlName] || {};
        setUniforms(gl, meshProgramInfo.program, {
            world: m4.translation(...objectPosition),
            diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],
        });

        setUniforms(gl, meshProgramInfo.program, {
            lightDirection: m4.normalize([-1, 3, 5]),
            view: view,
            projection: projection,
            world: m4.translation(...objectPosition),
            diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],

            keyLightPos: lights.keyLight.position,
            keyLightColor: lights.keyLight.color,
            keyLightOn: Number(lights.keyLight.on),

            fillLightPos: lights.fillLight.position,
            fillLightColor: lights.fillLight.color,
            fillLightOn: Number(lights.fillLight.on),

            backLightPos: lights.backLight.position,
            backLightColor: lights.backLight.color,
            backLightOn: Number(lights.backLight.on),
        });


        for (const [materialName, indices] of Object.entries(data.materialGroups)) {
            const mat = materials[materialName] || {};

            setUniforms(gl, meshProgramInfo.program, {
                diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],
                world: m4.translation(...objectPosition),
            });

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, "textureSampler"), 0);

            drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, indices.length, 0, indices);
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

// ren('suzanne', 'suzanne', [0, 5, 0]);
// main('cube', 'cube')
// main('cube', 'brick', [0, 0, -5]);

