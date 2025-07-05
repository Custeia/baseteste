"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, Target, DollarSign, Package, BarChart3, AlertCircle, ShoppingCart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatarMoeda, type IngredienteCalculo } from "../utils/unit-converter"

interface Ingrediente {
  id: string
  nome: string
  unidadeCompra: string
  quantidadeComprada: number
  precoCompra: number
  volumeUnidade?: number
}

interface IngredienteReceita {
  ingredienteId: string
  nome: string
  quantidade: number
  unidade: string
}

interface Receita {
  id: string
  nome: string
  descricao: string
  ingredientes: IngredienteReceita[]
  rendimento: number
  custosFixos: {
    embalagem: number
    etiqueta: number
    gas: number
    energia: number
    transporte: number
  }
  precoVenda: number
  tipoPrecoVenda: "por_unidade" | "total_receita"
  taxaPlataforma: number
}

interface ProjecaoIngrediente {
  ingredienteId: string
  nome: string
  quantidadeNecessaria: number
  unidade: string
  quantidadePorUnidadeCompra: number
  unidadeCompra: string
  unidadesMinimas: number
  quantidadeTotal: number
  sobra: number
  custoUnitario: number
  custoTotal: number
}

interface ProjecaoCompleta {
  receita: Receita
  quantidadeReceitas: number
  totalUnidadesProduzidas: number
  ingredientes: ProjecaoIngrediente[]
  custoTotalProducao: number
  custoTotalComExcesso: number
  custoUnitario: number
  receitaBrutaTotal: number
  precoUnitario: number
  lucroTotal: number
  lucroUnitario: number
  margemLucro: number
}

