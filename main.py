import os
import time
from datetime import datetime
import requests

def registrar_usuario_online():
    # URL do seu banco de dados Firebase Realtime
    FIREBASE_URL = "https://automatizador-7d7d7-default-rtdb.firebaseio.com/usuarios_online"
    
    # Pega automaticamente o nome de identificação do computador atual (ex: DFBSB7KVM)
    nome_maquina = os.environ.get('COMPUTERNAME', 'Usuario_Desconhecido')
    
    # Pega o horário atual formatado
    hora_atual = datetime.now().strftime("%H:%M:%S")
    
    # Dados que serão salvos no banco
    dados = {
        "status": "online",
        "ultima_conexao": hora_atual
    }
    
    try:
        # Envia os dados para a subpasta com o nome da máquina específica
        url_destino = f"{FIREBASE_URL}/{nome_maquina}.json"
        resposta = requests.put(url_destino, json=dados)
        
        if resposta.status_code == 200:
            print(f">>> Conectado ao Firebase! Máquina: {nome_maquina} às {hora_atual} <<<")
        else:
            print(f"Erro ao conectar ao Firebase: {resposta.status_code}")
            
    except Exception as e:
        print(f"Erro de conexão: {e}")

if __name__ == "__main__":
    print(">>> INICIANDO CENTRAL DE AUTOMAÇÃO <<<")
    
    # Registra a máquina no Firebase assim que o script é aberto
    registrar_usuario_online()
    
    # Mantém o robô rodando daqui para baixo
    while True:
        # Coloque aqui o restante do seu código principal do robô
        time.sleep(1)
