import { mat4 } from "gl-matrix"

export class DefaultInteractionHandler {
    constructor(objectId, initialPosition, scale = [1, 1, 1], triangles = [], rotation, standByRotation = [0, 0, 0]) {
        this.objectPosition = initialPosition 
        this.scale = scale
        this.triangles = triangles
        this.rotation = rotation
        this.objectId = objectId
        this.standByRotation = standByRotation
    }

    handleObjectPosition() {
        this.rotation[0] += this.standByRotation[0]
        this.rotation[1] += this.standByRotation[1]
        this.rotation[2] += this.standByRotation[2]
        return this.objectPosition
    }


    getWorldMatrix() {
        const translationMatrix = mat4.create()
        mat4.translate(translationMatrix, translationMatrix, this.objectPosition)
        let worldMatrix = translationMatrix

        if(this.rotation) {
            const rotationMatrix = mat4.create()
            mat4.rotateX(rotationMatrix, rotationMatrix, this.rotation[0])
            mat4.rotateY(rotationMatrix, rotationMatrix, this.rotation[1])
            mat4.rotateZ(rotationMatrix, rotationMatrix, this.rotation[2])
            worldMatrix = mat4.multiply(mat4.create(), worldMatrix, rotationMatrix)
        }

        const scaleMatrix = mat4.create()
        mat4.scale(scaleMatrix, scaleMatrix, this.scale)
        return mat4.multiply(mat4.create(), worldMatrix, scaleMatrix)
    }
}
