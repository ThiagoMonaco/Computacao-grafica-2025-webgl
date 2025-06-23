import { createVAOFromData, drawBufferInfo } from './webgl/buffers.js'
import { setUniforms } from './webgl/uniforms.js'
import { parseOBJ } from './webgl/parsers/obj-parser.js'
import { parseMTL } from './webgl/parsers/mtl-parser.js'
import { loadTexture } from './webgl/texture.js'
import { getObjectData } from './misc/obj-selector.js'
import { ObjectTranslation } from './webgl/object-translation.js'
import { ObjectHoldable } from './webgl/object-holder.js'
import { DefaultInteractionHandler } from './webgl/default-interaction-handler.js'
import { getTriangles } from './webgl/triangles.js'

let lastId = 0
export async function startObject(obj, shader, meshProgramInfo, gl, interactionMode = null, initialPosition = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
    const objectData = getObjectData(obj, shader)
    const id = lastId++

    const response = await fetch(objectData.obj)
    const text = await response.text()
    const data = parseOBJ(text)

    const mtlName = data.materialsLibs[0]
    const mtlResponse = await fetch(objectData.mtl)
    const mtlText = await mtlResponse.text()
    const materials = parseMTL(mtlText)

    const texture = loadTexture(gl, objectData.tex)
    const position = data.position
    const triangles = getTriangles(data.materialGroups, position)

    let interactionHandler = new DefaultInteractionHandler(id, initialPosition, scale, triangles, rotation)
    switch (interactionMode) {
        case 'translate':
            interactionHandler = new ObjectTranslation(id, initialPosition, scale, triangles, rotation)
            break
        case 'hold':
            interactionHandler = new ObjectHoldable(id, initialPosition, scale, triangles)
            break
        default:
            interactionHandler = new DefaultInteractionHandler(id, initialPosition, scale, triangles, rotation)
    }

    const vaosByMaterial = {}
    for (const [materialName, indices] of Object.entries(data.materialGroups)) {
        vaosByMaterial[materialName] = createVAOFromData(gl, {
            position: data.position,
            normal: data.normal,
            texcoord: data.texcoord,
        }, meshProgramInfo.program, indices)
    }

    function renderObject() {
        interactionHandler.handleObjectPosition()
        let worldMatrix = interactionHandler.getWorldMatrix()

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

    return {
        renderObject,
        interactionHandler,
        interactionMode
    }
}

