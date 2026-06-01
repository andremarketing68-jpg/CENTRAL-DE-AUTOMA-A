// ==UserScript==
// @name         Robô Central - Atalho Gist
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Abre a central de robôs com ALT + Q em qualquer popup
// @match        *://*/*
// @grant        none
// ==/UserScript==

(() => {
    // Função principal que desenha o menu e contém todos os robôs
    function abrirMenuCentral() {
        // 1. Impede a abertura de múltiplos menus centrais ao mesmo tempo
        if (document.getElementById('menu-central-robos')) return;

        // 2. Criação do painel visual do Menu Central (Forçado com !important para o site não esconder)
        const menu = document.createElement('div');
        menu.id = 'menu-central-robos';
        menu.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            left: 20px !important;
            width: 320px !important;
            background: #1e1e1e !important;
            color: #f1f1f1 !important;
            border-radius: 12px !important;
            box-shadow: 0 15px 50px rgba(0,0,0,0.9) !important;
            z-index: 2147483647 !important;
            font-family: system-ui, Arial, sans-serif !important;
            padding: 20px !important;
            border: 2px solid #2d7dff !important;
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;
        menu.innerHTML = `
            <h2 style="margin: 0 0 10px 0; font-size: 18px; text-align: center; color: #2d7dff;">🤖 Central de Automação</h2>
            <p style="font-size: 13px; text-align: center; color: #aaa; margin-bottom: 20px;">Selecione o robô para iniciar:</p>
            <div id="botoes-robos" style="display: flex; flex-direction: column; gap: 10px; max-height: 60vh; overflow-y: auto; padding-right: 5px;"></div>
            <button id="fechar-menu-central" style="margin-top: 20px; width: 100%; padding: 10px; background: #444; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">❌ Fechar Menu</button>
        `;
        (document.body || document.documentElement).appendChild(menu);

        // --- SISTEMA DE AVISOS DINÂMICOS ---
        const linkDoAviso = "https://gist.githubusercontent.com/andremarketing68-jpg/63fce593c84ee104119b64c4b3e164a2/raw/aviso.txt";
        fetch(linkDoAviso + "?t=" + new Date().getTime())
            .then(response => response.text())
            .then(texto => {
                if (texto.trim() !== "") {
                    const avisoDiv = document.createElement('div');
                    avisoDiv.style.cssText = `background: #ffcc00 !important; color: #111 !important; padding: 12px 25px 12px 12px !important; border-radius: 6px !important; margin-bottom: 15px !important; font-size: 13px !important; position: relative !important; border: 1px solid #cc9900 !important; box-shadow: 0 4px 6px rgba(0,0,0,0.3) !important;`;
                    avisoDiv.innerHTML = `
                        <strong>⚠️ ATENÇÃO:</strong><br>
                        ${texto}
                        <button onclick="this.parentElement.remove()" style="position: absolute; top: 4px; right: 4px; background: transparent; border: none; color: #111; font-weight: bold; cursor: pointer; font-size: 16px;">✖</button>
                    `;
                    menu.querySelector('h2').insertAdjacentElement('afterend', avisoDiv);
                }
            })
            .catch(erro => console.log("Sem avisos no momento."));

        // Fechar menu
        document.getElementById('fechar-menu-central').onclick = () => menu.remove();

        // 3. Dicionário com os scripts dos Robôs
        const robos = {
            "PROASA": () => {
                (async function () {
                    const inputStr = prompt("Cole os códigos TUSS (ex: 403xxxxx):");
                    if (!inputStr) return;
                    const rawCodes = inputStr.match(/403\d{5}/g);
                    if (!rawCodes || rawCodes.length === 0) {
                        return alert("Nenhum código válido encontrado.");
                    }
                    const counts = {};
                    rawCodes.forEach(c => counts[c] = (counts[c] || 0) + 1);
                    
                    const uniqueCodes = [...new Set(rawCodes)];
                    let codigos = uniqueCodes.map(k => ({ cod: k, qtd: counts[k] }));

                    if (codigos.length > 30) {
                        alert(`ATENÇÃO: Você colou ${codigos.length} códigos únicos, mas a guia aceita apenas 30. O robô vai preencher apenas os 30 primeiros.`);
                        codigos.length = 30;
                    }

                    const delay = ms => new Promise(res => setTimeout(res, ms));
                    const getSel = (campo, idx) => `#procedimentosSolicitados\\[${idx}\\]\\.${campo}`;

                    for (let i = 0; i < codigos.length; i++) {
                        const item = codigos[i];

                        if (i >= 5) {
                            const btnAddLinha = document.querySelector('#qata-adicionar');
                            if (btnAddLinha) {
                                btnAddLinha.click();
                                await delay(800);
                            }
                        }

                        const comboTabela = document.querySelector(getSel('tipoTabela', i));
                        if (comboTabela) {
                            for (let opt of comboTabela.options) {
                                if (opt.text.toUpperCase().includes("TUSS -- PROCEDIMENTOS") || opt.text.toUpperCase().includes("TUSS")) {
                                    comboTabela.value = opt.value;
                                    break;
                                }
                            }
                            comboTabela.dispatchEvent(new Event('change', { bubbles: true }));
                            await delay(300);
                        }

                        const inpCod = document.querySelector(getSel('codigo', i));
                        if (inpCod) {
                            inpCod.focus();
                            inpCod.value = item.cod;
                            inpCod.dispatchEvent(new Event('input', { bubbles: true }));
                            inpCod.dispatchEvent(new Event('change', { bubbles: true }));
                            inpCod.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true })); 
                        }

                        let tentativasDesc = 0;
                        while (tentativasDesc < 40) { 
                            const inpDesc = document.querySelector(getSel('descricao', i));
                            if (inpDesc && inpDesc.value && inpDesc.value.trim().length > 2) {
                                break;
                            }
                            await delay(250);
                            tentativasDesc++;
                        }

                        if (item.qtd > 1) {
                            const inpQtd = document.querySelector(getSel('quantidade', i));
                            if (inpQtd) {
                                inpQtd.focus();
                                inpQtd.value = item.qtd;
                                inpQtd.dispatchEvent(new Event('input', { bubbles: true }));
                                inpQtd.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }

                        await delay(500); 
                    }

                    alert("✅ Concluído! " + codigos.length + " códigos foram inseridos na guia.");
                })();
            },
            "TRE": () => {
                (async function () {
                    const inputStr = prompt("Cole os códigos de 8 dígitos:");
                    if (!inputStr) return;
                    const rawCodes = inputStr.match(/403\d{5}/g);
                    if (!rawCodes || rawCodes.length === 0) {
                        alert("Nenhum código válido encontrado.");
                        return;
                    }
                    const codeCounts = {};
                    for (const c of rawCodes) {
                        codeCounts[c] = (codeCounts[c] || 0) + 1;
                    }
                    const uniqueCodes = Object.keys(codeCounts);
                    const delay = ms => new Promise(res => setTimeout(res, ms));
                    for (let i = 0; i < uniqueCodes.length; i++) {
                        const code = uniqueCodes[i];
                        const count = codeCounts[code];
                        const inputField = document.querySelector('#principal > form > table:nth-child(15) > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=input]');
                        if (!inputField) {
                            alert("Campo não encontrado.");
                            return;
                        }
                        inputField.focus();
                        inputField.value = code;
                        inputField.dispatchEvent(new Event('input', { bubbles: true }));
                        inputField.dispatchEvent(new Event('change', { bubbles: true }));
                        inputField.blur();
                        inputField.dispatchEvent(new Event('focusout', { bubbles: true }));
                        document.body.click();
                        await delay(2000);
                        const radioBtn = document.querySelector('#procedimentosPesquisados > tbody > tr:nth-child(2) > td:nth-child(1) > input[type=radio]');
                        if (radioBtn) radioBtn.click();
                        await delay(500);
                        const qtdField = document.querySelector('#quantidadeProcedimento');
                        if (qtdField) {
                            qtdField.focus();
                            qtdField.value = count.toString();
                            qtdField.dispatchEvent(new Event('input', { bubbles: true }));
                            qtdField.dispatchEvent(new Event('change', { bubbles: true }));
                            qtdField.blur();
                        }
                        const addBtn = document.querySelector('#principal > form > table:nth-child(21) > tbody > tr:nth-child(7) > td > input:nth-child(1)');
                        if (addBtn) addBtn.click();
                        await delay(1500);
                        inputField.value = "";
                    }
                    alert("Concluído! Foram inseridos " + uniqueCodes.length + " códigos únicos.");
                })();
            },
            "MEDSENIOR": () => {
                (function () {
                    var P = document.getElementById('painel-v60-27');
                    if (P) P.remove();
                    var painel = document.createElement('div');
                    painel.id = 'painel-v60-27';
                    painel.style.cssText = 'position:fixed;top:10px;right:10px;width:310px;background:#2d3436;color:#fff;padding:15px;z-index:2147483647;border:4px solid #d63031;border-radius:8px;font-family:Arial;box-shadow:0 0 20px #000;font-size:12px;';
                    painel.innerHTML = '<h3 style="color:#fab1a0;margin:0 0 10px;">🏥 V60.29 NOME CHECK</h3><textarea id="txtInput" style="width:100%;height:80px;color:#000;" placeholder="Cole os códigos..."></textarea><button id="btnRun" style="width:100%;padding:10px;margin-top:5px;background:#e17055;color:#fff;font-weight:bold;border:none;cursor:pointer;">INICIAR ▶</button><div id="statusLog" style="margin-top:10px;color:#fab1a0;">Pronto.</div><button id="btnPanic" style="width:100%;margin-top:15px;background:#d63031;border:2px solid #fff;color:#fff;padding:5px;cursor:pointer;font-weight:bold;">💣 DESTROÇAR TRAVAMENTO</button><button onclick="this.parentElement.remove()" style="width:100%;margin-top:5px;cursor:pointer;background:#636e72;border:none;color:#fff;padding:5px;">Fechar</button>';
                    document.body.appendChild(painel);
                    var log = msg => document.getElementById('statusLog').innerText = msg;
                    var winAlvo = null;
                    function unlock() {
                        try {
                            document.body.style.cursor = 'default';
                            document.body.style.pointerEvents = 'auto';
                            var wins = [window, window.top];
                            if (winAlvo) wins.push(winAlvo);
                            wins.forEach(w => {
                                if (w.document) {
                                    w.document.body.style.cursor = 'default';
                                    w.document.body.style.pointerEvents = 'auto';
                                    var list = w.document.querySelectorAll('.ui-widget-overlay,.blockUI,.modal-backdrop,.ui-dialog-mask');
                                    list.forEach(e => e.remove());
                                }
                            });
                        } catch (e) {}
                    }
                    document.getElementById('btnPanic').onclick = unlock;
                    function findBtn(w) {
                        try {
                            var b = w.document.getElementById('button2');
                            if (b) return { btn: b, win: w };
                            if (w.frames) {
                                for (var i = 0; i < w.frames.length; i++) {
                                    var r = findBtn(w.frames[i]);
                                    if (r) return r;
                                }
                            }
                        } catch (e) {}
                        return null;
                    }
                    document.getElementById('btnRun').onclick = function () {
                        var txt = document.getElementById('txtInput').value;
                        var raw = txt.match(/\b\d{8}\b/g);
                        if (!raw) return alert('Sem códigos!');
                        var counts = {};
                        raw.forEach(x => counts[x] = (counts[x] || 0) + 1);
                        var unicos = [...new Set(raw)];
                        var order = unicos.filter(c => counts[c] === 1).concat(unicos.filter(c => counts[c] > 1));
                        var codigos = order.map(k => ({ cod: k, qtd: counts[k] }));
                        var res = findBtn(window.top);
                        if (!res) return alert('Botão button2 sumiu!');
                        winAlvo = res.win;
                        document.getElementById('btnRun').disabled = true;
                        log('Iniciando...');
                        var idx = 0;
                        function aguardarResp(cb) {
                            let t = 0;
                            let c = setInterval(() => {
                                let bl = false;
                                try {
                                    if (winAlvo && winAlvo.document.querySelector('.blockUI, .ui-widget-overlay, .ajax-status')) bl = true;
                                } catch (e) {}
                                if (!bl) {
                                    clearInterval(c);
                                    cb();
                                } else {
                                    t++;
                                    if (t > 40) {
                                        clearInterval(c);
                                        unlock();
                                        cb();
                                    }
                                }
                            }, 250);
                        }
                        function loop() {
                            if (idx >= codigos.length) {
                                unlock();
                                log('✅ FIM!');
                                document.getElementById('btnRun').disabled = false;
                                return;
                            }
                            aguardarResp(function () {
                                var item = codigos[idx];
                                var code = item.cod;
                                var q = item.qtd;
                                log('Ln ' + (idx + 1) + ': ' + code + (q > 1 ? ' Qtd: ' + q : ''));
                                res.btn.click();
                                var idField = 'item_medico_' + (idx + 1);
                                var idQtd = 'qtd_solicitada_' + (idx + 1);
                                var idNome = 'nome_item_proc_' + (idx + 1);
                                var tries = 0;
                                var timer = setInterval(function () {
                                    var field = winAlvo.document.getElementById(idField);
                                    if (field) {
                                        clearInterval(timer);
                                        field.focus();
                                        field.value = code;
                                        field.dispatchEvent(new Event('input', { bubbles: true }));
                                        field.dispatchEvent(new Event('change', { bubbles: true }));
                                        field.blur();
                                        log('Aguardando nome preencher...');
                                        var nomeTries = 0;
                                        var nomeCheck = setInterval(function () {
                                            var nomeField = winAlvo.document.getElementById(idNome);
                                            var val = nomeField ? (nomeField.value || nomeField.innerText || "") : "";
                                            if (val.trim().length > 2) {
                                                clearInterval(nomeCheck);
                                                log('Nome OK!');
                                                processarQtd();
                                            } else {
                                                nomeTries++;
                                                if (nomeTries > 60) {
                                                    clearInterval(nomeCheck);
                                                    log('Aviso: Timeout Nome');
                                                    processarQtd();
                                                }
                                            }
                                        }, 250);
                                        function processarQtd() {
                                            if (q > 1) {
                                                var qTries = 0;
                                                var qCheck = setInterval(function () {
                                                    var qField = winAlvo.document.getElementById(idQtd);
                                                    if (qField) {
                                                        clearInterval(qCheck);
                                                        qField.focus();
                                                        qField.value = q;
                                                        qField.dispatchEvent(new Event('input', { bubbles: true }));
                                                        qField.dispatchEvent(new Event('change', { bubbles: true }));
                                                        qField.blur();
                                                        idx++;
                                                        setTimeout(loop, 100);
                                                    } else {
                                                        qTries++;
                                                        if (qTries > 20) {
                                                            clearInterval(qCheck);
                                                            log('Aviso: Qtd falhou na linha ' + (idx + 1));
                                                            idx++;
                                                            setTimeout(loop, 100);
                                                        }
                                                    }
                                                }, 250);
                                            } else {
                                                idx++;
                                                setTimeout(loop, 100);
                                            }
                                        }
                                    } else {
                                        tries++;
                                        if (tries > 50) {
                                            clearInterval(timer);
                                            if (confirm('Campo ' + idField + ' não abriu. Pular?')) {
                                                idx++;
                                                loop();
                                            } else {
                                                log('Parado.');
                                                document.getElementById('btnRun').disabled = false;
                                            }
                                        }
                                    }
                                }, 100);
                            });
                        }
                        loop();
                    };
                })();
            },
            "TJDF": () => {
                (() => {
                    if (document.getElementById('b403-painel-root')) return;
                    let codigos = [];
                    let idx = 0;
                    let observer;
                    let obsTabelaAtual = null;
                    let executando = false;
                    let pausado = false;
                    let painel = null;
                    let statusEl, contadorEl;
                    const criarPainelEntrada = () => {
                        painel = document.createElement('div');
                        painel.id = 'b403-painel-root';
                        painel.style = 'position:fixed;bottom:20px;right:20px;z-index:999999;background:#1e1e1e;color:#f1f1f1;font-family:system-ui,Arial;padding:14px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);width:260px;';
                        painel.innerHTML = '<div style="font-weight:600;margin-bottom:8px;">⚙️ Automação 403</div><textarea id="b403-input" placeholder="Cole os códigos aqui..." style="width:100%;height:80px;border-radius:6px;border:none;padding:6px;margin-bottom:8px;"></textarea><button id="b403-iniciar" style="width:100%;padding:8px;border:none;border-radius:8px;background:#2d7dff;color:#fff;cursor:pointer;">▶️ Iniciar</button>';
                        document.body.appendChild(painel);
                        painel.querySelector('#b403-iniciar').onclick = iniciarAutomacao;
                    };
                    const iniciarAutomacao = () => {
                        const texto = painel.querySelector('#b403-input').value || '';
                        const matches = texto.match(/403\d{5}/g) || [];
                        if (!matches.length) {
                            alert('Nenhum código válido.');
                            return;
                        }
                        const contagem = {};
                        matches.forEach(m => { contagem[m] = (contagem[m] || 0) + 1; });
                        const unicos = [...new Set(matches)];
                        const order = unicos.filter(c => contagem[c] === 1).concat(unicos.filter(c => contagem[c] > 1));
                        codigos = order.map(k => ({ cod: k, qtd: contagem[k] }));
                        painel.innerHTML = '<div style="font-weight:600;margin-bottom:10px;">⚙️ Automação 403</div><div id="b403-status">Status: iniciado</div><div id="b403-contador">0 / ' + codigos.length + '</div><div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px;"><button id="b403-pausar">⏸ Pausar</button><button id="b403-pular">⏭ Pular</button><button id="b403-encerrar" style="grid-column:1/3;">❌ Encerrar</button></div>';
                        statusEl = painel.querySelector('#b403-status');
                        contadorEl = painel.querySelector('#b403-contador');
                        painel.querySelector('#b403-pausar').onclick = togglePause;
                        painel.querySelector('#b403-pular').onclick = () => { executando = false; avancarProximo(); };
                        painel.querySelector('#b403-encerrar').onclick = finalizar;
                        observer = new MutationObserver(() => !pausado && executarProximo());
                        observer.observe(document.body, { childList: true, subtree: true });
                        executarProximo();
                    };
                    const setStatus = t => statusEl.textContent = 'Status: ' + t;
                    const setContador = () => contadorEl.textContent = idx + ' / ' + codigos.length;
                    const togglePause = () => {
                        pausado = !pausado;
                        setStatus(pausado ? 'pausado' : 'retomado');
                        if (!pausado) executarProximo();
                    };
                    const adicionarEventoEnterAoInput = () => {
                        const input = document.querySelector('#HandleTermo');
                        if (!input || input.dataset.enterAdded) return;
                        input.addEventListener('paste', () => {
                            setTimeout(() => {
                                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true }));
                            }, 100);
                        });
                        input.dataset.enterAdded = '1';
                    };
                    const selecionarTabelaTJDF = () => {
                        setStatus('aguardando tabela');
                        obsTabelaAtual = new MutationObserver(() => {
                            const celula = document.querySelector('#result-body-table > tr.dataGridRow.ng-scope.kb-active > td:nth-child(2)');
                            if (celula) {
                                celula.click();
                                obsTabelaAtual.disconnect();
                                obsTabelaAtual = null;
                                verificarEPreencherQuantidade();
                            }
                        });
                        obsTabelaAtual.observe(document.body, { childList: true, subtree: true });
                    };
                    const verificarEPreencherQuantidade = () => {
                        const itemAtual = codigos[idx];
                        if (itemAtual.qtd > 1) {
                            setStatus('preenchendo qtd (' + itemAtual.qtd + ')');
                            let tentativas = 0;
                            const checarInput = setInterval(() => {
                                const seletor = '#stepDadosSolicitacaoForm > bc-guia-eventos-exibicao-termos-selecionados > div > div:nth-child(' + (idx + 1) + ') > div.form-group > div.size-1.no-rpadding > input';
                                const inputQtd = document.querySelector(seletor);
                                if (inputQtd) {
                                    clearInterval(checarInput);
                                    inputQtd.value = itemAtual.qtd;
                                    inputQtd.dispatchEvent(new Event('input', { bubbles: true }));
                                    inputQtd.dispatchEvent(new Event('change', { bubbles: true }));
                                    avancarProximo();
                                } else {
                                    tentativas++;
                                    if (tentativas > 20) {
                                        clearInterval(checarInput);
                                        console.warn('Campo de quantidade não apareceu a tempo.');
                                        avancarProximo();
                                    }
                                }
                            }, 500);
                        } else {
                            avancarProximo();
                        }
                    };
                    const avancarProximo = () => {
                        executando = false;
                        idx++;
                        executarProximo();
                    };
                    const executarProximo = () => {
                        if (pausado || executando) return;
                        if (idx >= codigos.length) {
                            finalizar();
                            return;
                        }
                        const c = document.querySelector('#HandleTermo');
                        if (!c) return;
                        executando = true;
                        setStatus('processando');
                        setContador();
                        adicionarEventoEnterAoInput();
                        selecionarTabelaTJDF();
                        c.focus();
                        c.value = codigos[idx].cod;
                        c.dispatchEvent(new Event('paste', { bubbles: true }));
                        c.dispatchEvent(new Event('input', { bubbles: true }));
                        c.dispatchEvent(new Event('change', { bubbles: true }));
                    };
                    const finalizar = () => {
                        pausado = true;
                        executando = false;
                        if (observer) observer.disconnect();
                        if (obsTabelaAtual) obsTabelaAtual.disconnect();
                        setStatus('finalizado');
                        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                        document.querySelectorAll('.modal').forEach(m => {
                            m.style.display = 'none';
                            m.classList.remove('in', 'show');
                            m.removeAttribute('aria-hidden');
                            m.removeAttribute('inert');
                        });
                        document.body.classList.remove('modal-open');
                        document.body.style.pointerEvents = 'auto';
                        document.body.style.overflow = 'auto';
                        try { document.activeElement.blur(); } catch (e) {}
                        const btnFechar = document.createElement('button');
                        btnFechar.textContent = '🧹 Fechar painel';
                        btnFechar.style = 'margin-top:10px;width:100%;padding:8px;border:none;border-radius:8px;background:#444;color:#fff;cursor:pointer;';
                        btnFechar.onclick = () => {
                            painel.remove();
                            painel = null;
                            document.body.style.pointerEvents = 'auto';
                            document.body.style.overflow = 'auto';
                        };
                        painel.appendChild(btnFechar);
                    };
                    criarPainelEntrada();
                })();
            },
            "PM/STJ": () => {
                (function () {
                    if (window._b403) return;
                    window._b403 = 1;
                    let t = prompt("Cole os códigos 403:");
                    if (!t) { window._b403 = 0; return; }
                    let m = t.match(/403\d{5}/g) || [];
                    if (!m.length) { window._b403 = 0; return; }
                    let counts = {};
                    m.forEach(x => counts[x] = (counts[x] || 0) + 1);
                    let unicos = [...new Set(m)];
                    let order = unicos.filter(c => counts[c] === 1).concat(unicos.filter(c => counts[c] > 1));
                    let a = order.map(k => ({ cod: k, qtd: counts[k] }));
                    let i = 0;
                    const run = () => {
                        if (i >= a.length) {
                            alert("Finalizado");
                            window._b403 = 0;
                            return;
                        }
                        let f = document.querySelector("#HandleTermo");
                        if (!f) { setTimeout(run, 50); return; }
                        let item = a[i], v = item.cod;
                        f.focus();
                        f.value = v;
                        f.dispatchEvent(new Event("input", { bubbles: true }));
                        f.dispatchEvent(new Event("change", { bubbles: true }));
                        f.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, which: 13, bubbles: true }));
                        let c = setInterval(() => {
                            if (f.value !== v) {
                                clearInterval(c);
                                if (item.qtd > 1) {
                                    let tries = 0;
                                    let qCheck = setInterval(() => {
                                        let inputs = document.querySelectorAll("#stepDadosSolicitacaoForm > bc-guia-eventos-exibicao-termos-selecionados > div > div.ng-scope > div.form-group > div.size-1.no-rpadding > input");
                                        let inputQtd = inputs[i];
                                        if (inputQtd) {
                                            clearInterval(qCheck);
                                            inputQtd.value = item.qtd;
                                            inputQtd.dispatchEvent(new Event("input", { bubbles: true }));
                                            inputQtd.dispatchEvent(new Event("change", { bubbles: true }));
                                            i++;
                                            run();
                                        } else {
                                            tries++;
                                            if (tries > 20) { clearInterval(qCheck); i++; run(); }
                                        }
                                    }, 250);
                                } else {
                                    i++;
                                    run();
                                }
                            }
                        }, 50);
                    };
                    run();
                })();
            },
            "SULAMERICA": () => {
                (function () {
                    const TEMPO = 150;
                    var texto = prompt("MODO SONIC: Cole os códigos aqui:");
                    if (!texto) return;
                    var raw = texto.match(/\b403\d{5}\b/g);
                    if (!raw || raw.length === 0) return;
                    var counts = {};
                    raw.forEach(x => counts[x] = (counts[x] || 0) + 1);
                    var unicos = [...new Set(raw)];
                    var order = unicos.filter(c => counts[c] === 1).concat(unicos.filter(c => counts[c] > 1));
                    var codigos = order.map(k => ({ cod: k, qtd: counts[k] }));
                    var selInput = "#formValidaProcedimento > fieldset > div > div > div:nth-child(1) > input";
                    var selBtn = "#btn-incluir-procedimento > span";
                    var selQtd = "#tabelaSolicitaProcedimento > tbody > tr > td:nth-child(5) > input";
                    async function run() {
                        for (let i = 0; i < codigos.length; i++) {
                            let item = codigos[i];
                            let inpt = document.querySelector(selInput);
                            let btn = document.querySelector(selBtn);
                            if (inpt && btn) {
                                inpt.value = item.cod;
                                inpt.dispatchEvent(new Event('input', { bubbles: true }));
                                inpt.dispatchEvent(new Event('change', { bubbles: true }));
                                btn.click();
                                await new Promise(r => setTimeout(r, TEMPO));
                                if (item.qtd > 1) {
                                    await new Promise(r => setTimeout(r, 150));
                                    let qInps = document.querySelectorAll(selQtd);
                                    let qInpt = qInps[i] || qInps[qInps.length - 1];
                                    if (qInpt) {
                                        qInpt.value = item.qtd;
                                        qInpt.dispatchEvent(new Event('input', { bubbles: true }));
                                        qInpt.dispatchEvent(new Event('change', { bubbles: true }));
                                    }
                                }
                            }
                        }
                        alert("Sonic finalizado!");
                    }
                    run();
                })();
            },
            "TST": () => {
                (function () {
                    var b = document.createElement("button");
                    b.innerText = "⚖️ ROBÔ EQUILIBRADO (TUSS 16)";
                    b.style = "position:fixed;top:10px;left:50%;transform:translateX(-50%);padding:15px;background:#008b8b;color:white;font-weight:bold;border:3px solid white;z-index:9999999;box-shadow:0 0 20px #000;cursor:pointer;border-radius:8px;font-family:monospace;font-size:14px;";
                    b.onclick = function () {
                        var w = window.open("", "RoboSafe", "width=400,height=600");
                        var h = `<html><head><title>Robô Equilibrado</title><style>body{background:#111;color:#fff;font-family:sans-serif;padding:10px}textarea{width:100%;height:150px;background:#222;color:#0f0;border:1px solid #555;font-family:monospace}button{width:100%;padding:10px;margin-top:10px;cursor:pointer;font-weight:bold}.g{background:#0d0;color:#000}.r{background:#f33;color:#fff}#l{margin-top:10px;height:300px;overflow-y:auto;background:#000;border:1px solid #444;font-family:monospace;font-size:11px;padding:5px}</style></head><body><h3>⚖️ Robô TUSS (Estável)</h3><p>Cole a lista:</p><textarea id="t"></textarea><button class="g" onclick="go()">▶ INICIAR</button><button class="r" onclick="stop()">⏹ PARAR</button><div id="l"></div> <script> var r=false,idx=0,lst=[],win=window.opener; function log(m){ var d=document.createElement("div"); d.innerText="["+new Date().toLocaleTimeString()+"] "+m; document.getElementById("l").prepend(d) } function stop(){r=false;log("PARADO.")} function go(){ var v=document.getElementById("t").value; var raw=v.match(/403\\d{5}/g); if(!raw)return alert("Sem códigos!"); var counts={}; raw.forEach(x=>counts[x]=(counts[x]||0)+1); var unicos=[...new Set(raw)]; var order=unicos.filter(c=>counts[c]===1).concat(unicos.filter(c=>counts[c]>1)); lst=order.map(k=>({cod:k,qtd:counts[k]})); if(!win||win.closed)return alert("Janela principal fechada!"); r=true;idx=0;log("Iniciando "+lst.length+" itens...");loop() } async function waitEl(sel,timeout=5000){ var t=0; while(t<timeout){ if(!r)throw new Error("Parado"); var el=win.document.querySelector(sel); if(el&&el.offsetParent!==null)return el; await new Promise(x=>setTimeout(x,200)); t+=200 } throw new Error("Timeout: "+sel) } async function pause(ms){await new Promise(x=>setTimeout(x,ms))} async function loop(){ if(!r)return; if(idx>=lst.length){r=false;return alert("FIM!")} var item=lst[idx],c=item.cod,q=item.qtd; log("Item "+(idx+1)+": "+c+(q>1?" (Qtd: "+q+")":"")); try{ log("Aguardando botão..."); await waitEl("input[value='Adicionar Procedimento']",10000); await pause(500); var b1=win.document.querySelector("input[value='Adicionar Procedimento']")||win.document.querySelector("input[name='adicionarProcedimento']"); b1.click(); var fixo=await waitEl("#noreset_txCodTabela"); await pause(500); fixo.value="16"; fixo.dispatchEvent(new win.Event('change',{bubbles:true})); fixo.dispatchEvent(new win.Event('blur',{bubbles:true})); try{win.$(fixo).trigger('change')}catch(e){} var inp=await waitEl("#codItemProcedimento"); await pause(300); inp.value=c; inp.dispatchEvent(new win.Event('change',{bubbles:true})); inp.dispatchEvent(new win.Event('blur',{bubbles:true})); var qtd=win.document.getElementById("procedimento.numQtdSolicitada"); if(qtd){ qtd.value=q; qtd.dispatchEvent(new win.Event('input',{bubbles:true})); qtd.dispatchEvent(new win.Event('change',{bubbles:true})); } await pause(500); var b2=await waitEl(".ui-dialog-buttonpane button:nth-child(2)"); if(!b2.innerText.includes("Salvar")&&!b2.innerText.includes("Confirmar")){ var bs=win.document.querySelectorAll("button"); for(var b of bs)if(b.innerText.includes("Salvar"))b2=b } b2.click(); log("Salvo! Aguardando..."); idx++; await pause(1500); loop() }catch(e){ log("ERRO: "+e.message); r=false; alert("Erro: "+e.message) } } <\/script></body></html>`;
                        w.document.write(h);
                        this.remove()
                    };
                    document.body.appendChild(b);
                })();
            },
            "POSTAL": () => {
                (function () {
                    var l = prompt("Cole os códigos 403:");
                    if (!l) return;
                    var raw = l.match(/403\d{5}/g);
                    if (!raw) return alert("Sem códigos!");
                    var counts = {};
                    raw.forEach(x => counts[x] = (counts[x] || 0) + 1);
                    var unicos = [...new Set(raw)];
                    var order = unicos.filter(c => counts[c] === 1).concat(unicos.filter(c => counts[c] > 1));
                    var cods = order.map(k => ({ cod: k, qtd: counts[k] }));
                    var W = window.open("", "RoboCtrl", "width=350,height=200,top=0,left=0");
                    if (!W) return alert("ERRO: POPUP BLOQUEADO! Permita popups no navegador.");
                    W.document.write("<body style='font-family:Arial;text-align:center;background:#eee'><h3>🤖 Robô Automático</h3><div id='msg' style='font-size:14px;margin:10px'>Iniciando...</div><button onclick='window.close()' style='padding:10px;background:red;color:white;border:none'>PARAR</button></body>");
                    var s = W.document.createElement('script');
                    s.textContent = `
                        var idx=0;
                        var lista=${JSON.stringify(cods)};
                        var mainWin=window.opener;
                        var selInp="#FormMain > table > tbody > tr:nth-child(1) > td.frm_cell_field > table > tbody > tr > td:nth-child(1) > input.frm_field_lkp_big";
                        var selQtd="#FormMain > table > tbody > tr:nth-child(3) > td:nth-child(4) > input";
                        var selBtn="body > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > div > div.act_box > div > div > div > div:nth-child(2) > a > nobr";
                        setInterval(function(){
                            if(idx>=lista.length){
                                document.getElementById('msg').innerHTML="<b style='color:green'>FIM DO LOTE!</b>";
                                return;
                            }
                            try{
                                var doc=mainWin.document;
                                var inp=doc.querySelector(selInp);
                                if(inp&&inp.value==""){
                                    var item=lista[idx];
                                    var c=item.cod;
                                    var q=item.qtd;
                                    document.getElementById('msg').innerText="Lançando: "+c+" ("+(idx+1)+"/"+lista.length+")"+(q>1?" Qtd: "+q:"");
                                    inp.focus();
                                    inp.value=c;
                                    inp.dispatchEvent(new Event('input',{bubbles:true}));
                                    inp.dispatchEvent(new Event('change',{bubbles:true}));
                                    if(q>1){
                                        var qInp=doc.querySelector(selQtd);
                                        if(qInp){
                                            qInp.value=q;
                                            qInp.dispatchEvent(new Event('input',{bubbles:true}));
                                            qInp.dispatchEvent(new Event('change',{bubbles:true}));
                                        }
                                    }
                                    setTimeout(function(){
                                        var btn=doc.querySelector(selBtn);
                                        if(btn){
                                            btn.click();
                                            idx++;
                                            document.getElementById('msg').innerText="Salvando... aguarde.";
                                        }else{
                                            document.getElementById('msg').innerText="ERRO: Botão sumiu!";
                                        }
                                    },800);
                                }
                            }catch(e){
                                document.getElementById('msg').innerText="Aguardando página...";
                            }
                        },1500);
                    `;
                    W.document.body.appendChild(s);
                })();
            },
            "AMIL": () => {
                (function () {
                    var d = document.createElement('div');
                    d.style.cssText = 'position:fixed;top:10px;right:10px;width:300px;background:#fff;border:3px solid #d63384;padding:10px;z-index:999999;font-family:Arial;box-shadow:0 0 15px rgba(0,0,0,0.5)';
                    d.innerHTML = '<h3 style="margin:0;color:#d63384">Lançador Amil (Rápido)</h3><p style="font-size:12px;margin:5px 0">Cola > Checa rápido o nome > Salva.</p><textarea id="tc" style="width:100%;height:100px" placeholder="Cole os códigos 403..."></textarea><button id="bi" style="margin-top:5px;width:100%;padding:10px;background:#28a745;color:white;cursor:pointer;font-weight:bold;border:none">INICIAR</button><button onclick="this.parentElement.remove()" style="margin-top:5px;width:100%;cursor:pointer">FECHAR</button><div id="lg" style="font-size:11px;margin-top:5px;color:red;font-weight:bold"></div>';
                    document.body.appendChild(d);
                    document.getElementById('bi').onclick = async () => {
                        var t = document.getElementById('tc').value;
                        var raw = t.match(/403\d{5}/g);
                        var log = document.getElementById('lg');
                        if (!raw || raw.length == 0) {
                            alert('Nenhum código 403 encontrado!');
                            return;
                        }
                        document.getElementById('bi').disabled = true;
                        var counts = {};
                        raw.forEach(x => counts[x] = (counts[x] || 0) + 1);
                        var unicos = [...new Set(raw)];
                        var order = unicos.filter(c => counts[c] === 1).concat(unicos.filter(c => counts[c] > 1));
                        var l = order.map(k => ({ cod: k, qtd: counts[k] }));
                        for (var i = 0; i < l.length; i++) {
                            var item = l[i];
                            var c = item.cod;
                            var q = item.qtd;
                            log.innerText = 'Processando: ' + c + ' (' + (i + 1) + '/' + l.length + ')' + (q > 1 ? ' Qtd: ' + q : '');
                            var seletorInputAmil = '#inclusao-consulta-pedido > section > as-tipo-pedido-sadt > div.procedimentos-servicos.card-config > as-procedimento-servico > div > ul > li > as-procedimento-autocomplete > div > div > input';
                            var inp = document.querySelector(seletorInputAmil);
                            if (!inp) { inp = document.querySelector('#inclusao-consulta-pedido input[type="text"]'); }
                            if (!inp) { alert('ERRO: Campo INPUT não encontrado!'); break; }
                            inp.focus();
                            inp.value = c;
                            inp.dispatchEvent(new Event('input', { bubbles: true }));
                            inp.dispatchEvent(new Event('change', { bubbles: true }));
                            var enterEvent = { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, view: window };
                            inp.dispatchEvent(new KeyboardEvent('keydown', enterEvent));
                            inp.dispatchEvent(new KeyboardEvent('keypress', enterEvent));
                            inp.dispatchEvent(new KeyboardEvent('keyup', enterEvent));
                            log.innerText = 'Aguardando o sistema preencher o nome do exame...';
                            await new Promise(resolve => {
                                let tentativas = 0;
                                let check = setInterval(() => {
                                    let campoAtual = document.querySelector(seletorInputAmil) || document.querySelector('#inclusao-consulta-pedido input[type="text"]');
                                    if (campoAtual && campoAtual.value && campoAtual.value !== c && campoAtual.value.length > c.length) {
                                        clearInterval(check);
                                        resolve();
                                    } else {
                                        tentativas++;
                                        if (tentativas > 200) {
                                            clearInterval(check);
                                            console.warn("Timeout esperando nome da Amil");
                                            resolve();
                                        }
                                    }
                                }, 50);
                            });
                            log.innerText = 'Processando: ' + c + ' (' + (i + 1) + '/' + l.length + ')' + (q > 1 ? ' Qtd: ' + q : '');
                            if (q > 1) {
                                var qInp = document.querySelector('#quantidade-procedimento');
                                if (qInp) {
                                    qInp.focus();
                                    qInp.value = q;
                                    qInp.dispatchEvent(new Event('input', { bubbles: true }));
                                    qInp.dispatchEvent(new Event('change', { bubbles: true }));
                                    await new Promise(r => setTimeout(r, 100));
                                }
                            }
                            var btn = document.querySelector('#inclusao-consulta-pedido > section > as-tipo-pedido-sadt > div.procedimentos-servicos.card-config > as-procedimento-servico > div > div > button');
                            if (btn) { btn.click(); } else { log.innerText = 'Botão salvar não apareceu para ' + c; }
                            await new Promise(r => setTimeout(r, 400));
                        }
                        document.getElementById('bi').disabled = false;
                        alert('Finalizado!');
                    };
                })();
            },
            "INAS": () => {
                (async () => {
                    if (document.getElementById('g-modal-inas')) return;
                    const style = document.createElement('style');
                    style.innerHTML = '.g-modal{position:fixed;top:20px;right:20px;width:300px;background:#fff;z-index:99999;box-shadow:0 10px 25px rgba(0,0,0,0.2);padding:15px;border-radius:8px;font-family:sans-serif;border-top:5px solid #2ecc71}.g-modal h3{margin:0 0 5px;font-size:16px;color:#333}.g-modal textarea{width:100%;height:100px;margin-bottom:5px;border:1px solid #ddd;border-radius:4px;padding:5px;box-sizing:border-box;font-size:12px;resize:none}.g-modal .count-tag{font-size:11px;color:#666;margin-bottom:10px;display:block}.g-modal button{width:100%;padding:10px;border:none;color:white;font-weight:700;border-radius:4px;cursor:pointer;margin-bottom:5px}.g-modal button:disabled{background:#ccc;cursor:not-allowed}';
                    document.head.appendChild(style);
                    
                    const div = document.createElement('div');
                    div.id = 'g-modal-inas';
                    div.className = 'g-modal';
                    div.innerHTML = `
                        <h3>🚀 Auto Preenchimento INAS</h3>
                        <span class="count-tag" id="g-count">Únicos: 0 | Total: 0</span>
                        <textarea id="g-codes" placeholder="Cole os códigos aqui..."></textarea>
                        <div style="display:flex; gap:5px;">
                            <button id="g-start" style="background:#2ecc71;">▶ Iniciar</button>
                            <button id="g-stop" style="background:#e74c3c; display:none;">⏹ Parar</button>
                        </div>
                        <button id="g-close" style="background:#7f8c8d;">❌ Fechar</button>
                        <div id="g-status" style="margin-top:10px;font-size:11px;color:#2ecc71;font-weight:bold"></div>
                    `;
                    document.body.appendChild(div);
                    const btn = document.getElementById('g-start');
                    const btnStop = document.getElementById('g-stop');
                    const btnClose = document.getElementById('g-close');
                    const status = document.getElementById('g-status');
                    const txt = document.getElementById('g-codes');
                    const countDisp = document.getElementById('g-count');
                    let isRunning = false;
                    
                    btnClose.onclick = () => { isRunning = false; div.remove(); };
                    btnStop.onclick = () => { 
                        isRunning = false; 
                        status.innerText = '🛑 Processo parado!'; 
                        btnStop.style.display = 'none'; 
                        btn.style.display = 'block'; 
                        btn.disabled = false; 
                        txt.disabled = false; 
                        setTimeout(() => div.remove(), 1500); 
                    };
                    const getCodes = () => {
                        const matches = [...txt.value.matchAll(/403\d{5}/g)].map(m => m[0]);
                        const counts = {};
                        for (const code of matches) { counts[code] = (counts[code] || 0) + 1; }
                        const unicos = [...new Set(matches)];
                        const order = unicos.filter(c => counts[c] === 1).concat(unicos.filter(c => counts[c] > 1));
                        return order.map(code => ({ code, qty: counts[code] }));
                    };
                    txt.oninput = () => {
                        const codes = getCodes();
                        const total = codes.reduce((a, c) => a + c.qty, 0);
                        countDisp.innerText = `Únicos: ${codes.length} | Total: ${total}`;
                    };
                    btn.onclick = async () => {
                        let codes = getCodes();
                        if (!codes.length) return alert('Nenhum código encontrado!');
                        
                        isRunning = true;
                        btn.style.display = 'none';
                        btnStop.style.display = 'block';
                        txt.disabled = true;
                        const C = { ADD: 'Adicionar', TAB: '22 - Procedimentos e eventos em saúde' };
                        const wait = ms => new Promise(r => setTimeout(r, ms));
                        
                        const click = el => {
                            if (!el) return !1;
                            try {
                                el.scrollIntoView({ block: 'center' });
                                el.focus?.();
                                el.dispatchEvent(new MouseEvent('mousedown', { bubbles: !0 }));
                                el.dispatchEvent(new MouseEvent('mouseup', { bubbles: !0 }));
                                el.dispatchEvent(new MouseEvent('click', { bubbles: !0 }));
                                return !0;
                            } catch (e) { return !1; }
                        };
                        
                        const dom = r => {
                            let l = [];
                            r.querySelectorAll('*').forEach(x => {
                                l.push(x);
                                if (x.shadowRoot) l = l.concat(dom(x.shadowRoot));
                            });
                            return l;
                        };
                        
                        const getInput = () => {
                            const i = document.querySelectorAll('input[id^="react-select-"][id$="-input"]');
                            const v = Array.from(i).filter(e => e.getBoundingClientRect().width > 0);
                            return v.length ? v[v.length - 1] : null;
                        };
                        
                        const getLupa = ref => {
                            if (!ref) return null;
                            let f = ref.closest('form');
                            if (f) {
                                let s = f.querySelector('button[type="submit"]');
                                if (s) return s;
                                let bs = f.querySelectorAll('button');
                                for (let b of bs) if (b.querySelector('svg')) return b;
                            }
                            const vs = Array.from(document.querySelectorAll('svg')).reverse().find(s => s.getBoundingClientRect().width > 0 && s.closest('button'));
                            return vs ? vs.closest('button') : null;
                        };
                        
                        const getAdd = () => {
                            const es = Array.from(document.querySelectorAll('button,div[role="button"],span'));
                            return es.find(e => e.textContent && e.textContent.toLowerCase().trim() === C.ADD.toLowerCase().trim() && e.getBoundingClientRect().width > 0);
                        };
                        
                        const getCombo = () => {
                            const c = dom(document).filter(e => e.getAttribute?.('role') === 'combobox' && e.offsetParent);
                            return c.length < 17 ? c[c.length - 1] : c[16];
                        };
                        
                        const getTab = () => dom(document).find(e => e.textContent?.trim() === C.TAB && e.getBoundingClientRect().height > 0);
                        
                        const ensureTab = async () => {
                            let c = getCombo();
                            if (c) click(c);
                            for (let k = 0; k < 20; k++) {
                                if (!isRunning) return !1;
                                let o = getTab();
                                if (o) { click(o); return !0; }
                                await wait(30);
                            }
                            c = getCombo();
                            if (c) click(c);
                            for (let k = 0; k < 20; k++) {
                                if (!isRunning) return !1;
                                let o = getTab();
                                if (o) { click(o); return !0; }
                                await wait(30);
                            }
                            return !1;
                        };
                        
                        const fill = async (cod, qty) => {
                            const inp = getInput();
                            if (!inp) return !1;
                            click(inp);
                            await wait(100);
                            const s = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
                            s.call(inp, cod);
                            inp.dispatchEvent(new InputEvent('input', { bubbles: !0, inputType: 'insertFromPaste', data: cod }));
                            let menuCarregou = false;
                            for (let w = 0; w < 50; w++) {
                                if (!isRunning) return !1;
                                let opcoesDrop = document.querySelectorAll('[id^="react-select-"][id*="-option"]');
                                if (opcoesDrop.length > 0) {
                                    let achou = Array.from(opcoesDrop).find(o => o.innerText.includes(cod));
                                    if (achou) { menuCarregou = true; break; }
                                }
                                await wait(200);
                            }
                            if (!menuCarregou) { await wait(1000); } else { await wait(300); }
                            inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: !0 }));
                            await wait(300);
                            const lp = getLupa(inp);
                            if (lp) {
                                for (let q = 0; q < qty; q++) {
                                    if (!isRunning) return !1;
                                    click(lp);
                                    await wait(250);
                                }
                            }
                            await wait(100);
                            const ad = getAdd() || document.querySelector('[class="button-add"]');
                            if (ad) click(ad);
                            return !0;
                        };
                        
                        const runProcess = async (list) => {
                            for (let i = 0; i < list.length; i++) {
                                if (!isRunning) return;
                                const item = list[i];
                                status.innerText = `⏳ Inserindo ${i + 1}/${list.length}: ${item.code} (Qtd: ${item.qty})`;
                                let ok = !1;
                                for (let t = 0; t < 3; t++) {
                                    if (!isRunning) return;
                                    if (await ensureTab()) { ok = !0; break; }
                                    await wait(100);
                                }
                                if (ok) {
                                    await wait(150);
                                    await fill(item.code, item.qty);
                                    await wait(1500);
                                }
                            }
                        };
                        await runProcess(codes);
                        
                        if (!isRunning) return;
                        status.innerText = '🔍 Conferindo tabela e quantidades...';
                        await wait(1000);
                        let allTables = Array.from(document.querySelectorAll('table'));
                        let table = allTables.find(t => t.innerText.includes('403') || t.offsetParent !== null);
                        let missing = [];
                        if (table) {
                            let rows = Array.from(table.querySelectorAll('tbody tr'));
                            for (let row of rows) {
                                if (!isRunning) return;
                                let txt = row.innerText;
                                let codeObj = codes.find(c => txt.includes(c.code));
                                
                                if (codeObj) {
                                    let tds = Array.from(row.querySelectorAll('td'));
                                    let nums = tds.map(td => td.innerText.trim()).filter(t => /^\d+$/.test(t) && t.length < 5);
                                    let expectedQtyStr = codeObj.qty.toString();
                                    if (nums.length > 0 && !nums.includes(expectedQtyStr)) {
                                        status.innerText = `🗑️ Qtd incorreta em ${codeObj.code}. Removendo para re-inserir...`;
                                        let trash = row.querySelector('td.last-column svg, td.last-column > div > div > div > svg, td:last-child svg');
                                        if (trash) {
                                            click(trash);
                                            await wait(1000); 
                                        }
                                    }
                                }
                            }
                        }
                        if (!isRunning) return;
                        allTables = Array.from(document.querySelectorAll('table'));
                        table = allTables.find(t => t.innerText.includes('403') || t.offsetParent !== null);
                        let tableText = table ? table.innerText : '';
                        missing = codes.filter(c => !tableText.includes(c.code));
                        if (missing.length > 0) {
                            status.innerText = `⚠️ Inserindo ${missing.length} itens ausentes/corrigidos...`;
                            await wait(1000);
                            await runProcess(missing);
                        }
                        if (!isRunning) return;
                        status.innerText = '✅ Fim! Tudo conferido.';
                        await wait(2000);
                        
                        if (isRunning) div.remove();
                    };
                })();
            },
            "TRF": () => {
                (function () {
                    var l = prompt("Cole os códigos 403:");
                    if (!l) return;
                    var cods = l.match(/403\d{5}/g);
                    if (!cods) return alert("Nenhum código!");
                    var counts = {};
                    cods.forEach(function (c) {
                        counts[c] = (counts[c] || 0) + 1;
                    });
                    var unicos = [...new Set(cods)];
                    var uniqueCods = unicos.filter(function (c) {
                        return counts[c] === 1;
                    }).concat(unicos.filter(function (c) {
                        return counts[c] > 1;
                    }));
                    var W = window.open("", "RoboExames", "width=350,height=280");
                    W.document.write("<body style='font-family:sans-serif;text-align:center;background:#f0f7ff;padding:20px'><h3>🤖 Robô Finalizador</h3><div id='msg' style='font-size:14px;color:#0056b3;font-weight:bold;'>Iniciando...</div><div id='status' style='font-size:12px;color:#666;margin-top:5px'></div><button onclick='window.close()' style='margin-top:15px;padding:8px;cursor:pointer;background:#ff4757;color:white;border:none;border-radius:5px;font-weight:bold;'>PARAR</button></body>");
                    var s = W.document.createElement('script');
                    s.textContent = `
                        var idx = 0;
                        var lista = ${JSON.stringify(uniqueCods)};
                        var qtds = ${JSON.stringify(counts)};
                        var msg = document.getElementById('msg');
                        var st = document.getElementById('status');
                        var selCod = "#FormMain > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > input.frm_field_lkp";
                        var sel22 = "#FormMain > table > tbody > tr:nth-child(1) > td:nth-child(4) > table > tbody > tr > td:nth-child(1) > input.frm_field_lkp";
                        var selFrase = "#FormMain > table > tbody > tr:nth-child(2) > td:nth-child(4) > table > tbody > tr > td:nth-child(1) > input.frm_field_lkp";
                        var selQtd = "#FormMain > table > tbody > tr:nth-child(3) > td:nth-child(2) > input";
                        var selBtnSalvar = "body > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > div > div.act_box > div > div > div > div:nth-child(2) > a";
                        var selBtnFinalizar = "body > table > tbody > tr:nth-child(1) > td > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > div > div.act_box > div > div > div > div:nth-child(3) > a";
                        var selErro = "#tsk_toolbar";
                        
                        function checarStatusPagina(ehUltimo, callback) {
                            var start = Date.now();
                            var interval = setInterval(function() {
                                try {
                                    var doc = window.opener.document;
                                    var erro = doc.querySelector(selErro);
                                    var inp = doc.querySelector(selCod);
                                    if (erro && erro.innerText.includes("Verifique")) {
                                        clearInterval(interval);
                                        callback('erro');
                                    } else if (!ehUltimo && inp && inp.value === "") {
                                        clearInterval(interval);
                                        callback('pronto');
                                    } else if (ehUltimo && (!inp || inp.value === "")) {
                                        clearInterval(interval);
                                        callback('pronto');
                                    } else if (Date.now() - start > 15000) {
                                        clearInterval(interval);
                                        callback('timeout');
                                    }
                                } catch(e) {
                                    if (ehUltimo) {
                                        clearInterval(interval);
                                        callback('pronto');
                                    }
                                }
                            }, 500);
                        }
                        
                        function proximoPasso() {
                            if(idx >= lista.length) {
                                msg.innerHTML = "<b style='color:green'>✅ TUDO FINALIZADO!</b>";
                                st.innerText = "";
                                return;
                            }
                            try {
                                var doc = window.opener.document;
                                var inp = doc.querySelector(selCod);
                                var erro = doc.querySelector(selErro);
                                var ehUltimo = (idx === lista.length - 1);
                                
                                if (erro && erro.innerText.includes("Verifique")) {
                                    msg.innerText = "⚠️ Corrigindo erro no " + lista[idx];
                                    var f = doc.querySelector(selFrase);
                                    if(f) {
                                        f.value = "Exame";
                                        f.dispatchEvent(new Event('input', {bubbles:true}));
                                        f.dispatchEvent(new Event('change', {bubbles:true}));
                                        
                                        erro.innerText = "AGUARDANDO SISTEMA...";
                                        setTimeout(function(){
                                            var btn = ehUltimo ? doc.querySelector(selBtnFinalizar) : doc.querySelector(selBtnSalvar);
                                            if(btn) btn.click();
                                            checarStatusPagina(ehUltimo, function(status) {
                                                if(status === 'pronto') {
                                                    idx++;
                                                    setTimeout(proximoPasso, 800);
                                                } else {
                                                    setTimeout(proximoPasso, 800);
                                                }
                                            });
                                        }, 500);
                                    }
                                    return;
                                }
                                
                                if (inp && inp.value === "") {
                                    var codAtual = lista[idx];
                                    var qtdAtual = qtds[codAtual];
                                    msg.innerText = "🚀 Lançando: " + codAtual + " (" + qtdAtual + "x)";
                                    st.innerText = (idx + 1) + " / " + lista.length;
                                    
                                    inp.value = codAtual;
                                    inp.dispatchEvent(new Event('input', {bubbles:true}));
                                    inp.dispatchEvent(new Event('change', {bubbles:true}));
                                    
                                    var f22 = doc.querySelector(sel22);
                                    if(f22) {
                                        f22.value = "22";
                                        f22.dispatchEvent(new Event('input', {bubbles:true}));
                                        f22.dispatchEvent(new Event('change', {bubbles:true}));
                                    }
                                    
                                    var fFrase = doc.querySelector(selFrase);
                                    if(fFrase) {
                                        fFrase.value = "Exames-Patologia Clínica";
                                        fFrase.dispatchEvent(new Event('input', {bubbles:true}));
                                        fFrase.dispatchEvent(new Event('change', {bubbles:true}));
                                    }
                                    
                                    var inpQtd = doc.querySelector(selQtd);
                                    if(inpQtd) {
                                        inpQtd.value = qtdAtual;
                                        inpQtd.dispatchEvent(new Event('input', {bubbles:true}));
                                        inpQtd.dispatchEvent(new Event('change', {bubbles:true}));
                                    }
                                    
                                    setTimeout(function(){
                                        var btn = ehUltimo ? doc.querySelector(selBtnFinalizar) : doc.querySelector(selBtnSalvar);
                                        if(btn) btn.click();
                                        checarStatusPagina(ehUltimo, function(status) {
                                            if(status === 'pronto') {
                                                idx++;
                                                setTimeout(proximoPasso, 800);
                                            } else {
                                                setTimeout(proximoPasso, 800);
                                            }
                                        });
                                    }, 500);
                                } else {
                                    setTimeout(proximoPasso, 1000);
                                }
                            } catch(e) {
                                setTimeout(proximoPasso, 1000);
                            }
                        }
                        setTimeout(proximoPasso, 1000);
                    `;
                    W.document.body.appendChild(s);
                })();
            },
            "TRT": () => {
                (function () {
                    if (document.getElementById('g-painel')) return;
                    const d = document.createElement('div');
                    d.id = 'g-painel';
                    d.style.cssText = 'position:fixed;top:10px;right:10px;width:300px;background:#2d3436;color:#fff;padding:15px;z-index:999999;border-radius:8px;font-family:Arial;box-shadow:0 4px 10px rgba(0,0,0,0.5);border:3px solid #0984e3';
                    d.innerHTML = `
                        <h3 style="margin:0 0 10px;color:#74b9ff">🤖 Inserir Códigos TRT</h3>
                        <textarea id="g-txt" style="width:100%;height:80px;color:#000;border-radius:4px;padding:5px;" placeholder="Cole os códigos aqui..."></textarea>
                        <button id="g-btn" style="width:100%;padding:10px;background:#0984e3;color:#fff;border:none;border-radius:5px;cursor:pointer;margin-top:5px;font-weight:bold">INICIAR ▶</button>
                        <div id="g-status" style="margin-top:10px;font-size:12px;color:#dfe6e9">Aguardando...</div>
                        <button onclick="this.parentElement.remove()" style="width:100%;padding:5px;margin-top:10px;background:#d63031;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">❌ FECHAR</button>
                    `;
                    document.body.appendChild(d);
                    const wait = ms => new Promise(r => setTimeout(r, ms));
                    document.getElementById('g-btn').onclick = async () => {
                        const t = document.getElementById('g-txt').value;
                        let cods = t.match(/\b\d{8}\b/g) || [];
                        if (!cods.length) return alert('Nenhum código de 8 dígitos encontrado!');
                        cods = [...new Set(cods)];
                        const status = document.getElementById('g-status');
                        document.getElementById('g-btn').disabled = true;
                        const setVal = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
                        for (let i = 0; i < cods.length; i++) {
                            let c = cods[i];
                            status.innerText = `Processando ${i + 1}/${cods.length}: ${c}`;
                            let inp = document.querySelector('#termoCodigoSolicitado');
                            if (inp) {
                                inp.focus();
                                setVal.call(inp, '');
                                inp.dispatchEvent(new Event('input', { bubbles: true }));
                                await wait(300);
                                setVal.call(inp, c);
                                inp.dispatchEvent(new Event('input', { bubbles: true }));
                                inp.dispatchEvent(new Event('change', { bubbles: true }));
                                await wait(500);
                            }
                            let inpng = document.querySelector('#termoSolicitado > div > div > div.ng-input > input[type=text]');
                            if (inpng) {
                                inpng.click();
                                inpng.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                                await wait(300);
                                inpng.click();
                                inpng.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                                await wait(300);
                                inpng.click();
                                inpng.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                                await wait(500);
                                inpng.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                            }
                            await wait(1000);
                            let btn = document.querySelector('app-autorizacao-modal app-aut-honorarios fieldset main form section button');
                            if (btn) {
                                btn.click();
                            } else {
                                console.log('Botão adicionar não encontrado.');
                            }
                        }
                        status.innerText = '✅ Concluído!';
                        document.getElementById('g-btn').disabled = false;
                    };
                })();
            }
        };

        // 4. Injeta os botões na janela central
        const container = document.getElementById('botoes-robos');
        for (const [nome, func] of Object.entries(robos)) {
            const btn = document.createElement('button');
            btn.textContent = `Rodar Robô: ${nome}`;
            
            // Forçamos com !important para que o visual do botão não quebre
            btn.style.cssText = `
                padding: 12px !important;
                background: #2d7dff !important;
                color: white !important;
                border: none !important;
                border-radius: 8px !important;
                cursor: pointer !important;
                font-weight: bold !important;
                font-size: 14px !important;
                transition: all 0.2s ease !important;
                margin-bottom: 5px !important;
                display: block !important;
                width: 100% !important;
            `;
            
            btn.onmouseover = () => btn.style.background = '#1a5bcc';
            btn.onmouseout = () => btn.style.background = '#2d7dff';
            
            btn.onclick = () => {
                menu.remove();
                func();
            };
            container.appendChild(btn);
        }
    }

    // Abre o menu na mesma hora que o script é injetado (para quem clicar no favorito lá dentro)
    abrirMenuCentral();

    // Fica escutando o ALT+Q para abrir de novo caso feche
    window.addEventListener('keydown', function(e) {
        if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
            e.preventDefault(); 
            e.stopPropagation(); 
            abrirMenuCentral();
        }
    }, true);

})();
