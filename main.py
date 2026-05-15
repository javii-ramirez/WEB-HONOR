from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
usuarios_db = {}
 
class Usuario(BaseModel):
    username: str
    pin: int

class Transaccion(BaseModel):
    username: str
    monto: int
    tipo: str
 
@app.get("/")
def home():
    return {"funcionando"}
 
@app.post("/register")
def registrar(usuario: Usuario):
    nombre = usuario.username.lower()
    if usuario.username in usuarios_db:
        return {"error": "El usuario ya existe."}
    usuarios_db[nombre] = {"pin": usuario.pin, "saldo":0}
    return {"mensaje": f"Usuario {usuario.username} registrado exitosamente."}
 
@app.post("/login")
def login(usuario: Usuario):
    nombre = usuario.username.lower()
    if nombre not in usuarios_db or usuarios_db[nombre]["pin"] != usuario.pin:
        return {"error": "Usuario o PIN incorrecto."}
    return {"mensaje": f"Bienvenido {nombre}", "saldo":usuarios_db[nombre]["saldo"]}

@app.post("/transaccion")
def login(trasaccion: Transaccion):
    nombre = trasaccion.username.lower()
    monto = trasaccion.monto
    tipo = trasaccion.tipo

    if monto <=0:
        return {"error": "Ingrese un monto mayor a cero."}

    if nombre in usuarios_db:
        if tipo == "deposito":
            usuarios_db[nombre]["saldo"] += monto
        elif tipo == "retiro": 
            if monto > usuarios_db[nombre]["saldo"]:
                return {"error": "Saldo insuficiente."}
            usuarios_db[nombre]["saldo"] -= monto
        return {"mensaje": f"Operación exitosa.", "nuevo_saldo": usuarios_db[nombre]["saldo"]}
    
    else:
        return {"error": "Usuario no encontrado."}
    

    


