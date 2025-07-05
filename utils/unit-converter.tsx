// Utilitário para conversão de unidades e cálculos corretos
export interface EntradaCompra {
  id: string
  data: string
  quantidadeComprada: number
  unidadeCompra: "g" | "ml" | "un"
  valorPago: number
  tipoValor: "total" | "unitario"
  medidaPorUnidade: number // quantos g ou ml cada unidade tem
  unidadeMedida: "g" | "ml" // unidade da medida por unidade
  semUnidadeDefinida?: boolean // true quando o ingrediente não tem unidade definida
}

export interface IngredienteCalculo {
  id: string
  nome: string
  nomeNormalizado: string
  entradas: EntradaCompra[]
  // Valores calculados automaticamente
  custoMedioPorUnidade: number
  custoMedioPorGrama: number
  custoMedioPorMl: number
}

export interface IngredienteReceita {
  ingredienteId: string
  nome: string
  quantidade: number
  unidade: "g" | "ml" | "un"
}

// Função para normalizar nomes de ingredientes
export function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, " ") // Remove espaços extras
}

// Função para verificar se um ingrediente dispensa o campo "medida por unidade"
export function ingredienteDispensaMedidaPorUnidade(nome: string): boolean {
  const nomeNormalizado = normalizarNome(nome)

  // Lista de ingredientes que são tipicamente vendidos por peso ou volume
  const ingredientesPorPesoOuVolume = [
    // Carnes e proteínas
    "carne",
    "frango",
    "peixe",
    "linguica",
    "presunto",
    "bacon",
    "atum",
    "sardinha",
    // Queijos e laticínios em fatia/peso
    "queijo",
    "requeijao",
    "manteiga",
    "margarina",
    // Frutas e vegetais
    "banana",
    "maca",
    "laranja",
    "limao",
    "morango",
    "abacaxi",
    "uva",
    "manga",
    "cebola",
    "alho",
    "tomate",
    "batata",
    "cenoura",
    "beterraba",
    "abobrinha",
    // Grãos e farinhas
    "arroz",
    "feijao",
    "lentilha",
    "farinha",
    "acucar",
    "sal",
    "aveia",
    // Óleos e líquidos
    "oleo",
    "azeite",
    "vinagre",
    "molho",
    "extrato",
    // Temperos e ervas
    "oregano",
    "manjericao",
    "salsinha",
    "cebolinha",
    "pimenta",
    "colorau",
    // Outros
    "chocolate em po",
    "cacau",
    "mel",
    "glucose",
  ]

  return ingredientesPorPesoOuVolume.some((termo) => nomeNormalizado.includes(termo))
}

// Função para calcular custos de um ingrediente baseado em suas entradas
export function calcularCustosIngrediente(ingrediente: IngredienteCalculo): {
  custoMedioPorUnidade: number
  custoMedioPorGrama: number
  custoMedioPorMl: number
} {
  const entradas = ingrediente.entradas ?? []

  if (entradas.length === 0) {
    return {
      custoMedioPorUnidade: 0,
      custoMedioPorGrama: 0,
      custoMedioPorMl: 0,
    }
  }

  let custoTotalUnidades = 0
  let quantidadeTotalUnidades = 0
  let custoTotalGramas = 0
  let quantidadeTotalGramas = 0
  let custoTotalMl = 0
  let quantidadeTotalMl = 0

  entradas.forEach((entrada) => {
    let custoTotalEntrada = entrada.valorPago
    let quantidadeUnidades = 0
    let quantidadeGramas = 0
    let quantidadeMl = 0

    // Calcular custo total da entrada
    if (entrada.tipoValor === "unitario") {
      // Se é preço por unidade, precisa calcular quantas unidades foram compradas
      if (entrada.unidadeCompra === "un") {
        quantidadeUnidades = entrada.quantidadeComprada
        custoTotalEntrada = entrada.valorPago * quantidadeUnidades
      } else if (entrada.unidadeCompra === "g") {
        quantidadeUnidades = entrada.quantidadeComprada / (entrada.medidaPorUnidade || 1)
        custoTotalEntrada = entrada.valorPago * entrada.quantidadeComprada
      } else if (entrada.unidadeCompra === "ml") {
        quantidadeUnidades = entrada.quantidadeComprada / (entrada.medidaPorUnidade || 1)
        custoTotalEntrada = entrada.valorPago * entrada.quantidadeComprada
      }
    } else {
      // Se é preço total, usar direto
      custoTotalEntrada = entrada.valorPago
    }

    // Calcular quantidades baseado na unidade de compra
    if (entrada.unidadeCompra === "un") {
      quantidadeUnidades = entrada.quantidadeComprada

      // Só calcular peso/volume se tiver medida por unidade definida e não for marcado como sem unidade
      if (!entrada.semUnidadeDefinida && entrada.medidaPorUnidade && entrada.medidaPorUnidade > 0) {
        if (entrada.unidadeMedida === "g") {
          quantidadeGramas = entrada.quantidadeComprada * entrada.medidaPorUnidade
          quantidadeMl = 0
        } else if (entrada.unidadeMedida === "ml") {
          quantidadeGramas = 0
          quantidadeMl = entrada.quantidadeComprada * entrada.medidaPorUnidade
        }
      }
    } else if (entrada.unidadeCompra === "g") {
      quantidadeUnidades = entrada.quantidadeComprada / (entrada.medidaPorUnidade || 1)
      quantidadeGramas = entrada.quantidadeComprada
      quantidadeMl = 0 // Não aplicável para peso
    } else if (entrada.unidadeCompra === "ml") {
      quantidadeUnidades = entrada.quantidadeComprada / (entrada.medidaPorUnidade || 1)
      quantidadeGramas = 0 // Não aplicável para volume
      quantidadeMl = entrada.quantidadeComprada
    }

    // Acumular totais
    custoTotalUnidades += custoTotalEntrada
    quantidadeTotalUnidades += quantidadeUnidades

    if (quantidadeGramas > 0) {
      custoTotalGramas += custoTotalEntrada
      quantidadeTotalGramas += quantidadeGramas
    }

    if (quantidadeMl > 0) {
      custoTotalMl += custoTotalEntrada
      quantidadeTotalMl += quantidadeMl
    }
  })

  return {
    custoMedioPorUnidade: quantidadeTotalUnidades > 0 ? custoTotalUnidades / quantidadeTotalUnidades : 0,
    custoMedioPorGrama: quantidadeTotalGramas > 0 ? custoTotalGramas / quantidadeTotalGramas : 0,
    custoMedioPorMl: quantidadeTotalMl > 0 ? custoTotalMl / quantidadeTotalMl : 0,
  }
}

