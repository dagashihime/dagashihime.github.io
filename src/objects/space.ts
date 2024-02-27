import * as THREE from 'three'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { getRandomXYZ } from '../helpers/math';

interface Plane {
    near: number
    far: number
}

interface SpaceInput {
    canvas: HTMLCanvasElement
    fieldOfView?: number
    plane?: Plane
}

export default class Space {
    private canvas: HTMLCanvasElement
    private width: number
    private height: number
    private fieldOfView: number
    private plane: Plane
    private pointer: THREE.Vector2
    
    private mouseX: number
    private mouseY: number

    private scene: THREE.Scene
    private renderer: THREE.WebGLRenderer
    private camera: THREE.Camera
    private light: THREE.DirectionalLight
    private textureLoader: THREE.TextureLoader
    private loadingManager: THREE.LoadingManager
    private raycaster: THREE.Raycaster
    private composer: EffectComposer
    private outlinePass: OutlinePass

    private moon: THREE.Mesh

    private intersected: any
    private states: {
        clicked: {
            moon: boolean
            pillar?: THREE.Mesh 
        }
    } = {
        clicked: {
            moon: false,
            pillar: undefined
        }
    }

    private meAnchor: HTMLAnchorElement
    private hoverMeAnchor: boolean = false

    constructor({ canvas, fieldOfView = 75, plane = { near: 1, far: 1250 } }: SpaceInput) {
        this.canvas = canvas
        this.width = this.canvas.width
        this.height = this.canvas.height
        this.fieldOfView = fieldOfView
        this.plane = plane
        this.pointer = new THREE.Vector2(0, 0)
        this.mouseX = 0
        this.mouseY = 0

        this.scene = new THREE.Scene()
        this.scene.fog = new THREE.FogExp2(0x000000, .0003)

        this.renderer = new THREE.WebGLRenderer({ alpha: true, canvas })
        this.renderer.setClearColor(0x000000, 1)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)

        this.camera = new THREE.PerspectiveCamera(this.fieldOfView, this.width / this.height, this.plane.near, this.plane.far)
        this.camera.position.z = this.plane.far / 4

        this.light = new THREE.DirectionalLight(0xffffff, 0.5);
        this.light.position.z = 50
        this.scene.add(this.light)

        this.loadingManager = new THREE.LoadingManager(this.loadCallback)

        this.textureLoader = new THREE.TextureLoader(this.loadingManager)

        this.raycaster = new THREE.Raycaster

        const { mesh: moon } = this.createMoon()
        this.moon = moon

        this.light.target = moon

        this.createStars({})

        const { composer, outlinePass } = this.composePostProcessing()
        this.composer = composer
        this.outlinePass = outlinePass

        this.meAnchor = document.querySelector('#me') as HTMLAnchorElement

