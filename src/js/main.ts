import Space from "./objects/space"

const canvas = document.createElement('canvas') as HTMLCanvasElement
canvas.id = '???'
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.position = 'fixed'

const space = new Space({ canvas })
space.render()

document.body.appendChild(canvas)

// document.addEventListener('scroll', e=> {
//     console.log(e)
// })