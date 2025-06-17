export function createVAOFromData(gl, data, program) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const buffers = {};

    for (const name in data) {
        const array = data[name];
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);

        const location = gl.getAttribLocation(program, name);
        if (location === -1) {
            console.warn(`Atributo "${name}" não encontrado no shader.`);
            continue;
        }

        gl.enableVertexAttribArray(location);
        const numComponents = guessNumComponents(name);
        gl.vertexAttribPointer(location, numComponents, gl.FLOAT, false, 0, 0);

        buffers[name] = buffer;
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return { vao, buffers, numElements: data.position.length / 3 };
}

function guessNumComponents(name) {
    if (name.toLowerCase().includes("coord")) return 2;
    if (name.toLowerCase().includes("normal")) return 3;
    return 3;
}

export function drawBufferInfo(gl, bufferInfo, mode = gl.TRIANGLES, countOverride) {
    gl.bindVertexArray(bufferInfo.vao);
    const count = countOverride ?? bufferInfo.numElements;
    gl.drawArrays(mode, 0, count);
    gl.bindVertexArray(null);
}