export function ProjecoesTab() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [receitaSelecionada, setReceitaSelecionada] = useState<string>("")
  const [quantidadeReceitas, setQuantidadeReceitas] = useState<number>(1)
  const [metaLucro, setMetaLucro] = useState<number>(50)
  const [projecao, setProjecao] = useState<ProjecaoCompleta | null>(null)

  useEffect(() => {
    const receitasData = localStorage.getItem("receitas")
    const ingredientesData = localStorage.getItem("ingredientes")

    if (receitasData) {
      const receitasParsed = JSON.parse(receitasData)
      const receitasMigradas = receitasParsed.map((receita: any) => ({
        ...receita,
        tipoPrecoVenda: receita.tipoPrecoVenda || "por_unidade",
      }))
      setReceitas(receitasMigradas)
    }
    if (ingredientesData) {
      setIngredientes(JSON.parse(ingredientesData))
    }
  }, [])

  const calcularProjecao = () => {
    const receita = receitas.find((r) => r.id === receitaSelecionada)
    if (!receita || quantidadeReceitas <= 0) return

    const totalUnidadesProduzidas = receita.rendimento * quantidadeReceitas
    const fatorMultiplicacao = quantidadeReceitas
    const ingredientesProjecao: ProjecaoIngrediente[] = []
    let custoTotalProducao = 0

    receita.ingredientes.forEach((ingReceita) => {
      const ingrediente = ingredientes.find((i) => i.id === ingReceita.ingredienteId)
      if (!ingrediente) return

      const quantidadeNecessaria = ingReceita.quantidade * fatorMultiplicacao

      let custoUnitario = 0
      if (ingReceita.unidade === "un") {
        custoUnitario = ingrediente.custoMedioPorUnidade
      } else if (ingReceita.unidade === "g") {
        custoUnitario = ingrediente.custoMedioPorGrama
      } else if (ingReceita.unidade === "ml") {
        custoUnitario = ingrediente.custoMedioPorMl
      }

      let unidadesMinimas = 1
      let quantidadeTotal = 0
      let sobra = 0

      const primeiraEntrada = ingrediente.entradas[0]
      if (primeiraEntrada) {
        if (primeiraEntrada.unidadeCompra === "un") {
          if (ingReceita.unidade === "un") {
            unidadesMinimas = Math.ceil(quantidadeNecessaria)
            quantidadeTotal = unidadesMinimas
            sobra = quantidadeTotal - quantidadeNecessaria
          } else {
            const medidaPorUnidade = primeiraEntrada.medidaPorUnidade || 1
            unidadesMinimas = Math.ceil(quantidadeNecessaria / medidaPorUnidade)
            quantidadeTotal = unidadesMinimas * medidaPorUnidade
            sobra = quantidadeTotal - quantidadeNecessaria
          }
        } else {
          unidadesMinimas = Math.ceil(quantidadeNecessaria / primeiraEntrada.quantidadeComprada)
          quantidadeTotal = unidadesMinimas * primeiraEntrada.quantidadeComprada
          sobra = quantidadeTotal - quantidadeNecessaria
        }
      }

      const custoTotal = custoUnitario * quantidadeNecessaria
      custoTotalProducao += custoTotal

      ingredientesProjecao.push({
        ingredienteId: ingReceita.ingredienteId,
        nome: ingReceita.nome,
        quantidadeNecessaria,
        unidade: ingReceita.unidade,
        quantidadePorUnidadeCompra: primeiraEntrada?.quantidadeComprada || 1,
        unidadeCompra: primeiraEntrada?.unidadeCompra || "un",
        unidadesMinimas,
        quantidadeTotal,
        sobra,
        custoUnitario,
        custoTotal,
      })
    })

    const custoFixoTotal =
      Object.values(receita.custosFixos).reduce((acc, val) => acc + val, 0) * totalUnidadesProduzidas
    custoTotalProducao += custoFixoTotal

    let custoTotalComExcesso = 0
    ingredientesProjecao.forEach((ing) => {
      custoTotalComExcesso += ing.custoUnitario * ing.quantidadeTotal
    })
    custoTotalComExcesso += custoFixoTotal

    const custoUnitario = custoTotalProducao / totalUnidadesProduzidas

    let receitaBrutaTotal = 0
    let precoUnitario = 0

    if (receita.tipoPrecoVenda === "por_unidade") {
      precoUnitario = receita.precoVenda
      receitaBrutaTotal = receita.precoVenda * totalUnidadesProduzidas
    } else {
      receitaBrutaTotal = receita.precoVenda * quantidadeReceitas
      precoUnitario = receita.precoVenda / receita.rendimento
    }

    const lucroTotal = receitaBrutaTotal - custoTotalProducao
    const lucroUnitario = lucroTotal / totalUnidadesProduzidas
    const margemLucro = receitaBrutaTotal > 0 ? (lucroTotal / receitaBrutaTotal) * 100 : 0

    setProjecao({
      receita,
      quantidadeReceitas,
      totalUnidadesProduzidas,
      ingredientes: ingredientesProjecao,
      custoTotalProducao,
      custoTotalComExcesso,
      custoUnitario,
      receitaBrutaTotal,
      precoUnitario,
      lucroTotal,
      lucroUnitario,
      margemLucro,
    })
  }

  const calcularPrecoIdealParaMeta = () => {
    if (!projecao) return 0
    const lucroDesejado = (projecao.custoTotalProducao * metaLucro) / 100
    return (projecao.custoTotalProducao + lucroDesejado) / projecao.totalUnidadesProduzidas
  }

  useEffect(() => {
    if (receitaSelecionada && quantidadeReceitas > 0) {
      calcularProjecao()
    }
  }, [receitaSelecionada, quantidadeReceitas, receitas, ingredientes])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-responsive-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          Projeções de Produção
        </h3>
        <p className="text-responsive-base text-gray-600 mt-2">
          Calcule ingredientes necessários, custos e lucros para sua produção
        </p>
      </div>

      {receitas.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-responsive-sm">
            Você precisa cadastrar receitas primeiro. Acesse a aba <strong className="text-blue-600">Receitas</strong>{" "}
            para continuar.
          </AlertDescription>
        </Alert>
      )}

      {/* Seleção de Receita e Quantidade */}
      <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-white to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-responsive-lg">
            <Target className="w-5 h-5 text-green-600" />
            <span>Configurar Projeção</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid-responsive-form">
            <div className="space-y-2">
              <Label className="text-responsive-base">Escolha uma receita</Label>
              <Select value={receitaSelecionada} onValueChange={setReceitaSelecionada}>
                <SelectTrigger className="input-responsive rounded-xl border-2">
                  <SelectValue placeholder="Selecione uma receita" />
                </SelectTrigger>
                <SelectContent>
                  {receitas.map((receita) => (
                    <SelectItem key={receita.id} value={receita.id}>
                      <span className="text-responsive-sm">
                        {receita.nome} (Rende {receita.rendimento} unidades)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-responsive-base">Quantas receitas produzir</Label>
              <Input
                type="number"
                min="1"
                placeholder="Ex: 3"
                value={quantidadeReceitas}
                onChange={(e) => setQuantidadeReceitas(Number(e.target.value) || 1)}
                className="input-responsive rounded-xl border-2"
              />
              <p className="text-responsive-sm text-gray-600">
                {projecao
                  ? `Total: ${projecao.totalUnidadesProduzidas} unidades (${quantidadeReceitas} receitas × ${projecao.receita.rendimento})`
                  : "Quantas vezes você vai fazer esta receita"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {projecao && (
        <>
          {/* Resumo da Projeção - Layout Mobile-Friendly */}
          <div className="space-y-4">
            {/* Informações Principais */}
            <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-responsive-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-truncate-responsive">{projecao.receita.nome}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="spacing-responsive-sm bg-white rounded-xl">
                    <div className="text-responsive-2xl font-bold text-blue-600">{projecao.quantidadeReceitas}</div>
                    <div className="text-responsive-sm text-gray-600">receitas</div>
                  </div>
                  <div className="spacing-responsive-sm bg-white rounded-xl">
                    <div className="text-responsive-2xl font-bold text-purple-600">
                      {projecao.totalUnidadesProduzidas}
                    </div>
                    <div className="text-responsive-sm text-gray-600">unidades totais</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-orange-50 to-red-50">
                <CardContent className="spacing-responsive-md text-center">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-responsive-sm text-orange-600 mb-1">Custo Total</p>
                  <p className="text-responsive-2xl font-bold text-orange-800">
                    {formatarMoeda(projecao.custoTotalProducao)}
                  </p>
                  <p className="text-responsive-xs text-gray-600">
                    {formatarMoeda(projecao.custoUnitario)} por unidade
                  </p>
                </CardContent>
              </Card>

              <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-red-50 to-pink-50">
                <CardContent className="spacing-responsive-md text-center">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-red-600" />
                  <p className="text-responsive-sm text-red-600 mb-1">Custo com Excesso</p>
                  <p className="text-responsive-2xl font-bold text-red-800">
                    {formatarMoeda(projecao.custoTotalComExcesso)}
                  </p>
                  <p className="text-responsive-xs text-gray-600">incluindo sobras</p>
                </CardContent>
              </Card>
            </div>

            {/* Receita e Lucro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="spacing-responsive-md text-center">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-responsive-sm text-green-600 mb-1">Receita Bruta</p>
                  <p className="text-responsive-2xl font-bold text-green-800">
                    {formatarMoeda(projecao.receitaBrutaTotal)}
                  </p>
                  <p className="text-responsive-xs text-gray-600">
                    {formatarMoeda(projecao.precoUnitario)} por unidade
                  </p>
                </CardContent>
              </Card>

              <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardContent className="spacing-responsive-md text-center">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-responsive-sm text-purple-600 mb-1">Lucro Total</p>
                  <p
                    className={`text-responsive-2xl font-bold ${projecao.lucroTotal >= 0 ? "text-purple-800" : "text-red-600"}`}
                  >
                    {formatarMoeda(projecao.lucroTotal)}
                  </p>
                  <p className="text-responsive-xs text-gray-600">
                    {projecao.margemLucro.toFixed(1)}% margem • {formatarMoeda(projecao.lucroUnitario)} por unidade
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Lista de Ingredientes Necessários */}
          <Card className="card-responsive rounded-2xl border-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-responsive-lg">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <span>Lista de Compras</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="table-responsive">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-responsive-sm">Ingrediente</th>
                      <th className="text-right p-3 text-responsive-sm">Precisa</th>
                      <th className="text-right p-3 text-responsive-sm">Compra Mínima</th>
                      <th className="text-right p-3 text-responsive-sm">Vai Sobrar</th>
                      <th className="text-right p-3 text-responsive-sm">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projecao.ingredientes.map((ing) => (
                      <tr key={ing.ingredienteId} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-responsive-sm text-truncate-responsive">{ing.nome}</td>
                        <td className="text-right p-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 text-responsive-xs">
                            {ing.quantidadeNecessaria.toFixed(1)} {ing.unidade}
                          </Badge>
                        </td>
                        <td className="text-right p-3">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 text-responsive-xs">
                            {ing.unidadesMinimas}x
                          </Badge>
                        </td>
                        <td className="text-right p-3">
                          <span
                            className={`text-responsive-sm ${ing.sobra > 0 ? "text-orange-600" : "text-green-600"}`}
                          >
                            {ing.sobra > 0 ? `${ing.sobra.toFixed(1)} ${ing.unidade}` : "Sem sobra"}
                          </span>
                        </td>
                        <td className="text-right p-3 font-semibold text-responsive-sm">
                          {formatarMoeda(ing.custoTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Meta de Lucro */}
          <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-responsive-lg">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Calculadora de Meta de Lucro</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid-responsive-form">
                <div className="space-y-2">
                  <Label className="text-responsive-base">Meta de lucro (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Ex: 50"
                    value={metaLucro}
                    onChange={(e) => setMetaLucro(Number(e.target.value) || 0)}
                    className="input-responsive rounded-xl border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-responsive-base">Preço ideal por unidade</Label>
                  <div className="input-responsive px-4 rounded-xl border-2 bg-gray-50 flex items-center">
                    <span className="text-responsive-lg font-bold text-purple-600">
                      {formatarMoeda(calcularPrecoIdealParaMeta())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="spacing-responsive-sm bg-purple-100 rounded-xl">
                <h4 className="font-medium text-purple-900 mb-2 text-responsive-base">
                  Para atingir {metaLucro}% de lucro:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-responsive-sm">
                  <div>
                    <span className="text-purple-700">Custo total:</span>
                    <p className="font-bold">{formatarMoeda(projecao.custoTotalProducao)}</p>
                  </div>
                  <div>
                    <span className="text-purple-700">Lucro desejado:</span>
                    <p className="font-bold">{formatarMoeda((projecao.custoTotalProducao * metaLucro) / 100)}</p>
                  </div>
                  <div>
                    <span className="text-purple-700">Receita necessária:</span>
                    <p className="font-bold">
                      {formatarMoeda(projecao.custoTotalProducao + (projecao.custoTotalProducao * metaLucro) / 100)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo Final */}
          <Card className="card-responsive rounded-2xl border-2 bg-gradient-to-br from-gray-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-responsive-lg">
                <BarChart3 className="w-5 h-5 text-gray-700" />
                <span>Resumo Executivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-responsive-lg">📊 Números da Produção</h4>
                  <div className="space-y-2 text-responsive-sm">
                    <div className="flex justify-between">
                      <span>Receitas a produzir:</span>
                      <span className="font-medium">{projecao.quantidadeReceitas}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de unidades:</span>
                      <span className="font-medium">{projecao.totalUnidadesProduzidas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investimento necessário:</span>
                      <span className="font-medium text-orange-600">{formatarMoeda(projecao.custoTotalProducao)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Faturamento esperado:</span>
                      <span className="font-medium text-green-600">{formatarMoeda(projecao.receitaBrutaTotal)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Lucro líquido:</span>
                      <span className={`font-bold ${projecao.lucroTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatarMoeda(projecao.lucroTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-responsive-lg">💡 Análise</h4>
                  <div className="space-y-2 text-responsive-sm">
                    <div className="spacing-responsive-sm bg-white rounded-lg">
                      <p className="font-medium text-gray-800">
                        {projecao.margemLucro >= 30
                          ? "✅ Margem Excelente"
                          : projecao.margemLucro >= 15
                            ? "⚠️ Margem Razoável"
                            : "❌ Margem Baixa"}
                      </p>
                      <p className="text-gray-600">Margem de lucro: {projecao.margemLucro.toFixed(1)}%</p>
                    </div>

                    <div className="spacing-responsive-sm bg-white rounded-lg">
                      <p className="font-medium text-gray-800">💰 Por Unidade:</p>
                      <p className="text-gray-600 break-words">
                        Custo: {formatarMoeda(projecao.custoUnitario)} • Venda: {formatarMoeda(projecao.precoUnitario)}{" "}
                        • Lucro: {formatarMoeda(projecao.lucroUnitario)}
                      </p>
                    </div>

                    {projecao.custoTotalComExcesso > projecao.custoTotalProducao && (
                      <div className="spacing-responsive-sm bg-orange-50 rounded-lg">
                        <p className="font-medium text-orange-800">⚠️ Atenção às Sobras:</p>
                        <p className="text-orange-700">
                          Você gastará {formatarMoeda(projecao.custoTotalComExcesso - projecao.custoTotalProducao)} a
                          mais devido às sobras
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
