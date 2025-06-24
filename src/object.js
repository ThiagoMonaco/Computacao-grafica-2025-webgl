import { createVAOFromData, drawBufferInfo } from './webgl/buffers.js'
import { setUniforms } from './webgl/uniforms.js'
import { parseOBJ } from './webgl/parsers/obj-parser.js'
import { parseMTL } from './webgl/parsers/mtl-parser.js'
import { loadTexture } from './webgl/texture.js'
import { getObjectData } from './misc/obj-selector.js'
import { ObjectTranslation } from './webgl/interaction-handlers/object-translation.js'
import { ObjectHoldable } from './webgl/interaction-handlers/object-holder.js'
import { DefaultInteractionHandler } from './webgl/interaction-handlers/default-interaction-handler.js'
import { getTriangles } from './webgl/triangles.js'
import { ObjectView } from './webgl/interaction-handlers/object-view.js'

let lastId = 0
export async function startObject(obj, meshProgramInfo, gl, options = {}) {
    const { 
        interactionMode = null,
        initialPosition = [0, 0, 0],
        rotation = [0, 0, 0],
        scale = [1, 1, 1],
        standByRotation = [0, 0, 0],
    } = options

    const objectData = getObjectData(obj)
    const id = lastId++

    const response = await fetch(objectData.obj)
    const text = await response.text()
    const data = parseOBJ(text)

    const mtlUrl = objectData.mtl
    const mtlResponse = await fetch(mtlUrl)
    const mtlText = await mtlResponse.text()
    const materials = parseMTL(mtlText)

    const baseDir = mtlUrl.substring(0, mtlUrl.lastIndexOf('/') + 1)

    const texturesByMaterial = {}
    const bumpTexturesByMaterial = {}
    const specularTexturesByMaterial = {}

    for (const [materialName, mat] of Object.entries(materials)) {
        if (mat.map_Kd) {
            texturesByMaterial[materialName] = loadTexture(gl, baseDir + mat.map_Kd)
        }
        if (mat.map_Bump) {
            bumpTexturesByMaterial[materialName] = loadTexture(gl, baseDir + mat.map_Bump)
        }
        if (mat.map_Ks) {
            specularTexturesByMaterial[materialName] = loadTexture(gl, baseDir + mat.map_Ks)
        }
    }


    const position = data.position
    const triangles = getTriangles(data.materialGroups, position)

    let interactionHandler;
    switch (interactionMode) {
        case 'translate':
            interactionHandler = new ObjectTranslation(id, initialPosition, scale, triangles, rotation, standByRotation)
            break
        case 'hold':
            interactionHandler = new ObjectHoldable(id, initialPosition, scale, triangles, rotation, standByRotation)
            break
        case 'focus':
            interactionHandler = new ObjectView(id, initialPosition, scale, triangles, rotation, standByRotation)
            break
        default:
            interactionHandler = new DefaultInteractionHandler(id, initialPosition, scale, triangles, rotation, standByRotation)
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

        for (const [materialName] of Object.entries(data.materialGroups)) {
            const mat = materials[materialName] || {}
            const texture = texturesByMaterial[materialName] || null
            const bump = bumpTexturesByMaterial?.[materialName] || null
            const specular = specularTexturesByMaterial?.[materialName] || null

            const baseDiffuse = mat.diffuse
            const useKd = baseDiffuse && (baseDiffuse[0] + baseDiffuse[1] + baseDiffuse[2]) > 0
            const finalDiffuse = useKd ? [...baseDiffuse, 1.0] : [1, 1, 1, 1]

            setUniforms(gl, meshProgramInfo.program, {
                world: worldMatrix,
                diffuse: finalDiffuse,
                useTexture: Number(!!texture),
                useBump: Number(!!bump),
                useSpecularMap: Number(!!specular),
                bumpScale: mat.bumpScale ?? 0.2, 
            })

            if (texture) {
                gl.activeTexture(gl.TEXTURE0)
                gl.bindTexture(gl.TEXTURE_2D, texture)
                gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, "textureSampler"), 0)
            }

            if (bump) {
                gl.activeTexture(gl.TEXTURE1)
                gl.bindTexture(gl.TEXTURE_2D, bump)
                gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, "bumpSampler"), 1)
            }

            if (specular) {
                gl.activeTexture(gl.TEXTURE2)
                gl.bindTexture(gl.TEXTURE_2D, specular)
                gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, "specularSampler"), 2)
            }

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

