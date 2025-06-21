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
        case 'grass': {
            object = {
                obj: '../public/assets/Modelos3D/grass/grass.obj',
                mtl: '../public/assets/Modelos3D/grass/grass.mtl',
                // obj: '../public/assets/Modelos3D/floor/Stone_ground_01.obj',
                // mtl: '../public/assets/Modelos3D/floor/Stone_ground_01.mtl',
                // obj: '../public/assets/Modelos3D/sign/floor/.obj',
                // mtl: '../public/assets/Modelos3D/.mtl',
            }
            break;
        }
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
        case 'brick':
            object.tex = '../public/assets/tex/pixelWall.png';
           break;
        case 'grass':
            object.tex = '../public/assets/Modelos3D/grass/grass.jpg';
            // object.tex = '../public/assets/Modelos3D/floor/Stone_ground_01_u1_v1.jpg';
            break;
        default:
            object.tex = '../public/assets/Modelos3D/Suzanne.png';
    }
    return object
}
