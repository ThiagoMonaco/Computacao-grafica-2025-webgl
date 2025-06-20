import { renderObject } from './object.js';


async function scene () {
    // const canvas = document.querySelector("#canvas");
    // const gl = canvas.getContext("webgl2");
    // if (!gl) return;
    //
    // let vs = await fetch('../public/shaders/vertex-shader.vs')
    // let fs = await fetch('../public/shaders/fragment-shader.fs')
    //
    // vs = await vs.text();
    // fs = await fs.text();


    // renderObject(canvas, gl, vs, fs, 'suzanne', 'suzanne', [0, 5, 0]);
    // renderObject(canvas, gl, vs, fs, 'cube', 'cube')
    // renderObject(canvas, gl, vs, fs, 'cube', 'brick', [5, 0, 0]);
    // renderObject(canvas, gl, vs, fs,'suzanne', 'suzanne', [0, 5, 0])



    renderObject('suzanne', 'suzanne', [0, 5, 0]);
    renderObject('cube', 'cube')
    renderObject('cube', 'brick', [5, 0, 0]);
    // renderObject('suzanne', 'suzanne', [0, 5, 0])
}

scene()