        this.listeners()
    }

    private loadCallback() {
        const loadingScreen = document.querySelector('#loading-screen') as HTMLDivElement
        loadingScreen.classList.add('hidden')
    }

    private createMoon() {
        const { scene } = this

        const sphereSize = 50
        const pillerSize = 1

        const moonTexture = this.textureLoader.load('../assets/MoonColorMap.png')
        const moonReliefTexture = this.textureLoader.load('../assets/MoonReliefMap.png')

        const geometry = new THREE.SphereGeometry(50, 64, 64)

        const material = new THREE.MeshStandardMaterial({
            // map: moonTexture,
            // bumpMap: moonReliefTexture,
            wireframe: true
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.name = 'moon'
        scene.add(mesh);

        const pillars = [
            { phi: 1.07, theta: 0 },
            { phi: 1.57, theta: 0 },
            { phi: 1.285, theta: .57 },
            { phi: 1.285, theta: -.57 },
            { phi: 1.855, theta: .57 },
            { phi: 1.855, theta: -.57 },
            { phi: 2.07, theta: 0 },
        ].map(({ phi, theta })=> {
            const geometryP = new THREE.CylinderGeometry(.5, .5, 1, 32, 32);
            const materialP = new THREE.MeshBasicMaterial({
                color: "red"
                // color: "#e3e0cd", 
                // wireframe: true
            });
            const meshP = new THREE.Mesh(geometryP, materialP);
            meshP.position.setFromSphericalCoords(sphereSize + (pillerSize / 2), phi, theta);
            meshP.lookAt(mesh.position)
            meshP.rotateX(THREE.MathUtils.degToRad(90))
            meshP.visible = false
            meshP.name = 'pillar'

            mesh.add(meshP);

            return meshP
        })

        return { mesh, pillars }
    }

    private createStars({ starQuantity = 45000 }: { starQuantity?: number }) {
        const { scene } = this

        const geometry = new THREE.SphereGeometry(1000, 100, 50)

        const materialOptions = {
            size: 2.0,
            transparency: true,
            opacity: .7
        }

        const material = new THREE.PointsMaterial(materialOptions)

        let vertices = []
        for (let i = 0; i < starQuantity; i++) {
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

    private composePostProcessing() {
        const { width, height, scene, camera, renderer } = this

        const composer = new EffectComposer(renderer);
        composer.setSize(width, height);

        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
        composer.addPass(outlinePass);

        const shaderPass = new ShaderPass(FXAAShader);
        shaderPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
        composer.addPass(shaderPass);

        const outputPass = new OutputPass();
        composer.addPass(outputPass);

        return { composer, renderPass, outlinePass, shaderPass, outputPass }
    }

    private listeners() {
        const { meAnchor } = this

        window.addEventListener('resize', () => {
            this.width = window.innerWidth
            this.height = window.innerHeight

            // @ts-ignore
            this.camera.aspect = this.width / this.height
            // @ts-ignore
            this.camera.updateProjectionMatrix()

            this.renderer.setSize(this.width, this.height)
        })
        window.addEventListener('mousemove', e => {
            this.mouseX = e.clientX - this.width / 2
            this.mouseY = e.clientY - this.height / 2

            this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
        })
        meAnchor.addEventListener('mouseenter', e => {
            this.hoverMeAnchor = true
        })
        meAnchor.addEventListener('mouseleave', e => {
            this.hoverMeAnchor = false
        })
        document.addEventListener('click', ()=> {
            if(this.intersected && this.intersected.name === 'moon') {
                this.states.clicked.moon = !this.states.clicked.moon

                this.moon.children.forEach(child=> {
                    if(child.name === 'pillar') {
                        child.visible = !child.visible
                    }
                })
            }
            if(this.intersected && this.intersected.name === 'pillar') {
                if(this.states.clicked.pillar) {
                    const v1 = this.states.clicked.pillar.position
                    const v3 = this.intersected.position

                    const s1 = new THREE.Spherical().setFromVector3(v1)
                    const s3 = new THREE.Spherical().setFromVector3(v3)
                    const s2 = new THREE.Spherical( (s1.radius + s3.radius) / 2 + 10, (s1.phi + s3.phi) / 2, (s1.theta + s3.theta) / 2 )

                    const v2 = new THREE.Vector3().setFromSpherical(s2)

                    const curve = new THREE.QuadraticBezierCurve3(
                        v1,
                        v2,
                        v3
                    )
                    const points = curve.getPoints(128)
            
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
                    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
                    const line = new THREE.Line(lineGeometry, lineMaterial)
                    line.name = 'line'

                    this.scene.add(line)
                }
                this.states.clicked.pillar = this.intersected
            }
        })
    }

    private render() {
        const { hoverMeAnchor, plane, mouseX, mouseY, camera, pointer, raycaster, scene, light } = this
        if (hoverMeAnchor || this.states.clicked.moon) {
            if (camera.position.z > 100)
                this.camera.position.z -= .5;
            this.camera.position.x += -camera.position.x * .005
            this.camera.position.y += -camera.position.y * .005
        } else {
            if (camera.position.z < plane.far / 4)
                this.camera.position.z += .5
            this.camera.position.x += (mouseX - camera.position.x) * .005
            this.camera.position.y += (mouseY - camera.position.y) * .005
        }

        this.raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(scene.children, true).filter(i=> {
            return !['line'].includes(i.object.name)
        });

        if (intersects.length > 0) {
            this.intersected = intersects[0].object
            this.outlinePass.selectedObjects = [this.intersected]
            document.body.style.cursor = 'pointer';

        } else {
            this.intersected = null
            this.outlinePass.selectedObjects = []
            document.body.style.cursor = 'default';
        }


        this.light.position.x += (mouseX - light.position.x) * .001
        this.light.position.y += (mouseY - light.position.y) * .001

        this.camera.lookAt(this.moon.position)
        this.composer.render()
    }

    public animate() {
        requestAnimationFrame(this.animate.bind(this))
        this.render()
    }
}