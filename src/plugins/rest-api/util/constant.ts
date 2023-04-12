
type Payload = {
    username: string
    ses: string
    sub: number
    exp: number
}

type RequestPayload = {
    user: Object
}
export {Payload,RequestPayload}