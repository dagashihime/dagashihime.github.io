import * as THREE from 'three'
import { setGlobe, setLight, setPerspectiveCamera, setRenderer, setStars } from './helpers/scene'

let { height, width, aspectRatio, mouseX, mouseY } = {
    height: window.innerHeight,
    width: window.innerWidth,
    aspectRatio: window.innerWidth / window.innerHeight,
    mouseX: 0,
    mouseY: 0
}

const { fieldOfView, nearPlane, farPlane, windowHalfX, windowHalfY } = {
    fieldOfView: 75,
    nearPlane: 1,
    farPlane: 1500,
    windowHalfX: width / 2,
    windowHalfY: height / 2
}

const scene = new THREE.Scene({ antialias: true })
scene.fog = new THREE.FogExp2(0x000000, .0003)

const loadingManager = new THREE.LoadingManager(()=> {
    console.log('his')
    const loadingScreen = document.querySelector('#loading-screen')
    loadingScreen.classList.add('hidden')
})

const { camera } = setPerspectiveCamera({ fieldOfView, aspectRatio, nearPlane, farPlane })
const { renderer } = setRenderer({ width, height })
setStars({ scene })
const { mesh: globe } = setGlobe({ scene, loadingManager })
globe.addEventListener('click', e=> {
    console.log('u enter wtf')
})

const { light } = setLight({ scene, target: globe })

window.addEventListener('resize', ()=> {
    width = window.innerWidth
    height = window.innerHeight
    aspectRatio = width / height

    camera.aspect = aspectRatio
    camera.updateProjectionMatrix()

    renderer.setSize(width, height)
})
window.addEventListener('mousemove', e=> {
    mouseX = e.clientX - windowHalfX
    mouseY = e.clientY - windowHalfY
})

const me = document.querySelector('#me')
let hover;
me.addEventListener('mouseenter', e=> {
    hover = true
})
me.addEventListener('mouseleave', e=> {
    hover = false
})

const animate = () => {
    requestAnimationFrame(animate)
    render()
}

const render = () => {
    if(hover) {
        if(camera.position.z > 100)
            camera.position.z -= .5;
        camera.position.x += -camera.position.x * .005
        camera.position.y += -camera.position.y * .005
    } else {
        if(camera.position.z < farPlane / 4)
            camera.position.z += .5
        camera.position.x += ( mouseX - camera.position.x ) * .005
        camera.position.y += ( mouseY - camera.position.y ) * .005
    }

    light.position.x += ( mouseX - light.position.x ) * .001
    light.position.y += ( mouseY - light.position.y ) * .001

    camera.lookAt(globe.position)
    renderer.render(scene, camera)
}

animate()