import * as THREE from 'three'

type Only<T, U> = {
    [P in keyof T]: T[P];
} & {
    [P in keyof U]?: never;
}

type Either<T, U> = Only<T, U> | Only<U, T>

interface CreateLineAroundSphereInput {
    r: number
    numPoints?: number
    vectors?: { 
        start: THREE.Vector3, 
        end: THREE.Vector3 
    }, 
    sphericals?: { 
        start: THREE.Spherical, 
        end: THREE.Spherical 
    } 
}

interface CreateLineAroundSphereOutput {
    line: THREE.Line
}

interface ErrorOutput {
    error: boolean
}

const createLineAroundSphere = ({ r, numPoints = 100, vectors, sphericals }: CreateLineAroundSphereInput): Either<CreateLineAroundSphereOutput, ErrorOutput> => {
    let start: THREE.Spherical, end: THREE.Spherical
    if(sphericals) {
        start = sphericals.start
        end = sphericals.end
    } else if(vectors) {
        start = new THREE.Spherical().setFromVector3(vectors?.start!)
        end = new THREE.Spherical().setFromVector3(vectors?.end!)
    } else {
        return { error: true }
    }

    const curvePoints = [];
    for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1);
        const phi = start.phi * (1 - t) + end.phi * t;
        const theta = start.theta * (1 - t) + end.theta * t;
        curvePoints.push(new THREE.Vector3().setFromSphericalCoords(r, phi, theta));
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints)
    const points = curve.getPoints(numPoints)

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
     })
    const line = new THREE.Line(lineGeometry, lineMaterial)
    line.name = 'line'

    return { line }
}

const getRandomVector3 = ({ exclusionRange }: { exclusionRange?: number })=> {
    let array;
    do {
        array = ['x','y','z'].map(()=> {
            return Math.random() * 2000 - 1000
        })
    } while(exclusionRange && array.filter(n=> n >= -exclusionRange && n <= exclusionRange).length === 3)
    
    

    return new THREE.Vector3(array[0], array[1] ,array[2])
}

export {
    createLineAroundSphere,
    getRandomVector3
}