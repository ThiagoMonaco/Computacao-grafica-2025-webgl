import { mat4 } from "gl-matrix"
import { rayIntersectsTriangle } from "../../misc/math-utils.js"
import { getCameraState, updateCameraState } from "../camera.js"
import { setSightMessage } from "../sight.js"
import { getLights } from "../lights.js"

let savedMouseHandler = null
let activeObjectId = null

class ObjectView {
    constructor(objectId, initialPosition, scale = [1, 1, 1], triangles = [], rotation = [0, 0, 0]) {
        this.objectId = objectId
        this.originalPosition = [...initialPosition]
        this.objectPosition = [...initialPosition]
        this.originalScale = [...scale]
        this.scale = [...scale]
        this.originalRotation = [...rotation]
        this.rotationAngles = [...rotation]
        this.triangles = triangles

        this.mode = 'default'

        this.savedCameraSpeed = null
        this.originalLights = null

        this.bindEvents()
    }

    bindEvents() {
        window.addEventListener('keydown', e => {
            if (e.key.toLowerCase() === 'r') {
                if (this.mode === 'default') {
                    const { cameraPosition, cameraRotation } = getCameraState()
                    const ray = this.getForwardVector(cameraRotation)
                    const hit = this.triangleIntersection(cameraPosition, ray)

                    if (hit && (activeObjectId === null || activeObjectId === this.objectId)) {
                        activeObjectId = this.objectId
                        this.toggleRotationMode()
                    }
                } else if (activeObjectId === this.objectId) {
                    this.toggleRotationMode()
                    activeObjectId = null
                }
            }

            if (this.mode === 'rotate') {
                if (e.key === '+') {
                    this.scale = this.scale.map(s => s * 1.1)
                }
                if (e.key === '-') {
                    this.scale = this.scale.map(s => s / 1.1)
                }
            }
        })

        window.addEventListener('mousemove', e => {
            if (this.mode === 'rotate' && activeObjectId === this.objectId && document.pointerLockElement) {
                const dx = e.movementX || 0
                const dy = e.movementY || 0
                this.rotationAngles[1] += dx * 0.01
                this.rotationAngles[0] += dy * 0.01
                e.stopPropagation()
                e.preventDefault()
            }
        }, true)
    }

    toggleRotationMode() {
        const camera = getCameraState()
        const canvas = document.getElementById('canvas')

        if (this.mode === 'default') {
            this.savedPosition = [...this.objectPosition]
            this.savedScale = [...this.scale]
            this.savedCameraSpeed = camera.movementSpeed
            updateCameraState('movementSpeed', 0)

            this.objectPosition = this._getFrontOfCamera(3.5)
            this.rotationAngles = [...this.originalRotation]
            this.mode = 'rotate'

            if (canvas && canvas._mouseHandler) {
                savedMouseHandler = canvas._mouseHandler
                canvas.removeEventListener('mousemove', savedMouseHandler)
            }

            const lights = getLights()
            this.originalLights = JSON.parse(JSON.stringify(lights))

            const center = [...this.objectPosition]
            lights.keyLight.position = [center[0] + 4, center[1] + 4, center[2] + 4]
            lights.fillLight.position = [center[0] - 4, center[1] + 2, center[2] + 4]
            lights.backLight.position = [center[0], center[1] + 2, center[2] - 4]
            setSightMessage(this.objectId,null , false)
        } else {
            this.objectPosition = [...this.savedPosition]
            this.scale = [...this.savedScale]
            this.rotationAngles = [...this.originalRotation]
            updateCameraState('movementSpeed', this.savedCameraSpeed)
            this.mode = 'default'

            if (canvas && savedMouseHandler) {
                canvas.addEventListener('mousemove', savedMouseHandler)
                savedMouseHandler = null
            }

            if (this.originalLights) {
                const lights = getLights()
                lights.keyLight.position = [...this.originalLights.keyLight.position]
                lights.fillLight.position = [...this.originalLights.fillLight.position]
                lights.backLight.position = [...this.originalLights.backLight.position]
            }
        }
    }

    handleObjectPosition() {
        if (this.mode === 'default') {
            const { cameraPosition, cameraRotation } = getCameraState()
            const ray = this.getForwardVector(cameraRotation)
            const hit = this.triangleIntersection(cameraPosition, ray)
            setSightMessage(this.objectId, "Press 'R' focus on object", !!hit)
        }

        return this.objectPosition
    }

    getWorldMatrix() {
        const translationMatrix = mat4.create()
        mat4.translate(translationMatrix, translationMatrix, this.objectPosition)

        const rotationMatrixX = mat4.create()
        const rotationMatrixY = mat4.create()
        mat4.rotateX(rotationMatrixX, rotationMatrixX, this.rotationAngles[0])
        mat4.rotateY(rotationMatrixY, rotationMatrixY, this.rotationAngles[1])

        const scaleMatrix = mat4.create()
        mat4.scale(scaleMatrix, scaleMatrix, this.scale)

        let worldMatrix = mat4.create()
        mat4.multiply(worldMatrix, translationMatrix, rotationMatrixY)
        mat4.multiply(worldMatrix, worldMatrix, rotationMatrixX)
        mat4.multiply(worldMatrix, worldMatrix, scaleMatrix)

        return worldMatrix
    }

    triangleIntersection(origin, dir) {
        let closestHit = null
        let minDist = Infinity
        const pos = this.objectPosition
        const scl = this.scale

        for (const tri of this.triangles) {
            const v0 = [tri[0][0] * scl[0] + pos[0], tri[0][1] * scl[1] + pos[1], tri[0][2] * scl[2] + pos[2]]
            const v1 = [tri[1][0] * scl[0] + pos[0], tri[1][1] * scl[1] + pos[1], tri[1][2] * scl[2] + pos[2]]
            const v2 = [tri[2][0] * scl[0] + pos[0], tri[2][1] * scl[1] + pos[1], tri[2][2] * scl[2] + pos[2]]

            const hit = rayIntersectsTriangle(origin, dir, v0, v1, v2)
            if (hit && hit.t < minDist) {
                minDist = hit.t
                closestHit = { ...hit }
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

    _getFrontOfCamera(distance = 2) {
        const { cameraPosition, cameraRotation } = getCameraState()
        const forward = this.getForwardVector(cameraRotation)
        return [
            cameraPosition[0] + forward[0] * distance,
            cameraPosition[1] + forward[1] * distance,
            cameraPosition[2] + forward[2] * distance,
        ]
    }

    setObjectPosition(pos) {
        this.objectPosition = pos
    }

    getObjectPosition() {
        return this.objectPosition
    }

    isInRotationMode() {
        return this.mode === 'rotate'
    }
}

export { ObjectView }

