<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { jogo, DADOS_PROCESSAMENTO, mostrarAviso, obterBuffRaca } from '../jogo.js';
import { corTier } from '../funcionarios.js';

const abaAtual = ref('tratamento');
const mostrarBotaoTopo = ref(false);

const verificarScroll = () => {
    mostrarBotaoTopo.value = window.scrollY > 300;
};

const voltarAoTopo = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
    window.addEventListener('scroll', verificarScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', verificarScroll);
});
// --- 1. LÓGICA DO FUNCIONÁRIO ---
const enfermeiroAtivo = computed(() => {
    // Procura o primeiro enfermeiro que NÃO esteja em greve
    const profissional = jogo.funcionarios.find(f => f.profissao === 'enfermeiro' && f.diasEmGreve === 0);
    
    if (profissional) {
        // Calcula o buff racial
        const buffPct = obterBuffRaca(profissional);
        const poderFinal = (profissional.bonus * (1 + (buffPct / 100)));

        return {
            tipo: 'profissional',
            nome: profissional.nome,
            raca: profissional.raca,
            sexo: profissional.sexo,
            imagem: profissional.imagem,
            tier: profissional.tier,
            poder: poderFinal.toFixed(2),
            salario: profissional.salario,
            frase: profissional.frase,
            profissao: profissional.profissao,
            nomeProfissao: profissional.sexo === 'masculino' ? 'Enfermeiro' : 'Enfermeira',
        };
    } 
    // CORREÇÃO: Retorna null se não tiver profissional, para ativar o v-else do Ajudante corretamente
    return null;
});

const statsEnfermeiro = computed(() => {
    // Proteção: Se não tiver enfermeiro, retorna valor padrão
    if (!enfermeiroAtivo.value) return { tempo: '1.00' };
    
    return {
        tempo: enfermeiroAtivo.value.poder
    };
});

// --- 2. HELPERS VISUAIS ---
const formatarNumero = (num) => {
    return num ? num.toLocaleString('pt-BR') : '0';
};
const guiaDeCura = [
    { nome: 'Corte Leve', tempo: '10 min' },
    { nome: 'Fratura Exposta', tempo: '1 hora' },
    { nome: 'Intoxicação', tempo: '4 horas' },
];





// --- SISTEMA DE LEITOS (PROTÓTIPO) ---

// 1. Configuração dos Leitos (Começam vazios)
const quantidadeLeitos = 3;

// 2. Cria a lista automaticamente
const leitos = ref(Array.from({ length: quantidadeLeitos }, (_, index) => ({
    id: index,
    ocupado: null
})));

// 2. Fila de Espera (Simulando os 305 feridos + 1 Minerador)
const filaDeEspera = ref([
    { id: 'min1', nome: 'Minerador João', tipo: 'especial', qtd: 1, tempoTotal: 10, tempoAtual: 0, icone: '/assets/faces/humano/neutro_2_m.png' }, // Usei uma face existente do jogo pro mineiro
    { id: 't1', nome: 'Batalhão A', tipo: 'tropa', qtd: 100, tempoTotal: 30, tempoAtual: 0, icone: '/assets/ui/icone_tropa.png' },
    { id: 't2', nome: 'Batalhão B', tipo: 'tropa', qtd: 100, tempoTotal: 30, tempoAtual: 0, icone: '/assets/ui/icone_tropa.png' },
    { id: 't3', nome: 'Batalhão C', tipo: 'tropa', qtd: 100, tempoTotal: 3000, tempoAtual: 0, icone: '/assets/ui/icone_tropa.png' },
    { id: 't4', nome: 'Sobreviventes', tipo: 'tropa', qtd: 5, tempoTotal: 5, tempoAtual: 0, icone: '/assets/ui/icone_civil.png' }
]);

// 3. Função: Mover da Fila para o Leito
const alocarPaciente = (paciente, indexLeito) => {
    // Se o leito já tem gente, não faz nada
    if (leitos.value[indexLeito].ocupado) return;

    // Coloca o paciente no leito
    leitos.value[indexLeito].ocupado = { ...paciente };

    // Remove ele da fila de espera (Filtro por ID)
    filaDeEspera.value = filaDeEspera.value.filter(p => p.id !== paciente.id);

    // Inicia a cura automática (Simulação visual)
    iniciarCura(indexLeito);
};

