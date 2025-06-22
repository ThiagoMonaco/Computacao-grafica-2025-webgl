import { createVAOFromData, drawBufferInfo } from './webgl/buffers.js'
import { setUniforms } from './webgl/uniforms.js'
import { parseOBJ } from './webgl/parsers/obj-parser.js'
import { parseMTL } from './webgl/parsers/mtl-parser.js'
import { loadTexture } from './webgl/texture.js'
import { getObjectData } from './misc/obj-selector.js'
import { ObjectTranslation } from './webgl/object-translation.js'
import { ObjectHoldable } from './webgl/object-holder.js'
import { mat4 } from 'gl-matrix'
import { getCameraState } from './webgl/camera.js'

export async function startObject(obj, shader, meshProgramInfo, gl, interactionMode = null, initialPosition = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
    const objectData = getObjectData(obj, shader)

    const response = await fetch(objectData.obj)
    const text = await response.text()
    const data = parseOBJ(text)

    const mtlName = data.materialsLibs[0]
    const mtlResponse = await fetch(objectData.mtl)
    const mtlText = await mtlResponse.text()
    const materials = parseMTL(mtlText)

    const texture = loadTexture(gl, objectData.tex)
    const position = data.position
    const triangles = []

    for (const indices of Object.values(data.materialGroups)) {
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i]
            const i1 = indices[i + 1]
            const i2 = indices[i + 2]

            const v0 = [position[i0 * 3 + 0], position[i0 * 3 + 1], position[i0 * 3 + 2]]
            const v1 = [position[i1 * 3 + 0], position[i1 * 3 + 1], position[i1 * 3 + 2]]
            const v2 = [position[i2 * 3 + 0], position[i2 * 3 + 1], position[i2 * 3 + 2]]

            if (v0.every(n => n !== undefined) && v1.every(n => n !== undefined) && v2.every(n => n !== undefined)) {
                triangles.push([v0, v1, v2])
            }
        }
    }

    let interactionHandler = null
    if (interactionMode === 'translate') {
        interactionHandler = new ObjectTranslation(initialPosition, scale, triangles)
    } else if (interactionMode === 'hold') {
        interactionHandler = new ObjectHoldable(initialPosition, scale, triangles)
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
        let objectPosition = initialPosition

        if (interactionHandler) {
            if (interactionMode === 'translate') {
                const { movePath } = interactionHandler
                if (movePath.length > 0) {
                    const newPos = movePath.shift()
                    interactionHandler.setObjectPosition(newPos)
                }
                objectPosition = interactionHandler.objectPosition
            } else if (interactionMode === 'hold') {
                interactionHandler.updateWhileHeld()
                objectPosition = interactionHandler.getObjectPosition()
            }
        }

        const translationMatrix = mat4.create()
        mat4.translate(translationMatrix, translationMatrix, objectPosition)

        let worldMatrix = translationMatrix

        // if (interactionMode === 'hold' && interactionHandler?.isHeld) {
            // const { cameraRotation } = getCameraState()
            // const cameraRotMatrix = mat4.create()
            //
            // mat4.rotateY(cameraRotMatrix, cameraRotMatrix, cameraRotation.yaw)
            // mat4.rotateX(cameraRotMatrix, cameraRotMatrix, -cameraRotation.pitch)
            //
            // worldMatrix = mat4.multiply(mat4.create(), worldMatrix, cameraRotMatrix)

            // const rotationMatrix = mat4.create()
            //
            // if (rotation) {
            //     mat4.rotateX(rotationMatrix, rotationMatrix, rotation[0])
            //     mat4.rotateY(rotationMatrix, rotationMatrix, rotation[1])
            //     mat4.rotateZ(rotationMatrix, rotationMatrix, rotation[2])
            // }
            //
            // if (interactionHandler.inFlight) {
            //     mat4.rotateY(rotationMatrix, rotationMatrix, interactionHandler.flightRotation);
            // }
            //
            //
            // worldMatrix = mat4.multiply(mat4.create(), worldMatrix, rotationMatrix)

            // const rotationMatrix = mat4.create()
            //
            // if (interactionHandler.inFlight) {
            //     mat4.rotateY(rotationMatrix, rotationMatrix, interactionHandler.flightRotation)
            //     console.log("Applying flight rotation:", interactionHandler.flightRotation)
            // }

            // if (rotation) {
            //     mat4.rotateX(rotationMatrix, rotationMatrix, rotation[0])
            //     mat4.rotateY(rotationMatrix, rotationMatrix, rotation[1])
            //     mat4.rotateZ(rotationMatrix, rotationMatrix, rotation[2])
            // }

            // worldMatrix = mat4.multiply(mat4.create(), worldMatrix, rotationMatrix)
            if (interactionMode === 'hold' && (interactionHandler?.isHeld || interactionHandler?.inFlight)) {
                const rotationMatrix = mat4.create()

                if (interactionHandler.inFlight) {
                    mat4.rotateY(rotationMatrix, rotationMatrix, interactionHandler.flightRotation)
                    mat4.rotateX(rotationMatrix, rotationMatrix, Math.PI / 2)
                    // rotaciona em 90 graus no eixo x
                }

                worldMatrix = mat4.multiply(mat4.create(), worldMatrix, rotationMatrix)


        } else if (rotation) {
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

    return {
        renderObject,
        interactionHandler,
        interactionMode
    }
}

