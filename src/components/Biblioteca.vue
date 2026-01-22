<script setup>
import { ref, computed } from 'vue';
import { jogo, DADOS_ESTUDO, mostrarAviso } from '../jogo.js'; // Importe DADOS_ESTUDO

const equipeExpandida = ref(false); // Começa "true" (Aberto)
// Verifica se tem QUALQUER slot com item sendo estudado
const temPesquisaAtiva = computed(() => jogo.estudos.some(s => s.item !== null));
// --- ESTADO LOCAL ---
const corTier = (t) => ({'F':'#8A8A8A','E':'#659665','D':'#71c404','C':'#475fad','B':'#0233d1','A':'#8e44ad','S':'#f1c40f','SS':'#0fbdd1'}[t] || '#000');
const formatarNumero = (n) => n ? Number(n).toLocaleString('pt-BR') : '0';
const modalItemAberto = ref(false);
// --- FUNÇÕES VISUAIS RPG (NOVO) ---
const getImagemItem = (idItem) => {
    if (idItem === 'pergaminho_comum') return '/assets/images/item_pergaminho.png';
    if (idItem === 'tabula_pedra') return '/assets/images/item_tabula.png';
    if (idItem === 'tomo_antigo') return '/assets/images/item_tomo.png';
    return ''; // Retorna vazio se não tiver item
};

const getClasseBrilho = (idItem) => {
    if (idItem === 'pergaminho_comum') return 'brilho-verde';
    if (idItem === 'tabula_pedra') return 'brilho-laranja';
    if (idItem === 'tomo_antigo') return 'brilho-roxo';
    return '';
};
const slotItemSelecionado = ref(null); // 0 ou 1
const modalFuncionarioAberto = ref(false);
const slotFuncionarioSelecionado = ref(null); // 0, 1 ou 2

// Garante inicialização
if (!jogo.alocacaoBiblioteca) jogo.alocacaoBiblioteca = [null, null, null];
if (!jogo.estudos) jogo.estudos = [{ item: null }];

// --- COMPUTEDS ---

// Calcula a "Velocidade de Estudo" baseada na Sabedoria (Bonus)
const velocidadeEstudo = computed(() => {
    let total = 0;
    jogo.alocacaoBiblioteca.forEach(id => {
        if (id) {
            const func = jogo.funcionarios.find(f => f.id === id);
            if (func && func.bonus) total += func.bonus;
        }
    });
    return total;
});

// Filtra inventário apenas para itens de estudo
const inventarioEstudo = computed(() => {
    const lista = [];
    Object.keys(DADOS_ESTUDO).forEach(itemId => {
        const qtd = jogo.itens[itemId] || 0;
        if (qtd > 0) {
            lista.push({ 
                id: itemId, 
                qtd: qtd, 
                ...DADOS_ESTUDO[itemId] 
            });
        }
    });
    return lista;
});

const academicosDisponiveis = computed(() => {
    return jogo.funcionarios.filter(f => 
        f.profissao === 'academico' && 
        !jogo.alocacaoBiblioteca.includes(f.id)
    );
});

// --- AÇÕES FUNCIONÁRIOS ---
const abrirSelecaoFunc = (index) => {
    if (temPesquisaAtiva.value) {
        mostrarAviso("Pesquisa em Andamento", "Aguarde o término do estudo atual para alterar a equipe.");
        return;
    }
    slotFuncionarioSelecionado.value = index;
    modalFuncionarioAberto.value = true;
};
const alocarFunc = (func) => {
    jogo.alocacaoBiblioteca[slotFuncionarioSelecionado.value] = func.id;
    modalFuncionarioAberto.value = false;
};
const desalocarFunc = (index) => {
    if (temPesquisaAtiva.value) {
        mostrarAviso("Ação Bloqueada", "Não é possível dispensar acadêmicos enquanto eles estão concentrados em uma pesquisa.");
        return;
    }
    jogo.alocacaoBiblioteca[index] = null;
};
const getFuncionario = (index) => {
    const id = jogo.alocacaoBiblioteca[index];
    return id ? jogo.funcionarios.find(f => f.id === id) : null;
};

// --- AÇÕES ITENS DE ESTUDO ---
const abrirSelecaoItem = (index) => {
    // Se já tiver item estudando, não faz nada (ou poderia cancelar)
    if (jogo.estudos[index].item) return; 
    slotItemSelecionado.value = index;
    modalItemAberto.value = true;
};

