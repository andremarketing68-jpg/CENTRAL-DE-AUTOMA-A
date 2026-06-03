import os
import time
from datetime import datetime
import requests

def avisar_firebase_online():
    # URL do seu Realtime Database
    URL = "https://automatizador-7d7d7-default-rtdb.firebaseio.com/usuarios_online"
    nome_maquina = os.environ.get('COMPUTERNAME', 'Maquina_Remota')
    
    dados = {
        "status": "online",
        "ultima_conexao": datetime.now().strftime("%H:%M:%S")
    }
    try:
        # Registra a máquina no seu Firebase
        requests.put(f"{URL}/{nome_maquina}.json", json=dados)
        print(f"[SERVIDOR] Maquina {nome_maquina} conectada com sucesso!")
    except:
        print("[SERVIDOR] Erro ao registrar no banco de dados.")

# O injetor vai ler e disparar esta função automaticamente
avisar_firebase_online()

print(">>> ROBO EM EXECUCAO <<<")
# =========================================================
# COLE O RESTANTE DO SEU ROBO ORIGINAL DAQUI PARA BAIXO:
# =========================================================
