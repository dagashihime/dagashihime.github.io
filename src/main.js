import * as THREE from 'three'
import { setGlobe, setLight, setPerspectiveCamera, setRenderer, setStars } from './helpers/scene'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

let { height, width, aspectRatio, mouseX, mouseY } = {
    height: window.innerHeight,
    width: window.innerWidth,
    aspectRatio: window.innerWidth / window.innerHeight,
    mouseX: 0,
    mouseY: 0
}
let INTERSECTED
let outlinePass, composer, effectFXAA

const { fieldOfView, nearPlane, farPlane, windowHalfX, windowHalfY } = {
    fieldOfView: 75,
    nearPlane: 1,
    farPlane: 1500,
    windowHalfX: width / 2,
    windowHalfY: height / 2
}

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

const scene = new THREE.Scene({ antialias: true })
scene.fog = new THREE.FogExp2(0x000000, .0003)

const loadingManager = new THREE.LoadingManager(() => {
    const loadingScreen = document.querySelector('#loading-screen')
    loadingScreen.classList.add('hidden')
})

const { camera } = setPerspectiveCamera({ fieldOfView, aspectRatio, nearPlane, farPlane })
const { renderer } = setRenderer({ width, height })
setStars({ scene })
const { mesh: globe } = setGlobe({ scene, loadingManager })

// postprocessing

composer = new EffectComposer(renderer);
composer.setSize(width, height);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(outlinePass);

effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(effectFXAA);

const outputPass = new OutputPass();
composer.addPass(outputPass);


const { light } = setLight({ scene, target: globe })

window.addEventListener('resize', () => {
    width = window.innerWidth
    height = window.innerHeight
    aspectRatio = width / height

    camera.aspect = aspectRatio
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
})
window.addEventListener('mousemove', e => {
    mouseX = e.clientX - windowHalfX
    mouseY = e.clientY - windowHalfY

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
})

const me = document.querySelector('#me')
let hover;
me.addEventListener('mouseenter', e => {
    hover = true
})
me.addEventListener('mouseleave', e => {
    hover = false
})


document.addEventListener('click', () => {
    if (INTERSECTED && INTERSECTED.name === 'moon') {
        console.log(INTERSECTED)
    }
})

const animate = () => {
    requestAnimationFrame(animate)
    render()
}

const render = () => {
    if (hover) {
        if (camera.position.z > 100)
            camera.position.z -= .5;
        camera.position.x += -camera.position.x * .005
        camera.position.y += -camera.position.y * .005
    } else {
        if (camera.position.z < farPlane / 4)
            camera.position.z += .5
        camera.position.x += (mouseX - camera.position.x) * .005
        camera.position.y += (mouseY - camera.position.y) * .005
    }

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        INTERSECTED = intersects[0].object
        outlinePass.selectedObjects = [INTERSECTED]

    } else {
        INTERSECTED = null
        outlinePass.selectedObjects = []
    }


    light.position.x += (mouseX - light.position.x) * .001
    light.position.y += (mouseY - light.position.y) * .001

    camera.lookAt(globe.position)
    // renderer.render(scene, camera)
    composer.render()
}

animate()