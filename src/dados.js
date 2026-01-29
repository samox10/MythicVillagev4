// ------------------------------------------
// TABELA DE MINERIOS
// ------------------------------------------
export const tabelaMinerais = [
  { id: 'pedra',      nome: 'Pedra',      nivel: 1,  producaoBase: 60 },  // 60 por minuto
  { id: 'cobre',      nome: 'Cobre',      nivel: 2,  producaoBase: 40 },  // 40 por minuto
  { id: 'ferro',      nome: 'Ferro',      nivel: 4,  producaoBase: 30 },  // 30 por minuto
  { id: 'prata',      nome: 'Prata',      nivel: 6,  producaoBase: 20 }, // 20 por minuto
  { id: 'ouro_min',   nome: 'Ouro (Min)', nivel: 8,  producaoBase: 15 }, // 15 por minuto
  { id: 'obsidiana',  nome: 'Obsidiana',  nivel: 10, producaoBase: 10 }, // 10 por minuto
  { id: 'titanio',    nome: 'Titânio',    nivel: 12, producaoBase: 8 }, // 8 por minuto
  { id: 'diamante',   nome: 'Diamante',   nivel: 14, producaoBase: 5 }, // 5 por minuto
  { id: 'mithril',    nome: 'Mithril',    nivel: 16, producaoBase: 3 }, // 3 por minuto
  { id: 'aetherium',  nome: 'Aetherium',  nivel: 18, producaoBase: 1 } // 1 por minuto
];

// ------------------------------------------
// TABELA DE ITENS CRAFTÁVEIS
// ------------------------------------------

export const tabelaItens = [
  // --- ARMAS ---
  
  { 
    id: 'espada_cobre', nome: 'Espada de Cobre', 
    img: '/assets/craft/espada_cobre.png',
    categoria: 'aventureiro', 
    tipo: 'arma',
    custo: { madeira: 10, cobre: 5, obsidiana: 1 }, 
    tempo: 10, 
    reqNivel: 1,
    nivelItem: 5,
    stats: { ataque: 8, critico: 2, danoCritico: 50, penetracao: 2, magia: 1,
    atributoInativo: "Dano contra slimes +10%"
     }     
  },
  { 
    id: 'espada_ferro', nome: 'Espada da Ruína Celestial', 
    categoria: 'heroi',
    tipo: 'arma', 
    img: '/assets/craft/espada_ferro.png', 
    custo: { madeira: 20, ferro: 10 }, tempo: 30, 
    reqNivel: 2,
    nivelItem: 5,
    stats: { ataque: 12, precisao: 3, danoCritico: 80, critico: 3  },
    atributoInativo: "Dano contra slimes +10%"
  },
  
  // --- ARMADURAS ---
  { 
    id: 'armadura_couro', nome: 'Armadura de Couro', 
    categoria: 'heroi',
    tipo: 'armadura', 
    custo: { couro: 10 }, tempo: 20, 
    reqNivel: 1,
    nivelItem: 5,
    img: '/assets/craft/armadura_couro.png',
    stats: { defesa: 3, evasao: 2, vida: 10, ataque: 1, critico: 1, 
      danoCritico: 10, magia: 1, defesaMagica: 2,},      
      atributoInativo: "Dano contra slimes +10%"
  },
  { 
    id: 'armadura_ferro', nome: 'Armadura de Ferro', 
    categoria: 'aventureiro',
    tipo: 'armadura', 
    custo: { ferro: 15, couro: 5 }, tempo: 60, 
    reqNivel: 2,
    nivelItem: 5,
    stats: { defesa: 10, evasao: -2 },
    atributoInativo: "Dano contra slimes +10%"
  },

  
  // --- MUNIÇÃO ---
  { 
    id: 'flecha_pedra', nome: 'Flechas de Pedra (x100)', 
    categoria: 'aventureiro',
    tipo: 'municao', 
    custo: { madeira: 100, pedra: 100 }, tempo: 20, qtd: 100, 
    reqNivel: 1,
    nivelItem: 102,
    stats: { ataque: 2, mana: 5  },
    atributoInativo: "Dano contra slimes +10%"
  }
];
// ------------------------------------------
// FIM TABELA DE ITENS CRAFTÁVEIS
// ------------------------------------------

