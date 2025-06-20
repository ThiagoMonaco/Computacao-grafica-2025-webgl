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
    let objectPosition = initialPosition 
    let selected = false;
    let movePath = [];

    function getForwardVector() {
        const { cameraRotation } = getCameraState();
        return [
            Math.cos(cameraRotation.pitch) * Math.sin(cameraRotation.yaw),
            Math.sin(cameraRotation.pitch),
            Math.cos(cameraRotation.pitch) * Math.cos(cameraRotation.yaw),
        ];
    }

    function intersectsObject(camPos, dir, objPos, r = 1) {
        const toObj = [
            objPos[0] - camPos[0],
            objPos[1] - camPos[1],
            objPos[2] - camPos[2],
        ];
        const proj = toObj[0]*dir[0] + toObj[1]*dir[1] + toObj[2]*dir[2];
        const closest = [
            camPos[0] + dir[0]*proj,
            camPos[1] + dir[1]*proj,
            camPos[2] + dir[2]*proj,
        ];
        const dSq = (objPos[0]-closest[0])**2+(objPos[1]-closest[1])**2+(objPos[2]-closest[2])**2;
        return dSq <= r*r;
    }


    // const cameraPosition = [0, 0, 10];
    // let cameraRotation = {
    //     yaw: Math.PI,
    //     pitch: 0,
    // };
    // const movementSpeed = 2.5;
    // const mouseSensitivity = 0.002;
    // const target = [0, 0, 0];
    // const up = [0, 1, 0];
    // const zNear = 0.1;
    // const zFar = 50;


    // const keysPressed = {};

    // window.addEventListener('mousemove', (e) => {
    //     if (document.pointerLockElement === canvas) {
    //         cameraRotation.yaw -= e.movementX * mouseSensitivity;
    //         cameraRotation.pitch -= e.movementY * mouseSensitivity;
    //         cameraRotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.pitch));
    //     }
    // });

    // window.addEventListener('keydown', (e) => {
    //     keysPressed[e.key.toLowerCase()] = true;
    // });
    //
    // window.addEventListener('keyup', (e) => {
    //     keysPressed[e.key.toLowerCase()] = false;
    // });

    startKeys()
    startCamera()


    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    canvas.addEventListener('mousedown', () => {
        const { cameraPosition, cameraRotation, up } = getCameraState();
        const ray = getForwardVector();

        if (!selected) {
            if (intersectsObject(cameraPosition, ray, objectPosition, 1)) {
                selected = true;
            }
        } else {
            const dist = 10;
            const target = [
                cameraPosition[0] + ray[0]*dist,
                cameraPosition[1] + ray[1]*dist,
                cameraPosition[2] + ray[2]*dist,
            ];
            const steps = 60;
            movePath.length = 0;
            for (let i = 1; i <= steps; i++) {
                movePath.push([
                    objectPosition[0] + (target[0] - objectPosition[0]) * (i/steps),
                    objectPosition[1] + (target[1] - objectPosition[1]) * (i/steps),
                    objectPosition[2] + (target[2] - objectPosition[2]) * (i/steps),
                ]);
            }
            selected = false;
        }
    });


    let lights = {
        keyLight: {
            position: [5, 10, 5],
            color: [1.0, 0.95, 0.8],
            on: true
        },
        fillLight: {
            position: [-5, 5, 5],
            color: [0.4, 0.4, 0.5],
            on: true
        },
        backLight: {
            position: [0, 5, -5],
            color: [0.3, 0.3, 0.4],
            on: true
        }
    };

    window.addEventListener('keydown', (e) => {
        const keysPressed = getKeys()
        keysPressed[e.key.toLowerCase()] = true;

        if (e.key === '1') lights.keyLight.on = !lights.keyLight.on;
        if (e.key === '2') lights.fillLight.on = !lights.fillLight.on;
        if (e.key === '3') lights.backLight.on = !lights.backLight.on;
    });



    function degToRad(d) {
        return d * Math.PI / 180;
    }


    // function updateCameraPosition(deltaTime) {
    //     const forward = [
    //         Math.sin(cameraRotation.yaw),
    //         0,
    //         Math.cos(cameraRotation.yaw),
    //     ];
    //
    //     const right = [
    //         Math.sin(cameraRotation.yaw - Math.PI/2),
    //         0,
    //         Math.cos(cameraRotation.yaw - Math.PI/2),
    //     ];
    //
    //     if (keysPressed['w']) {
    //         cameraPosition[0] += forward[0] * movementSpeed * deltaTime;
    //         cameraPosition[1] += forward[1] * movementSpeed * deltaTime;
    //         cameraPosition[2] += forward[2] * movementSpeed * deltaTime;
    //     }
    //     if (keysPressed['s']) {
    //         cameraPosition[0] -= forward[0] * movementSpeed * deltaTime;
    //         cameraPosition[1] -= forward[1] * movementSpeed * deltaTime;
    //         cameraPosition[2] -= forward[2] * movementSpeed * deltaTime;
    //     }
    //
    //     if (keysPressed['d']) {
    //         cameraPosition[0] += right[0] * movementSpeed * deltaTime;
    //         cameraPosition[2] += right[2] * movementSpeed * deltaTime;
    //     }
    //     if (keysPressed['a']) {
    //         cameraPosition[0] -= right[0] * movementSpeed * deltaTime;
    //         cameraPosition[2] -= right[2] * movementSpeed * deltaTime;
    //     }
    // }

    let lastTime = 0;
    function render(time) {
        time *= 0.001;
        const deltaTime = time - lastTime;
        lastTime = time;

        updateCameraPosition(deltaTime);
        if (movePath.length > 0) {
            objectPosition = movePath.shift();
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

