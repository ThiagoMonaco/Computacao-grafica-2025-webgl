export function getObjectData (obj, tex) {
    let object
    switch (obj) {
        case 'suzanne':
            object = {
                obj: '../public/assets/Modelos3D/Suzanne.obj',
                mtl: '../public/assets/Modelos3D/Suzanne.mtl',
            }
            break;
        case 'cube':
            object = {
                obj: '../public/assets/Modelos3D/Cube.obj',
                mtl: '../public/assets/Modelos3D/Cube.mtl',
            }
            break;
        default:
            object = {
                obj: '../public/assets/Modelos3D/Suzanne.obj',
                mtl: '../public/assets/Modelos3D/Suzanne.mtl',
            } 
    }

    switch (tex) {
        case 'suzanne':
            object.tex = '../public/assets/Modelos3D/Suzanne.png';
            break;
        case 'suzanneUV':
            object.tex = '../public/assets/Modelos3D/SuzanneUV.png';
            break;
        case 'cube':
            object.tex = '../public/assets/Modelos3D/Cube.png';
            break;
        case 'brick':
            object.tex = '../public/assets/tex/pixelWall.png';
           break;
        default:
            object.tex = '../public/assets/Modelos3D/Suzanne.png';
    }
    return object
}
