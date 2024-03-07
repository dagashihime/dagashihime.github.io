import * as THREE from 'three'

interface Plane {
    near: number
    far: number
}

interface SceneBaseInput {
    canvas: HTMLCanvasElement
    fieldOfView: number
    plane: Plane
}

export default class SceneBase {
    private canvas: HTMLCanvasElement
    protected fieldOfView: number
    protected plane: Plane
    protected width: number
    protected height: number

    protected pointer: THREE.Vector2

    protected scene: THREE.Scene
    protected renderer: THREE.WebGLRenderer
    protected camera: THREE.PerspectiveCamera

    constructor({ canvas, fieldOfView, plane }: SceneBaseInput) {
        this.canvas = canvas
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.fieldOfView = fieldOfView
        this.plane = plane

        this.pointer = new THREE.Vector2(0, 0)

        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas })
        this.renderer.setClearColor(0x000000, 1)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)

        this.camera = new THREE.PerspectiveCamera(this.fieldOfView, this.width / this.height, this.plane.near, this.plane.far)
    }

    protected listeners() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth
            this.height = window.innerHeight

            this.camera.aspect = this.width / this.height
            this.camera.updateProjectionMatrix()

            this.renderer.setSize(this.width, this.height)
        })

        window.addEventListener('mousemove', e => {
            this.pointer.x = (e.clientX / this.width) * 2 - 1;
            this.pointer.y = -(e.clientY / this.height) * 2 + 1;
        })
    }

    protected render() {
        requestAnimationFrame(this.render.bind(this))
    }
}

export type { SceneBaseInput, Plane}