const iniciarEstudo = (itemObj) => {
    const index = slotItemSelecionado.value;

    // Se o slot anterior (0) estiver vazio e tentarmos por no (1), forçamos ir para o (0)
    // Isso ajuda a manter a fila organizada

    if (jogo.itens[itemObj.id] > 0) {
        jogo.itens[itemObj.id]--;

        // CÁLCULO NOVO: Divide o tempo pela velocidade AGORA.
        // Ex: 60 segundos / 2x velocidade = 30 segundos totais.
        const velAtual = velocidadeEstudo.value > 0 ? velocidadeEstudo.value : 1;
        const tempoReduzido = itemObj.tempo / velAtual;

        jogo.estudos[0] = {
            item: itemObj.id,
            tempoTotal: tempoReduzido,     // Salva o tempo já reduzido
            tempoRestante: tempoReduzido,  // Começa do tempo reduzido
            progresso: 0
        };
        modalItemAberto.value = false;
    }
};

const cancelarEstudo = (index) => {
    const slot = jogo.estudos[index];
    if (slot.item) {
        // Devolve o item (Opcional: Se quiser punir, não devolve)
        jogo.itens[slot.item]++;
        
        // Reseta slot
        slot.item = null;
        slot.progresso = 0;
    }
};

// Formatar tempo (segundos -> MM:SS)
const formatarTempo = (s) => {
    if (s <= 0) return "00:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
};
</script>

