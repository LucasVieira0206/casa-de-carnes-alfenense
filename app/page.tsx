"use client";

import { useState, useEffect } from "react";

// Estruturas de dados
type Produto = { 
  id: string; 
  nome: string; 
  preco: number; 
  imagem: string; 
  descricao: string; 
  unidade: string; 
  category: string;
  sobConsulta?: boolean; 
};

type ItemCarrinho = Produto & { 
  idCarrinho: string; 
  quantidade: number; 
  corte?: string; 
  porcoes?: number; 
  instrucao?: string; 
};

// Estrutura para os cortes
type Corte = { id: string; nome: string; icone: string };

export default function Home() {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  
  const [modalKitAberto, setModalKitAberto] = useState(false);

  const [produtoModal, setProdutoModal] = useState<Produto | null>(null);
  const [etapaModal, setEtapaModal] = useState(1);
  const [corteSelecionado, setCorteSelecionado] = useState('');
  const [pesoSelecionadoGramas, setPesoSelecionadoGramas] = useState(500);
  const [porcoes, setPorcoes] = useState(1);
  const [instrucao, setInstrucao] = useState('');
  const [instrucaoAberta, setInstrucaoAberta] = useState(false);

  // === NOVOS ESTADOS PARA ENTREGA E ENDEREÇO ===
  const [tipoPedido, setTipoPedido] = useState<'retirada' | 'entrega'>('retirada');
  const [endereco, setEndereco] = useState('');
  // ============================================

  // === FUNÇÃO DO GOOGLE ANALYTICS (O ESPIÃO) ===
  const trackEvent = (action: string, category: string, label: string, value?: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  };
  // ============================================

  // === ESTADOS E DADOS DO MONTADOR DE KIT ===
  const [selecaoKit, setSelecaoKit] = useState<Record<string, number>>({});

  const produtosKit = [
    { id: 'k1', nome: 'Kibe', porcao: '500g', preco: 18.00, imagem: '/kibe.png' },
    { id: 'k2', nome: 'Panceta', porcao: '500g', preco: 15.00, imagem: '/panceta.png' },
    { id: 'k3', nome: 'Bife a Rolê', porcao: '500g', preco: 25.00, imagem: '/bife-role.png' },
    { id: 'k4', nome: 'Costela Bovina com osso', porcao: '1kg', preco: 20.00, imagem: '/costela-boi.png' },
    { id: 'k5', nome: 'Carne Moída', porcao: '500g', preco: 20.00, imagem: '/carne-moida.png' },
    { id: 'k6', nome: 'Acém', porcao: '500g', preco: 22.00, imagem: '/acem.png' },
    { id: 'k7', nome: 'Filé de Frango', porcao: '500g', preco: 15.00, imagem: '/file-peito.png' },
    { id: 'k8', nome: 'Bife de Boi', porcao: '500g', preco: 25.00, imagem: '/contrafile.png' },
    { id: 'k9', nome: 'Bife de Porco', porcao: '500g', preco: 13.00, imagem: '/pernil.png' },
    { id: 'k10', nome: 'Almôndega', porcao: '1 Bdj', preco: 20.00, imagem: '/almondega.png' },
    { id: 'k11', nome: 'Frango a Passarinho', porcao: '500g', preco: 10.00, imagem: '/frango-passarinho.png' },
    { id: 'k12', nome: 'Pernil em Cubos', porcao: '500g', preco: 13.00, imagem: '/pernil.png' },
    { id: 'k13', nome: 'Peixe', porcao: '1 Bdj', preco: 25.00, imagem: '/file-peixe.png' },
    { id: 'k14', nome: 'Tulipa', porcao: '500g', preco: 17.00, imagem: '/tulipa.png' },
    { id: 'k15', nome: 'Coxinha da Asa', porcao: '500g', preco: 14.00, imagem: '/coxinha-asa.jpeg' },
    { id: 'k16', nome: 'Coxa', porcao: '1kg', preco: 18.00, imagem: '/coxa-sobrecoxa.jpeg' },
    { id: 'k17', nome: 'Filé de Frango Empanado', porcao: '500g', preco: 15.00, imagem: '/file-empanado.png' },
    { id: 'k18', nome: 'Linguiça', porcao: '500g', preco: 15.00, imagem: '/linguica-toscana.png' },
    { id: 'k19', nome: 'Salsicha', porcao: '500g', preco: 6.00, imagem: '/salsicha.png' },
  ];

  const totalItensSelecionadosKit = Object.values(selecaoKit).reduce((acc, curr) => acc + curr, 0);
  const valorTotalKit = Object.entries(selecaoKit).reduce((acc, [id, qtd]) => {
    const prod = produtosKit.find(p => p.id === id);
    return acc + (prod ? prod.preco * qtd : 0);
  }, 0);
  const faltamParaKit = Math.max(0, 6 - totalItensSelecionadosKit);

  const alterarItemKit = (id: string, delta: number) => {
    setSelecaoKit(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const newState = { ...prev, [id]: next };
      if (next === 0) delete newState[id];
      return newState;
    });
  };

  const adicionarKitCustomizadoAoCarrinho = () => {
    if (faltamParaKit > 0) return;

    const itensFormatados = Object.entries(selecaoKit).map(([id, qtd]) => {
      const prod = produtosKit.find(p => p.id === id);
      return `${qtd}x ${prod?.porcao} ${prod?.nome}`;
    }).join(' / ');

    const produtoKitPersonalizado: Produto = {
      id: `kit-custom-${Date.now()}`,
      nome: `Kit Personalizado (${totalItensSelecionadosKit} itens)`,
      preco: valorTotalKit,
      imagem: '/kit-essencial-1.jpg', 
      descricao: itensFormatados,
      unidade: 'un',
      category: 'Kits'
    };

    adicionarAoCarrinho(produtoKitPersonalizado, 1);
    setModalKitAberto(false);
    setSelecaoKit({});
  };
  // ==========================================

  const [cortesDisponiveis, setCortesDisponiveis] = useState<Corte[]>([]);

  // === ARRAYS DE CORTES ESPECÍFICOS ===
  const cutsPecaInteiraCarne: Corte[] = [
    { id: 'peca', nome: 'Peça Inteira', icone: '🥩' },
  ];

  const cutsPecaInteiraFrango: Corte[] = [
    { id: 'peca', nome: 'Peça Inteira', icone: '🍗' },
  ];

  const cutsPanceta: Corte[] = [
    { id: 'peca', nome: 'Peça Inteira', icone: '🥩' },
    { id: 'bife', nome: 'Bife', icone: '🥩' },
  ];

  const cutsBeefStandard: Corte[] = [
    { id: 'peca', nome: 'Peça Inteira', icone: '🥩' },
    { id: 'bife', nome: 'Bife', icone: '🥩' },
    { id: 'grelha', nome: 'Grelha', icone: '🔥' },
    { id: 'cubos', nome: 'Cubos', icone: '🧊' },
    { id: 'moido', nome: 'Moído', icone: '🍔' },
    { id: 'tiras', nome: 'Tiras', icone: '🥓' },
    { id: 'strogonoff', nome: 'Strogonoff', icone: '🍲' },
  ];

  const cutsCostela: Corte[] = [
    { id: 'peca', nome: 'Peça Inteira', icone: '🥩' },
    { id: 'grelha', nome: 'Grelha', icone: '🔥' },
  ];

  const cutsSuinoStandard: Corte[] = [
    { id: 'peca', nome: 'Peça Inteira', icone: '🥩' },
    { id: 'bife', nome: 'Bife', icone: '🥩' },
    { id: 'grelha', nome: 'Grelha', icone: '🔥' },
    { id: 'cubos', nome: 'Cubos', icone: '🧊' },
    { id: 'tiras', nome: 'Tiras', icone: '🥓' },
  ];

  const cutsCostelinhaPorco: Corte[] = [
    { id: 'peca', nome: 'Peça Inteira', icone: '🥩' },
    { id: 'grelha', nome: 'Grelha', icone: '🔥' },
  ];

  const cutsGroundOnly: Corte[] = [
    { id: 'moido', nome: 'Moído', icone: '🍔' },
  ];

  // === FUNÇÃO DE MAPEAMENTO INTELIGENTE DE CORTES ===
  const getCutsForProduct = (product: Produto): Corte[] => {
    const pecaInteiraIds = ["1", "41", "92", "93", "96", "61", "62", "88", "97", "98"]; 
    
    if (pecaInteiraIds.includes(product.id)) return cutsPecaInteiraCarne;
    if (product.category === 'Linguiças') return cutsPecaInteiraCarne;
    if (product.id === "46") return cutsGroundOnly; 
    if (product.id === "47") return cutsCostela; 
    
    if (product.category === 'Bovinos') return cutsBeefStandard; 
    
    if (product.category === 'Suínos') {
      if (product.nome === 'Panceta') return cutsPanceta;
      if (product.nome.includes('Costelinha')) return cutsCostelinhaPorco;
      return cutsSuinoStandard; 
    }

    if (product.category === 'Frangos') {
      const chickenStandardNames = ["Filé de Peito", "Peito de Frango"];
      if (chickenStandardNames.includes(product.nome)) return cutsBeefStandard;
      return cutsPecaInteiraFrango; 
    }

    return cutsPecaInteiraCarne;
  };

  const opcoesPeso = [300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000];

  const [statusLoja, setStatusLoja] = useState({ texto: 'CARREGANDO...', cor: 'bg-zinc-200 text-zinc-700' });

  useEffect(() => {
    const verificarStatus = () => {
      const agora = new Date();
      const dia = agora.getDay();
      const hora = agora.getHours();
      const minutos = agora.getMinutes();
      const tempoAtual = hora + (minutos / 60);

      let estaAberto = false;

      if (dia >= 1 && dia <= 6) {
        if (tempoAtual >= 7 && tempoAtual < 19.5) estaAberto = true;
      } else if (dia === 0) {
        if (tempoAtual >= 7 && tempoAtual < 12.5) estaAberto = true;
      }

      if (estaAberto) {
        setStatusLoja({ texto: 'Aberto Agora', cor: 'bg-emerald-600 text-white' });
      } else {
        setStatusLoja({ texto: 'Fechado', cor: 'bg-red-600 text-white' });
      }
    };

    verificarStatus();
    const intervalo = setInterval(verificarStatus, 60000);
    return () => clearInterval(intervalo);
  }, []);

 // --- BASE DE DADOS DE PRODUTOS ---
  const produtos: Produto[] = [
    // BOVINOS 
    { id: "1", nome: "Picanha Premium", preco: 0, imagem: "/picanha.png", descricao: "Corte nobre com capa de gordura uniforme. O peso e o valor final da peça serão confirmados no WhatsApp.", unidade: "kg", category: "Bovinos", sobConsulta: true },
    { id: "2", nome: "Contra Filé", preco: 59.90, imagem: "/contrafile.png", descricao: "Corte clássico, macio e versátil, ideal para bifes e grelha.", unidade: "kg", category: "Bovinos" },
    { id: "10", nome: "Alcatra", preco: 59.90, imagem: "/alcatra.png", descricao: "Carne magra de primeira, excelente para assados e bifes.", unidade: "kg", category: "Bovinos" },
    { id: "37", nome: "Maminha", preco: 59.90, imagem: "/maminha.png", descricao: "Corte super suculento e macio, perfeito para assar no forno ou na brasa.", unidade: "kg", category: "Bovinos" },
    { id: "38", nome: "Coxão Mole", preco: 49.90, imagem: "/coxao-mole.png", descricao: "Carne macia do dia a dia, ideal para bifes, assados e carne moída.", unidade: "kg", category: "Bovinos" },
    { id: "39", nome: "Miolo da Paleta", preco: 49.90, imagem: "/miolo-paleta.png", descricao: "Corte saboroso e muito macio, ótimo para cozidos e bifes do dia a dia.", unidade: "kg", category: "Bovinos" },
    { id: "40", nome: "Lagarto", preco: 45.90, imagem: "/lagarto.png", descricao: "Corte magro e bem delineado, a melhor opção para rosbife e carne louca.", unidade: "kg", category: "Bovinos" },
    { id: "41", nome: "Bife a Rolê", preco: 47.90, imagem: "/bife-role.png", descricao: "Bifes finos já preparados no ponto certo para você rechear e enrolar.", unidade: "kg", category: "Bovinos" },
    { id: "42", nome: "Coxão Duro", preco: 47.90, imagem: "/coxao-duro.png", descricao: "Corte de fibras mais longas, perfeito para carnes de panela e cozidos lentos.", unidade: "kg", category: "Bovinos" },
    { id: "43", nome: "Braço da Paleta", preco: 42.90, imagem: "/braco-paleta.png", descricao: "Corte saboroso e nutritivo, excelente para ensopados e caldos.", unidade: "kg", category: "Bovinos" },
    { id: "44", nome: "Acém", preco: 42.90, imagem: "/acem.png", descricao: "Carne super versátil, a campeã para o preparo de carne de panela e moída.", unidade: "kg", category: "Bovinos" },
    { id: "45", nome: "Músculo", preco: 39.90, imagem: "/musculo.png", descricao: "Rico em colágeno, indispensável para caldos, sopas e cozidos de inverno.", unidade: "kg", category: "Bovinos" },
    { id: "46", nome: "Kibe", preco: 36.90, imagem: "/kibe.png", descricao: "Massa pronta e bem temperada para kibe, feita com carne de primeira qualidade.", unidade: "kg", category: "Bovinos" },
    { id: "47", nome: "Costela de Boi", preco: 24.90, imagem: "/costela-boi.png", descricao: "Clássico raiz, sabor intenso e textura que desmancha após assada.", unidade: "kg", category: "Bovinos" },
    { id: "11", nome: "Fraldinha", preco: 42.90, imagem: "/fraldinha.png", descricao: "Corte muito suculento e de fibras soltas, excelente na grelha.", unidade: "kg", category: "Bovinos" },
    { id: "13", nome: "Patinho", preco: 49.90, imagem: "/patinho.png", descricao: "Carne magra de primeira com pouca gordura. Ideal para bifes, picadinhos ou moída na hora.", unidade: "kg", category: "Bovinos" },

    // SUÍNOS
    { id: "92", nome: "Bacon", preco: 32.90, imagem: "/bacon.png", descricao: "Bacon defumado em peça, com equilíbrio perfeito de carne e gordura.", unidade: "kg", category: "Suínos" },
    { id: "93", nome: "Calabresa", preco: 32.90, imagem: "/calabresa.png", descricao: "Linguiça calabresa defumada de alta qualidade, ideal para porções.", unidade: "kg", category: "Suínos" },
    { id: "14", nome: "Costelinha de Porco", preco: 33.90, imagem: "/costelinha-porco.png", descricao: "Corte super saboroso, a queridinha para assar no forno ou churrasqueira.", unidade: "kg", category: "Suínos" },
    { id: "15", nome: "Lombo", preco: 24.90, imagem: "/lombo.png", descricao: "Carne suína nobre e magra, muito versátil para assar e fatiar.", unidade: "kg", category: "Suínos" },
    { id: "9", nome: "Panceta", preco: 29.90, imagem: "/panceta.png", descricao: "Corte suculento para fazer aquele torresmo pururuca crocante perfeito.", unidade: "kg", category: "Suínos" },
    { id: "16", nome: "Pernil", preco: 24.90, imagem: "/pernil.png", descricao: "Carne macia e com ótimo rendimento, excelente para o assado de domingo.", unidade: "kg", category: "Suínos" },
    { id: "96", nome: "Suã", preco: 19.90, imagem: "/sua.png", descricao: "Corte tradicional com osso, traz um sabor marcante para pratos caipiras.", unidade: "kg", category: "Suínos" },

    // LINGUIÇAS
    { id: "4", nome: "Linguiça Toscana", preco: 28.90, imagem: "/linguica-toscana.png", descricao: "A tradicional do churrasco, super suculenta e com tempero no ponto.", unidade: "kg", category: "Linguiças" },
    { id: "17", nome: "Linguiça Apimentada", preco: 28.90, imagem: "/linguica-apimentada.png", descricao: "Nossa toscana com um toque picante especial que não pode faltar.", unidade: "kg", category: "Linguiças" },
    { id: "86", nome: "Linguiça de Frango (Comum)", preco: 30.00, imagem: "/linguica-frango-comum.png", descricao: "Mais leve, suave e saborosa. Feita com cortes de frango selecionados.", unidade: "kg", category: "Linguiças" },
    { id: "87", nome: "Linguiça de Frango Recheada", preco: 45.00, imagem: "/linguica-frango-recheada.png", descricao: "Linguiça de frango artesanal com aquele recheio irresistível e cremoso.", unidade: "kg", category: "Linguiças" },
    { id: "94", nome: "Linguiça Suína (Comum)", preco: 28.90, imagem: "/linguica-suina-comum.png", descricao: "A autêntica linguiça de porco mineira, com aquele temperinho caseiro.", unidade: "kg", category: "Linguiças" },
    { id: "95", nome: "Linguiça Suína Recheada", preco: 45.00, imagem: "/linguica-suina-recheada.png", descricao: "Linguiça suína elevada ao próximo nível com nosso recheio especial.", unidade: "kg", category: "Linguiças" },

    // FRANGOS 
    { id: "3", nome: "Tulipa de Frango", preco: 32.90, imagem: "/tulipa.png", descricao: "O meio da asa temperado, carne suculenta e que doura fácil na brasa.", unidade: "kg", category: "Frangos" },
    { id: "21", nome: "Filé de Peito", preco: 29.90, imagem: "/file-peito.png", descricao: "Limpo, sem osso e sem pele. A escolha prática e saudável para o dia a dia.", unidade: "kg", category: "Frangos" },
    { id: "80", nome: "Asa de Frango", preco: 19.90, imagem: "/asa-frango.jpeg", descricao: "Corte tradicional que todos adoram, perfeito para petiscos e assados.", unidade: "kg", category: "Frangos" },
    { id: "81", nome: "Coraçãozinho de Frango", preco: 49.00, imagem: "/coracaozinho-frango.jpeg", descricao: "Limpos e frescos. A estrela dos aperitivos antes do prato principal.", unidade: "kg", category: "Frangos" },
    { id: "82", nome: "Coxa com Sobrecoxa", preco: 17.90, imagem: "/coxa-sobrecoxa.jpeg", descricao: "As partes mais suculentas do frango, garantem um assado macio e saboroso.", unidade: "kg", category: "Frangos" },
    { id: "97", nome: "Sobrecoxa", preco: 19.90, imagem: "/sobrecoxa.jpeg", descricao: "Corte suculento e versátil, excelente para assados ou ensopados.", unidade: "kg", category: "Frangos" },
    { id: "83", nome: "Coxinha da Asa", preco: 24.90, imagem: "/coxinha-asa.jpeg", descricao: "Os famosos 'drumets', pequenininhos, fáceis de fazer e super carnudos.", unidade: "kg", category: "Frangos" },
    { id: "84", nome: "Fígado de Frango", preco: 13.00, imagem: "/figado-frango.jpeg", descricao: "Fresco e fonte de ferro, excelente para refogados com cebola e patês.", unidade: "kg", category: "Frangos" },
    { id: "85", nome: "Frango a Passarinho", preco: 20.00, imagem: "/frango-passarinho.png", descricao: "Cortes pequenos e uniformes, perfeitos para empanar, fritar ou fazer ao molho.", unidade: "kg", category: "Frangos" },
    { id: "88", nome: "Medalhão de Frango", preco: 47.90, imagem: "/medalhao-frango.png", descricao: "Peito de frango enrolado caprichosamente na tira de bacon. Um espetáculo.", unidade: "kg", category: "Frangos" },
    { id: "89", nome: "Moela", preco: 20.00, imagem: "/moela.jpeg", descricao: "Muito bem limpas, a escolha certa para preparar aquele ensopado de boteco.", unidade: "kg", category: "Frangos" },
    { id: "90", nome: "Pé de Frango", preco: 10.00, imagem: "/pe-frango.jpeg", descricao: "Muito rico em vitaminas e colágeno, dá substância e sabor a sopas e caldos.", unidade: "kg", category: "Frangos" },
    { id: "98", nome: "Dorso de Frango", preco: 8.00, imagem: "/dorso.jpeg", descricao: "Ótimo para o preparo de caldos nutritivos e sopas.", unidade: "kg", category: "Frangos" },
    { id: "91", nome: "Rocambole", preco: 45.90, imagem: "/rocambole.jpeg", descricao: "Rocambole de frango generosamente recheado. É só levar ao forno e servir.", unidade: "un", category: "Frangos" },

    // ESPETINHOS (Vendidos por Unidade)
    { id: "50", nome: "Espetinho de Alcatra", preco: 7.00, imagem: "/espeto-alcatra.jpeg", descricao: "Cubos padronizados de alcatra macia, prontinhos para sua grelha.", unidade: "un", category: "Espetinhos" },
    { id: "51", nome: "Espetinho de Contra Filé", preco: 7.00, imagem: "/espeto-contrafile.jpeg", descricao: "A excelência e suculência do contra filé já cortado e no espeto.", unidade: "un", category: "Espetinhos" },
    { id: "101", nome: "Espetinho de Picanha", preco: 9.50, imagem: "/espeto-picanha.png", descricao: "O corte mais nobre do churrasco, agora em um espetinho irresistível.", unidade: "un", category: "Espetinhos" },
    { id: "52", nome: "Espetinho de Medalhão de Frango", preco: 6.00, imagem: "/espeto-medalhao-frango.png", descricao: "O queridinho medalhão de frango com bacon na comodidade do palito.", unidade: "un", category: "Espetinhos" },
    { id: "53", nome: "Espetinho de Linguiça Tradicional", preco: 4.00, imagem: "/espeto-linguica.jpeg", descricao: "Nossa saborosa linguiça porcionada no palito, asse rápido e sem trabalho.", unidade: "un", category: "Espetinhos" },
    { id: "103", nome: "Espetinho de Linguiça Recheada", preco: 5.00, imagem: "/espeto-linguica-recheada.png", descricao: "A deliciosa linguiça recheada, pronta para a grelha.", unidade: "un", category: "Espetinhos" },
    { id: "54", nome: "Espetinho de Queijo Coalho - 6 Unid.", preco: 25.00, imagem: "/espeto-queijo-coalho.jpeg", descricao: "Pacote com 6 espetos generosos de queijo coalho para dourar na brasa.", unidade: "un", category: "Espetinhos" },
    { id: "55", nome: "Espeto de Fraldinha", preco: 5.00, imagem: "/espeto-fraldinha.jpeg", descricao: "Espeto que derrete na boca com o sabor característico da nossa fraldinha.", unidade: "un", category: "Espetinhos" },
    { id: "56", nome: "Espeto Coxão Mole", preco: 6.00, imagem: "/espeto-coxao-mole.png", descricao: "Carne bovina bastante macia, opção de espetinho mais magro e saboroso.", unidade: "un", category: "Espetinhos" },
    { id: "57", nome: "Espeto Panceta", preco: 5.00, imagem: "/espeto-panceta.png", descricao: "Cubos de panceta suína que pururucam lindamente na sua churrasqueira.", unidade: "un", category: "Espetinhos" },
    { id: "102", nome: "Espetinho de Costela", preco: 6.00, imagem: "/espeto-costela.png", descricao: "Costela macia e saborosa no espeto.", unidade: "un", category: "Espetinhos" },
    { id: "58", nome: "Espeto de Tulipa", preco: 6.00, imagem: "/espeto-tulipa.png", descricao: "Asinhas de frango invertidas e bem temperadas, espetadas para fácil manuseio.", unidade: "un", category: "Espetinhos" },
    { id: "105", nome: "Espetinho de Tulipa Mostarda e Mel", preco: 8.00, imagem: "/espeto-tulipa-mostarda.png", descricao: "Tulipas com o toque agridoce perfeito da mostarda e mel.", unidade: "un", category: "Espetinhos" },
    { id: "104", nome: "Espetinho de Coração de Frango", preco: 6.00, imagem: "/espeto-coracao.png", descricao: "Coraçõezinhos bem temperados e assados no ponto certo.", unidade: "un", category: "Espetinhos" },
    { id: "59", nome: "Espeto de Pernil", preco: 4.75, imagem: "/espeto-pernil.png", descricao: "Cubinhos caprichados de carne de porco macia com nosso tempero mineiro.", unidade: "un", category: "Espetinhos" },

    // FRIOS E ACOMPANHAMENTOS (Vendidos por Unidade/Kg)
    { id: "5", nome: "Pão de Alho (Pacote)", preco: 18.00, imagem: "/pao-de-alho.png", descricao: "Pacotinho prático com 400g. O melhor pão de alho para acompanhar as carnes.", unidade: "un", category: "Frios e Acompanhamentos" },
    { id: "24", nome: "Queijo Coalho", preco: 25.00, imagem: "/queijo-coalho-tradicional.png", descricao: "Pacote com 6 espetos maravilhosos, perfeito para dourar na churrasqueira.", unidade: "un", category: "Frios e Acompanhamentos" },
    { id: "6", nome: "Carvão 3kg", preco: 19.00, imagem: "/carvao.png", descricao: "Carvão vegetal selecionado com queima duradoura e que faz pouca fumaça.", unidade: "un", category: "Frios e Acompanhamentos" },
    { id: "60", nome: "Coxinha para Fritar (500g)", preco: 32.90, imagem: "/coxinha-fritar.png", descricao: "Massa super sequinha e recheio farto de frango desfiado. Pacote com 500g, é só chegar e fritar.", unidade: "un", category: "Frios e Acompanhamentos" },
    { id: "61", nome: "Mussarela", preco: 59.90, imagem: "/mussarela.png", descricao: "Mussarela fatiada ou em pedaço de alta qualidade. Derrete perfeitamente.", unidade: "kg", category: "Frios e Acompanhamentos" },
    { id: "62", nome: "Queijo Meia Cura", preco: 59.90, imagem: "/queijo-meia-cura.png", descricao: "Tradicional queijo minas curado, com sabor mais firme. Combina com um bom café.", unidade: "kg", category: "Frios e Acompanhamentos" },
    { id: "63", nome: "Queijo Palito", preco: 19.00, imagem: "/queijo-palito.png", descricao: "Queijo tipo minas em formato divertido de palito, é o lanche ideal das crianças.", unidade: "un", category: "Frios e Acompanhamentos" },
    { id: "64", nome: "Queijo Nozinho", preco: 19.00, imagem: "/queijo-nozinho.png", descricao: "As famosas bolinhas trançadas em nó de queijo minas, super frescas e macias.", unidade: "un", category: "Frios e Acompanhamentos" },
    { id: "65", nome: "Queijo Fresco (Frescal)", preco: 48.90, imagem: "/queijo-fresco.png", descricao: "O clássico frescal, suave e molhadinho, essencial no café da manhã brasileiro.", unidade: "kg", category: "Frios e Acompanhamentos" },

    // ITENS DO IFOOD (DIA A DIA E KITS)
    { id: "26", nome: "Bandeja de Almôndega", preco: 20.00, imagem: "/almondega.png", descricao: "Almôndegas artesanais super suculentas, já moldadas para ir direto ao molho.", unidade: "un", category: "Dia a Dia" },
    { id: "27", nome: "Bandeja de Filé de Peixe 500g", preco: 25.00, imagem: "/file-peixe.png", descricao: "Filés de peixe selecionados, levinhos e prontos para fritar ou assar com batatas.", unidade: "un", category: "Dia a Dia" },
    
    // KITS E SAUDÁVEL
    { id: "28", nome: "Kit Essencial #1", preco: 99.00, imagem: "/kit-essencial-1.jpg", descricao: "500g Coxinha da Asa / 500g Carne Moída / 500g Tekitos / 500g Pernil em Cubos / 500g Acém em Cubos / 500g Frango a Passarinho", unidade: "un", category: "Kits" },
    { id: "29", nome: "Kit Praticidade #2", preco: 130.00, imagem: "/kit-praticidade-2.jpg", descricao: "500g Coxinha da Asa / 500g Linguiça / 500g Carne Moída / 500g Tulipa / 500g Bife de Porco / 500g Filé de Frango / 500g Carne para Cozinhar / 500g Frango a Passarinho", unidade: "un", category: "Kits" },
    { id: "30", nome: "Kit Semanal #3", preco: 145.00, imagem: "/kit-semanal-3.jpg", descricao: "500g Carne Moída / 500g Linguiça / 500g Filé de Frango / 500g Bife de Boi / 1 Bdj Almôndegas / 500g Frango a Passarinho / 500g Acém em Cubos / 500g Pernil em Cubos", unidade: "un", category: "Kits" },
    { id: "31", nome: "Kit Fitness #1", preco: 109.90, imagem: "/kit-fitness-1.jpg", descricao: "1 Bdj Almôndegas / 500g Bife de Patinho / 500g Filé de Frango / 500g Patinho Moído / 1 Bdj Filé de Peixe", unidade: "un", category: "Kits" },
    { id: "32", nome: "Kit Fitness #2", preco: 109.90, imagem: "/kit-fitness-2.jpg", descricao: "1 Bdj Almôndegas / 500g Bife de Patinho / 500g Filé de Frango / 500g Patinho Moído / 1 Bdj Hambúrguer", unidade: "un", category: "Kits" },
    { id: "33", nome: "Kit Hambúrguer", preco: 79.00, imagem: "/kit-hamburguer.jpg", descricao: "6 Unidades Pães Brioche / 12 Fat Queijo Cheddar / 12 Fatias Bacon / 6 Unidades Hambúrguer Artesanal 120g", unidade: "un", category: "Kits" },
    { id: "34", nome: "Kit Churrasco - 10 Pessoas", preco: 149.00, imagem: "/kit-churrasco-10.jpg", descricao: "800g Contra Filé / 800g Coxão Mole / 500g Tulipa / 500g Panceta / 800g Linguiça / 500g Pernil", unidade: "un", category: "Kits" },
    { id: "35", nome: "Kit Churrasco 10 Pessoas + Carvão", preco: 154.90, imagem: "/kit-churrasco-10-carvao.jpg", descricao: "600g Contra Filé / 600g Coxão Mole / 500g Tulipa / 1 Bdj Pão de Alho / 600g Linguiça / 600g Pernil + 1 Pct Carvão", unidade: "un", category: "Kits" },
    { id: "36", nome: "Kit Churrasco - 12 Pessoas", preco: 219.90, imagem: "/kit-churrasco-12.jpg", descricao: "800g Panceta / 800g Contra Filé Paraguaio / 800g Alcatra / 800g Linguiça Recheada / 1 Pct Tulipa C/ Mostarda e Mel", unidade: "un", category: "Kits" },
  ];

  const categoriasMenu = ['Todos', 'Kits', 'Dia a Dia', 'Bovinos', 'Suínos', 'Frangos', 'Linguiças', 'Espetinhos', 'Frios e Acompanhamentos'];
  const produtosFiltrados = categoriaAtiva === 'Todos' ? produtos : produtos.filter(p => p.category === categoriaAtiva);

  // --- LÓGICAS DO CARRINHO ---
  const adicionarAoCarrinho = (produto: Produto, quantidadeDesejada: number = 1, corte?: string, porcoes?: number, instrucao?: string) => {
    
    // 🔥 EVENTO: AVISA O GOOGLE QUE ALGO FOI PRO CARRINHO
    trackEvent('add_to_cart', 'Carrinho', produto.nome, produto.preco);

    setCarrinho((carrinhoAtual) => {
      const itemIndex = carrinhoAtual.findIndex(item => 
        item.id === produto.id && 
        item.corte === corte && 
        item.instrucao === instrucao && 
        item.porcoes === porcoes
      );

      if (itemIndex > -1) {
        const novoCarrinho = [...carrinhoAtual];
        novoCarrinho[itemIndex].quantidade = Number((novoCarrinho[itemIndex].quantidade + quantidadeDesejada).toFixed(3));
        return novoCarrinho;
      }

      return [...carrinhoAtual, { 
        ...produto, 
        idCarrinho: Math.random().toString(36).substring(2, 9),
        quantidade: Number(quantidadeDesejada.toFixed(3)),
        corte,
        porcoes,
        instrucao
      }];
    });
  };

  const removerDoCarrinho = (idCarrinho: string, quantidadeRemover: number = 1) => {
    setCarrinho((carrinhoAtual) => {
      return carrinhoAtual.map(item => {
        if (item.idCarrinho === idCarrinho) {
          return { ...item, quantidade: Number((item.quantidade - quantidadeRemover).toFixed(3)) };
        }
        return item;
      }).filter(item => item.quantidade > 0); 
    });
  };

  const excluirItemDoCarrinho = (idCarrinho: string) => {
    setCarrinho((carrinhoAtual) => carrinhoAtual.filter(item => item.idCarrinho !== idCarrinho));
  };

  const limparCarrinho = () => {
    if (window.confirm("Tem certeza que deseja esvaziar todo o seu pedido?")) {
      setCarrinho([]);
    }
  };

  const totalItens = carrinho.length;
  const valorTotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  const temItemSobConsulta = carrinho.some(item => item.sobConsulta);

  // --- FUNÇÕES DO MODAL DE PRODUTOS ---
  const abrirModalProduto = (produto: Produto) => {
    // 🔥 EVENTO: AVISA O GOOGLE QUE O CLIENTE OLHOU A CARNE
    trackEvent('view_item', 'Produto', produto.nome, produto.preco);

    if (produto.unidade === 'kg') {
      setCortesDisponiveis(getCutsForProduct(produto));
      setProdutoModal(produto);
      setEtapaModal(1);
      setCorteSelecionado('');
      setPesoSelecionadoGramas(500);
      setPorcoes(1);
      setInstrucao('');
      setInstrucaoAberta(false);
    } else {
      adicionarAoCarrinho(produto, 1);
    }
  };

  const confirmarCorte = (nomeCorte: string) => {
    setCorteSelecionado(nomeCorte);
    setEtapaModal(2); 
  };

  const finalizarAdicaoModal = () => {
    if (produtoModal) {
      if (produtoModal.sobConsulta) {
        adicionarAoCarrinho(produtoModal, 1, corteSelecionado, 1, instrucao);
      } else {
        adicionarAoCarrinho(produtoModal, pesoSelecionadoGramas / 1000, corteSelecionado, porcoes, instrucao);
      }
      setProdutoModal(null);
    }
  };

  const finalizarPedido = () => {
    if(carrinho.length === 0) return;

    if (tipoPedido === 'entrega' && endereco.trim() === '') {
      alert("Por favor, preencha o seu endereço para que possamos realizar a entrega.");
      return;
    }

    // 🔥 EVENTO: AVISA O GOOGLE QUE O CLIENTE TENTOU FECHAR A COMPRA
    trackEvent('begin_checkout', 'Venda', 'Iniciou Finalização WhatsApp', valorTotal);

    const numeroWhatsApp = "5535999323530"; 
    let mensagem = "*NOVO PEDIDO - CASA DE CARNES E FRANGOS ALFENENSE*\n\n";
    
    carrinho.forEach(item => {
      const obsTexto = item.instrucao ? `\n    ↳ *Obs:* ${item.instrucao}` : '';
      const corteTexto = item.corte ? ` (${item.corte})` : '';

      if (item.sobConsulta) {
        mensagem += `• ${item.quantidade}x ${item.nome}${corteTexto} - *A Consultar*${obsTexto}\n`;
      } else if (item.unidade === 'kg') {
        const pesoFormatado = `${item.quantidade.toFixed(3).replace('.', ',')}kg`;
        const porcoesTexto = item.porcoes && item.porcoes > 1 ? ` - Div. em ${item.porcoes} porções` : '';
        const precoItem = (item.preco * item.quantidade).toFixed(2).replace('.', ',');
        mensagem += `• ${pesoFormatado} ${item.nome}${corteTexto} - R$ ${precoItem}${porcoesTexto}${obsTexto}\n`;
      } else {
        mensagem += `• ${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
      }
      
      if (item.id.includes('kit-custom')) {
        mensagem += `    ↳ *Itens:* ${item.descricao}\n`;
      }
    });

    const taxaEntrega = tipoPedido === 'entrega' ? 8 : 0;
    const valorFinal = valorTotal + taxaEntrega;

    if (temItemSobConsulta) {
      mensagem += `\n*Valor Parcial: R$ ${valorTotal.toFixed(2).replace('.', ',')}*\n_(Sem contar os itens com preço a consultar)_\n\n`;
    } else {
      mensagem += `\n*Subtotal:* R$ ${valorTotal.toFixed(2).replace('.', ',')}\n`;
      if (tipoPedido === 'entrega') {
        mensagem += `*Taxa de Entrega:* R$ 8,00\n`;
      }
      mensagem += `*Valor Total:* R$ ${valorFinal.toFixed(2).replace('.', ',')}\n\n`;
    }
    
    mensagem += `*Forma de Recebimento:* ${tipoPedido === 'entrega' ? 'Entrega' : 'Retirada na Loja'}\n`;
    if (tipoPedido === 'entrega') {
      mensagem += `*Endereço:* ${endereco}\n`;
    }

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-zinc-100 pb-28 font-sans text-zinc-900">
      
      {/* CABEÇALHO */}
      <header className="bg-red-600 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="font-extrabold text-lg md:text-2xl tracking-tight truncate max-w-[65%] md:max-w-none text-white">
          CASA DE CARNES E FRANGOS ALFENENSE
        </div>
        <div className={`text-[10px] md:text-xs px-3 py-1 rounded-full font-bold shadow-sm whitespace-nowrap tracking-wider uppercase transition-colors duration-500 ${statusLoja.cor}`}>
          {statusLoja.texto}
        </div>
      </header>

      {/* BANNER PRINCIPAL */}
      <section className="w-full flex justify-center p-4 md:p-6 pb-2">
        <img 
          src="/banner.png" 
          alt="Banner Casa de Carnes Alfenense" 
          className="w-full max-w-4xl h-auto object-cover rounded-2xl shadow-md border border-zinc-200" 
          onError={(e) => { 
            const target = e.currentTarget;
            target.style.display = 'none'; 
            if (target.parentElement) {
              target.parentElement.innerHTML = '<div class="p-10 text-center text-zinc-500 text-sm bg-white rounded-2xl border border-zinc-200 shadow-sm">Salve sua imagem como banner.png na pasta public</div>'; 
            }
          }} 
        />
      </section>

      {/* BOTÕES RÁPIDOS */}
      <section className="px-4 py-2 flex justify-center gap-3 max-w-4xl mx-auto">
        <a href="https://www.ifood.com.br/delivery/alfenas-mg/casa-de-carnes-e-frangos-alfenense-aparecida/ca0df60d-59b9-4309-9616-02ab67e4aa99?utm_medium=share" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#ea1d2c] hover:bg-[#c91825] text-white flex flex-col md:flex-row items-center justify-center gap-2 py-3 rounded-xl font-bold shadow-md transition-transform active:scale-95">
          <img src="/ifood-logo.jpg" alt="iFood" className="w-6 h-6 object-contain rounded-md" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="text-sm md:text-base">Pedir no iFood</span>
        </a>
        <a href="https://wa.me/5535999323530?text=Ol%C3%A1%2C%20gostaria%20de%20fazer%20um%20pedido!" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#25D366] hover:bg-[#1ebd59] text-white flex flex-col md:flex-row items-center justify-center gap-2 py-3 rounded-xl font-bold shadow-md transition-transform active:scale-95">
          <img src="/whatsapp-logo.jpg" alt="WhatsApp" className="w-6 h-6 object-contain rounded-md" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <span className="text-sm md:text-base">Pedir no WhatsApp</span>
        </a>
      </section>

      {/* 📦 SEÇÃO: MONTADOR DE KIT */}
      <section className="p-4 md:px-6 md:max-w-4xl md:mx-auto">
        <div className="border border-zinc-200 rounded-2xl p-6 flex flex-col items-center text-center bg-zinc-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-8xl">📦</div>
          <h2 className="text-2xl font-black text-yellow-400 mb-2 relative z-10 tracking-tight">Monte seu Kit</h2>
          <p className="text-zinc-300 text-sm mb-6 relative z-10 leading-relaxed">Crie o combo perfeito para sua semana ou churrasco. Escolha os cortes, defina os pesos e garanta seu kit com praticidade.</p>
          <button onClick={() => setModalKitAberto(true)} className="w-full md:w-3/4 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition-all relative z-10 tracking-wide">
            CRIAR MEU KIT 🥩
          </button>
        </div>
      </section>

      {/* MENU DE CATEGORIAS */}
      <section className="py-3 bg-white border-y border-zinc-200 sticky top-[60px] md:top-[68px] z-20 shadow-sm">
        <div className="flex flex-wrap justify-center gap-2 px-5 max-w-5xl mx-auto">
          {categoriasMenu.map((categoria) => (
            <button key={categoria} onClick={() => setCategoriaAtiva(categoria)} className={`font-bold px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-all border ${categoriaAtiva === categoria ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'}`}>
              {categoria}
            </button>
          ))}
        </div>
      </section>

      {/* VITRINE DE PRODUTOS */}
      <section className="px-5 py-8 max-w-5xl mx-auto">
        <h2 className="text-xl font-extrabold text-zinc-900 mb-6 tracking-tight">{categoriaAtiva === 'Todos' ? 'Nosso Cardápio Completo' : `${categoriaAtiva}`}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {produtosFiltrados.map((produto) => (
            <div key={produto.id} className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-row h-[130px] transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer" onClick={() => abrirModalProduto(produto)}>
              <div className="w-1/3 bg-zinc-100 flex-shrink-0 relative overflow-hidden flex items-center justify-center border-r border-zinc-100">
                <img 
                  src={produto.imagem} 
                  alt={produto.nome} 
                  className="w-full h-full object-cover absolute inset-0" 
                  onError={(e) => { 
                    const target = e.currentTarget;
                    target.style.display = 'none'; 
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<span class="text-3xl text-zinc-300">📷</span>'; 
                    }
                  }} 
                />
              </div>
              <div className="w-2/3 p-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-zinc-900 leading-tight tracking-tight">{produto.nome}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-snug">{produto.descricao}</p>
                </div>
                <div className="flex justify-between items-end mt-3">
                  <div className="flex flex-col">
                    {produto.sobConsulta ? (
                       <span className="font-black text-amber-500 text-sm md:text-base leading-none mt-1 uppercase tracking-tighter">Sob Consulta</span>
                    ) : (
                       <>
                         <span className="font-black text-red-600 text-lg leading-none">R$ {produto.preco.toFixed(2).replace('.', ',')}</span>
                         <span className="text-[10px] text-zinc-400 mt-1">por {produto.unidade}</span>
                       </>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); abrirModalProduto(produto); }} 
                    className={`${produto.unidade === 'kg' ? 'bg-zinc-800 hover:bg-zinc-900' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm active:scale-95 transition-colors`}
                  >
                    {produto.unidade === 'kg' ? 'Escolher' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 BANNER CARNE ASSADA DE DOMINGO 🔥 */}
      <section className="px-5 py-4 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-red-800">
          <div className="absolute -right-10 -bottom-10 opacity-20 text-9xl">🔥</div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className="bg-yellow-400 text-red-900 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">Sob Encomenda</span>
              <h3 className="font-black text-2xl text-white tracking-tight">Carne Assada de Domingo</h3>
            </div>
            <p className="text-red-100 text-sm md:text-base leading-relaxed">
              A folga do fogão que sua família merece! Assamos o seu corte preferido <strong className="text-yellow-300 font-black">exclusivamente sob encomenda</strong>. Reserve com antecedência e garanta um almoço espetacular sem trabalho nenhum.
            </p>
            <p className="text-xs text-red-200 mt-3 font-medium flex items-center justify-center md:justify-start gap-1">
              <span>⚠️</span> Encomendas limitadas para garantir o nosso padrão de qualidade.
            </p>
          </div>
          
          <div className="w-full md:w-auto relative z-10">
            <a 
              href="https://wa.me/5535999323530?text=Ol%C3%A1%21%20Gostaria%20de%20fazer%20uma%20encomenda%20de%20carne%20assada%20para%20este%20domingo%21" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-red-950 font-black py-4 px-8 rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-transform active:scale-95 uppercase tracking-wide whitespace-nowrap"
            >
              <span>Fazer Encomenda</span>
              <span className="text-xl">🍗</span>
            </a>
          </div>
        </div>
      </section>

      {/* BANNER GRUPO VIP */}
      <section className="px-5 py-4 max-w-5xl mx-auto">
        <div className="bg-emerald-800 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-emerald-700">
          <div className="absolute -left-10 -bottom-10 opacity-10 text-9xl">💬</div>
          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className="bg-yellow-400 text-zinc-950 text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">Exclusivo</span>
              <h3 className="font-black text-2xl text-white tracking-tight">Clube VIP WhatsApp ⭐</h3>
            </div>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">Faça parte da nossa comunidade VIP! Receba <strong className="text-yellow-300">ofertas relâmpago</strong>, cortes especiais em primeira mão e participe de enquetes sobre nossos novos kits.</p>
          </div>
          <div className="w-full md:w-auto relative z-10">
            <a href="https://chat.whatsapp.com/EtxjmUvN4AOHoAtcOl0NQ8" target="_blank" rel="noopener noreferrer" className="flex-1 items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-black py-4 px-8 rounded-xl shadow-md transition-transform active:scale-95 uppercase tracking-wide whitespace-nowrap">
              <span>Entrar no Grupo</span>
              <span className="text-xl">📲</span>
            </a>
          </div>
        </div>
      </section>

      {/* LOCALIZAÇÃO E REDES SOCIAIS */}
      <section className="px-5 py-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col">
          <h3 className="font-black text-xl text-zinc-900 mb-4 flex items-center gap-2">📍 Como Chegar</h3>
          <div className="w-full h-48 bg-zinc-100 rounded-xl overflow-hidden mb-4 relative shadow-inner">
            <iframe src="https://www.google.com/maps?q=Rua+Carlos+Chagas,+196+-+Aparecida,+Alfenas+-+MG&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <p className="text-zinc-600 text-sm mb-4 flex-1">Rua Carlos Chagas, 196 - Bairro Aparecida, Alfenas/MG</p>
          <a href="https://maps.app.goo.gl/LzYTXCVqryzAGGrH9" target="_blank" rel="noopener noreferrer" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-colors text-center text-sm active:scale-95">Abrir Rota no Celular</a>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-gradient-to-tr from-yellow-300 via-red-300 to-purple-300 blur-3xl opacity-30 pointer-events-none"></div>
          <h3 className="font-black text-xl text-zinc-900 mb-2 flex items-center gap-2 relative z-10">📸 Nosso Instagram</h3>
          <p className="text-zinc-500 text-sm mb-6 relative z-10">Acompanhe nossas ofertas, bastidores e veja nossas carnes de primeira bem de perto!</p>
          <div className="flex-1 flex flex-col justify-center items-center relative z-10 mb-6 mt-2">
             <div className="w-24 h-24 bg-zinc-100 rounded-full border-4 border-white shadow-[0_0_0_2px_#e1306c] p-1 mb-3">
               <img src="/logo.png" alt="Instagram" className="w-full h-full rounded-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
             </div>
             <span className="font-black text-lg text-zinc-900">@casadecarnes_frangos.alfenense</span>
             <span className="text-xs text-zinc-500 font-medium">Carnes Premium • Kits • Assados</span>
          </div>
          <a href="https://www.instagram.com/casadecarnes_frangos.alfenense?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-95 text-white font-black py-3 rounded-xl transition-opacity text-center text-sm shadow-md active:scale-95 uppercase tracking-wide">Seguir no Instagram</a>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="bg-zinc-900 text-zinc-400 px-5 py-12 mt-4 rounded-t-3xl border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-black text-xl mb-4 text-white tracking-tight">📍 Nossa Loja</h3>
          <p className="text-sm mb-1 text-zinc-300">Rua Carlos Chagas, 196 - Bairro Aparecida</p>
          <p className="text-sm mb-4 text-zinc-300">Alfenas/MG</p>
          <p className="text-sm mb-2 flex items-center gap-2"><span className="text-zinc-400">WhatsApp:</span><span className="font-bold text-white">(35) 9 9932-3530</span></p>
          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6">
            <div className="flex justify-between text-sm"><span className="text-zinc-400">Segunda a Sábado</span><span className="font-bold text-amber-400">07h00 às 19h30</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">Domingo</span><span className="font-bold text-amber-400">07h00 às 12h30</span></div>
          </div>

          {/* === ASSINATURA DO DESENVOLVEDOR === */}
          <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 Casa de Carnes e Frangos Alfenense.</p>
            <p className="flex items-center gap-1">
              Desenvolvido por 
              <a 
                href="https://www.linkedin.com/in/lucas-eduardo-vieira-ferreira-415a26364/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white font-bold hover:text-amber-400 transition-colors"
              >
                Lucas Vieira Ferreira
              </a>
            </p>
          </div>
          {/* =================================== */}
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 🥩 MODAL DE DETALHES DO PRODUTO (CORTES E PESO) */}
      {/* ========================================================= */}
      {produtoModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full md:w-[600px] md:rounded-3xl rounded-t-3xl h-[90vh] md:h-auto max-h-[95vh] flex flex-col shadow-2xl border border-zinc-200 animate-in slide-in-from-bottom-full duration-300 overflow-hidden">
            
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-white z-10 sticky top-0">
              <button onClick={() => etapaModal === 2 ? setEtapaModal(1) : setProdutoModal(null)} className="flex items-center text-zinc-600 font-bold hover:text-zinc-900 transition-colors">
                <span className="mr-1 text-xl">‹</span> Voltar
              </button>
              <button onClick={() => setProdutoModal(null)} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 h-8 w-8 rounded-full font-bold transition-colors">X</button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* ETAPA 1: ESCOLHER CORTE */}
              {etapaModal === 1 && (
                <div className="flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-1/2 bg-gradient-to-br from-black to-yellow-600 h-48 md:h-full flex items-center justify-center p-6 shrink-0">
                    <img 
                      src={produtoModal.imagem} 
                      alt={produtoModal.nome} 
                      className="w-full h-auto max-h-48 object-contain drop-shadow-2xl" 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
                    />
                  </div>
                  
                  <div className="p-5 md:w-1/2 flex flex-col">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{produtoModal.nome}</h2>
                    
                    {produtoModal.sobConsulta ? (
                       <p className="text-amber-600 font-bold text-lg mt-1 mb-6">Preço e Peso sob consulta</p>
                    ) : (
                       <>
                         <p className="text-zinc-500 font-medium text-lg mt-1">R$ {produtoModal.preco.toFixed(2).replace('.', ',')} /{produtoModal.unidade === 'kg' ? 'Kg' : 'un'}</p>
                         {produtoModal.unidade === 'kg' && <p className="text-zinc-400 text-sm mb-6">R$ {(produtoModal.preco / 10).toFixed(2).replace('.', ',')} /100g</p>}
                       </>
                    )}
                    
                    <h3 className="font-bold text-zinc-800 mb-3 text-sm">Selecione um dos cortes abaixo</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {cortesDisponiveis.map((corte) => (
                        <button 
                          key={corte.id} 
                          onClick={() => confirmarCorte(corte.nome)}
                          className="flex flex-col items-center justify-center p-3 border border-zinc-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all active:scale-95 group bg-white shadow-sm"
                        >
                          <span className="text-sm font-bold text-zinc-700 group-hover:text-red-700">{corte.nome}</span>
                          <span className="text-2xl my-1">{corte.icone}</span>
                          <span className="text-[9px] text-zinc-400 uppercase tracking-tighter group-hover:text-red-400">Clique para adicionar</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 2: ESCOLHER PESO E DETALHES */}
              {etapaModal === 2 && (
                <div className="p-5 flex flex-col h-full bg-zinc-50">
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{corteSelecionado}</h2>
                  
                  {!produtoModal.sobConsulta && (
                    <p className="text-zinc-700 font-bold mt-2">Você gostaria de quantos gramas?</p>
                  )}
                  
                  <div className="flex items-start gap-2 text-xs text-zinc-600 mt-2 mb-6 bg-white p-3 rounded-lg border border-zinc-200">
                    <span className="text-amber-500 text-base">⚠️</span>
                    <p><strong>Produtos por kg podem variar na pesagem.</strong> Faremos o possível para chegar o mais próximo do seu pedido.</p>
                  </div>

                  {produtoModal.sobConsulta ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-zinc-200 shadow-sm mb-6 p-6 text-center">
                      <span className="text-4xl mb-3">⚖️</span>
                      <p className="text-zinc-800 font-black text-lg mb-2">Peça de peso variável</p>
                      <p className="text-zinc-500 text-sm">O valor final e o peso exato da sua peça serão confirmados diretamente pelo WhatsApp durante o atendimento do seu pedido.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-zinc-200 shadow-inner mb-6 max-h-60">
                        {opcoesPeso.map((peso) => (
                          <button 
                            key={peso} 
                            onClick={() => setPesoSelecionadoGramas(peso)}
                            className={`w-full text-center py-4 border-b last:border-0 border-zinc-100 font-bold transition-colors ${pesoSelecionadoGramas === peso ? 'bg-red-50 text-red-600 text-lg' : 'text-zinc-600 hover:bg-zinc-50'}`}
                          >
                            {peso >= 1000 ? `${(peso/1000).toFixed(1).replace('.0', '')}kg` : `${peso}g`}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-xl border border-zinc-200 shadow-sm shrink-0">
                        <span className="text-zinc-600 font-medium whitespace-nowrap">Separar em:</span>
                        <select 
                          value={porcoes} 
                          onChange={(e) => setPorcoes(Number(e.target.value))}
                          className="flex-1 bg-transparent text-zinc-900 font-bold outline-none cursor-pointer"
                        >
                          {[1,2,3,4,5,6].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'porção' : 'porções'}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="mb-4 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden shrink-0">
                    <button 
                      onClick={() => setInstrucaoAberta(!instrucaoAberta)} 
                      className="w-full flex justify-between items-center p-4 text-zinc-700 font-medium hover:bg-zinc-50 transition-colors"
                    >
                      Deixar instrução extra
                      <span className={`transform transition-transform ${instrucaoAberta ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {instrucaoAberta && (
                      <div className="p-4 pt-0 border-t border-zinc-100 bg-zinc-50">
                        <textarea 
                          value={instrucao}
                          onChange={(e) => setInstrucao(e.target.value)}
                          placeholder="Ex: Tirar a gordura, cortar mais fino..."
                          className="w-full p-3 rounded-lg border border-zinc-300 bg-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none h-24 text-zinc-800"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {etapaModal === 2 && (
              <div className="p-5 bg-white border-t border-zinc-200 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={finalizarAdicaoModal} 
                  className="w-full bg-black text-white font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform text-lg tracking-wide flex justify-between px-6 items-center"
                >
                  {produtoModal.sobConsulta ? (
                     <>
                        <span>Adicionar 1 Peça</span>
                        <span className="text-amber-400">Consultar</span>
                     </>
                  ) : (
                     <>
                        <span>Selecionar {pesoSelecionadoGramas >= 1000 ? `${(pesoSelecionadoGramas/1000).toFixed(1).replace('.0', '')}kg` : `${pesoSelecionadoGramas}g`}</span>
                        <span className="text-amber-400">R$ {((produtoModal.preco / 1000) * pesoSelecionadoGramas).toFixed(2).replace('.', ',')}</span>
                     </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📦 MODAL DO MONTADOR DE KIT */}
      {/* ========================================================= */}
      {modalKitAberto && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full md:w-[600px] md:rounded-3xl rounded-t-3xl h-[95vh] md:h-[85vh] flex flex-col shadow-2xl border border-zinc-200 animate-in slide-in-from-bottom-full duration-300 overflow-hidden">
            
            {/* Header do Modal */}
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-900 text-white shrink-0">
              <div>
                <h2 className="text-xl font-black tracking-tight text-yellow-400 flex items-center gap-2">
                  <span>📦</span> Kit Personalizado
                </h2>
                <p className="text-xs text-zinc-400 mt-1">Selecione no mínimo 6 opções para o seu combo.</p>
              </div>
              <button 
                onClick={() => setModalKitAberto(false)} 
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 h-8 w-8 rounded-full font-bold transition-colors"
              >
                X
              </button>
            </div>

            {/* Lista de Produtos do Kit */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 space-y-3">
              {produtosKit.map((prod) => {
                const qtd = selecaoKit[prod.id] || 0;
                
                return (
                  <div key={prod.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${qtd > 0 ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-zinc-200'}`}>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-zinc-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-zinc-200">
                        <img 
                          src={prod.imagem} 
                          alt={prod.nome} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 leading-tight">{prod.nome}</span>
                        <div className="flex gap-2 text-[10px] mt-1 items-center">
                          <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-medium border border-zinc-200">{prod.porcao}</span>
                          <span className="text-red-600 font-bold">R$ {prod.preco.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {qtd > 0 && (
                        <div className="flex items-center bg-white rounded-lg p-1 border border-zinc-200 shadow-sm">
                          <button onClick={() => alterarItemKit(prod.id, -1)} className="w-8 h-8 flex items-center justify-center text-red-600 font-bold hover:bg-zinc-50 rounded-md">-</button>
                          <span className="w-6 text-center font-black text-zinc-900">{qtd}</span>
                          <button onClick={() => alterarItemKit(prod.id, 1)} className="w-8 h-8 flex items-center justify-center text-emerald-600 font-bold hover:bg-zinc-50 rounded-md">+</button>
                        </div>
                      )}
                      {qtd === 0 && (
                        <button 
                          onClick={() => alterarItemKit(prod.id, 1)} 
                          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors active:scale-95"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 bg-white border-t border-zinc-200 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Itens Selecionados</span>
                  <span className={`text-xl font-black ${faltamParaKit > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {totalItensSelecionadosKit} {totalItensSelecionadosKit === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total do Kit</span>
                  <span className="text-2xl font-black text-zinc-900">R$ {valorTotalKit.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {faltamParaKit > 0 ? (
                <div className="w-full bg-zinc-200 text-zinc-500 font-bold py-4 rounded-xl text-center text-sm uppercase tracking-wide">
                  Selecione mais {faltamParaKit} {faltamParaKit === 1 ? 'item' : 'itens'} para liberar
                </div>
              ) : (
                <button 
                  onClick={adicionarKitCustomizadoAoCarrinho} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-md active:scale-95 transition-all text-lg tracking-wide uppercase flex justify-center items-center gap-2"
                >
                  Adicionar ao Carrinho 🛒
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* BOTÃO FLUTUANTE DO CARRINHO */}
      {/* ========================================================= */}
      {totalItens > 0 && !modalKitAberto && !produtoModal && (
        <div className="fixed bottom-6 left-0 right-0 px-5 z-40 animate-bounce">
          <button onClick={() => setCarrinhoAberto(true)} className="w-full max-w-md mx-auto bg-emerald-600 text-white p-4 rounded-2xl font-bold flex justify-between items-center shadow-xl active:scale-95 transition-transform border border-emerald-500">
            <div className="bg-emerald-800 px-3 py-1 rounded-full text-sm">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</div>
            <span className="tracking-wide">VER PEDIDO</span>
            <span className="text-lg">R$ {valorTotal.toFixed(2).replace('.', ',')} {temItemSobConsulta && <span className="text-emerald-300 ml-1 text-sm">+</span>}</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🛒 MODAL DO CARRINHO COM OPÇÃO DE ENTREGA */}
      {/* ========================================================= */}
      {carrinhoAberto && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full md:w-[450px] md:rounded-3xl rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 animate-in slide-in-from-bottom-full duration-300">
            
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50 rounded-t-3xl shrink-0">
              <h2 className="text-xl font-black text-zinc-900 tracking-tight">Seu Pedido 🛒</h2>
              <div className="flex items-center gap-3">
                {totalItens > 0 && (
                  <button onClick={limparCarrinho} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">
                    Esvaziar
                  </button>
                )}
                <button onClick={() => setCarrinhoAberto(false)} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-600 h-8 w-8 rounded-full font-bold transition-colors">X</button>
              </div>
            </div>
            
            {totalItens === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <span className="text-6xl mb-4">🛒</span>
                <h3 className="text-xl font-black text-zinc-900 mb-2">Seu carrinho está vazio</h3>
                <p className="text-zinc-500 text-sm mb-6">Que tal adicionar umas carnes premium para o seu churrasco?</p>
                <button onClick={() => setCarrinhoAberto(false)} className="bg-zinc-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-zinc-800 transition-colors">
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {carrinho.map((item) => {
                  const stepDeQuantidade = (item.unidade === 'kg' && !item.sobConsulta) ? 0.1 : 1;
                  
                  return (
                    <div key={item.idCarrinho} className="flex justify-between items-start border-b border-zinc-100 pb-5">
                      <div className="flex items-start gap-4 w-3/5">
                        <div className="w-12 h-12 bg-zinc-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-zinc-200 mt-1">
                          <img 
                            src={item.imagem} 
                            alt={item.nome} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 leading-tight">{item.nome} {item.corte && <span className="text-zinc-500 font-medium text-sm">({item.corte})</span>}</span>
                          {item.porcoes && item.porcoes > 1 && !item.sobConsulta && (
                            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-max mt-1">
                              Dividir em {item.porcoes}
                            </span>
                          )}
                          {item.id.includes('kit-custom') ? (
                            <span className="text-[10px] text-zinc-500 italic mt-1 line-clamp-3 w-full leading-tight">{item.descricao}</span>
                          ) : item.instrucao && (
                            <span className="text-[10px] text-zinc-500 italic mt-1 line-clamp-2 w-full leading-tight">Obs: {item.instrucao}</span>
                          )}
                          
                          <span className="text-red-600 text-xs mt-1 font-bold">
                            {item.sobConsulta ? 'Preço a consultar' : (item.id.includes('kit-custom') ? 'Kit Customizado' : `R$ ${item.preco.toFixed(2).replace('.', ',')} / ${item.unidade}`)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 w-2/5">
                        <span className={`font-black text-sm mb-1 ${item.sobConsulta ? 'text-amber-500' : 'text-zinc-900'}`}>
                          {item.sobConsulta ? 'A Consultar' : `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`}
                        </span>
                        <div className="flex items-center bg-zinc-100 rounded-xl p-1 border border-zinc-200 w-max">
                          <button onClick={() => removerDoCarrinho(item.idCarrinho, stepDeQuantidade)} className="w-7 h-7 flex items-center justify-center text-red-600 font-bold bg-white rounded-lg shadow-sm hover:bg-zinc-50 transition-colors">-</button>
                          <span className="font-black text-zinc-900 w-10 text-center text-sm">
                            {(item.unidade === 'kg' && !item.sobConsulta) ? `${item.quantidade.toFixed(3)}` : item.quantidade}
                            {item.sobConsulta && <span className="text-[10px] text-zinc-500 font-normal"> un</span>}
                          </span>
                          <button onClick={() => adicionarAoCarrinho(item, stepDeQuantidade, item.corte, item.porcoes, item.instrucao)} className="w-7 h-7 flex items-center justify-center text-emerald-600 font-bold bg-white rounded-lg shadow-sm hover:bg-zinc-50 transition-colors">+</button>
                        </div>
                        <button onClick={() => excluirItemDoCarrinho(item.idCarrinho)} className="text-[10px] font-bold text-zinc-400 hover:text-red-600 flex items-center gap-1 mt-1 px-1 transition-colors uppercase tracking-wider">
                          🗑️ Remover
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {totalItens > 0 && (
              <div className="p-6 bg-zinc-50 border-t border-zinc-200 rounded-b-3xl shrink-0">
                
                {/* NOVA ÁREA: ESCOLHER RETIRADA OU ENTREGA */}
                <div className="mb-6 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                  <h3 className="font-bold text-zinc-800 mb-3 text-sm">Como deseja receber seu pedido?</h3>
                  <div className="flex gap-3 mb-4">
                    <button 
                      onClick={() => setTipoPedido('retirada')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs md:text-sm transition-colors ${tipoPedido === 'retirada' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'}`}
                    >
                      🏪 Retirar na Loja
                    </button>
                    <button 
                      onClick={() => setTipoPedido('entrega')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-bold text-xs md:text-sm transition-colors ${tipoPedido === 'entrega' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'}`}
                    >
                      🛵 Entrega (+R$ 8,00)
                    </button>
                  </div>

                  {tipoPedido === 'entrega' && (
                    <div className="animate-in slide-in-from-top-2">
                      <textarea 
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        placeholder="Digite sua Rua, Número, Bairro e Ponto de Referência..."
                        className="w-full p-3 rounded-lg border border-zinc-300 bg-zinc-50 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none h-20 text-zinc-800"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider text-sm">Total do Pedido</span>
                  <div className="flex flex-col items-end">
                    <span className="text-3xl font-black text-zinc-900">
                      R$ {(valorTotal + (tipoPedido === 'entrega' ? 8 : 0)).toFixed(2).replace('.', ',')}
                    </span>
                    {temItemSobConsulta && (
                      <span className="text-xs text-amber-600 font-bold mt-1">+ itens a consultar</span>
                    )}
                  </div>
                </div>
                <button onClick={finalizarPedido} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-md active:scale-95 transition-all text-lg tracking-wide uppercase">
                  Concluir no WhatsApp 🟢
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}