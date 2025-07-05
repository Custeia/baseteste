"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, ChefHat, TrendingUp, Menu, DollarSign, Percent } from "lucide-react"
import { formatarMoeda, calcularCustoReceita, type IngredienteCalculo } from "../../utils/unit-converter"
import { SistemaRelatorios } from "../relatorios/sistema-relatorios"

interface PratoCardapio {
  pratoId: string
  nome: string
  categoria: string
  custoProducao: number
  custoEditavel: boolean
  precoVenda: number
  estimativaPedidosDia: number
  tempoPreparoMinutos: number
  margemLucro: number
  ativo: boolean
}

interface ConfiguracaoAlaCarte {
  nomeRestaurante: string
  cardapio: PratoCardapio[]
}

export function AlaCarteRestaurante() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoAlaCarte>({
    nomeRestaurante: "",
    cardapio: [],
  })

  const [pratos, setPratos] = useState<any[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [activeTab, setActiveTab] = useState("configuracao")

  useEffect(() => {
    // Carregar configuração salva
    const configSalva = localStorage.getItem("alacarte_config")
    if (configSalva) {
      setConfiguracao(JSON.parse(configSalva))
    }

    // Carregar pratos disponíveis
    const pratosData = localStorage.getItem("pratos")
    if (pratosData) {
      const todosPratos = JSON.parse(pratosData)
      setPratos(todosPratos.filter((p: any) => p.disponibilidade.alaCarte))
    }

    // Carregar ingredientes
    const ingredientesData = localStorage.getItem("ingredientes")
    if (ingredientesData) {
      setIngredientes(JSON.parse(ingredientesData))
    }
  }, [])

  const salvarConfiguracao = () => {
    localStorage.setItem("alacarte_config", JSON.stringify(configuracao))
    alert("Configuração salva com sucesso!")
  }

  const calcularCustoPrato = (pratoId: string): number => {
    const prato = pratos.find((p) => p.id === pratoId)
    if (!prato || !ingredientes.length) return 0

    const { custoUnitario } = calcularCustoReceita(prato.ingredientes || [], ingredientes, prato.rendimento || 1)

    return custoUnitario
  }

  const adicionarPratoAoCardapio = (prato: any) => {
    const custoCalculado = calcularCustoPrato(prato.id)

    const novoPratoCardapio: PratoCardapio = {
      pratoId: prato.id,
      nome: prato.nome,
      categoria: prato.categoria,
      custoProducao: custoCalculado,
      custoEditavel: false,
      precoVenda: 0,
      estimativaPedidosDia: 0,
      tempoPreparoMinutos: 0,
      margemLucro: 0,
      ativo: true,
    }

    setConfiguracao({
      ...configuracao,
      cardapio: [...configuracao.cardapio, novoPratoCardapio],
    })
  }

  const atualizarPratoCardapio = (index: number, campo: string, valor: any) => {
    const cardapioAtualizado = [...configuracao.cardapio]
    cardapioAtualizado[index] = { ...cardapioAtualizado[index], [campo]: valor }

    // Recalcular margem de lucro quando preço ou custo mudam
    if (campo === "precoVenda" || campo === "custoProducao") {
      const prato = cardapioAtualizado[index]
      prato.margemLucro = prato.precoVenda > 0 ? ((prato.precoVenda - prato.custoProducao) / prato.precoVenda) * 100 : 0
    }

    setConfiguracao({
      ...configuracao,
      cardapio: cardapioAtualizado,
    })
  }

  const removerPratoDoCardapio = (index: number) => {
    setConfiguracao({
      ...configuracao,
      cardapio: configuracao.cardapio.filter((_, i) => i !== index),
    })
  }

  const calcularReceitaDiaria = () => {
    return configuracao.cardapio
      .filter((p) => p.ativo)
      .reduce((total, prato) => total + prato.precoVenda * prato.estimativaPedidosDia, 0)
  }

  const calcularCustoDiario = () => {
    return configuracao.cardapio
      .filter((p) => p.ativo)
      .reduce((total, prato) => total + prato.custoProducao * prato.estimativaPedidosDia, 0)
  }

  const calcularLucroDiario = () => {
    return calcularReceitaDiaria() - calcularCustoDiario()
  }

  const calcularMargemMedia = () => {
    const pratosAtivos = configuracao.cardapio.filter((p) => p.ativo && p.estimativaPedidosDia > 0)
    if (pratosAtivos.length === 0) return 0

    const margemTotal = pratosAtivos.reduce((acc, prato) => acc + prato.margemLucro, 0)
    return margemTotal / pratosAtivos.length
  }

  const calcularTotalVendas = () => {
    return configuracao.cardapio.filter((p) => p.ativo).reduce((total, prato) => total + prato.estimativaPedidosDia, 0)
  }

  // Dados para o sistema de relatórios
  const dadosAtuais = {
    receita: calcularReceitaDiaria(),
    custo: calcularCustoDiario(),
    lucro: calcularLucroDiario(),
    vendas: calcularTotalVendas(),
  }

  return (
    <div className="layout-main">
      <div className="content-wrapper">
        <div className="container-main space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="menu-responsive h-12 lg:h-14 bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-responsive rounded-2xl p-2">
              <TabsTrigger
                value="configuracao"
                className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <ChefHat className="w-4 h-4" />
                <span className="text-responsive-sm">Configuração</span>
              </TabsTrigger>
              <TabsTrigger
                value="cardapio"
                className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Menu className="w-4 h-4" />
                <span className="text-responsive-sm">Cardápio</span>
              </TabsTrigger>
              <TabsTrigger
                value="relatorios"
                className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-responsive-sm">Relatórios</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configuracao" className="space-y-6">
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-green-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-green-600" />
                    Configuração do Restaurante À La Carte
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Configure as informações básicas do seu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="form-section">
                  <div className="space-y-4">
                    <Label className="text-responsive-base font-medium">Nome do Restaurante</Label>
                    <Input
                      placeholder="Ex: Restaurante Sabor & Arte"
                      value={configuracao.nomeRestaurante}
                      onChange={(e) => setConfiguracao({ ...configuracao, nomeRestaurante: e.target.value })}
                      className="input-responsive border-2"
                    />
                  </div>

                  <Button
                    onClick={salvarConfiguracao}
                    className="w-full button-responsive bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-responsive"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    <span className="text-responsive-sm">Salvar Configuração</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cardapio" className="space-y-6">
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-blue-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <Menu className="w-6 h-6 text-blue-600" />
                    Gerenciar Cardápio
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Adicione pratos ao cardápio e configure preços
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pratos disponíveis para adicionar */}
                  <div className="space-y-4">
                    <h4 className="text-responsive-lg font-semibold text-gray-800">Pratos Disponíveis</h4>
                    <div className="grid-cards">
                      {pratos
                        .filter((prato) => !configuracao.cardapio.some((c) => c.pratoId === prato.id))
                        .map((prato) => (
                          <Card
                            key={prato.id}
                            className="cursor-pointer hover:shadow-responsive transition-all rounded-xl animate-responsive"
                          >
                            <CardContent className="spacing-responsive">
                              <div className="space-y-3">
                                <h5 className="text-responsive-sm font-medium">{prato.nome}</h5>
                                <Badge variant="outline" className="text-responsive-xs">
                                  {prato.categoria}
                                </Badge>
                                <Button
                                  size="sm"
                                  onClick={() => adicionarPratoAoCardapio(prato)}
                                  className="w-full mt-2 text-responsive-xs"
                                >
                                  Adicionar ao Cardápio
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>

                  {/* Cardápio atual */}
                  <div className="space-y-4">
                    <h4 className="text-responsive-lg font-semibold text-gray-800">Cardápio Atual</h4>
                    <div className="space-y-4">
                      {configuracao.cardapio.map((pratoCardapio, index) => (
                        <Card key={pratoCardapio.pratoId} className="card-responsive shadow-responsive">
                          <CardContent className="spacing-responsive">
                            <div className="space-y-4">
                              {/* Header do prato */}
                              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                                <div>
                                  <h5 className="text-responsive-lg font-semibold">{pratoCardapio.nome}</h5>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge variant="outline" className="text-responsive-xs">
                                      {pratoCardapio.categoria}
                                    </Badge>
                                    <Badge
                                      variant={
                                        pratoCardapio.margemLucro >= 30
                                          ? "default"
                                          : pratoCardapio.margemLucro >= 15
                                            ? "secondary"
                                            : "destructive"
                                      }
                                      className="text-responsive-xs"
                                    >
                                      Margem: {pratoCardapio.margemLucro.toFixed(1)}%
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={pratoCardapio.ativo}
                                    onCheckedChange={(checked) => atualizarPratoCardapio(index, "ativo", checked)}
                                  />
                                  <Label className="text-responsive-xs">Ativo</Label>
                                </div>
                              </div>

                              {/* Campos de configuração */}
                              <div className="form-grid">
                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Custo de Produção</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={pratoCardapio.custoProducao}
                                      onChange={(e) =>
                                        atualizarPratoCardapio(index, "custoProducao", Number(e.target.value))
                                      }
                                      disabled={!pratoCardapio.custoEditavel}
                                      className="h-10 text-responsive-sm"
                                    />
                                    <Checkbox
                                      checked={pratoCardapio.custoEditavel}
                                      onCheckedChange={(checked) =>
                                        atualizarPratoCardapio(index, "custoEditavel", checked)
                                      }
                                    />
                                  </div>
                                  <span className="text-responsive-xs text-gray-500">
                                    {pratoCardapio.custoEditavel ? "Editável" : "Automático"}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Preço de Venda</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={pratoCardapio.precoVenda}
                                    onChange={(e) =>
                                      atualizarPratoCardapio(index, "precoVenda", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Pedidos/Dia</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={pratoCardapio.estimativaPedidosDia}
                                    onChange={(e) =>
                                      atualizarPratoCardapio(index, "estimativaPedidosDia", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Tempo (min)</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={pratoCardapio.tempoPreparoMinutos}
                                    onChange={(e) =>
                                      atualizarPratoCardapio(index, "tempoPreparoMinutos", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>
                              </div>

                              {/* Resumo financeiro */}
                              <div className="bg-gray-50 rounded-xl spacing-responsive">
                                <div className="grid-responsive-4 gap-3 text-center">
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Receita/Dia</p>
                                    <p className="text-responsive-sm font-bold text-green-600">
                                      {formatarMoeda(pratoCardapio.precoVenda * pratoCardapio.estimativaPedidosDia)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Custo/Dia</p>
                                    <p className="text-responsive-sm font-bold text-red-600">
                                      {formatarMoeda(pratoCardapio.custoProducao * pratoCardapio.estimativaPedidosDia)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Lucro/Dia</p>
                                    <p className="text-responsive-sm font-bold text-blue-600">
                                      {formatarMoeda(
                                        (pratoCardapio.precoVenda - pratoCardapio.custoProducao) *
                                          pratoCardapio.estimativaPedidosDia,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Margem</p>
                                    <p
                                      className={`text-responsive-sm font-bold ${
                                        pratoCardapio.margemLucro >= 30
                                          ? "text-green-600"
                                          : pratoCardapio.margemLucro >= 15
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                      }`}
                                    >
                                      {pratoCardapio.margemLucro.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removerPratoDoCardapio(index)}
                                  className="text-responsive-xs"
                                >
                                  Remover do Cardápio
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {configuracao.cardapio.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Menu className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-responsive-lg">Nenhum prato no cardápio. Adicione pratos acima.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-6">
              {/* Cards de Estatísticas Básicas */}
              <div className="stats-grid">
                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Receita Diária</p>
                        <p className="text-responsive-2xl font-bold text-green-600">
                          {formatarMoeda(calcularReceitaDiaria())}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Custo Diário</p>
                        <p className="text-responsive-2xl font-bold text-red-600">
                          {formatarMoeda(calcularCustoDiario())}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Lucro Diário</p>
                        <p className="text-responsive-2xl font-bold text-blue-600">
                          {formatarMoeda(calcularLucroDiario())}
                        </p>
                      </div>
                      <Percent className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Margem Média</p>
                        <p className="text-responsive-2xl font-bold text-purple-600">
                          {calcularMargemMedia().toFixed(1)}%
                        </p>
                      </div>
                      <Menu className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sistema de Relatórios */}
              <SistemaRelatorios tipoRestaurante="ala-carte" dadosAtuais={dadosAtuais} configuracao={configuracao} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