<template>
<div class="mythic-container animacao-entrada">
    <div class="header-titulo-aba">
        <div class="titulo-nivel">
            <h2>📘 Biblioteca Arcana</h2>
        </div>
        <div class="info-nivel">
            <span class="badge-nivel">Nível {{ jogo.biblioteca }}</span>
        </div>
    </div>
    <div class="painel-topo">
        <div class="info-velocidade" @click="equipeExpandida = !equipeExpandida" style="cursor: pointer;">
            <span class="icone-vel">🧠</span>
            <div>
                <h2>Sabedoria da Equipe</h2>
                <small>Velocidade de Estudo: <b :class="{'text-zero': velocidadeEstudo === 0, 'text-bom': velocidadeEstudo > 0}">{{ velocidadeEstudo.toFixed(2) }}x</b></small>
            </div>
            
            <span class="seta-controle" :class="{ 'rotacionada': equipeExpandida }" style="margin-left: auto; font-size: 1em; ">
                ➤
            </span>
        </div>
        
        <div class="slots-funcionarios" v-if="equipeExpandida">
        <div v-for="(slot, index) in jogo.alocacaoBiblioteca" :key="index" class="slot-wrapper">
            
            <button v-if="slot" class="btn-remove-card" @click.stop="desalocarFunc(index)">✖</button>

            <div v-if="slot" class="card-funcionario ferreiro-ativo" :style="{ borderColor: corTier(getFuncionario(index).tier) }">
                
                <div class="card-topo" :style="{ backgroundColor: corTier(getFuncionario(index).tier) }">
                    <div class="topo-esquerda">
                        <span class="tier-badge">{{ getFuncionario(index).tier }}</span>
                        <span class="card-nome">{{ getFuncionario(index).nome }}</span>
                    </div>
                    
                    <div class="molde-icone-prof">
                        <img src="/assets/ui/i_cientista.png" class="img-prof-inner" title="Acadêmico">
                    </div>
                </div>

                <div class="card-mid">
                    <div class="avatar-box">
                        <img :src="`/assets/faces/${getFuncionario(index).raca}/${getFuncionario(index).imagem}.png`" class="avatar-func">
                    </div>

                    <div class="tabela-dados-func">
                        <div class="linha-dado">
                            <span class="dado-label">Profissão:</span>
                            <span class="dado-valor">Acadêmico</span>
                        </div>
                        <div class="linha-dado">
                            <span class="dado-label">Raça:</span>
                            <span class="dado-valor capitalize">{{ getFuncionario(index).raca }}</span>
                        </div>
                        <div class="linha-dado">
                            <span class="dado-label">Sexo:</span>
                            <span class="dado-valor">{{ getFuncionario(index).sexo === 'masculino' ? 'Masculino' : 'Feminino' }}</span>
                        </div>
                        <div class="linha-dado">
                            <span class="dado-label">Salário:</span>
                            <span class="dado-valor">
                                {{ formatarNumero(getFuncionario(index).salario) }} 
                                <img src="/assets/ui/icone_goldC.png" class="tiny-coin">
                            </span>
                        </div>
                    </div>
                </div>

                <div class="rodape-card">
                    <div class="info-produtividade">
                        Sabedoria: <span class="verde">⚡ {{ getFuncionario(index).bonus.toFixed(2) }}</span>
                    </div>
                    <div class="frase-efeito">
                        "Estudando..."
                    </div>
                </div>
            </div>

            <div v-else class="card-funcionario vazio-ferreiro-card" @click="abrirSelecaoFunc(index)" style="cursor: pointer;">
                
                <div class="card-topo vazio-topo">
                    <div class="topo-esquerda">
                        <span class="tier-badge vazio-badge">-</span>
                        <span class="card-nome">Vaga Aberta</span>
                    </div>
                    <img src="/assets/ui/i_cientista.png" class="icon-prof-topo grayscale">
                </div>

                <div class="card-mid">
                    <div class="avatar-box vazio-avatar-box">
                         <img src="/assets/ui/icone_morador.png" class="avatar-vazio">
                    </div>

                    <div class="tabela-dados-func vazio-dados">
                        <div class="texto-central-vazio">
                            <span class="titulo-vazio">Sem Acadêmico<br></span>
                            <span class="subtitulo-vazio">ESTAMOS CONTRATANDO</span>
                        </div>
                    </div>
                </div>

                <div class="rodape-card vazio-rodape">
                    <div class="frase-efeito">
                        "O conhecimento espera..."
                    </div>
                </div>
            </div>

        </div>
    </div>
    </div>

    <div class="divisor-secao">Mesas de Estudo</div>

    <div class="mesa-estudos rpg-container">
        
        <div class="info-ciencia-total">
            ⚛️ Pontos Atuais: <b>{{ Math.floor(jogo.ciencia).toLocaleString() }}</b>
        </div>

        <div class="area-trabalho-flex">

            <div class="coluna-altar">
                
                <div class="slot-estudo rpg-slot">
                    <div v-if="!jogo.estudos[0].item" class="estudo-vazio" @click="abrirSelecaoItem(0)"></div>

                    <div v-else class="estudo-ativo rpg-ativo">
                        <div class="header-estudo">
                            <button class="btn-cancelar rpg-btn-close" @click.stop="cancelarEstudo(0)">✖</button>
                        </div>
                        <div class="area-item-visual">
                            <img 
                                :src="getImagemItem(jogo.estudos[0].item)" 
                                class="img-item-rpg"
                                :class="getClasseBrilho(jogo.estudos[0].item)"
                            >
                        </div>
                    </div>
                </div>

                <div class="container-barra-separada" v-if="jogo.estudos[0].item">
                    <div class="barra-externa">
                        <div class="barra-fill" :style="{ width: jogo.estudos[0].progresso + '%' }"></div>
                        <span class="texto-barra">{{ formatarTempo(jogo.estudos[0].tempoRestante) }}</span>
                    </div>
                </div>
                <div v-else class="container-barra-separada placeholder-barra">
                </div>

            </div>

            <div class="coluna-fila-vertical">
                <div class="titulo-fila">Fila</div>
                
                <div class="slot-fila vertical" @click="abrirSelecaoItem(1)">
                    <div v-if="jogo.estudos[1].item" class="item-fila-conteudo">
                        <button class="btn-cancelar-fila" @click.stop="cancelarEstudo(1)">✖</button>
                        <img :src="getImagemItem(jogo.estudos[1].item)" class="img-mini-fila">
                    </div>
                    <div v-else class="fila-vazia">+</div>
                </div>

                <div class="slot-fila vertical" @click="abrirSelecaoItem(2)">
                    <div v-if="jogo.estudos[2].item" class="item-fila-conteudo">
                        <button class="btn-cancelar-fila" @click.stop="cancelarEstudo(2)">✖</button>
                        <img :src="getImagemItem(jogo.estudos[2].item)" class="img-mini-fila">
                    </div>
                    <div v-else class="fila-vazia">+</div>
                </div>
                <div class="slot-fila vertical" @click="abrirSelecaoItem(3)">
                    <div v-if="jogo.estudos[3].item" class="item-fila-conteudo">
                        <button class="btn-cancelar-fila" @click.stop="cancelarEstudo(3)">✖</button>
                        <img :src="getImagemItem(jogo.estudos[3].item)" class="img-mini-fila">
                    </div>
                    <div v-else class="fila-vazia">+</div>
                </div>
            </div>

        </div>
    </div>

    <div class="divisor-secao">Árvore do Conhecimento</div>
    <div class="arvore-placeholder">
        <p>Utilize os pontos gerados acima para desbloquear novas tecnologias aqui.</p>
        </div>

    <div v-if="modalFuncionarioAberto" class="modal-overlay" @click.self="modalFuncionarioAberto = false">
        <div class="modal-content">
            <h3>Alocar Acadêmico</h3>
            <div v-if="academicosDisponiveis.length === 0" class="aviso-vazio">Sem acadêmicos disponíveis.</div>
            <div class="lista-selecao">
                <div v-for="func in academicosDisponiveis" :key="func.id" class="item-lista" @click="alocarFunc(func)">
                    <img :src="func.img || '/assets/ui/i_academico.png'" width="30">
                    <div>
                        <strong>{{ func.nome }}</strong>
                        <div class="stat-sabedoria">Sabedoria: {{ func.bonus.toFixed(2) }}</div>
                    </div>
                </div>
            </div>
            <button class="btn-fechar" @click="modalFuncionarioAberto = false">Fechar</button>
        </div>
    </div>

    <div v-if="modalItemAberto" class="modal-overlay" @click.self="modalItemAberto = false">
        <div class="modal-content">
            <h3>O que estudar?</h3>
            <div v-if="inventarioEstudo.length === 0" class="aviso-vazio">
                Você não possui Pergaminhos ou Tomos.<br>
                <small>(Eles serão dropados em missões futuras)</small>
            </div>
            <div class="lista-selecao">
                <div v-for="item in inventarioEstudo" :key="item.id" class="item-lista item-estudo" @click="iniciarEstudo(item)">
                    <div class="icone-item-lista">📜</div>
                    <div class="detalhes-item">
                        <strong>{{ item.nome }}<br></strong>
                        <small>Tempo Base: {{ formatarTempo(item.tempo) }} | XP: {{ item.xp }}</small>
                    </div>
                    <div class="qtd-badge">x{{ item.qtd }}</div>
                </div>
            </div>
            <button class="btn-fechar" @click="modalItemAberto = false">Fechar</button>
        </div>
    </div>

