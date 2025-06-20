export function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight
    const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight

    if (needResize) {
        canvas.width = displayWidth
        canvas.height = displayHeight
    }

    return needResize
}

