import { rayIntersectsTriangle } from "../misc/math-utils.js"
import { getCameraState } from "./camera.js"

class ObjectHoldable {
    constructor(initialPosition, scale = [1, 1, 1], triangles = []) {
        this.objectPosition = initialPosition
        this.scale = scale
        this.triangles = triangles

        this.isHeld = false
        this.trajectory = []
        this.trajectoryIndex = 0
        this.inFlight = false   // true enquanto estiver voando
        this.phase = null       // 'out' ou 'back'
        this.flightRotation = 0 // rotação acumulada em radianos
        this.rotationSpeed = 0.1  // velocidade angular da rotação
    }

    tryHoldFromCameraRay() {
        const { cameraPosition, cameraRotation } = getCameraState()
        const ray = this.getForwardVector(cameraRotation)
        const hit = this.triangleIntersection(cameraPosition, ray)

        if (hit) {
            this.isHeld = true
        }
    }

    updateWhileHeld() {
        // 1. Se estiver em voo (trajetória ativa)
        if (this.inFlight) {
            // Atualiza posição na trajetória
            this.objectPosition = this.trajectory[this.trajectoryIndex++]

            // Atualiza rotação acumulada para o giro
            this.flightRotation += this.rotationSpeed

            if (this.trajectoryIndex >= this.trajectory.length) {
                if (this.phase === 'out') {
                    // Só gera a trajetória de volta se ainda não tiver gerado
                    if (this.phase !== 'back') { // evita gerar múltiplas vezes
                        // Começa a gerar a trajetória de volta
                        const start = [...this.objectPosition]
                        const end = this._getHandPosition()
                        const { cameraRotation } = getCameraState()

                        const forward = this.getForwardVector(cameraRotation)
                        const right = [
                            Math.sin(cameraRotation.yaw - Math.PI / 2), 0,
                            Math.cos(cameraRotation.yaw - Math.PI / 2)
                        ]

                        const lateralOffset = 14
                        const height = 5
                        const steps = 180

                        // Pontos de controle para a volta (curva espelhada)
                        const backP1 = [
                            start[0] + (end[0] - start[0]) * 0.33 - right[0] * lateralOffset,
                            Math.max(start[1], end[1]) + height,
                            start[2] + (end[2] - start[2]) * 0.33 - right[2] * lateralOffset,
                        ]

                        const backP2 = [
                            start[0] + (end[0] - start[0]) * 0.66 - right[0] * lateralOffset,
                            Math.max(start[1], end[1]) + height,
                            start[2] + (end[2] - start[2]) * 0.66 - right[2] * lateralOffset,
                        ]

                        // Gera curva de volta
                        this.trajectory = []
                        for (let t = 0; t <= 1; t += 1 / steps) {
                            this.trajectory.push([
                                this._bezier(start[0], backP1[0], backP2[0], end[0], t),
                                this._bezier(start[1], backP1[1], backP2[1], end[1], t),
                                this._bezier(start[2], backP1[2], backP2[2], end[2], t),
                            ])
                        }

                        this.phase = 'back'
                        this.trajectoryIndex = 0
                    }
                } else if (this.phase === 'back') {
                    // Chegou na mão, para o voo e segura o objeto
                    this.inFlight = false
                    this.isHeld = true
                    this.phase = null
                    this.trajectory = []
                    this.trajectoryIndex = 0

                    // Resetar rotação para ficar "normal" na mão
                    this.flightRotation = 0
                    this.rotationSpeed = 0
                }
            }

            return // não processa mais nada enquanto em voo
        }

        // 2. Se não está voando e não está sendo segurado → nada a fazer
        if (!this.isHeld) return

        // 3. Objeto está sendo segurado: atualizar posição fixa na mão
        this.objectPosition = this._getHandPosition()
    }

    release() {
        this.isHeld = false
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

    setObjectPosition(pos) {
        this.objectPosition = pos
    }

    getObjectPosition() {
        return this.objectPosition
    }

    _bezier(p0, p1, p2, p3, t) {
        const it = 1 - t
        return it * it * it * p0 +
            3 * it * it * t * p1 +
            3 * it * t * t * p2 +
            t * t * t * p3
    }

    _getHandPosition() {
        const { cameraPosition, cameraRotation } = getCameraState()
        const forward = this.getForwardVector(cameraRotation)
        const right = [
            Math.sin(cameraRotation.yaw - Math.PI / 2), 0,
            Math.cos(cameraRotation.yaw - Math.PI / 2)
        ]
        const up = [0, 1, 0]

        const forwardDistance = 1.5
        const rightOffset = 0.5
        const upOffset = -0.3

        return [
            cameraPosition[0] + forward[0] * forwardDistance + right[0] * rightOffset + up[0] * upOffset,
            cameraPosition[1] + forward[1] * forwardDistance + right[1] * rightOffset + up[1] * upOffset,
            cameraPosition[2] + forward[2] * forwardDistance + right[2] * rightOffset + up[2] * upOffset,
        ]
    }

    throwBoomerang() {
        if (!this.isHeld) return

        const { cameraPosition, cameraRotation } = getCameraState()
        const forward = this.getForwardVector(cameraRotation)
        const right = [
            Math.sin(cameraRotation.yaw - Math.PI / 2), 0,
            Math.cos(cameraRotation.yaw - Math.PI / 2)
        ]

        const distanceOut = 28
        const lateralOffset = 14
        const height = 5
        const steps = 180

        const p0 = this._getHandPosition()

        const p3 = [
            cameraPosition[0] + forward[0] * distanceOut,
            cameraPosition[1],
            cameraPosition[2] + forward[2] * distanceOut,
        ]

        const p1 = [
            cameraPosition[0] + forward[0] * (distanceOut * 0.33) + right[0] * lateralOffset,
            cameraPosition[1] + height,
            cameraPosition[2] + forward[2] * (distanceOut * 0.33) + right[2] * lateralOffset,
        ]

        const p2 = [
            cameraPosition[0] + forward[0] * (distanceOut * 0.66) + right[0] * lateralOffset,
            cameraPosition[1] + height,
            cameraPosition[2] + forward[2] * (distanceOut * 0.66) + right[2] * lateralOffset,
        ]

        // Gera curva de ida
        this.trajectory = []
        for (let t = 0; t <= 1; t += 1 / steps) {
            this.trajectory.push([
                this._bezier(p0[0], p1[0], p2[0], p3[0], t),
                this._bezier(p0[1], p1[1], p2[1], p3[1], t),
                this._bezier(p0[2], p1[2], p2[2], p3[2], t),
            ])
        }

        this.rotationSpeed = 0.3
        this.flightRotation = 0
        this.inFlight = true
        this.isHeld = false
        this.phase = 'out'
        this.trajectoryIndex = 0
    }
}

export { ObjectHoldable }

