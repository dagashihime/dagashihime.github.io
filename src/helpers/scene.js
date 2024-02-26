import * as THREE from 'three'
import { getRandomXYZ } from './math'

const webGLSupport = () => {
    try {
        const canvas = document.createElement('canvas')
        return !!(window.WebGLRenderingContext && (
            canvas.getContext('webgl') || canvas.getContext('experiment-webgl')
        ))
    } catch(e) {
        return false
    }
}

const setGlobe = ({ scene, loadingManager })=> {
    const textureLoader = new THREE.TextureLoader(loadingManager)

    const moonTexture = textureLoader.load('../assets/MoonColorMap.png')
    const moonReliefTexture = textureLoader.load('../assets/MoonReliefMap.png')

    const geometry = new THREE.SphereGeometry(50, 64, 64)
    
    const material = new THREE.MeshStandardMaterial({
        map: moonTexture,
        bumpMap: moonReliefTexture
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = 'moon'
    scene.add(mesh)

    return { mesh }
}

const setLight = ({ scene, target })=> {
    const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light.position.z = 50
    light.target = target
    scene.add(light)

    return { light }
}

const setPerspectiveCamera = ({ fieldOfView, aspectRatio, nearPlane, farPlane })=> {
    const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    camera.position.z = farPlane / 4

    return { camera }
}

const setRenderer = ({ width, height })=> {
    const canvas = document.createElement('canvas')
    document.body.appendChild(canvas)

    let renderer
    if(webGLSupport()) {
        renderer = new THREE.WebGLRenderer({ alpha: true, canvas })   
    } else {
        renderer = new THREE.CanvasRenderer(canvas)
    }

    renderer.setClearColor(0x000000, 1)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    
    return { canvas, renderer }
}

const setStars = ({ scene, starQuantity = 45000 })=> {
    const geometry = new THREE.SphereGeometry(1500, 100, 50)

    const materialOptions = {
        size: 1.0,
        transparency: true,
        opacity: .7
    }

    const material = new THREE.PointsMaterial(materialOptions)

    let vertices = []
    for(let i = 0; i < starQuantity; i++) {
        let starVertex = new THREE.Vector3()
        const { x, y, z } = getRandomXYZ({ exclusionRange: 500 })
        starVertex.x = x
        starVertex.y = y
        starVertex.z = z

        vertices.push(starVertex)
    }

    geometry.setFromPoints(vertices)

    const stars = new THREE.Points(geometry, material)
    scene.add(stars)
}

export {
    setGlobe,
    setLight,
    setPerspectiveCamera,
    setRenderer,
    setStars
}