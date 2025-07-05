"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Utensils, TrendingUp, Calendar, DollarSign, Users, Scale } from "lucide-react"
import { formatarMoeda, calcularCustoReceita, type IngredienteCalculo } from "../../utils/unit-converter"
import { SistemaRelatorios } from "../relatorios/sistema-relatorios"

interface PratoSelfService {
  pratoId: string
  nome: string
  categoria: string
  quantidadeServida: "quilos" | "porcoes"
  custoProducao: number
  custoEditavel: boolean
  estimativaPorcoesKg: number
}

interface ConfiguracaoSelfService {
  nomeRestaurante: string
  tipoFuncionamento: "por_kg" | "por_unidade" | "buffet_livre"
  precoPorKg: number
  precoBuffetLivre: number
  previsaoClientesDia: number
  consumoMedioPorPessoa: number
  estimativaDesperdicio: number
  pratosSemanais: {
    [key: string]: PratoSelfService[]
  }
}

const diasSemana = [
  { key: "segunda", nome: "Segunda-feira", cor: "bg-blue-500" },
  { key: "terca", nome: "Terça-feira", cor: "bg-green-500" },
  { key: "quarta", nome: "Quarta-feira", cor: "bg-yellow-500" },
  { key: "quinta", nome: "Quinta-feira", cor: "bg-purple-500" },
  { key: "sexta", nome: "Sexta-feira", cor: "bg-red-500" },
  { key: "sabado", nome: "Sábado", cor: "bg-indigo-500" },
  { key: "domingo", nome: "Domingo", cor: "bg-pink-500" },
]

