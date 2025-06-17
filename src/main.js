import { createProgramFromSources } from './webgl/shaders.js';
import { createVAOFromData, drawBufferInfo } from './webgl/buffers.js';
import { resizeCanvasToDisplaySize } from './webgl/utils.js';
import { setUniforms } from './webgl/uniforms.js';
import { parseOBJ } from './webgl/parsers/obj-parser.js';
import { parseMTL } from './webgl/parsers/mtl-parser.js';
import { loadTexture } from './webgl/texture.js';


async function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return;


    let vs = await fetch('../public/shaders/vertex-shader.vs')
    let fs = await fetch('../public/shaders/fragment-shader.fs')

    vs = await vs.text();
    fs = await fs.text();

    const meshProgramInfo = createProgramFromSources(gl, [vs, fs]);

    // const response = await fetch('https://webgl2fundamentals.org/webgl/resources/models/cube/cube.obj');
    const response = await fetch('../public/assets/Modelos3D/Suzanne.obj');
    const text = await response.text();
    const data = parseOBJ(text);

    const mtlName = data.materialsLibs[0];
    const mtlResponse = await fetch(`../public/assets/Modelos3D/Suzanne.mtl`);
    const mtlText = await mtlResponse.text();
    const materials = parseMTL(mtlText);

    const bufferInfo = createVAOFromData(gl, data, meshProgramInfo.program);


    const texture = loadTexture(gl, `../public/assets/tex/pixelWall.png`);

    const cameraPosition = [0, 0, 4];
    let cameraRotation = {
        yaw: 0,    // giro horizontal (em radianos)
        pitch: 0,  // giro vertical (em radianos)
    };
    const movementSpeed = 2.5; // unidades por segundo
    const mouseSensitivity = 0.002; // ajuste fino do mouse
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const zNear = 0.1;
    const zFar = 50;


    const keysPressed = {};



window.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
        // inverta o sinal aqui para yaw e veja o resultado
        cameraRotation.yaw -= e.movementX * mouseSensitivity;
        cameraRotation.pitch -= e.movementY * mouseSensitivity;
        cameraRotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.pitch));
    }
});

    window.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
        keysPressed[e.key.toLowerCase()] = false;
    });



    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });





    function degToRad(d) {
        return d * Math.PI / 180;
    }


    function updateCameraPosition(deltaTime) {
        // Só no plano XZ, ignorando pitch
        const forward = [
            Math.sin(cameraRotation.yaw),
            0,
            Math.cos(cameraRotation.yaw),
        ];

        // vetor para a direita (perpendicular ao forward)
        const right = [
            Math.sin(cameraRotation.yaw - Math.PI/2),
            0,
            Math.cos(cameraRotation.yaw - Math.PI/2),
        ];

        // Movimento para frente e para trás (W e S)
        if (keysPressed['w']) {
            cameraPosition[0] += forward[0] * movementSpeed * deltaTime;
            cameraPosition[1] += forward[1] * movementSpeed * deltaTime;
            cameraPosition[2] += forward[2] * movementSpeed * deltaTime;
        }
        if (keysPressed['s']) {
            cameraPosition[0] -= forward[0] * movementSpeed * deltaTime;
            cameraPosition[1] -= forward[1] * movementSpeed * deltaTime;
            cameraPosition[2] -= forward[2] * movementSpeed * deltaTime;
        }

        // Movimento para direita e esquerda (D e A)
        if (keysPressed['d']) {
            cameraPosition[0] += right[0] * movementSpeed * deltaTime;
            cameraPosition[2] += right[2] * movementSpeed * deltaTime;
        }
        if (keysPressed['a']) {
            cameraPosition[0] -= right[0] * movementSpeed * deltaTime;
            cameraPosition[2] -= right[2] * movementSpeed * deltaTime;
        }
    }

    let lastTime = 0;
    function render(time) {
        time *= 0.001;
        const deltaTime = time - lastTime;
        lastTime = time;

        updateCameraPosition(deltaTime);


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


        // const camera = m4.lookAt(cameraPosition, target, up);
        // const view = m4.inverse(camera);

        gl.useProgram(meshProgramInfo.program);
        setUniforms(gl, meshProgramInfo.program, {
            lightDirection: m4.normalize([-1, 3, 5]),
            view: view,
            projection: projection,
            // world: m4.yRotation(time),
            world: m4.identity(),
            diffuse: [1, 0.7, 0.5, 1],
        });
        const mat = materials[mtlName] || {};
        setUniforms(gl, meshProgramInfo.program, {
            // world: m4.yRotation(time),
            world: m4.identity(),
            diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],
        });

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, "textureSampler"), 0);

        drawBufferInfo(gl, bufferInfo);
        requestAnimationFrame(render);

        // for (const [materialName, indices] of Object.entries(data.materialGroups)) {
        //     const mat = materials[materialName] || {};
        //
        //     setUniforms(gl, meshProgramInfo.program, {
        //         u_world: m4.yRotation(time),
        //         u_diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],
        //     });
        //
        //     // drawBufferInfo se precisar de indices por material
        //     drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, indices.length);
        // }

    }

    requestAnimationFrame(render);
}

main();
