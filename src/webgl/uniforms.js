export function setUniforms(gl, program, uniforms) {
    const textureUnitCounter = { value: 0 };

    for (const name in uniforms) {
        const location = gl.getUniformLocation(program, name);
        if (location === null) continue;
        setUniform(gl, location, uniforms[name], textureUnitCounter);
    }
}

function setUniform(gl, location, value, textureUnitCounter) {
    if (typeof value === "number") {
        gl.uniform1f(location, value);
    } else if (value instanceof WebGLTexture) {
        const unit = textureUnitCounter.value++;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, value);
        gl.uniform1i(location, unit);
    } else if (Array.isArray(value) || value instanceof Float32Array) {
        switch (value.length) {
            case 1: gl.uniform1fv(location, value); break;
            case 2: gl.uniform2fv(location, value); break;
            case 3: gl.uniform3fv(location, value); break;
            case 4: gl.uniform4fv(location, value); break;
            case 9: gl.uniformMatrix3fv(location, false, value); break;
            case 16: gl.uniformMatrix4fv(location, false, value); break;
            default:
                console.warn("Uniform array size não suportada:", value.length);
        }
    } else {
        console.warn("Tipo de uniform não reconhecido:", value);
    }
}

