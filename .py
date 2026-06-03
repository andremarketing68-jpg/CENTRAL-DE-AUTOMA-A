import requests
import socket
import datetime

FIREBASE_URL = "https://automatizador-7d7d7-default-rtdb.firebaseio.com/"

def entrar_online():
    nome_maquina = socket.gethostname()
    hora_atual = datetime.datetime.now().strftime("%H:%M:%S")
    url = f"{FIREBASE_URL}usuarios_online/{nome_maquina}.json"
    
    dados = {
        "status": "online",
        "ultima_conexao": hora_atual
    }
    
    try:
        requests.put(url, json=dados, timeout=5)
        print("[Firebase] Status 'Online' enviado!")
    except Exception as e:
        print("[Firebase] Erro:", e)

if __name__ == "__main__":
    entrar_online()
    # Seu código de automação Python continuaria aqui...
  