// ------------------------------------------
// SISTEMA DE APRIMORAMENTO DE ITENS
// ------------------------------------------
export const DB_PEDRAS = {
    lista: [
        { 
            id: 'pedra_up_comum', 
            nome: 'Pedra do Aprendiz', 
            tier: 'comum',
                    // +1, +2, +3, +4,  +5,  +6, +7, +8...
            chances: [100, 80, 70, 50,  20,  10,  0,  0,  0,  0] 
        }, 
        { 
            id: 'pedra_up_rara', 
            nome: 'Pedra do Artesão', 
            tier: 'rara', 
                    // +1, +2,  +3, +4,  +5,  +6,  +7, +8,  +9,  +10
            chances: [100, 100, 90, 70,  65,  45,  30,  18,  5,  1] 
        }, 
        { 
            id: 'pedra_up_mitica', 
            nome: 'Pedra do Grão-Mestre', 
            tier: 'mitica', 
                    // +1, +2, +3,   +4,  +5,  +6, +7,  +8,  +9,  +10
            chances: [100, 100, 100, 100, 100, 75,  50,  30,  20,  10] 
        }
    ]
};

// ------------------------------------------
// FIM SISTEMA DE APRIMORAMENTO DE ITENS
// ------------------------------------------

// ------------------------------------------
// TABELA DE CARCAÇAS
// ------------------------------------------
export const tabelaCarcacas = [
  { 
    id: 'besouro_rinoceronte', nome: 'Besouro Rinoceronte', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/besouro_rinoceronte.png', 
    imgCorpo: '/assets/monstros/besouro_rinoceronte.png',
    desc: 'Pode ser processada para obter carne e couro.',
    tempo: 10, // 10 segundos para testar rápido
    recursos: { carne: 50, couro: 10 },
    ambiente: 'Floresta Densa',
    tamanhoVisual: 200,
    tamanhoMobile: 150,
    nivelRequerido: 1
  },
  { 
    id: 'tatu_pedra', nome: 'Tatu Pedra', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/tatu_pedra.png', 
    imgCorpo: '/assets/monstros/tatu_pedra.png',
    desc: 'Couro resistente e carne fibrosa.',
    tempo: 20, // 20 segundos
    recursos: { carne: 30, couro: 25 },
    ambiente: 'Montanhas Nevadas',
    tamanhoVisual: 160,
    tamanhoMobile: 150,
    nivelRequerido: 1
  },
  { 
    id: 'javali_da_vila', nome: 'Javali da Vila', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/javali_da_vila.png', 
    imgCorpo: '/assets/monstros/javali_da_vila.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 300,
    tamanhoMobile: 150,
    nivelRequerido: 1
  },
  { 
    id: 'javali_de_granito', nome: 'Javali de Granito', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/javali_de_granito.png', 
    imgCorpo: '/assets/monstros/javali_de_granito.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 305,
    tamanhoMobile: 150,
    nivelRequerido: 1
  },
  { 
    id: 'basilisco', nome: 'Basilisco', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/basilisco.png', 
    imgCorpo: '/assets/monstros/basilisco.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 265,
    tamanhoMobile: 150,
    nivelRequerido: 10
  },
  { 
    id: 'lagarto_de_brasa', nome: 'Lagarto de Brasa', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/lagarto_de_brasa.png', 
    imgCorpo: '/assets/monstros/lagarto_de_brasa.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 269,
    tamanhoMobile: 150,
    nivelRequerido: 7
  },
  {
    id: 'sand_scorpion', nome: 'Escorpião de Areia', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/sand_scorpion.png', 
    imgCorpo: '/assets/monstros/sand_scorpion.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 200,
    tamanhoMobile: 150,
    nivelRequerido: 6
  },
  {
    id: 'magma_hyena', nome: 'Hiena de Magma', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/magma_hyena.png', 
    imgCorpo: '/assets/monstros/magma_hyena.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 290,
    tamanhoMobile: 150,
    nivelRequerido: 2
  },
  {
    id: 'salamandra', nome: 'Salamandra', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/salamandra.png', 
    imgCorpo: '/assets/monstros/salamandra.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 250,
    tamanhoMobile: 150,
    nivelRequerido: 3
  },
  {
    id: 'fire_serpe', nome: 'Serpe de Fogo', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/fire_serpe.png', 
    imgCorpo: '/assets/monstros/fire_serpe.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 430,
    tamanhoMobile: 150,
    nivelRequerido: 4
  },
  {
    id: 'snow_fox', nome: 'Raposa de Neve', 
    tipo: 'recurso', categoria: 'carcaca',
    img: '/assets/monstros/snow_fox.png', 
    imgCorpo: '/assets/monstros/snow_fox.png',
    desc: 'Uma enorme fonte de recursos.',
    tempo: 40, // 40 segundos
    recursos: { carne: 120, couro: 40 },
    ambiente: 'Planícies',
    tamanhoVisual: 250,
    tamanhoMobile: 150,
    nivelRequerido: 5
  }
];
// ------------------------------------------
// FIM TABELA DE CARCAÇAS
// ------------------------------------------