// Função para verificar se um ingrediente tem medida por peso ou volume definida
export function ingredienteTemMedidaPorPesoOuVolume(ingrediente: IngredienteCalculo): {
  temGramas: boolean
  temMl: boolean
} {
  let temGramas = false
  let temMl = false

  ingrediente.entradas.forEach((entrada) => {
    // Se foi comprado diretamente por peso ou volume
    if (entrada.unidadeCompra === "g") {
      temGramas = true
    } else if (entrada.unidadeCompra === "ml") {
      temMl = true
    }
    // Se foi comprado por unidade mas tem medida por unidade definida
    else if (
      entrada.unidadeCompra === "un" &&
      !entrada.semUnidadeDefinida &&
      entrada.medidaPorUnidade &&
      entrada.medidaPorUnidade > 0
    ) {
      if (entrada.unidadeMedida === "g") {
        temGramas = true
      } else if (entrada.unidadeMedida === "ml") {
        temMl = true
      }
    }
  })

  return { temGramas, temMl }
}

// Função para calcular custo de um ingrediente em uma receita
export function calcularCustoIngredienteReceita(
  ingredienteReceita: IngredienteReceita,
  ingredienteEstoque: IngredienteCalculo,
): number {
  const quantidade = ingredienteReceita.quantidade
  const unidade = ingredienteReceita.unidade

  if (unidade === "un") {
    return ingredienteEstoque.custoMedioPorUnidade * quantidade
  } else if (unidade === "g") {
    return ingredienteEstoque.custoMedioPorGrama * quantidade
  } else if (unidade === "ml") {
    return ingredienteEstoque.custoMedioPorMl * quantidade
  }

  return 0
}

// Função para calcular custo total de uma receita
export function calcularCustoReceita(
  ingredientesReceita: IngredienteReceita[],
  ingredientesEstoque: IngredienteCalculo[],
  rendimento = 1,
): {
  custoTotal: number
  custoUnitario: number
  detalhes: Array<{
    nome: string
    quantidade: number
    unidade: string
    custoUnitario: number
    custoTotal: number
  }>
} {
  let custoTotal = 0
  const detalhes: Array<{
    nome: string
    quantidade: number
    unidade: string
    custoUnitario: number
    custoTotal: number
  }> = []

  ingredientesReceita.forEach((ingReceita) => {
    const ingEstoque = ingredientesEstoque.find((ing) => ing.id === ingReceita.ingredienteId)

    if (ingEstoque) {
      const custoIngrediente = calcularCustoIngredienteReceita(ingReceita, ingEstoque)
      custoTotal += custoIngrediente

      let custoUnitarioIng = 0
      if (ingReceita.unidade === "un") {
        custoUnitarioIng = ingEstoque.custoMedioPorUnidade
      } else if (ingReceita.unidade === "g") {
        custoUnitarioIng = ingEstoque.custoMedioPorGrama
      } else if (ingReceita.unidade === "ml") {
        custoUnitarioIng = ingEstoque.custoMedioPorMl
      }

      detalhes.push({
        nome: ingReceita.nome,
        quantidade: ingReceita.quantidade,
        unidade: ingReceita.unidade,
        custoUnitario: custoUnitarioIng,
        custoTotal: custoIngrediente,
      })
    }
  })

  return {
    custoTotal,
    custoUnitario: custoTotal / rendimento,
    detalhes,
  }
}

