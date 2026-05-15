const btnIngresar = document.getElementById("btnLogin")
const btnOperacion = document.getElementById("btnEjecucion")
const btnSalir = document.getElementById("btnsalir")
const section1 = document.getElementById("sectionLogin")
const section2 = document.getElementById("sectionOperacion")
const section3 = document.getElementById("sectionRegister")
const section4 = document.getElementById("sectionLogo")

const temaOscuro = () => {
    document.querySelector("html").setAttribute("data-bs-theme","dark");
    document.querySelector("#dl-icon").setAttribute("class","bi bi-sun-fill");
}

const temaClaro = () => {
    document.querySelector("html").setAttribute("data-bs-theme","light");
    document.querySelector("#dl-icon").setAttribute("class","bi bi-moon-fill");
}

const cambiarTema = () => {
    document.querySelector("html").getAttribute("data-bs-theme") === "light"?
    temaOscuro() : temaClaro()
}

let saldoActual = Number(document.getElementById("saldo").innerText);
let intentosClave = 3
let bloqueado = false

const API_URL = "http://127.0.0.1:8000" 



btnIngresar.addEventListener("click", verificarUsuario)
btnOperacion.addEventListener("click", transacción)
btnSalir.addEventListener("click", salir)

section2.style.display = "none"
section3.style.display = "none"

document.getElementById("irARegistro").addEventListener("click", (e) => {
    e.preventDefault()
    section1.style.display = "none"
    section4.style.display = "none"
    section3.style.display = "block"
})
 
document.getElementById("irALogin").addEventListener("click", (e) => {
    e.preventDefault()
    section3.style.display = "none"
    section4.style.display = "block"
    section1.style.display = "block"
})

document.getElementById("btnRegister").addEventListener("click", async (e) => {
    e.preventDefault()
    const username = document.getElementById("reg-user").value.trim()
    const pinStr   = document.getElementById("reg-pin").value.trim()
 
    if (!username || !/^\d{4}$/.test(pinStr)) {
        alert("Ingrese un usuario y un PIN de 4 dígitos.")
        return
    }
 
    try {
        const respuesta = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, pin: Number(pinStr) })
        })
        const datos = await respuesta.json()
 
        if (datos.error) {
            alert(datos.error)
        } else {
            alert("Cuenta creada.")
            document.getElementById("reg-user").value = ""
            document.getElementById("reg-pin").value  = ""
            section3.style.display = "none"
            section1.style.display = "block"
            section4.style.display = "block"
        }
    } catch {
        alert("No se pudo conectar con el servidor.")
    }
})
 
async function verificarUsuario(){
    const inputUserName = document.getElementById("user-name").value
    const inputPassword = document.getElementById("user-password").value
    if (!/^\d{4}$/.test(inputPassword)) {
        alert("La contrasseña debe ser 4 dígitos numéricos.")
        return
    }
    
 
    if (bloqueado == true) {
        alert("Está bloqueado.")
        return
    }
 
    try {
        const respuesta = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: inputUserName, pin: Number(inputPassword) })
        })
        const datos = await respuesta.json()
 
        if (datos.error) {
            intentosClave--;
            if (intentosClave > 0) {
                alert(`Clave incorrecta. Le quedan ${intentosClave} intentos.`);
            } else {
                alert("Ha alcanzado el número máximo de intentos.");
                bloqueado = true;
            }
        } else {
            console.log("Nombre usuario: ", inputUserName)
            document.getElementById("saldo").innerText = datos.saldo
            saldoUF(datos.saldo)
            section1.style.display = "none"
            section2.style.display = "block"
        }
    } catch {
        alert("No se pudo conectar con el servidor.")
    }
}

async function transacción(){
    let inputMonto = Number(document.getElementById("user-monto").value)
    let selectOperacion = document.getElementById("seleccion-operacion").value
    let inputPassword = document.getElementById("user-password").value
    let inputUserName = document.getElementById("user-name").value
    let inputTipo = ""
    if (selectOperacion === "1"){
        inputTipo = "deposito"
    } else {
        inputTipo = "retiro"
    }
 
    try {
        const respuesta = await fetch(`${API_URL}/transaccion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: inputUserName, pin: Number(inputPassword), monto:inputMonto, tipo: inputTipo })
        })
        const datos = await respuesta.json()
        if (datos.error) {
            alert(datos.error)
        } else {
            document.getElementById("saldo").innerText = datos.nuevo_saldo
            saldoUF(datos.nuevo_saldo)
        }
        
        
    } catch {
        alert("No se pudo conectar con el servidor.")
    }
}

async function saldoUF(saldo){
    try {
        const respuesta = await fetch("https://mindicador.cl/api")
        const datos = await respuesta.json()
        console.log(datos)
        const valorUF = datos.uf.valor
        let saldoUF = (saldo/valorUF).toFixed(2)
        document.getElementById("saldo-uf").innerText = saldoUF

    } catch {
        document.getElementById("saldo-uf").innerText = "No disponible"
    }
}
 
function salir(){
    location.reload()
}