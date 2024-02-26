import Space from "./objects/space"

const canvas = document.createElement('canvas') as HTMLCanvasElement
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const space = new Space({ canvas })
space.animate()

document.body.appendChild(canvas)