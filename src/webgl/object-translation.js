import { mat4 } from "gl-matrix"
import { rayIntersectsTriangle } from "../misc/math-utils.js"
import { getCameraState } from "./camera.js"

class ObjectTranslation {
    constructor(objectId, initialPosition, scale = [1, 1, 1], triangles = [], rotation) {
        this.objectPosition = initialPosition
        this.scale = scale
        this.triangles = triangles
        this.selected = false
        this.movePath = []
        this.rotation = rotation
        this.objectId = objectId

        const canvas = document.querySelector("#canvas")
        canvas.addEventListener('mousedown', () => this.handleClick())
    }


    handleObjectPosition() {
        if (this.movePath.length > 0) {
            const newPos = this.movePath.shift()
            this.setObjectPosition(newPos)
        }
        return this.objectPosition
    } 

    getWorldMatrix() {
        const translationMatrix = mat4.create()
        mat4.translate(translationMatrix, translationMatrix, this.objectPosition)
        let worldMatrix = translationMatrix

        if (this.rotation) {
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



    handleClick() {
        const { cameraPosition, cameraRotation } = getCameraState()
        const ray = this.getForwardVector(cameraRotation)

        if (!this.selected) {
            const hit = this.triangleIntersection(cameraPosition, ray)
            if (hit) {
                this.selected = true
            }
        } else {
            const dist = 10
            const target = [
                cameraPosition[0] + ray[0] * dist,
                cameraPosition[1] + ray[1] * dist,
                cameraPosition[2] + ray[2] * dist,
            ]
            const steps = 60
            this.movePath.length = 0
            for (let i = 1; i <= steps; i++) {
                this.movePath.push([
                    this.objectPosition[0] + (target[0] - this.objectPosition[0]) * (i / steps),
                    this.objectPosition[1] + (target[1] - this.objectPosition[1]) * (i / steps),
                    this.objectPosition[2] + (target[2] - this.objectPosition[2]) * (i / steps),
                ])
            }
            this.selected = false
        }
    }

triangleIntersection(origin, dir) {
    let closestHit = null
    let minDist = Infinity

    const pos = this.objectPosition
    const scl = this.scale

    for (const tri of this.triangles) {
        const v0 = [
            tri[0][0] * scl[0] + pos[0],
            tri[0][1] * scl[1] + pos[1],
            tri[0][2] * scl[2] + pos[2],
        ]
        const v1 = [
            tri[1][0] * scl[0] + pos[0],
            tri[1][1] * scl[1] + pos[1],
            tri[1][2] * scl[2] + pos[2],
        ]
        const v2 = [
            tri[2][0] * scl[0] + pos[0],
            tri[2][1] * scl[1] + pos[1],
            tri[2][2] * scl[2] + pos[2],
        ]

        const hit = rayIntersectsTriangle(origin, dir, v0, v1, v2)
        if (hit && hit.t < minDist) {
            minDist = hit.t
            closestHit = { ...hit, triangle: [v0, v1, v2] }
        }
    }

    return closestHit
}

    getForwardVector(cameraRotation) {
        return [
            Math.cos(cameraRotation.pitch) * Math.sin(cameraRotation.yaw),
            Math.sin(cameraRotation.pitch),
            Math.cos(cameraRotation.pitch) * Math.cos(cameraRotation.yaw),
        ]
    }

    getObjectTranslationState() {
        return this
    }

    setObjectPosition(position) {
        this.objectPosition = position
    }

    updateObjectTranslationState(attr, value) {
        this[attr] = value
    }
}

export { ObjectTranslation }

