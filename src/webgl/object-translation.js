import { getCameraState } from "./camera";


class ObjectTranslation {
    constructor(initialPosition) {
        this.objectPosition = initialPosition;
        this.selected = false;
        this.movePath = [];
        const canvas = document.querySelector("#canvas");
        canvas.addEventListener('mousedown', () => {
            const { objectPosition, selected, movePath } = this
            const { cameraPosition } = getCameraState();
            const ray = this.getForwardVector();

            if (!selected) {
                if (this.intersectsObject(cameraPosition, ray, objectPosition, 1)) {
                    this.selected = true;
                }
            } else {
                const dist = 10;
                const target = [
                    cameraPosition[0] + ray[0]*dist,
                    cameraPosition[1] + ray[1]*dist,
                    cameraPosition[2] + ray[2]*dist,
                ];
                const steps = 60;
                this.movePath.length = 0;
                for (let i = 1; i <= steps; i++) {
                    movePath.push([
                        objectPosition[0] + (target[0] - objectPosition[0]) * (i/steps),
                        objectPosition[1] + (target[1] - objectPosition[1]) * (i/steps),
                        objectPosition[2] + (target[2] - objectPosition[2]) * (i/steps),
                    ]);
                }
                this.selected = false;
            }
        });
    }

    getObjectTranslationState () {
        return this
    }

    setObjectPosition(position) {
        this.objectPosition = position;
    }

    updateObjectTranslationState(attr, value) {
        this[attr] = value
    }

    getForwardVector() {
        const { cameraRotation } = getCameraState();
        return [
            Math.cos(cameraRotation.pitch) * Math.sin(cameraRotation.yaw),
            Math.sin(cameraRotation.pitch),
            Math.cos(cameraRotation.pitch) * Math.cos(cameraRotation.yaw),
        ];
    }

    intersectsObject(camPos, dir, objPos, r = 1) {
        const toObj = [
            objPos[0] - camPos[0],
            objPos[1] - camPos[1],
            objPos[2] - camPos[2],
        ];
        const proj = toObj[0]*dir[0] + toObj[1]*dir[1] + toObj[2]*dir[2];
        const closest = [
            camPos[0] + dir[0]*proj,
            camPos[1] + dir[1]*proj,
            camPos[2] + dir[2]*proj,
        ];
        const dSq = (objPos[0]-closest[0])**2+(objPos[1]-closest[1])**2+(objPos[2]-closest[2])**2;
        return dSq <= r*r;
    }


    startObjectTranslation() {
    }
}


export { ObjectTranslation }
