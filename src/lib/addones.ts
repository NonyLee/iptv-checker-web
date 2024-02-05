interface Addones {
    name: string,
    url: string
}

let userAgent = navigator.userAgent
let isEdge = userAgent.includes("Edge");
let isChrome = userAgent.includes("Chrome");

const eAddones = {
    name: "CORS Unblock",
    url: "https://microsoftedge.microsoft.com/addons/detail/cors-unblock/hkjklmhkbkdhlgnnfbbcihcajofmjgbh"
}

const cAddones = {
    name: "CORS Unblock",
    url: "https://chromewebstore.google.com/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino"
}

const addones: Addones[] = []
if (isEdge) {
    addones.push(eAddones)
} else if (isChrome) {
    addones.push(cAddones)
}

export default addones