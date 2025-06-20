let MatType = Float32Array 

function identity(dst) {
    dst = dst || new MatType(16)

    dst[ 0] = 1
    dst[ 1] = 0
    dst[ 2] = 0
    dst[ 3] = 0
    dst[ 4] = 0
    dst[ 5] = 1
    dst[ 6] = 0
    dst[ 7] = 0
    dst[ 8] = 0
    dst[ 9] = 0
    dst[10] = 1
    dst[11] = 0
    dst[12] = 0
    dst[13] = 0
    dst[14] = 0
    dst[15] = 1

    return dst
}

function translation(tx, ty, tz, dst) {
    dst = dst || new MatType(16)

    dst[ 0] = 1
    dst[ 1] = 0
    dst[ 2] = 0
    dst[ 3] = 0
    dst[ 4] = 0
    dst[ 5] = 1
    dst[ 6] = 0
    dst[ 7] = 0
    dst[ 8] = 0
    dst[ 9] = 0
    dst[10] = 1
    dst[11] = 0
    dst[12] = tx
    dst[13] = ty
    dst[14] = tz
    dst[15] = 1

    return dst
}

function normalize(v, dst) {
    dst = dst || new MatType(3)
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    if (length > 0.00001) {
        dst[0] = v[0] / length
        dst[1] = v[1] / length
        dst[2] = v[2] / length
    }
    return dst
}

function inverse(m, dst) {
    dst = dst || new MatType(16)
    const m00 = m[0 * 4 + 0]
    const m01 = m[0 * 4 + 1]
    const m02 = m[0 * 4 + 2]
    const m03 = m[0 * 4 + 3]
    const m10 = m[1 * 4 + 0]
    const m11 = m[1 * 4 + 1]
    const m12 = m[1 * 4 + 2]
    const m13 = m[1 * 4 + 3]
    const m20 = m[2 * 4 + 0]
    const m21 = m[2 * 4 + 1]
    const m22 = m[2 * 4 + 2]
    const m23 = m[2 * 4 + 3]
    const m30 = m[3 * 4 + 0]
    const m31 = m[3 * 4 + 1]
    const m32 = m[3 * 4 + 2]
    const m33 = m[3 * 4 + 3]
    const tmp_0  = m22 * m33
    const tmp_1  = m32 * m23
    const tmp_2  = m12 * m33
    const tmp_3  = m32 * m13
    const tmp_4  = m12 * m23
    const tmp_5  = m22 * m13
    const tmp_6  = m02 * m33
    const tmp_7  = m32 * m03
    const tmp_8  = m02 * m23
    const tmp_9  = m22 * m03
    const tmp_10 = m02 * m13
    const tmp_11 = m12 * m03
    const tmp_12 = m20 * m31
    const tmp_13 = m30 * m21
    const tmp_14 = m10 * m31
    const tmp_15 = m30 * m11
    const tmp_16 = m10 * m21
    const tmp_17 = m20 * m11
    const tmp_18 = m00 * m31
    const tmp_19 = m30 * m01
    const tmp_20 = m00 * m21
    const tmp_21 = m20 * m01
    const tmp_22 = m00 * m11
    const tmp_23 = m10 * m01

    const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31)
    const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31)
    const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31)
    const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21)

    const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3)

    dst[0] = d * t0
    dst[1] = d * t1
    dst[2] = d * t2
    dst[3] = d * t3
    dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
        (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30))
    dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
        (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30))
    dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
        (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30))
    dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
        (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20))
    dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
        (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33))
    dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
        (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33))
    dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
        (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33))
    dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
        (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23))
    dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
        (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22))
    dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
        (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02))
    dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
        (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12))
    dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
        (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))

    return dst
} 

function cross(a, b, dst) {
    dst = dst || new MatType(3)
    dst[0] = a[1] * b[2] - a[2] * b[1]
    dst[1] = a[2] * b[0] - a[0] * b[2]
    dst[2] = a[0] * b[1] - a[1] * b[0]
    return dst
}

function subtractVectors(a, b, dst) {
    dst = dst || new MatType(3)
    dst[0] = a[0] - b[0]
    dst[1] = a[1] - b[1]
    dst[2] = a[2] - b[2]
    return dst
}

function lookAt(cameraPosition, target, up, dst) {
    dst = dst || new MatType(16)
    const zAxis = normalize(
        subtractVectors(cameraPosition, target))
    const xAxis = normalize(cross(up, zAxis))
    const yAxis = normalize(cross(zAxis, xAxis))

    dst[ 0] = xAxis[0]
    dst[ 1] = xAxis[1]
    dst[ 2] = xAxis[2]
    dst[ 3] = 0
    dst[ 4] = yAxis[0]
    dst[ 5] = yAxis[1]
    dst[ 6] = yAxis[2]
    dst[ 7] = 0
    dst[ 8] = zAxis[0]
    dst[ 9] = zAxis[1]
    dst[10] = zAxis[2]
    dst[11] = 0
    dst[12] = cameraPosition[0]
    dst[13] = cameraPosition[1]
    dst[14] = cameraPosition[2]
    dst[15] = 1

    return dst
}

function perspective(fieldOfViewInRadians, aspect, near, far, dst) {
    dst = dst || new MatType(16)
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians)
    const rangeInv = 1.0 / (near - far)

    dst[ 0] = f / aspect
    dst[ 1] = 0
    dst[ 2] = 0
    dst[ 3] = 0
    dst[ 4] = 0
    dst[ 5] = f
    dst[ 6] = 0
    dst[ 7] = 0
    dst[ 8] = 0
    dst[ 9] = 0
    dst[10] = (near + far) * rangeInv
    dst[11] = -1
    dst[12] = 0
    dst[13] = 0
    dst[14] = near * far * rangeInv * 2
    dst[15] = 0

    return dst
}


export {
    identity,
    translation,
    normalize,
    inverse,
    lookAt,
    perspective
}
