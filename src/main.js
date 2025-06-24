import { startKeys } from './misc/keys.js'
import { startObject } from './object.js'
import { getCameraState, startCamera, updateCameraPosition } from './webgl/camera.js'
import { getLights, startLights } from './webgl/lights.js'
import { createProgramFromSources } from './webgl/shaders.js'
import { setUniforms } from './webgl/uniforms.js'
import { resizeCanvasToDisplaySize } from './webgl/utils.js'
import { perspective, lookAt, inverse, identity, normalize } from './misc/math-utils.js'
import { loadObjectsFromJSON } from './misc/object-json-parser.js'

async function scene (objectsData) {
    const canvas = document.querySelector("#canvas")
    const gl = canvas.getContext("webgl2")
    if (!gl) return

    let vs = await fetch('../public/shaders/vertex-shader.vs')
    let fs = await fetch('../public/shaders/fragment-shader.fs')
    vs = await vs.text()
    fs = await fs.text()

    const meshProgramInfo = createProgramFromSources(gl, [vs, fs])

    startKeys()
    startCamera()
    startLights()

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock()
    })

    function degToRad(d) {
        return d * Math.PI / 180
    }

    const objects = await Promise.all(objectsData.map(obj => { 
        const options = {
            interactionMode: obj.interactionMode,
            initialPosition: obj.initialPosition,
            rotation: obj.rotation.map(degToRad),
            scale: [obj.scale, obj.scale, obj.scale]
        }

        return startObject(obj.name, meshProgramInfo, gl, options)
    }))

    let lastTime = 0
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.depthMask(true)
    gl.frontFace(gl.CCW)
    gl.enable(gl.DEPTH_TEST)

    function render(time) {
        time *= 0.001
        const deltaTime = time - lastTime
        lastTime = time
        const lights = getLights()

        updateCameraPosition(deltaTime)
        resizeCanvasToDisplaySize(gl.canvas)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

        const { cameraPosition, cameraRotation, up, zFar, zNear } = getCameraState()
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
        const projection = perspective(degToRad(60), aspect, zNear, zFar)

        const lookDirection = [
            cameraPosition[0] + Math.cos(cameraRotation.pitch) * Math.sin(cameraRotation.yaw),
            cameraPosition[1] + Math.sin(cameraRotation.pitch),
            cameraPosition[2] + Math.cos(cameraRotation.pitch) * Math.cos(cameraRotation.yaw),
        ]

        const cameraMatrix = lookAt(cameraPosition, lookDirection, up)
        const view = inverse(cameraMatrix)

        gl.useProgram(meshProgramInfo.program)
        setUniforms(gl, meshProgramInfo.program, {
            lightDirection: normalize([-1, 3, 5]),
            view,
            projection,
            world: identity(),
            diffuse: [1, 1, 1, 1],

            keyLightPos: lights.keyLight.position,
            keyLightColor: lights.keyLight.color,
            keyLightOn: Number(lights.keyLight.on),

            fillLightPos: lights.fillLight.position,
            fillLightColor: lights.fillLight.color,
            fillLightOn: Number(lights.fillLight.on),

            backLightPos: lights.backLight.position,
            backLightColor: lights.backLight.color,
            backLightOn: Number(lights.backLight.on),
        })

        for (const ob of objects) {
            ob.renderObject()
        }

        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}

const objectsData = await loadObjectsFromJSON('../public/objects.json')
scene(objectsData)