// Função para calcular custo de uma receita específica (usado em restaurantes)
export function calcularCustoReceitaEspecifica(
  receita: {
    id: string
    nome: string
    ingredientes: IngredienteReceita[]
    rendimento: number
    custosFixos?: {
      embalagem: number
      etiqueta: number
      gas: number
      energia: number
      transporte: number
    }
  },
  ingredientesEstoque: IngredienteCalculo[],
  quantidadeProduzir = 1,
): {
  custoIngredientes: number
  custoFixoTotal: number
  custoTotal: number
  custoUnitario: number
} {
  // Calcular custo dos ingredientes
  const { custoTotal: custoIngredientesBase } = calcularCustoReceita(
    receita.ingredientes,
    ingredientesEstoque,
    receita.rendimento,
  )

  // Calcular fator de multiplicação baseado na quantidade a produzir
  const fatorMultiplicacao = quantidadeProduzir / receita.rendimento
  const custoIngredientes = custoIngredientesBase * fatorMultiplicacao

  // Calcular custos fixos
  let custoFixoTotal = 0
  if (receita.custosFixos) {
    const custoFixoUnitario = Object.values(receita.custosFixos).reduce((acc, val) => acc + val, 0)
    custoFixoTotal = custoFixoUnitario * quantidadeProduzir
  }

  const custoTotal = custoIngredientes + custoFixoTotal
  const custoUnitario = custoTotal / quantidadeProduzir

  return {
    custoIngredientes,
    custoFixoTotal,
    custoTotal,
    custoUnitario,
  }
}

// Função para formatar valores monetários
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

// Função para formatar quantidades
export function formatarQuantidade(quantidade: number, unidade: string): string {
  const quantidadeFormatada = quantidade % 1 === 0 ? quantidade.toString() : quantidade.toFixed(2)
  return `${quantidadeFormatada} ${unidade}`
}

// Função para buscar ingredientes por nome
export function buscarIngredientes(ingredientes: IngredienteCalculo[], termo: string): IngredienteCalculo[] {
  if (!termo.trim()) return ingredientes

  const termoNormalizado = normalizarNome(termo)

  return ingredientes.filter((ingrediente) => ingrediente.nomeNormalizado.includes(termoNormalizado))
}

// Função para migrar dados antigos para novo formato
export function migrarIngredientesAntigos(ingredientesAntigos: any[]): IngredienteCalculo[] {
  const ingredientesNovos: IngredienteCalculo[] = []
  const mapaIngredientes = new Map<string, IngredienteCalculo>()

  ingredientesAntigos.forEach((ingredienteAntigo) => {
    const nomeNormalizado = normalizarNome(ingredienteAntigo.nome)

    let ingrediente = mapaIngredientes.get(nomeNormalizado)

    if (!ingrediente) {
      // Criar novo ingrediente
      ingrediente = {
        id: ingredienteAntigo.id,
        nome: ingredienteAntigo.nome,
        nomeNormalizado,
        entradas: [],
        custoMedioPorUnidade: 0,
        custoMedioPorGrama: 0,
        custoMedioPorMl: 0,
      }
      mapaIngredientes.set(nomeNormalizado, ingrediente)
      ingredientesNovos.push(ingrediente)
    }

    // Migrar entrada se houver dados de compra
    if (ingredienteAntigo.quantidadeComprada > 0) {
      // Tentar mapear unidade antiga para nova
      let unidadeCompra: "g" | "ml" | "un" = "un"
      if (ingredienteAntigo.unidadeCompra === "kg") {
        unidadeCompra = "g"
      } else if (ingredienteAntigo.unidadeCompra === "l") {
        unidadeCompra = "ml"
      } else if (ingredienteAntigo.unidadeCompra === "g") {
        unidadeCompra = "g"
      } else if (ingredienteAntigo.unidadeCompra === "ml") {
        unidadeCompra = "ml"
      }

      const entrada: EntradaCompra = {
        id: Date.now().toString() + Math.random(),
        data: new Date().toISOString(),
        quantidadeComprada: ingredienteAntigo.quantidadeComprada,
        unidadeCompra,
        valorPago: ingredienteAntigo.precoCompra,
        tipoValor: ingredienteAntigo.tipoPreco || "total",
        medidaPorUnidade: ingredienteAntigo.volumeUnidade || 1000,
        unidadeMedida: "g",
      }

      ingrediente.entradas.push(entrada)
    }
  })

  // Calcular custos para todos os ingredientes
  ingredientesNovos.forEach((ingrediente) => {
    const custos = calcularCustosIngrediente(ingrediente)
    ingrediente.custoMedioPorUnidade = custos.custoMedioPorUnidade
    ingrediente.custoMedioPorGrama = custos.custoMedioPorGrama
    ingrediente.custoMedioPorMl = custos.custoMedioPorMl
  })

  return ingredientesNovos
}
