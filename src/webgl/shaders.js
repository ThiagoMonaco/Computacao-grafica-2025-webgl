export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

export function createProgramFromSources(gl, [vsSource, fsSource]) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
        throw new Error("Erro ao compilar shaders");
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return {
        program,
        attribLocations: getAttribLocations(gl, program),
        uniformLocations: getUniformLocations(gl, program),
    };
}

function getAttribLocations(gl, program) {
    const locations = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < count; ++i) {
        const info = gl.getActiveAttrib(program, i);
        if (info) locations[info.name] = gl.getAttribLocation(program, info.name);
    }
    return locations;
}

function getUniformLocations(gl, program) {
    const locations = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; ++i) {
        const info = gl.getActiveUniform(program, i);
        if (info) locations[info.name] = gl.getUniformLocation(program, info.name);
    }
    return locations;
}

