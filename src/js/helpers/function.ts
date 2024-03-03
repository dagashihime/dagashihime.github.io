const isFunction = (input: any)=> {
    return Object.prototype.toString.call(input) == '[object Function]';
}

export {
    isFunction
}