// 4. Função: Timer de Cura (A barrinha enchendo)
const iniciarCura = (indexLeito) => {
    const timer = setInterval(() => {
        const paciente = leitos.value[indexLeito].ocupado;
        if (!paciente) { clearInterval(timer); return; }

        // Aumenta o progresso (Se tiver enfermeiro, cura + rápido: x2)
        const velocidade = enfermeiroAtivo.value ? 2 : 1; 
        paciente.tempoAtual += (0.1 * velocidade);

        // Se acabou o tempo
        if (paciente.tempoAtual >= paciente.tempoTotal) {
            clearInterval(timer);
            leitos.value[indexLeito].ocupado = null; // Libera o leito
            // Aqui entraria o código para devolver a tropa pro jogo.js
        }
    }, 100);
};

// Helper para cor da barra
const corBarra = (p) => {
    if (p.tipo === 'especial') return '#f1c40f'; // Amarelo (VIP)
    return '#e74c3c'; // Vermelho (Tropa)
};
</script>

<template>
    <div class="mythic-container">
        
        <div class="header-titulo-aba">
            <div class="titulo-nivel">
                <h2>🔪 Enfermaria</h2>
            </div>
            <div class="info-nivel">
                <span class="badge-nivel">Nível {{ jogo.enfermaria }}</span>
            </div>
        </div>
        
        <div class="abas-taverna">
            <button :class="{ ativo: abaAtual === 'tratamento' }" @click="abaAtual = 'tratamento'">Tratamento</button>
            
            <button 
                :class="{ 'ativo': abaAtual === 'bercario', 'bloqueado': !enfermeiroAtivo }" 
                @click="abaAtual = 'bercario'"
                :disabled="!enfermeiroAtivo"
                :title="!enfermeiroAtivo ? 'Requer um Enfermeiro contratado (O Ajudante não sabe aprimorar itens)' : ''">
                BERÇARIO <span v-if="!enfermeiroAtivo" style="margin-left:5px; font-size: 0.9em;">🔒</span>
            </button>
        </div>

        <div v-if="abaAtual === 'tratamento'">
            <div class="painel-controle-enfermaria">
                
                <div v-if="enfermeiroAtivo" class="card-funcionario enfermeiro-ativo" :style="{ borderColor: corTier(enfermeiroAtivo.tier) }">
                    <div class="card-topo" :style="{ backgroundColor: corTier(enfermeiroAtivo.tier) }">
                        <div class="topo-esquerda">
                            <span class="tier-badge">{{ enfermeiroAtivo.tier }}</span>
                            <span class="card-nome">{{ enfermeiroAtivo.nome }}</span>
                        </div>
                        
                        <div class="molde-icone-prof">
                            <img src="/assets/ui/i_enfermeiro.png" class="img-prof-inner" title="Enfermeiro">
                        </div>
                    </div>

                    <div class="card-mid">
                        <div class="avatar-box">
                             <img :src="`/assets/faces/${enfermeiroAtivo.raca}/${enfermeiroAtivo.imagem}.png`" class="avatar-func">
                        </div>

                        <div class="tabela-dados-func">
                            <div class="linha-dado">
                                <span class="dado-label">Profissão:</span>
                                <span class="dado-valor capitalize">{{ enfermeiroAtivo.nomeProfissao }}</span>
                            </div>
                            <div class="linha-dado">
                                <span class="dado-label">Raça:</span>
                                <span class="dado-valor capitalize">{{ enfermeiroAtivo.raca }}</span>
                            </div>
                            <div class="linha-dado">
                                <span class="dado-label">Sexo:</span>
                                <span class="dado-valor">{{ enfermeiroAtivo.sexo === 'masculino' ? 'Masculino' : 'Feminino' }}</span>
                            </div>
                            <div class="linha-dado">
                                <span class="dado-label">Salário:</span>
                                <span class="dado-valor">
                                    {{ formatarNumero(enfermeiroAtivo.salario) }} 
                                    <img src="/assets/ui/icone_goldC.png" class="tiny-coin">
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="rodape-card">
                        <div class="info-produtividade">
                            Poder de Cura: <span class="verde">{{ enfermeiroAtivo.poder }}x</span>
                        </div>
                        <div class="frase-efeito">
                            "{{ enfermeiroAtivo.frase || 'Curo feridas, salvo vidas!' }}"
                        </div>
                    </div>
                </div>
                <div v-else class="card-funcionario enfermeiro-ativo" style="border-color: #95a5a6; opacity: 0.9;">
                    <div class="card-topo" style="background-color: #95a5a6;">
                        <div class="topo-esquerda">
                            <span class="tier-badge" style="background: rgba(0,0,0,0.2)">-</span>
                            <span class="card-nome">Ajudante da Vila</span>
                        </div>
                        
                        <div class="molde-icone-prof">
                            <img src="/assets/ui/i_enfermeiro.png" class="img-prof-inner" title="Enfermeiro Interino" style="filter: grayscale(1);">
                        </div>
                    </div>

                    <div class="card-mid">
                        <div class="avatar-box">
                            <img src="/assets/faces/humano/enfermeiro_m.png" class="avatar-func" style="filter: sepia(0.4);">
                        </div>

                        <div class="tabela-dados-func" style="justify-content: flex-start; align-self: flex-start; margin-top: 5px;">
                            <div class="linha-dado">
                                <span class="dado-label">Profissão:</span>
                                <span class="dado-valor">Ajudante</span>
                            </div>
                        </div>
                    </div>

                    <div class="rodape-card">
                        <div class="frase-efeito">
                            "Segurando as pontas até o mestre chegar..."
                        </div>
                    </div>
                </div>

                <div class="linha-divisoria"></div>

                <div class="lado-direito-filtros">
                    <div class="titulo-info-cura">
                        <span>Guia de Recuperação</span>
                    </div>

                    <div class="tabela-cura">
                        <div v-for="(item, index) in guiaDeCura" :key="index" class="linha-cura">
                            <span class="nome-ferimento">🤕 {{ item.nome }}</span>
                            <span class="tempo-ferimento">🕒 {{ item.tempo }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="area-leitos">
            <h3>🏥 Leitos de Recuperação ({{ leitos.filter(l => l.ocupado).length }} / 3)</h3>
            
            <div class="grid-leitos">
                <div v-for="(leito, index) in leitos" :key="index" class="box-leito">
                    
                    <div class="leito-numero">#{{ index + 1 }}</div>

                    <div v-if="leito.ocupado" class="modo-cura-magica">
                        
                        <div class="runa-rotativa"></div>

                        <div class="avatar-wrapper">
                             <img :src="leito.ocupado.icone" class="img-avatar-padrao">
                        </div>

                        <div class="aura-cura"></div>

                        <div class="ui-cura">
                            <span class="badge-qtd" v-if="leito.ocupado.qtd > 1">x{{ leito.ocupado.qtd }}</span>
                            
                            <div class="barra-vida-magic">
                                <div class="fill-magic" 
                                     :style="{ width: (leito.ocupado.tempoAtual / leito.ocupado.tempoTotal * 100) + '%' }">
                                </div>
                            </div>
                            <span class="timer-texto">{{ (leito.ocupado.tempoTotal - leito.ocupado.tempoAtual).toFixed(0) }}s</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="area-fila">
            <h3>📋 Triagem (Clique para internar)</h3>
            
            <div class="lista-cards-fila">
                <div v-for="paciente in filaDeEspera" :key="paciente.id" 
                     class="card-fila" 
                     @click="alocarPaciente(paciente, leitos.findIndex(l => !l.ocupado))">
                    
                    <div class="card-fila-esquerda">
                        <img :src="paciente.icone" class="img-fila-icone">
                        
                        <div class="dados-fila">
                            <span class="nome-fila">{{ paciente.nome }}</span>
                            <span class="badge-qtd" :class="paciente.tipo">x{{ paciente.qtd }}</span>
                        </div>
                    </div>
                    
                    <div class="card-fila-direita">
                        <span class="tempo-estimado">⏱️ {{ paciente.tempoTotal }}s</span>
                        <small>Toque para curar</small>
                    </div>
                </div>

                <div v-if="filaDeEspera.length === 0" class="aviso-sem-feridos">
                    Nenhum ferido na fila. Bom trabalho!
                </div>
            </div>
        </div>
        </div>

        <div class="conteudo-pagina">
            <slot></slot>
        </div>

        <button v-if="mostrarBotaoTopo" 
                class="btn-scroll-topo" 
                @click="voltarAoTopo" 
                title="Voltar ao Topo">
            ▲
        </button>
    </div>
</template>

<style scoped>
@import '../css/importantes.css';
* { box-sizing: border-box; }

/* --- PAINEL DE CONTROLE --- */
.painel-controle-enfermaria {
    display: flex; 
    align-items: center; 
    justify-content: flex-start; 
    background: #ecf0f1; 
    border: 1px solid #bdc3c7; 
    border-radius: 8px;
    padding: 10px 15px; 
    /* O gap define o espaço base, mas a margem da linha vai personalizar isso */
    gap: 0; 
    height: auto; 
    min-height: 180px; 
}

/* --- CARD GENÉRICO (Estrutura) --- */
.enfermeiro-ativo {
    width: 100%;
    max-width: 235px; 
    margin: 0;  
    background: #ffffff;
    border-width: 2px; 
    border-style: solid;
    border-radius: 8px; 
    overflow: hidden;
    display: flex; 
    flex-direction: column;
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    flex-shrink: 0; 
    margin-right: 0;
}

/* Miolo do Card */
.enfermeiro-ativo .card-mid { 
    flex: 1; 
    display: flex; 
    align-items: center; 
    padding: 5px 5px 5px 15px; 
    background: #fff; 
}

/* --- HEADER DO CARD --- */
.card-topo {
    position: relative;
    display: flex;
    align-items: center;
    padding: 1px 5px;
    padding-right: 35px;
    color: #fff; 
    font-weight: bold;
    height: 32px;
}

.molde-icone-prof {
    position: absolute;
    top: 2px;
    right: 6px;
    background-color: #ffffff;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    border: 2px solid rgba(255, 255, 255, 0.5);
    z-index: 10;
}

.img-prof-inner { width: 17px; height: 17px; object-fit: contain; }
.topo-esquerda { display: flex; align-items: center; gap: 6px; }
.tier-badge { background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 4px; font-size: 0.9em; }

/* --- CONTEÚDO (Avatar e Tabela) --- */
.avatar-box {
    width: 80px;
    display: flex; align-items: center; justify-content: center;
    background: #f1f2f6; border-right: 1px solid #dfe4ea;
}
.avatar-func { 
    width: 90px;
    height: 90px;
    border-radius: 4px; border: 1px solid #ced6e0; background: #fff; 
}

.tabela-dados-func { flex: 1; display: flex; flex-direction: column; font-size: 0.75em; }

.linha-dado {
    display: flex; justify-content: space-between; align-items: center;
    padding: 3px 6px; border-bottom: 1px solid #f1f2f6; color: #2f3542;
}
.linha-dado:nth-child(even) { background-color: #f8f9fa; }

.dado-label { color: #747d8c; font-weight: 600; }
.dado-valor { font-weight: bold; color: #2f3542; display: flex; align-items: center; gap: 3px; white-space: nowrap; }
.capitalize { text-transform: capitalize; }
.tiny-coin { width: 11px; height: 11px; }

/* --- RODAPÉ --- */
.rodape-card {
    background: #fff;
    border-top: 1px solid #f1f2f6;
    padding: 6px 4px;
    text-align: center;
    display: flex; flex-direction: column; gap: 2px;
}
.info-produtividade { font-size: 0.75em; color: #2c3e50; font-weight: 600; }
.verde { color: #27ae60; }
.frase-efeito { font-size: 0.7em; font-style: italic; color: #a4b0be; }

/* --- OUTROS --- */
.linha-divisoria { 
    display: block !important;
    width: 2px; /* Deixando ela levemente mais fina e elegante */
    height: 100px; 
    background: #bdc3c7; 
    opacity: 0.5;
    flex-shrink: 0;
    margin-left: 15px;
    margin-right: 0 20px; /* Mantém o catálogo afastado para não embolar */
}

/* --- LADO DIREITO (CATÁLOGO) --- */
.lado-direito-filtros {
    flex: 1; /* Ocupa o restante do painel */
    display: flex;
    flex-direction: column;
    padding-left: 0;
    border-left: none !important; /* Remove a borda para usar apenas a .linha-divisoria */
}
/* Estilos da Tabela de Cura */
.titulo-info-cura {
    width: 100%;
    text-align: center;
    font-weight: bold;
    color: #7f8c8d;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 5px;
    margin-bottom: 8px;
    display: flex; flex-direction: column;
}

.tabela-cura { width: 80%; display: flex; flex-direction: column; gap: 4px; margin-left: 15px; }

.linha-cura {
    display: flex; justify-content: space-between;
    background: #fff;
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 0.85em;
    border: 1px solid #f1f2f6;
}
.nome-ferimento { font-weight: 600; color: #2c3e50; }
.tempo-ferimento { color: #7f8c8d; }
.abas-taverna button.bloqueado {
    opacity: 0.6;
    cursor: not-allowed;
    background: #95a5a6;
    color: #ecf0f1;
    border-color: #7f8c8d;
    box-shadow: none;
}

.grid-leitos {
    display: grid;
    /* Isso aqui é a mágica: cria colunas automáticas de no mínimo 100px */
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
    padding: 10px;
    background: #bdc3c7; /* Cor do chão da enfermaria */
    border-radius: 8px;
    border: 4px solid #7f8c8d; /* Paredes de pedra */
}

/* O BOX DA CAMA INDIVIDUAL */
.box-leito {
    position: relative;
    background-image: url('/assets/ui/cama_vazia.png');
    background-size: cover;
    background-position: center;
    height: 140px;
    border-radius: 8px;
    border: 2px solid #57606f;
    box-shadow: inset 0 0 15px #000; /* Sombra interna para profundidade */
    overflow: hidden;
}
.leito-numero {
    position: absolute; top: 5px; left: 8px;
    font-size: 0.7em; color: rgba(255,255,255,0.4);
    z-index: 10;
}

/* --- MODO CURA MÁGICA (ESTADO OCUPADO) --- */
.modo-cura-magica {
    width: 100%; height: 100%;
    position: relative;
    display: flex; justify-content: center; align-items: center;
    background: rgba(0, 0, 0, 0.4); /* Escurece o fundo para destacar a magia */
    backdrop-filter: blur(1px); /* Leve desfoque no fundo */
}
/* 1. Runa Rotativa (Círculo Mágico) */
.runa-rotativa {
    position: absolute;
    width: 90px; height: 90px;
    border: 2px dashed rgba(100, 255, 218, 0.4); /* Verde Água Mágico */
    border-radius: 50%;
    animation: girar 8s linear infinite;
    z-index: 1;
}
.runa-rotativa::after {
    content: ''; position: absolute;
    top: 10px; left: 10px; right: 10px; bottom: 10px;
    border: 1px solid rgba(100, 255, 218, 0.6);
    border-radius: 50%;
}

/* 2. Avatar Flutuante */
.avatar-wrapper {
    z-index: 2;
    animation: flutuar 3s ease-in-out infinite;
}
.img-avatar-padrao {
    width: 60px; height: 60px; object-fit: contain;
    filter: drop-shadow(0 0 10px rgba(100, 255, 218, 0.6)); /* Brilho em volta do boneco */
}

/* 3. Aura (Brilho Geral) */
.aura-cura {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(circle, rgba(100,255,218,0.2) 0%, rgba(0,0,0,0) 70%);
    z-index: 2;
    pointer-events: none;
}

/* 4. Interface Unificada */
.ui-cura {
    position: absolute; bottom: 10px; width: 100%;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    z-index: 5;
}
.badge-qtd {
    background: #2c3e50; color: #fff; font-size: 0.7em;
    padding: 1px 6px; border-radius: 10px; font-weight: bold;
    border: 1px solid #64ffda;
}

.barra-vida-magic {
    width: 60%; height: 4px;
    background: rgba(0,0,0,0.5);
    border-radius: 2px;
    overflow: hidden;
}
.fill-magic {
    height: 100%;
    background: #64ffda; /* Verde Neon Mágico */
    box-shadow: 0 0 5px #64ffda;
    transition: width 0.1s linear;
}

.timer-texto {
    font-size: 0.6em; color: #64ffda; font-weight: bold;
    text-shadow: 0 1px 2px #000;
}

/* Estilo da imagem na lista de espera */
.img-fila-icone {
    width: 40px;
    height: 40px;
    object-fit: contain;
    background: rgba(0,0,0,0.05);
    border-radius: 4px;
    padding: 2px;
}
/* --- ANIMAÇÕES --- */
@keyframes girar {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

@keyframes flutuar {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
}
@media(max-width: 768px) {
    .painel-controle-enfermaria { flex-direction: column; height: auto; gap: 20px; }

    /* ESCONDE A LINHA NO CELULAR */
    .linha-divisoria { display: none; }

    /* Ajuste para o painel da direita ocupar 100% no celular */
    .lado-direito-filtros { width: 100%; }
}
</style>