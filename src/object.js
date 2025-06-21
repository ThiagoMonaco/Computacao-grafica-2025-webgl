import { createVAOFromData, drawBufferInfo } from './webgl/buffers.js'
import { setUniforms } from './webgl/uniforms.js'
import { parseOBJ } from './webgl/parsers/obj-parser.js'
import { parseMTL } from './webgl/parsers/mtl-parser.js'
import { loadTexture } from './webgl/texture.js'
import { getObjectData } from './misc/obj-selector.js'
import { ObjectTranslation } from './webgl/object-translation.js'
import { mat4 } from 'gl-matrix'

export async function startObject(obj, shader, meshProgramInfo, gl, initialPosition = [0, 0, 0], rotation = [0,0,0], scale = [1, 1, 1]) {
    let objectData = getObjectData(obj, shader)

    const response = await fetch(objectData.obj)
    const text = await response.text()
    const data = parseOBJ(text)

    const mtlName = data.materialsLibs[0]
    const mtlResponse = await fetch(objectData.mtl)
    const mtlText = await mtlResponse.text()
    const materials = parseMTL(mtlText)

    const texture = loadTexture(gl, objectData.tex)

    const objectTranslation = new ObjectTranslation(initialPosition)

    const vaosByMaterial = {}

    for (const [materialName, indices] of Object.entries(data.materialGroups)) {
        vaosByMaterial[materialName] = createVAOFromData(gl, {
            position: data.position,
            normal: data.normal,
            texcoord: data.texcoord,
        }, meshProgramInfo.program, indices)
    }


    function renderObject() {
        const { movePath, objectPosition } = objectTranslation

        if (movePath.length > 0) {
            const newObjectPosition = movePath.shift()
            objectTranslation.setObjectPosition(newObjectPosition)
        }

        const translationMatrix = mat4.create()
        mat4.translate(translationMatrix, translationMatrix, objectPosition)

        let worldMatrix = translationMatrix

        if (rotation) {
            const rotationMatrix = mat4.create()
            mat4.rotateX(rotationMatrix, rotationMatrix, rotation[0])
            mat4.rotateY(rotationMatrix, rotationMatrix, rotation[1])
            mat4.rotateZ(rotationMatrix, rotationMatrix, rotation[2])
            worldMatrix = mat4.multiply(mat4.create(), worldMatrix, rotationMatrix)
        }

        const scaleMatrix = mat4.create()
        mat4.scale(scaleMatrix, scaleMatrix, scale)
        worldMatrix = mat4.multiply(mat4.create(), worldMatrix, scaleMatrix)

        const mat = materials[mtlName] || {}
        setUniforms(gl, meshProgramInfo.program, {
            world: worldMatrix,
            diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],
            useTexture: Number(!!texture),
        })

        for (const [materialName] of Object.entries(data.materialGroups)) {
            const mat = materials[materialName] || {}

            setUniforms(gl, meshProgramInfo.program, {
                diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],
                world: worldMatrix,
                useTexture: Number(!!texture),
            })

            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, "textureSampler"), 0)
            const vaoInfo = vaosByMaterial[materialName]
            gl.bindVertexArray(vaoInfo.vao)
            gl.drawElements(gl.TRIANGLES, vaoInfo.numIndices, gl.UNSIGNED_INT, 0)
            gl.bindVertexArray(null)
        }
    }

    return { renderObject }
}

