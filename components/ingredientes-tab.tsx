"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  ShoppingCart,
  Package2,
  Sparkles,
  Star,
  AlertCircle,
  Search,
  X,
  Calculator,
  RefreshCw,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  calcularCustosIngrediente,
  formatarMoeda,
  normalizarNome,
  buscarIngredientes,
  migrarIngredientesAntigos,
  ingredienteDispensaMedidaPorUnidade,
  ingredienteTemMedidaPorPesoOuVolume,
  type IngredienteCalculo,
  type EntradaCompra,
} from "../utils/unit-converter"

const ingredientesPorCategoria = {
  Laticínios: [
    "Leite integral",
    "Leite desnatado",
    "Leite sem lactose",
    "Leite condensado",
    "Leite em pó",
    "Creme de leite",
    "Iogurte natural",
    "Iogurte grego",
    "Queijo muçarela",
    "Queijo parmesão",
    "Queijo prato",
    "Queijo minas",
    "Queijo coalho",
    "Manteiga",
    "Margarina",
    "Requeijão",
    "Doce de leite",
  ],
  Ovos: ["Ovo de galinha", "Ovo caipira", "Ovo de codorna"],
  "Farinhas, grãos e cereais": [
    "Farinha de trigo",
    "Farinha de rosca",
    "Farinha de milho",
    "Fubá",
    "Amido de milho",
    "Aveia em flocos",
    "Aveia em flocos finos",
    "Farelo de trigo",
    "Centeio",
    "Arroz branco",
    "Arroz integral",
    "Quinoa",
    "Linhaça",
    "Milho de pipoca",
    "Granola",
  ],
  "Açúcares e adoçantes": [
    "Açúcar refinado",
    "Açúcar cristal",
    "Açúcar mascavo",
    "Açúcar demerara",
    "Mel",
    "Glucose de milho",
    "Melado",
    "Adoçante sucralose",
    "Adoçante stevia",
  ],
  "Fermentos e espessantes": [
    "Fermento químico",
    "Fermento biológico seco",
    "Fermento biológico fresco",
    "Bicarbonato de sódio",
    "Gelatina incolor",
    "Gelatina saborizada",
    "Pectina",
    "Agar-agar",
    "Amido modificado",
  ],
  "Gorduras e óleos": [
    "Óleo de soja",
    "Óleo de girassol",
    "Óleo de milho",
    "Óleo de coco",
    "Óleo de canola",
    "Azeite de oliva",
    "Banha de porco",
    "Gordura vegetal hidrogenada",
  ],
  "Carnes e proteínas": [
    "Carne moída",
    "Carne de sol",
    "Carne seca",
    "Frango desfiado",
    "Peito de frango",
    "Linguiça calabresa",
    "Presunto",
    "Bacon",
    "Atum enlatado",
    "Sardinha enlatada",
  ],
  "Peixes e frutos do mar": ["Camarão", "Filé de tilápia", "Bacalhau dessalgado"],
  "Legumes e vegetais": [
    "Cebola",
    "Alho",
    "Tomate",
    "Batata inglesa",
    "Batata-doce",
    "Cenoura",
    "Beterraba",
    "Abobrinha",
    "Abóbora",
    "Mandioca",
    "Inhame",
    "Pimentão verde",
    "Pimentão vermelho",
    "Milho verde",
    "Ervilha",
    "Palmito",
  ],
  "Frutas (frescas e secas)": [
    "Banana",
    "Maçã",
    "Laranja",
    "Limão",
    "Morango",
    "Abacaxi",
    "Uva",
    "Manga",
    "Maracujá",
    "Goiaba",
    "Coco ralado",
    "Uva-passa",
    "Damasco seco",
    "Tâmara",
    "Castanha-do-pará",
    "Castanha de caju",
    "Nozes",
    "Amêndoas",
    "Amendoim",
  ],
  "Temperos e ervas": [
    "Sal",
    "Sal grosso",
    "Pimenta-do-reino",
    "Colorau",
    "Curry",
    "Cominho",
    "Orégano",
    "Manjericão",
    "Salsinha",
    "Cebolinha",
    "Alecrim",
    "Páprica doce",
    "Páprica picante",
    "Chimichurri",
    "Tomilho",
    "Louro",
    "Ervas finas",
  ],
  "Bebidas e líquidos": [
    "Água",
    "Água com gás",
    "Leite de coco",
    "Cerveja",
    "Refrigerante",
    "Suco concentrado",
    "Café solúvel",
    "Café moído",
    "Essência de baunilha",
    "Essência de amêndoas",
  ],
  "Confeitaria e panificação": [
    "Chocolate em pó 50%",
    "Chocolate em pó 70%",
    "Cacau em pó",
    "Chocolate ao leite",
    "Chocolate meio amargo",
    "Cobertura fracionada",
    "Confeitos coloridos",
    "Granulado",
    "Chantilly",
    "Pó para glacê real",
    "Corante alimentício",
    "Pasta americana",
    "Leite condensado diet",
    "Leite em pó desnatado",
    "Pó para sorvete",
    "Glacê",
  ],
  "Embalagens e insumos": [
    "Embalagem plástica pequena",
    "Embalagem plástica média",
    "Embalagem plástica grande",
    "Pote de vidro",
    "Embalagem de isopor",
    "Saquinho plástico",
    "Saquinho metalizado",
    "Papel manteiga",
    "Caixa de papelão",
    "Etiqueta adesiva",
    "Fita decorativa",
    "Forminha de papel",
    "Forminha de alumínio",
  ],
  "Higiene e limpeza": ["Álcool 70%", "Detergente neutro", "Luvas descartáveis", "Papel toalha"],
}

