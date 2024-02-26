const getRandomXYZ = ({ exclusionRange } = {})=> {
    let array;
    do {
        array = ['x','y','z'].map(()=> {
            return Math.random() * 2000 - 1000
        })
    } while(exclusionRange && array.filter(n=> n >= -exclusionRange && n <= exclusionRange).length === 3)
    
    return { 
        x: array[0], 
        y: array[1],
        z: array[2]
    }
}

export {
    getRandomXYZ
}