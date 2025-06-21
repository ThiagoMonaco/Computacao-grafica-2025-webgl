import { createVAOFromData, drawBufferInfo } from './webgl/buffers.js'
import { setUniforms } from './webgl/uniforms.js'
import { parseOBJ } from './webgl/parsers/obj-parser.js'
import { parseMTL } from './webgl/parsers/mtl-parser.js'
import { loadTexture } from './webgl/texture.js'
import { getObjectData } from './misc/obj-selector.js'
import { ObjectTranslation } from './webgl/object-translation.js'
import { multiply, translation, xRotation } from './misc/math-utils.js'


export async function startObject(obj, shader, meshProgramInfo, gl, initialPosition = [0, 0, 0], rotation = null) {
    let objectData = getObjectData(obj, shader)

    const response = await fetch(objectData.obj)
    const text = await response.text()
    const data = parseOBJ(text)

    const mtlName = data.materialsLibs[0]
    const mtlResponse = await fetch(objectData.mtl)
    const mtlText = await mtlResponse.text()
    const materials = parseMTL(mtlText)

    const bufferInfo = createVAOFromData(gl, data, meshProgramInfo.program)

    const texture = loadTexture(gl, objectData.tex)

    const objectTranslation = new ObjectTranslation(initialPosition)


    function renderObject() {
        const { movePath, objectPosition } = objectTranslation

        if (movePath.length > 0) {
            const newObjectPosition = movePath.shift()
            objectTranslation.setObjectPosition(newObjectPosition)
        }
        const rotationMatrix = xRotation(Math.PI / 2)
        const translationMatrix = translation(...objectPosition)
        let worldMatrix = translationMatrix
        if(rotation) {
            worldMatrix = multiply(translationMatrix, rotationMatrix)
        } 

        const mat = materials[mtlName] || {}
        setUniforms(gl, meshProgramInfo.program, {
            world: worldMatrix, 
            diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],
        })


        for (const [materialName, indices] of Object.entries(data.materialGroups)) {
            const mat = materials[materialName] || {}

            setUniforms(gl, meshProgramInfo.program, {
                diffuse: mat.diffuse ? [...mat.diffuse, 1.0] : [1, 1, 1, 1],
                world: worldMatrix, 
            })

            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.uniform1i(gl.getUniformLocation(meshProgramInfo.program, "textureSampler"), 0)

            drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, indices.length, 0, indices)
        }

    }
    return { renderObject }
}