export function SelfServiceRestaurante() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoSelfService>({
    nomeRestaurante: "",
    tipoFuncionamento: "por_kg",
    precoPorKg: 0,
    precoBuffetLivre: 0,
    previsaoClientesDia: 0,
    consumoMedioPorPessoa: 0.4,
    estimativaDesperdicio: 10,
    pratosSemanais: {},
  })

  const [pratos, setPratos] = useState<any[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [activeTab, setActiveTab] = useState("configuracao")
  const [diaSelecionado, setDiaSelecionado] = useState("segunda")

  useEffect(() => {
    // Carregar configuração salva
    const configSalva = localStorage.getItem("selfservice_config")
    if (configSalva) {
      setConfiguracao(JSON.parse(configSalva))
    }

    // Carregar pratos disponíveis
    const pratosData = localStorage.getItem("pratos")
    if (pratosData) {
      const todosPratos = JSON.parse(pratosData)
      setPratos(todosPratos.filter((p: any) => p.disponibilidade.selfService))
    }

    // Carregar ingredientes
    const ingredientesData = localStorage.getItem("ingredientes")
    if (ingredientesData) {
      setIngredientes(JSON.parse(ingredientesData))
    }
  }, [])

  const salvarConfiguracao = () => {
    localStorage.setItem("selfservice_config", JSON.stringify(configuracao))
    alert("Configuração salva com sucesso!")
  }

  const calcularQuantidadeIdeal = () => {
    const consumoTotal = configuracao.previsaoClientesDia * configuracao.consumoMedioPorPessoa
    const comDesperdicio = consumoTotal * (1 + configuracao.estimativaDesperdicio / 100)
    return comDesperdicio
  }

  const calcularReceitaEstimada = () => {
    const quantidadeIdeal = calcularQuantidadeIdeal()
    if (configuracao.tipoFuncionamento === "buffet_livre") {
      return configuracao.previsaoClientesDia * configuracao.precoBuffetLivre
    }
    return quantidadeIdeal * configuracao.precoPorKg
  }

  const calcularCustoPrato = (prato: any): number => {
    if (!prato || !ingredientes.length) return 0

    const pratoCompleto = pratos.find((p) => p.id === prato.pratoId)
    if (!pratoCompleto) return 0

    const { custoUnitario } = calcularCustoReceita(
      pratoCompleto.ingredientes || [],
      ingredientes,
      pratoCompleto.rendimento || 1,
    )

    return custoUnitario
  }

  const adicionarPratoAoDia = (pratoId: string) => {
    const prato = pratos.find((p) => p.id === pratoId)
    if (!prato) return

    const novoPratoSelfService: PratoSelfService = {
      pratoId: pratoId,
      nome: prato.nome,
      categoria: prato.categoria,
      quantidadeServida: "quilos",
      custoProducao: calcularCustoPrato({ pratoId }),
      custoEditavel: false,
      estimativaPorcoesKg: 4,
    }

    const pratosAtuais = configuracao.pratosSemanais[diaSelecionado] || []
    if (!pratosAtuais.some((p) => p.pratoId === pratoId)) {
      setConfiguracao({
        ...configuracao,
        pratosSemanais: {
          ...configuracao.pratosSemanais,
          [diaSelecionado]: [...pratosAtuais, novoPratoSelfService],
        },
      })
    }
  }

  const atualizarPratoDoDia = (index: number, campo: string, valor: any) => {
    const pratosAtuais = [...(configuracao.pratosSemanais[diaSelecionado] || [])]
    pratosAtuais[index] = { ...pratosAtuais[index], [campo]: valor }

    setConfiguracao({
      ...configuracao,
      pratosSemanais: {
        ...configuracao.pratosSemanais,
        [diaSelecionado]: pratosAtuais,
      },
    })
  }

  const removerPratoDoDia = (index: number) => {
    const pratosAtuais = configuracao.pratosSemanais[diaSelecionado] || []
    const novosPratos = pratosAtuais.filter((_, i) => i !== index)

    setConfiguracao({
      ...configuracao,
      pratosSemanais: {
        ...configuracao.pratosSemanais,
        [diaSelecionado]: novosPratos,
      },
    })
  }

  const calcularCustoTotal = () => {
    return Object.values(configuracao.pratosSemanais).reduce((total, pratos) => {
      return total + pratos.reduce((subtotal, prato) => subtotal + prato.custoProducao, 0)
    }, 0)
  }

  const pratosAtuais = configuracao.pratosSemanais[diaSelecionado] || []

  // Dados para o sistema de relatórios
  const dadosAtuais = {
    receita: calcularReceitaEstimada(),
    custo: calcularCustoTotal(),
    lucro: calcularReceitaEstimada() - calcularCustoTotal(),
    vendas: configuracao.previsaoClientesDia,
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
                <Utensils className="w-4 h-4" />
                <span className="text-responsive-sm">Configuração</span>
              </TabsTrigger>
              <TabsTrigger
                value="cardapio"
                className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Calendar className="w-4 h-4" />
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
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-blue-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-blue-600" />
                    Configuração do Self-Service
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Configure as informações básicas do seu restaurante
                  </CardDescription>
                </CardHeader>
                <CardContent className="form-section">
                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Nome do Restaurante</Label>
                      <Input
                        placeholder="Ex: Restaurante do João"
                        value={configuracao.nomeRestaurante}
                        onChange={(e) => setConfiguracao({ ...configuracao, nomeRestaurante: e.target.value })}
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Tipo de Funcionamento</Label>
                      <Select
                        value={configuracao.tipoFuncionamento}
                        onValueChange={(value: "por_kg" | "por_unidade" | "buffet_livre") =>
                          setConfiguracao({ ...configuracao, tipoFuncionamento: value })
                        }
                      >
                        <SelectTrigger className="input-responsive border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="por_kg">Por Quilograma</SelectItem>
                          <SelectItem value="por_unidade">Por Unidade/Prato</SelectItem>
                          <SelectItem value="buffet_livre">Buffet Livre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="form-grid">
                    {configuracao.tipoFuncionamento === "por_kg" && (
                      <div className="space-y-3">
                        <Label className="text-responsive-base font-medium">Preço por Kg (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 32.90"
                          value={configuracao.precoPorKg}
                          onChange={(e) => setConfiguracao({ ...configuracao, precoPorKg: Number(e.target.value) })}
                          className="input-responsive border-2"
                        />
                      </div>
                    )}
                    {configuracao.tipoFuncionamento === "buffet_livre" && (
                      <div className="space-y-3">
                        <Label className="text-responsive-base font-medium">Preço do Buffet Livre (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 25.00"
                          value={configuracao.precoBuffetLivre}
                          onChange={(e) =>
                            setConfiguracao({ ...configuracao, precoBuffetLivre: Number(e.target.value) })
                          }
                          className="input-responsive border-2"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Previsão de Clientes por Dia</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 150"
                        value={configuracao.previsaoClientesDia}
                        onChange={(e) =>
                          setConfiguracao({ ...configuracao, previsaoClientesDia: Number(e.target.value) })
                        }
                        className="input-responsive border-2"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Consumo Médio por Pessoa (kg)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 0.4"
                        value={configuracao.consumoMedioPorPessoa}
                        onChange={(e) =>
                          setConfiguracao({ ...configuracao, consumoMedioPorPessoa: Number(e.target.value) })
                        }
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Estimativa de Desperdício (%)</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 10"
                        value={configuracao.estimativaDesperdicio}
                        onChange={(e) =>
                          setConfiguracao({ ...configuracao, estimativaDesperdicio: Number(e.target.value) })
                        }
                        className="input-responsive border-2"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={salvarConfiguracao}
                    className="w-full button-responsive bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-responsive"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    <span className="text-responsive-sm">Salvar Configuração</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cardapio" className="space-y-6">
              {/* Seleção do Dia */}
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-green-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800">Cardápio Semanal</CardTitle>
                  <CardDescription className="text-responsive-base">
                    Selecione o dia e configure os pratos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    {diasSemana.map((dia) => {
                      const temPratos = (configuracao.pratosSemanais[dia.key] || []).length > 0
                      const custoTotal = (configuracao.pratosSemanais[dia.key] || []).reduce(
                        (acc, prato) => acc + prato.custoProducao,
                        0,
                      )
                      return (
                        <Button
                          key={dia.key}
                          variant={diaSelecionado === dia.key ? "default" : "outline"}
                          className={`h-auto p-3 flex flex-col animate-responsive ${
                            diaSelecionado === dia.key
                              ? "bg-blue-600 hover:bg-blue-700 shadow-responsive"
                              : "hover:shadow-responsive"
                          }`}
                          onClick={() => setDiaSelecionado(dia.key)}
                        >
                          <span className="text-responsive-sm font-medium">{dia.nome.split("-")[0]}</span>
                          {temPratos && (
                            <>
                              <span className="text-responsive-xs mt-1 opacity-80">
                                {(configuracao.pratosSemanais[dia.key] || []).length} pratos
                              </span>
                              <span className="text-responsive-xs">{formatarMoeda(custoTotal)}</span>
                            </>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Pratos do Dia */}
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-gray-50 shadow-responsive">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="text-responsive-xl font-bold text-gray-800">
                        Pratos para {diasSemana.find((d) => d.key === diaSelecionado)?.nome}
                      </CardTitle>
                      <CardDescription className="text-responsive-base">
                        Configure quantidade e custos dos pratos
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pratos disponíveis */}
                  <div className="space-y-4">
                    <h4 className="text-responsive-lg font-semibold text-gray-800">Adicionar Pratos</h4>
                    <div className="grid-cards">
                      {pratos
                        .filter((prato) => !pratosAtuais.some((p) => p.pratoId === prato.id))
                        .map((prato) => (
                          <Button
                            key={prato.id}
                            variant="outline"
                            onClick={() => adicionarPratoAoDia(prato.id)}
                            className="h-auto p-4 flex flex-col items-start text-left hover:shadow-responsive animate-responsive"
                          >
                            <span className="text-responsive-sm font-medium">{prato.nome}</span>
                            <span className="text-responsive-xs text-gray-600">{prato.categoria}</span>
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Pratos configurados */}
                  {pratosAtuais.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-responsive-lg font-semibold text-gray-800">Pratos Configurados</h4>
                      <div className="space-y-4">
                        {pratosAtuais.map((prato, index) => (
                          <div key={index} className="p-4 border-2 rounded-xl bg-white shadow-responsive">
                            <div className="form-grid">
                              <div className="space-y-2">
                                <Label className="text-responsive-sm font-medium">{prato.nome}</Label>
                                <span className="text-responsive-xs text-gray-600 block">{prato.categoria}</span>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-responsive-xs">Quantidade Servida</Label>
                                <Select
                                  value={prato.quantidadeServida}
                                  onValueChange={(value: "quilos" | "porcoes") =>
                                    atualizarPratoDoDia(index, "quantidadeServida", value)
                                  }
                                >
                                  <SelectTrigger className="h-10 text-responsive-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="quilos">Quilos</SelectItem>
                                    <SelectItem value="porcoes">Porções</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-responsive-xs">Custo do Prato</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={prato.custoProducao}
                                    onChange={(e) =>
                                      atualizarPratoDoDia(index, "custoProducao", Number(e.target.value))
                                    }
                                    disabled={!prato.custoEditavel}
                                    className="h-10 text-responsive-xs"
                                  />
                                  <Checkbox
                                    checked={prato.custoEditavel}
                                    onCheckedChange={(checked) => atualizarPratoDoDia(index, "custoEditavel", checked)}
                                  />
                                </div>
                                <span className="text-responsive-xs text-gray-500">
                                  {prato.custoEditavel ? "Editável" : "Automático"}
                                </span>
                              </div>

                              <div className="flex items-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removerPratoDoDia(index)}
                                  className="h-10 text-responsive-xs"
                                >
                                  Remover
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                        <p className="text-responsive-sm font-medium text-gray-600">Quantidade Ideal</p>
                        <p className="text-responsive-2xl font-bold text-blue-600">
                          {calcularQuantidadeIdeal().toFixed(1)} kg
                        </p>
                      </div>
                      <Scale className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Receita Estimada</p>
                        <p className="text-responsive-2xl font-bold text-green-600">
                          {formatarMoeda(calcularReceitaEstimada())}
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
                        <p className="text-responsive-sm font-medium text-gray-600">Clientes/Dia</p>
                        <p className="text-responsive-2xl font-bold text-purple-600">
                          {configuracao.previsaoClientesDia}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Desperdício</p>
                        <p className="text-responsive-2xl font-bold text-orange-600">
                          {configuracao.estimativaDesperdicio}%
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sistema de Relatórios */}
              <SistemaRelatorios tipoRestaurante="self-service" dadosAtuais={dadosAtuais} configuracao={configuracao} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
