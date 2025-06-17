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

    // const vs = `#version 300 es
    //     in vec4 position;
    // in vec3 normal;
    // uniform mat4 u_projection, u_view, u_world;
    // out vec3 v_normal;
    // void main() {
    //     gl_Position = u_projection * u_view * u_world * position;
    //     v_normal = mat3(u_world) * normal;
    // }`;
    //
    // const fs = `#version 300 es
    // precision highp float;
    // in vec3 v_normal;
    // uniform vec4 u_diffuse;
    // uniform vec3 u_lightDirection;
    // out vec4 outColor;
    // void main () {
    //     vec3 normal = normalize(v_normal);
    //     float light = dot(u_lightDirection, normal) * 0.5 + 0.5;
    //     outColor = vec4(u_diffuse.rgb * light, u_diffuse.a);
    // }`;



const vs = 
    `#version 300 es
in vec4 position;
in vec3 normal;
in vec2 texcoord;   // sem prefixo 'a_'

uniform mat4 projection, view, world; // sem prefixo 'u_'

out vec3 normalInterp;  // sem prefixo 'v_'
out vec2 texcoordInterp;

void main() {
    gl_Position = projection * view * world * position;
    normalInterp = mat3(world) * normal;
    texcoordInterp = texcoord;
}`;

    const fs = 
    ` #version 300 es
precision highp float;

in vec3 normalInterp;
in vec2 texcoordInterp;

uniform vec4 diffuse;
uniform vec3 lightDirection;

uniform sampler2D textureSampler;  // sem prefixo

out vec4 outColor;

void main() {
    vec3 norm = normalize(normalInterp);
    float light = dot(lightDirection, norm) * 0.5 + 0.5;

    vec4 texColor = texture(textureSampler, texcoordInterp);
    vec3 color = texColor.rgb * diffuse.rgb * light;
    float alpha = texColor.a * diffuse.a;

    outColor = vec4(color, alpha);
}
`;



    const meshProgramInfo = createProgramFromSources(gl, [vs, fs]);

    // const response = await fetch('https://webgl2fundamentals.org/webgl/resources/models/cube/cube.obj');
    const response = await fetch('../public/assets/Modelos3D/Suzanne.obj');
    const text = await response.text();
    const data = parseOBJ(text);

    const mtlName = data.materialsLibs[0];
    const mtlResponse = await fetch(`../public/assets/Modelos3D/Suzanne.mtl`);
    const mtlText = await mtlResponse.text();
    const materials = parseMTL(mtlText);


    console.log(data);
    const bufferInfo = createVAOFromData(gl, data, meshProgramInfo.program);


    const texture = loadTexture(gl, `../public/assets/tex/pixelWall.png`);
    console.log(texture)


    const cameraPosition = [0, 0, 4];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const zNear = 0.1;
    const zFar = 50;

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    function render(time) {
        time *= 0.001;
        resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(degToRad(60), aspect, zNear, zFar);
        const camera = m4.lookAt(cameraPosition, target, up);
        const view = m4.inverse(camera);

        gl.useProgram(meshProgramInfo.program);
        setUniforms(gl, meshProgramInfo.program, {
            lightDirection: m4.normalize([-1, 3, 5]),
            view: view,
            projection: projection,
            world: m4.yRotation(time),
            diffuse: [1, 0.7, 0.5, 1],
        });
        const mat = materials[mtlName] || {};
        setUniforms(gl, meshProgramInfo.program, {
            world: m4.yRotation(time),
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
