import os
import time
from datetime import datetime
import requests
import subprocess
import json

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

def copiar_para_clipboard(texto):
    """Injeta o texto diretamente na área de transferência (Ctrl+V) do Windows"""
    process = subprocess.Popen('clip', stdin=subprocess.PIPE, close_fds=True, shell=True)
    process.communicate(input=texto.encode('utf-8'))

# ==============================================================================
# DICIONÁRIO CONTENDO TODOS OS SEUS ROBÔS JAVASCRIPT EM VERSÃO STRING
# ==============================================================================
SCRIPTS_JAVASCRIPT = {
    "TRE": """(async function () {
        const inputStr = prompt("Cole os códigos de 8 dígitos:");
        if (!inputStr) return;
        const rawCodes = inputStr.match(/403\\d{5}/g);
        if (!rawCodes || rawCodes.length === 0) { alert("Nenhum código válido encontrado."); return; }
        const codeCounts = {};
        for (const c of rawCodes) { codeCounts[c] = (codeCounts[c] || 0) + 1; }
        const uniqueCodes = Object.keys(codeCounts);
        const delay = ms => new Promise(res => setTimeout(res, ms));
        for (let i = 0; i < uniqueCodes.length; i++) {
            const code = uniqueCodes[i]; const count = codeCounts[code];
            const inputField = document.querySelector('#principal > form > table:nth-child(15) > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=input]');
            if (!inputField) { alert("Campo não encontrado."); return; }
            inputField.focus(); inputField.value = code;
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            inputField.dispatchEvent(new Event('change', { bubbles: true }));
            inputField.blur(); inputField.dispatchEvent(new Event('focusout', { bubbles: true }));
            document.body.click(); await delay(2000);
            const radioBtn = document.querySelector('#procedimentosPesquisados > tbody > tr:nth-child(2) > td:nth-child(1) > input[type=radio]');
            if (radioBtn) radioBtn.click(); await delay(500);
            const qtdField = document.querySelector('#quantidadeProcedimento');
            if (qtdField) {
                qtdField.focus(); qtdField.value = count.toString();
                qtdField.dispatchEvent(new Event('input', { bubbles: true }));
