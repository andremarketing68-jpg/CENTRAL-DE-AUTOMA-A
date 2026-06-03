import requests
import socket
import datetime
import time

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
        print(f"[Firebase] Voce esta ONLINE como: {nome_maquina}")
    except Exception as e:
        print("[Firebase] Erro ao conectar:", e)

def ficar_offline():
    nome_maquina = socket.gethostname()
    url = f"{FIREBASE_URL}usuarios_online/{nome_maquina}.json"
    try:
        requests.delete(url, timeout=5)
        print("[Firebase] Voce saiu. Status 'Online' removido.")
    except:
        pass

if __name__ == "__main__":
    entrar_online()
    
    print("\n>>> ROBO EM EXECUCAO <<<")
    print("Mantenha esta janela aberta para continuar online.")
    print("Pressione CTRL + C para fechar o robo.")
    
    try:
        # Loop que mantem o script rodando e segurando o status online
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        # Executa esta parte quando voce fecha o programa com CTRL+C
        ficar_offline()
