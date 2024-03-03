import { isFunction } from "../helpers/function"

type Callback = (value: any)=> any
type Setter =  ({ oldValue, value }: { oldValue: any, value: any })=> any 

interface StateConstructor {
    value: any,
    setter?: Setter
}

class State {
    private value: any
    private setter?: Setter 

    constructor({ value, setter }: StateConstructor) {
        this.value = value
        this.setter = setter
    }

    public set(input: Callback | any) {
        if(isFunction(input)) {
            this.value = input(this.value)
        } else if(this.setter) {
            this.value = this.setter({ oldValue: this.value, value: input })
        }
    }

    public declareSetter(callback: Setter) {
        this.setter = callback
    }

    public get() {
        return this.value
    }
}

export default State