</div>
</template>

<style scoped>
    @import '../css/importantes.css';

/* PAINEL TOPO (EQUIPE) */
.painel-topo {
    background: white; border-radius: 12px; padding: 15px;
    border: 1px solid #bdc3c7; box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    margin-bottom: 20px;
}
.info-velocidade { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
.icone-vel { font-size: 2em; }
.info-velocidade h2 { margin: 0; font-size: 1.2em; }
.text-zero { color: #e74c3c; }
.text-bom { color: #27ae60; }

.slots-funcionarios { display: flex; gap: 10px; }
.slot-func { 
    flex: 1; height: 70px; background: #f7f9fa; 
    border: 2px dashed #bdc3c7; border-radius: 8px; position: relative;
}
.slot-func-vazio { 
    height: 100%; display: flex; align-items: center; justify-content: center; 
    font-size: 2em; color: #bdc3c7; cursor: pointer;
}
.slot-func-ocupado {
    height: 100%; display: flex; align-items: center; padding: 5px; gap: 8px;
    background: #ebf5fb; border: 2px solid #3498db; border-radius: 8px; overflow: hidden;
}
.img-avatar { width: 35px; height: 35px; border-radius: 50%; border: 1px solid #ccc; background: white;}
.dados-func { display: flex; flex-direction: column; overflow: hidden; }
.dados-func .nome { font-size: 0.8em; font-weight: bold; }
.dados-func .sabedoria { font-size: 0.75em; color: #8e44ad; font-weight: bold; }
.btn-remove { 
    position: absolute; top: -5px; right: -5px; 
    background: #c0392b; color: white; border: none; 
    width: 20px; height: 20px; border-radius: 50%; cursor: pointer;
}

/* DIVISOR */
.divisor-secao {
    text-align: center; text-transform: uppercase; font-weight: bold;
    color: #95a5a6; margin: 20px 0 10px 0; font-size: 0.9em; letter-spacing: 1px;
}

/* PAINEL ESTUDOS (ITENS) */
.info-ciencia-total { text-align: right; margin-bottom: 10px; font-size: 0.9em; color: #2c3e50; }

.grid-slots-estudo { 
    display: flex;             /* Mudamos de Grid para Flex para centralizar fácil */
    justify-content: center;   /* Centraliza horizontalmente */
    width: 100%;
    max-width: 400px;          /* Limita a largura para ficar bonito */
    margin: 0 auto;            /* Garante centralização na página */
}


/* ESTILO: ALTAR VAZIO (Área de Clique) */
.estudo-vazio {
    /* MUDANÇA: Usamos absolute para colar a box lá embaixo, junto com a imagem */
    position: absolute; 
    bottom: 0; 
    left: 0;
    width: 100%;
    
    /* MUDANÇA: Definimos uma altura fixa que bate com o tamanho visual do pilar */
    height: 200px; 
    
    background: transparent; 
    border: none;
    cursor: pointer;
    
    /* MUDANÇA: Arredondar o topo para combinar com a perspectiva isométrica do pilar */
    border-radius: 0% 0% 10px 10px; 
    
    transition: all 0.2s;
    z-index: 20; /* Garante que fique clicável */
}

/* O hover permanece igual, mas agora respeitará o formato acima */
.estudo-vazio:hover {
    background-color: rgba(255, 255, 255, 0.1); 
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.15); /* Aumentei um pouco o brilho externo */
}
.icone-add-livro { font-size: 1.8em; margin-bottom: 5px; }

/* Estudo Ativo */
.estudo-ativo {
    background: white; 
    border: 1px solid #bdc3c7; 
    padding: 10px;
    border-radius: 8px; /* Arredonda as bordas internas */
    display: flex; 
    flex-direction: column; 
    justify-content: space-between; 
    gap: 12px; /* Espaço entre título, barra e XP */
}
.header-estudo { display: flex; justify-content: space-between; align-items: center; }
.nome-item { font-weight: bold; font-size: 0.9em; color: #2c3e50; }
.btn-cancelar { background: none; border: none; color: #e74c3c; cursor: pointer; font-weight: bold; }

.barra-container {
    height: 15px; background: #ecf0f1; border-radius: 10px; overflow: hidden; position: relative;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}
.barra-fill { height: 100%; background: linear-gradient(90deg, #f1c40f, #f39c12); transition: width 1s linear; }
.texto-barra { 
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
    display: flex; align-items: center; justify-content: center; 
    font-size: 0.7em; font-weight: bold; color: rgba(0,0,0,0.6);
}
.info-xp { 
    font-size: 0.85em; 
    text-align: center; 
    color: #27ae60; 
    font-weight: bold; 
    margin-top: auto; /* Empurra para o fundo da caixa */
    background: #eafaf1; /* Fundo verdinho claro */
    border-radius: 4px;
    padding: 2px;
}

/* MODAL */
.modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); z-index: 999;
    display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-content {
    background: white; padding: 20px; border-radius: 10px; width: 100%; max-width: 350px;
}
.lista-selecao { display: flex; flex-direction: column; gap: 8px; margin: 15px 0; max-height: 50vh; overflow-y: auto; }
.item-lista {
    display: flex; align-items: center; gap: 10px; padding: 10px; 
    background: #f1f2f6; border-radius: 8px; cursor: pointer; border: 1px solid transparent;
}
.item-lista:hover { border-color: #3498db; background: #ebf5fb; }
.stat-sabedoria { color: #8e44ad; font-size: 0.8em; font-weight: bold; }

.qtd-badge { background: #2c3e50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; font-weight: bold; margin-left: auto; }
.icone-item-lista { font-size: 1.5em; }

.btn-fechar { width: 100%; padding: 10px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.aviso-vazio { text-align: center; color: #7f8c8d; padding: 20px; }




/* --- INICIO DA SUBSTITUIÇÃO DO CSS (Versão Ferraria Adaptada) --- */

/* 1. CONTAINER DOS 3 SLOTS (Alinhamento) */
.slots-funcionarios { 
    display: flex; 
    gap: 15px; 
    padding: 5px;
    align-items: stretch; /* Faz todos terem a mesma altura */
}

.slot-wrapper {
    flex: 1;
    min-width: 200px; /* Largura mínima para não esmagar */
    max-width: 240px; /* Limite para manter estilo carta */
    display: flex;
    flex-direction: column;
    position: relative; /* Necessário para o botão X */
    transition: transform 0.2s;
}

/* 2. BOTÃO DE REMOVER (O "X" Vermelho) */
/* Mantive este estilo pois a Ferraria original não tem botão de remover direto no card */
.btn-remove-card {
    position: absolute; 
    top: -8px; right: -8px; 
    background: #c0392b; color: white; 
    width: 20px; height: 20px; 
    border-radius: 50%;
    border: 2px solid #fff;
    cursor: pointer;
    font-weight: bold; 
    font-size: 10px;
    z-index: 50;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    opacity: 0; /* Começa invisível */
    transition: all 0.2s ease-in-out;
}
.slot-wrapper:hover .btn-remove-card { opacity: 1; transform: scale(1.1); }
.btn-remove-card:hover { background: #e74c3c; }


/* === 3. ESTILO DO CARD (CÓDIGO DA FERRARIA) === */

/* Container Principal do Card */
.ferreiro-ativo {
    width: 100%;
    max-width: 235px; /* Largura da carta */
    margin: 0 auto;
    background: #ffffff;
    border-width: 2px; border-style: solid;
    border-radius: 8px; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    height: 100%; 
}

/* Topo do Card */
.card-topo {
    position: relative;
    display: flex; align-items: center;
    padding: 1px 5px; padding-right: 35px;
    color: #fff; font-weight: bold; height: 32px;
}

/* Alinhamento do Nome e Badge */
.topo-esquerda { 
    display: flex; align-items: center; gap: 6px; 
}
.card-nome { 
    font-size: 0.85em; white-space: nowrap; overflow: hidden; 
    text-overflow: ellipsis; max-width: 150px; 
}
.tier-badge { 
    background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; font-size: 0.9em; 
}

/* Ícone de Profissão (Bolinha Branca) */
.molde-icone-prof {
    position: absolute; top: 2px; right: 6px;
    background-color: #ffffff; width: 24px; height: 24px;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    border: 2px solid rgba(255, 255, 255, 0.5); z-index: 10;
}
.img-prof-inner { width: 19px; height: 19px; object-fit: contain; }

/* Corpo do Card */
.card-mid { flex: 1; display: flex; align-items: stretch; background: #fff; }

.avatar-box {
    width: 80px; 
    display: flex; align-items: center; justify-content: center;
    background: #f1f2f6; border-right: 1px solid #dfe4ea;
    overflow: hidden;
}
.avatar-func { 
    width: 90px; height: 90px; 
    border-radius: 4px; border: 1px solid #ced6e0; background: #fff; 
    object-fit: cover;
}

.tabela-dados-func { flex: 1; display: flex; flex-direction: column; font-size: 0.75em; }

.linha-dado {
    display: flex; justify-content: space-between; align-items: center;
    padding: 3px 6px; border-bottom: 1px solid #f1f2f6; color: #2f3542;
}
.linha-dado:nth-child(even) { background-color: #f8f9fa; }
.linha-dado:last-child { border-bottom: none; }

.dado-label { color: #747d8c; font-weight: 600; }
.dado-valor { font-weight: bold; color: #2f3542; display: flex; align-items: center; gap: 3px; white-space: nowrap; }
.capitalize { text-transform: capitalize; }
.tiny-coin { width: 11px; height: 11px; }

/* Rodapé */
.rodape-card {
    background: #fff; border-top: 1px solid #f1f2f6;
    padding: 6px 4px; text-align: center;
    display: flex; flex-direction: column; gap: 2px;
}
.info-produtividade { font-size: 0.75em; color: #2c3e50; font-weight: 600; }
.verde { color: #27ae60; }
.frase-efeito { font-size: 0.7em; font-style: italic; color: #a4b0be; }

/* === 4. CARD VAZIO (ESTILO FERRARIA) === */
.vazio-ferreiro-card {
    width: 100%; max-width: 235px; margin: 0 auto;
    background: #f8f9fa; border: 2px dashed #bdc3c7;
    border-radius: 8px; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: none; height: 100%; min-height: 140px;
    cursor: pointer;
}
.vazio-topo { 
    background-color: #95a5a6; color: #ecf0f1; 
    padding: 5px; height: 32px; display: flex; align-items: center; position: relative;
}
.vazio-badge { background: rgba(0,0,0,0.1); margin-right: 5px;}
.icon-prof-topo { width: 22px; height: 22px; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5)); opacity: 0.6; }

.vazio-avatar-box {
    width: 80px; display: flex; align-items: center; justify-content: center;
    background: #ecf0f1; border-right: 1px dashed #bdc3c7;
}
.avatar-vazio { width: 40px; height: 40px; opacity: 0.3; filter: grayscale(100%); }

.vazio-dados { display: flex; align-items: center; justify-content: center; padding: 10px; text-align: center; flex: 1;}
.texto-central-vazio { display: flex; flex-direction: column; gap: 4px; }
.titulo-vazio { font-weight: 800; color: #7f8c8d; text-transform: uppercase; font-size: 0.9em; }
.subtitulo-vazio { font-size: 0.75em; color: #95a5a6; }

.vazio-rodape { background: #ecf0f1; border-top: 1px dashed #bdc3c7; color: #95a5a6; padding: 5px; text-align: center; font-size: 0.7em;}

/* Responsivo para Celular */
@media (max-width: 600px) {
    .slots-funcionarios { flex-direction: column; }
    .slot-wrapper { max-width: 100%; margin-bottom: 15px; }
    .btn-remove-card { opacity: 1; }
    
}



/* ESTILO 2: MINIMALISTA */
.seta-controle {
    display: inline-block;
    color: #bdc3c7; /* Cinza bem claro quando fechado */
    font-size: 1.5em; /* Seta bem grande */
    margin-left: auto;
    line-height: 1; /* Remove espaços extras verticais */
    padding: 0 10px; /* Um pouco de área de clique extra */
    transform: rotate(-180deg);
}

.seta-controle:hover {
    color: #7f8c8d;
    cursor: pointer;
}

/* Quando aberto (rotacionada) */
.seta-controle.rotacionada {
    transform: rotate(90deg);
    color: #2c3e50; /* Preto forte quando aberto */
    text-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Leve sombra na letra */
}
@media (max-width: 600px) {
    /* Força o modal a ter tamanho fixo e barra de rolagem se precisar */
    .modal-content {
        width: 90% !important;
        max-width: 85% !important;
        max-height: 85vh !important; /* Máximo 85% da altura da tela */
        overflow-y: auto !important; /* Cria barra de rolagem se for muito alto */
        padding: 15px !important;
        border-radius: 12px !important;
        display: flex;
        flex-direction: column;
    }

    /* Ajusta a lista interna para rolar também */
    .lista-selecao {
        max-height: none !important; /* Deixa o pai controlar a altura */
        overflow-y: visible !important;
        flex: 1; /* Ocupa o espaço que sobrar */
    }

    /* Garante que o Grid de estudos fique um embaixo do outro no celular */
    .grid-slots-estudo { 
        grid-template-columns: 1fr !important; 
    }
    .modal-overlay {
    display: flex; align-items: center; justify-content: center; padding: 0px!important;
}
    .img-item-rpg {
        margin-top: 80px !important; /* Aumente este número para descer mais, diminua para subir */
        
        /* Opcional: Se o item estiver muito grande no celular, você pode reduzir aqui também */
        width: 140px !important; 
        height: 140px !important;
    }
    .slot-estudo.rpg-slot {
        width: 100% !important;
        min-height: 320px !important;
        background-size: contain !important;
        background-position: center bottom !important;
        padding-bottom: 0px !important;
        margin-bottom: 2px !important;
        
        /* ADICIONE ESSA LINHA ABAIXO: */
        transform: translateX(55px); /* Move 40px para a direita */
    }
    .area-item-visual {
    padding-bottom: 60px !important; /* Empurra o item um pouco pra cima do pé do altar */
}
    .coluna-altar {
        padding-left: 0 !important; /* Volte para 0 para recuperar o tamanho original */
        width: 100% !important;
    }
    .container-barra-separada {
        /* Move a barra 40px para direita (IGUAL fizemos no pilar) para alinhar */
        transform: translateX(52px); 
        
        /* Aumenta a largura para ficar mais bonito no celular */
        width: 70% !important; 
        max-width: none !important; 
    }
}



/* --- ESTILO RPG - BIBLIOTECA --- */

/* 1. CONTAINER GERAL (FUNDO ESCURO + IMAGEM) */
.mesa-estudos.rpg-container {
    /* O linear-gradient cria a camada escura por cima da imagem */
    background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/assets/images/bg_biblioteca.png');
    background-size: cover;
    background-position: center;
    border: 2px solid #57606f;
    border-radius: 12px;
    padding: 20px;
    color: white; /* Texto branco para ler no fundo escuro */
    box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}

/* Ajuste da cor do texto de pontos para branco no fundo escuro */
.info-ciencia-total {
    color: #ecf0f1 !important; 
    text-shadow: 0 2px 4px black;
    font-size: 1.1em;
}

/* 2. O SLOT (O ALTAR) */
.slot-estudo.rpg-slot {
    /* Imagem do Altar */
    background: url('/assets/images/altar_base.png');
    background-size: contain; 
    
    /* MUDANÇA 1: Alinhamos ao fundo normal. 
       Como vamos aumentar a caixa com padding, o "fundo" vai descer, 
       levando a imagem junto para o lugar certo. */
    background-position: center bottom;
    
    background-repeat: no-repeat;
    background-color: transparent; 
    
    border: none; 
    box-shadow: none; 
    
    height: auto;
    min-height: 220px;
    position: relative;
    display: flex;
    flex-direction: column;
    width: 60%;

    /* MUDANÇA 2: Criamos o espaço físico extra embaixo.
       Isso "estica" a caixa para baixo, permitindo que a imagem apareça inteira. */
    padding-bottom: 110px; 
}
.slot-estudo:hover .rpg-btn-close {
    opacity: 1;
    transform: scale(1);
}

/* Ajuste do container interno para alinhar com o altar */
.estudo-ativo.rpg-ativo {
    background: transparent;
    border: none;
    padding: 2px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

/* 3. O ITEM FLUTUANTE (ANIMAÇÃO) */
.area-item-visual {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 0px; /* Empurra o item um pouco pra cima do pé do altar */
}

.img-item-rpg {
    width: 200px; /* Tamanho do item */
    height: 200px;
    object-fit: contain;
    animation: flutuar 4s ease-in-out infinite; /* Item sobe e desce */
}

@keyframes flutuar {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-25px); }
    100% { transform: translateY(0px); }
}

/* --- EFEITOS DE BRILHO (DROP SHADOW) --- */

/* Pergaminho: Verde Suave */
.brilho-verde {
    filter: drop-shadow(0 0 10px rgba(46, 204, 113, 0.8));
}

/* Tábula: Laranja Terroso */
.brilho-laranja {
    filter: drop-shadow(0 0 15px rgba(230, 126, 34, 0.9));
}

/* Tomo: Roxo Pulsante */
.brilho-roxo {
    filter: drop-shadow(0 0 20px rgba(155, 89, 182, 1));
    animation: flutuar 4s ease-in-out infinite, pulsarRoxo 2s infinite alternate;
}

@keyframes pulsarRoxo {
    from { filter: drop-shadow(0 0 15px rgba(155, 89, 182, 0.6)); }
    to { filter: drop-shadow(0 0 30px rgba(142, 68, 173, 1)); }
}

/* 4. AJUSTES FINAIS (Botão Fechar e Barra) */
/* ESTILO: BOTÃO FECHAR (ESCONDE-ESCONDE) */
.rpg-btn-close {
    position: absolute;
    top: 5px; right: 10px;
    background: rgba(0,0,0,0.5);
    border-radius: 50%;
    width: 24px; height: 24px;
    color: #e74c3c;
    border: 1px solid rgba(255,255,255,0.2);
    cursor: pointer;
    
    /* Mágica do desaparecimento */
    opacity: 0; 
    transform: scale(0.8);
    transition: all 0.2s ease-in-out;
    z-index: 10; /* Garante que fique por cima de tudo */
}

.rpg-btn-close:hover {
    background: #c0392b;
    color: white;
}

.area-info-inferior {
    margin-top: auto;
    background: rgba(0,0,0,0.6); /* Fundo escurinho para ler a barra */
    padding: 8px;
    border-radius: 8px;
    width: 90%;
    margin-left: auto; margin-right: auto;
}
/* --- CSS NOVO PARA A BARRA SEPARADA E FILA --- *//* --- CSS ATUALIZADO: LAYOUT COM BARRA LATERAL --- */

.area-trabalho-flex {
    display: flex;
    gap: 15px;
    align-items: flex-start; /* Alinha tudo ao topo */
    margin-top: 10px;
}

/* Coluna da Esquerda (Maior) */
.coluna-altar {
    flex: 1; /* Ocupa todo o espaço que sobrar */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-left: 110px; /* <--- ADICIONE ESTA LINHA (Ajuste o valor se precisar mais/menos) */
}

/* Coluna da Direita (Barra Lateral) */
.coluna-fila-vertical {
    width: 80px; /* Largura fixa da barra lateral */
    background: rgba(0,0,0,0.4);
    border-radius: 8px;
    padding: 10px 5px;
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    min-height: 200px; /* Garante que ela acompanhe a altura do altar */
}

/* Ajustes da Barra de Progresso */
.container-barra-separada {
    width: 80%; /* Agora ocupa a largura da coluna do altar */
    max-width: 60%;
    margin-top: 10px;
    height: 15px;
    text-align: center;
}

.barra-externa {
    width: 100%; height: 100%;
    background: #2c3e50;
    border: 2px solid #95a5a6;
    border-radius: 6px;
    position: relative; overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}
.placeholder-barra {
    color: rgba(255,255,255,0.4);
    font-size: 0.8em; display: flex; align-items: center; justify-content: center;
}

/* Estilos dos Slots da Fila */
.titulo-fila {
    color: #bdc3c7; font-size: 0.7em;
    text-transform: uppercase; font-weight: bold; letter-spacing: 1px;
    margin-bottom: 2px;
    text-orientation: mixed;
}

.slot-fila {
    width: 50px; height: 50px;
    background: rgba(0,0,0,0.5);
    border: 2px dashed #7f8c8d;
    border-radius: 8px;
    cursor: pointer; position: relative;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
}
.slot-fila:hover { background: rgba(255,255,255,0.1); border-color: #ecf0f1; }
.slot-fila.vertical { margin-bottom: 5px; } /* Espaço extra entre eles */

.fila-vazia { font-size: 1.5em; color: #7f8c8d; line-height: 0; padding-bottom: 7px; }
.img-mini-fila { width: 35px; height: 35px; object-fit: contain; }

.btn-cancelar-fila {
    position: absolute; top: -5px; right: -5px;
    width: 16px; height: 16px;
    background: #c0392b; color: white; border: none; border-radius: 50%;
    font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    z-index: 10;
}
.btn-cancelar-fila:hover { background: #e74c3c; transform: scale(1.1); }
</style>