export function IngredientesTab() {
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [activeTab, setActiveTab] = useState("cadastro")

  // Estados para busca
  const [buscaIngrediente, setBuscaIngrediente] = useState("")
  const [buscaLista, setBuscaLista] = useState("")

  // Estados para cadastro de ingrediente
  const [novoIngrediente, setNovoIngrediente] = useState({
    nome: "",
    quantidadeComprada: "",
    unidadeCompra: "un" as "g" | "ml" | "un",
    valorPago: "",
    tipoValor: "total" as "total" | "unitario",
    medidaPorUnidade: "",
    unidadeMedida: "g" as "g" | "ml",
    semUnidadeDefinida: false,
  })

  useEffect(() => {
    const ingredientesData = localStorage.getItem("ingredientes")
    if (ingredientesData) {
      const dadosCarregados = JSON.parse(ingredientesData)

      if (dadosCarregados.length > 0 && !dadosCarregados[0].nomeNormalizado) {
        const ingredientesMigrados = migrarIngredientesAntigos(dadosCarregados)
        setIngredientes(ingredientesMigrados)
        localStorage.setItem("ingredientes", JSON.stringify(ingredientesMigrados))
      } else {
        setIngredientes(dadosCarregados)
      }
    }
  }, [])

  const salvarIngredientes = (novosIngredientes: IngredienteCalculo[]) => {
    setIngredientes(novosIngredientes)
    localStorage.setItem("ingredientes", JSON.stringify(novosIngredientes))
  }

  const verificarIngredienteExistente = (nome: string): IngredienteCalculo | null => {
    const nomeNormalizado = normalizarNome(nome)
    return ingredientes.find((ing) => ing.nomeNormalizado === nomeNormalizado) || null
  }

  const adicionarIngrediente = () => {
    if (!novoIngrediente.nome.trim()) {
      alert("Digite o nome do ingrediente")
      return
    }
    if (!novoIngrediente.quantidadeComprada || Number(novoIngrediente.quantidadeComprada) <= 0) {
      alert("Digite a quantidade comprada")
      return
    }
    if (!novoIngrediente.valorPago || Number(novoIngrediente.valorPago) <= 0) {
      alert("Digite o valor pago")
      return
    }

    if (
      !novoIngrediente.semUnidadeDefinida &&
      (!novoIngrediente.medidaPorUnidade || Number(novoIngrediente.medidaPorUnidade) <= 0)
    ) {
      alert("Digite a medida por unidade")
      return
    }

    const ingredienteExistente = verificarIngredienteExistente(novoIngrediente.nome)

    const novaEntrada: EntradaCompra = {
      id: Date.now().toString() + Math.random(),
      data: new Date().toISOString(),
      quantidadeComprada: Number(novoIngrediente.quantidadeComprada),
      unidadeCompra: novoIngrediente.unidadeCompra,
      valorPago: Number(novoIngrediente.valorPago),
      tipoValor: novoIngrediente.tipoValor,
      medidaPorUnidade: novoIngrediente.semUnidadeDefinida ? 1 : Number(novoIngrediente.medidaPorUnidade),
      unidadeMedida: novoIngrediente.unidadeMedida,
      semUnidadeDefinida: novoIngrediente.semUnidadeDefinida,
    }

    let ingredientesAtualizados: IngredienteCalculo[]

    if (ingredienteExistente) {
      ingredientesAtualizados = ingredientes.map((ing) =>
        ing.id === ingredienteExistente!.id
          ? {
              ...ing,
              nome: novoIngrediente.nome.trim(),
              entradas: [novaEntrada],
            }
          : ing,
      )
    } else {
      const novoId = Date.now().toString()
      const nomeNormalizado = normalizarNome(novoIngrediente.nome.trim())

      const ingredienteNovo: IngredienteCalculo = {
        id: novoId,
        nome: novoIngrediente.nome.trim(),
        nomeNormalizado,
        entradas: [novaEntrada],
        custoMedioPorUnidade: 0,
        custoMedioPorGrama: 0,
        custoMedioPorMl: 0,
      }

      ingredientesAtualizados = [...ingredientes, ingredienteNovo]
    }

    ingredientesAtualizados = ingredientesAtualizados.map((ing) => {
      const custos = calcularCustosIngrediente(ing)
      return {
        ...ing,
        custoMedioPorUnidade: custos.custoMedioPorUnidade,
        custoMedioPorGrama: custos.custoMedioPorGrama,
        custoMedioPorMl: custos.custoMedioPorMl,
      }
    })

    salvarIngredientes(ingredientesAtualizados)

    setNovoIngrediente({
      nome: "",
      quantidadeComprada: "",
      unidadeCompra: "un",
      valorPago: "",
      tipoValor: "total",
      medidaPorUnidade: "",
      unidadeMedida: "g",
      semUnidadeDefinida: false,
    })
    setBuscaIngrediente("")

    alert(
      ingredienteExistente
        ? `Ingrediente "${ingredienteExistente.nome}" foi atualizado com os novos dados!`
        : `Ingrediente "${novoIngrediente.nome}" cadastrado com sucesso!`,
    )
  }

  const excluirIngrediente = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este ingrediente?")) {
      const novosIngredientes = ingredientes.filter((i) => i.id !== id)
      salvarIngredientes(novosIngredientes)
    }
  }

  const ingredientesFiltrados = buscarIngredientes(ingredientes, buscaLista)

  const ingredientesPadraoFiltrados = Object.entries(ingredientesPorCategoria).reduce(
    (acc, [categoria, nomes]) => {
      const nomesFiltrados = nomes.filter((nome) => normalizarNome(nome).includes(normalizarNome(buscaIngrediente)))
      if (nomesFiltrados.length > 0) {
        acc[categoria] = nomesFiltrados
      }
      return acc
    },
    {} as Record<string, string[]>,
  )

  const ingredienteExistenteNaBusca = buscaIngrediente.trim() ? verificarIngredienteExistente(buscaIngrediente) : null

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h3 className="text-responsive-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          Sistema de Ingredientes
        </h3>
        <p className="text-responsive-base text-gray-600">Cadastro padronizado com cálculo automático de custos</p>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-blue-800 text-responsive-sm">
          <strong>Sistema Inteligente:</strong> Cadastre ingredientes informando quantidade, unidade, valor e medida por
          unidade. O sistema calcula automaticamente o custo por unidade, por grama e por ml. Ingredientes com nomes
          idênticos são atualizados automaticamente.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto sm:h-14 bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl p-2 gap-2 sm:gap-0">
          <TabsTrigger
            value="cadastro"
            className="flex items-center justify-center space-x-3 h-12 sm:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md text-responsive-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="font-medium">Cadastrar Ingrediente</span>
          </TabsTrigger>
          <TabsTrigger
            value="lista"
            className="flex items-center justify-center space-x-3 h-12 sm:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md text-responsive-sm"
          >
            <Package2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="font-medium">Lista de Ingredientes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro" className="space-y-6">
          <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-white to-green-50">
            <CardHeader>
              <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                Cadastrar Novo Ingrediente
              </CardTitle>
              <CardDescription className="text-responsive-base">
                Preencha todos os campos para calcular automaticamente os custos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campo de busca para nome do ingrediente */}
              <div className="space-y-3">
                <Label className="text-responsive-base font-medium">1. Nome do Ingrediente *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="Digite o nome do ingrediente..."
                    value={buscaIngrediente}
                    onChange={(e) => {
                      const novoNome = e.target.value
                      setBuscaIngrediente(novoNome)
                      setNovoIngrediente({
                        ...novoIngrediente,
                        nome: novoNome,
                        semUnidadeDefinida: ingredienteDispensaMedidaPorUnidade(novoNome),
                      })
                    }}
                    className="input-responsive pl-10 pr-10 rounded-xl border-2 focus:border-green-500 transition-colors"
                  />
                  {buscaIngrediente && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setBuscaIngrediente("")
                        setNovoIngrediente({
                          ...novoIngrediente,
                          nome: "",
                          semUnidadeDefinida: false,
                        })
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Sugestões de ingredientes */}
                {buscaIngrediente && Object.keys(ingredientesPadraoFiltrados).length > 0 && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                    <div className="text-responsive-sm font-medium text-gray-600 mb-2">Sugestões:</div>
                    {Object.entries(ingredientesPadraoFiltrados).map(([categoria, nomes]) =>
                      nomes.slice(0, 3).map((nome) => (
                        <button
                          key={nome}
                          onClick={() => {
                            setBuscaIngrediente(nome)
                            setNovoIngrediente({
                              ...novoIngrediente,
                              nome,
                              semUnidadeDefinida: ingredienteDispensaMedidaPorUnidade(nome),
                            })
                          }}
                          className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-responsive-sm"
                        >
                          {nome}
                        </button>
                      )),
                    )}
                  </div>
                )}

                {ingredienteExistenteNaBusca && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <RefreshCw className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800 text-responsive-sm">
                      <strong>Ingrediente já existe:</strong> "{ingredienteExistenteNaBusca.nome}" já está cadastrado.
                      Ao continuar, os dados existentes serão <strong>atualizados</strong> com as novas informações.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="grid-responsive-form">
                <div className="space-y-3">
                  <Label className="text-responsive-base font-medium">2. Quantidade Comprada *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 10"
                    value={novoIngrediente.quantidadeComprada}
                    onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidadeComprada: e.target.value })}
                    className="input-responsive rounded-xl border-2 focus:border-green-500 transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-responsive-base font-medium">3. Unidade da Compra *</Label>
                  <Select
                    value={novoIngrediente.unidadeCompra}
                    onValueChange={(value: "g" | "ml" | "un") =>
                      setNovoIngrediente({ ...novoIngrediente, unidadeCompra: value })
                    }
                  >
                    <SelectTrigger className="input-responsive rounded-xl border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Gramas (g)</SelectItem>
                      <SelectItem value="ml">Mililitros (ml)</SelectItem>
                      <SelectItem value="un">Unidades (un)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid-responsive-form">
                <div className="space-y-3">
                  <Label className="text-responsive-base font-medium">4. Tipo de Valor *</Label>
                  <Select
                    value={novoIngrediente.tipoValor}
                    onValueChange={(value: "total" | "unitario") =>
                      setNovoIngrediente({ ...novoIngrediente, tipoValor: value })
                    }
                  >
                    <SelectTrigger className="input-responsive rounded-xl border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Preço total pago</SelectItem>
                      <SelectItem value="unitario">Preço por unidade de medida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-responsive-base font-medium">Valor Pago (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={
                      novoIngrediente.tipoValor === "total"
                        ? "Ex: 45.00 (total pago)"
                        : `Ex: 4.50 (por ${novoIngrediente.unidadeCompra})`
                    }
                    value={novoIngrediente.valorPago}
                    onChange={(e) => setNovoIngrediente({ ...novoIngrediente, valorPago: e.target.value })}
                    className="input-responsive rounded-xl border-2 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              {/* Checkbox para ingredientes sem unidade definida */}
              <div className="spacing-responsive-sm bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="semUnidadeDefinida"
                    checked={novoIngrediente.semUnidadeDefinida}
                    onChange={(e) =>
                      setNovoIngrediente({
                        ...novoIngrediente,
                        semUnidadeDefinida: e.target.checked,
                        medidaPorUnidade: e.target.checked ? "" : novoIngrediente.medidaPorUnidade,
                      })
                    }
                    className="mt-1 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500 flex-shrink-0"
                  />
                  <div>
                    <label
                      htmlFor="semUnidadeDefinida"
                      className="text-responsive-sm font-medium text-amber-800 cursor-pointer"
                    >
                      Este ingrediente não tem unidade definida (é comprado por peso ou volume)
                    </label>
                    <p className="text-responsive-xs text-amber-700 mt-1">
                      Marque esta opção se o ingrediente é vendido diretamente por peso (g) ou volume (ml), sem
                      embalagem com medida específica.
                    </p>
                  </div>
                </div>
              </div>

              {/* Campo medida por unidade */}
              <div className="spacing-responsive-sm bg-blue-50 rounded-xl border border-blue-200">
                <div className="space-y-4">
                  <Label className="text-responsive-base font-medium text-blue-800">
                    5. Medida por Unidade {!novoIngrediente.semUnidadeDefinida && "*"}
                  </Label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-responsive-sm text-blue-700">Quantidade</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1000"
                        value={novoIngrediente.medidaPorUnidade}
                        onChange={(e) => setNovoIngrediente({ ...novoIngrediente, medidaPorUnidade: e.target.value })}
                        className="input-responsive rounded-xl border-2 focus:border-blue-500 transition-colors"
                        disabled={novoIngrediente.semUnidadeDefinida}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-responsive-sm text-blue-700">Unidade</Label>
                      <Select
                        value={novoIngrediente.unidadeMedida}
                        onValueChange={(value: "g" | "ml") =>
                          setNovoIngrediente({ ...novoIngrediente, unidadeMedida: value })
                        }
                        disabled={novoIngrediente.semUnidadeDefinida}
                      >
                        <SelectTrigger className="input-responsive rounded-xl border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">Gramas (g)</SelectItem>
                          <SelectItem value="ml">Mililitros (ml)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-responsive-sm text-blue-700 bg-blue-100 spacing-responsive-sm rounded-lg">
                    <strong>Importante:</strong> Este campo permite usar o ingrediente em porções fracionadas (ex: 1/2
                    unidade).
                    <br />
                    <strong>Exemplo:</strong> Se comprou 3 caixas de leite de 1L cada, coloque "1000 ml" por unidade.
                    <br />
                    <strong>Exemplo:</strong> Se comprou 5 pães de 50g cada, coloque "50 g" por unidade.
                    {novoIngrediente.semUnidadeDefinida && (
                      <>
                        <br />
                        <strong>Nota:</strong> Campo desabilitado pois o ingrediente não tem unidade definida.
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={adicionarIngrediente}
                className="button-responsive w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {ingredienteExistenteNaBusca ? "Atualizar Ingrediente" : "Cadastrar Ingrediente"}
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lista" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h4 className="text-responsive-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package2 className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              Ingredientes Cadastrados
            </h4>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                placeholder="Buscar ingredientes..."
                value={buscaLista}
                onChange={(e) => setBuscaLista(e.target.value)}
                className="input-responsive pl-10 pr-10 rounded-xl border-2"
              />
              {buscaLista && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBuscaLista("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid-responsive-cards">
            {ingredientesFiltrados.map((ingrediente, index) => {
              const { temGramas, temMl } = ingredienteTemMedidaPorPesoOuVolume(ingrediente)

              return (
                <Card
                  key={ingrediente.id}
                  className="card-responsive hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl border-2 hover:border-purple-200 bg-gradient-to-br from-white to-purple-50 card-enter-responsive"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-responsive-lg font-bold text-gray-900 text-truncate-responsive">
                          {ingrediente.nome}
                        </CardTitle>
                        <CardDescription className="text-responsive-sm mt-1">
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                            {ingrediente.entradas.length} entrada{ingrediente.entradas.length !== 1 ? "s" : ""}
                          </Badge>
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          excluirIngrediente(ingrediente.id)
                        }}
                        className="hover:bg-red-50 rounded-xl p-2 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 spacing-responsive-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between text-responsive-sm">
                        <span className="text-gray-600 font-medium">Por unidade:</span>
                        <span className="font-bold text-green-600">
                          {formatarMoeda(ingrediente.custoMedioPorUnidade)}
                        </span>
                      </div>

                      {temGramas && ingrediente.custoMedioPorGrama > 0 && (
                        <div className="flex justify-between text-responsive-sm">
                          <span className="text-gray-600 font-medium">Por grama:</span>
                          <span className="font-bold text-blue-600">
                            {formatarMoeda(ingrediente.custoMedioPorGrama)}
                          </span>
                        </div>
                      )}

                      {temMl && ingrediente.custoMedioPorMl > 0 && (
                        <div className="flex justify-between text-responsive-sm">
                          <span className="text-gray-600 font-medium">Por ml:</span>
                          <span className="font-bold text-orange-600">
                            {formatarMoeda(ingrediente.custoMedioPorMl)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant="default" className="text-responsive-xs bg-green-100 text-green-800">
                        Cálculo automático
                      </Badge>
                      <Badge variant="secondary" className="text-responsive-xs bg-gray-100 text-gray-800">
                        Sem duplicação
                      </Badge>
                      {temGramas && (
                        <Badge
                          variant="outline"
                          className="text-responsive-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Peso (g)
                        </Badge>
                      )}
                      {temMl && (
                        <Badge
                          variant="outline"
                          className="text-responsive-xs bg-orange-50 text-orange-700 border-orange-200"
                        >
                          Volume (ml)
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {ingredientesFiltrados.length === 0 && ingredientes.length > 0 && (
            <Card className="border-dashed border-4 border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-purple-50">
              <CardContent className="flex flex-col items-center justify-center spacing-responsive-xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-responsive-2xl font-bold text-gray-900 mb-3">Nenhum ingrediente encontrado</h3>
                <p className="text-responsive-base text-gray-600 text-center mb-8 max-w-md">
                  Tente buscar com outros termos ou limpe o filtro
                </p>
              </CardContent>
            </Card>
          )}

          {ingredientes.length === 0 && (
            <Card className="border-dashed border-4 border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-purple-50">
              <CardContent className="flex flex-col items-center justify-center spacing-responsive-xl">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
                  <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-responsive-2xl font-bold text-gray-900 mb-3">Nenhum ingrediente cadastrado</h3>
                <p className="text-responsive-base text-gray-600 text-center mb-8 max-w-md">
                  Comece cadastrando seus primeiros ingredientes com o sistema padronizado
                </p>
                <Button
                  onClick={() => setActiveTab("cadastro")}
                  className="button-responsive bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Cadastrar Primeiro Ingrediente
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
