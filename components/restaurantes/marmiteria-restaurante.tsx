"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Package, TrendingUp, Calendar, DollarSign, Users, Clock } from "lucide-react"
import { formatarMoeda, calcularCustoReceita, type IngredienteCalculo } from "../../utils/unit-converter"
import { SistemaRelatorios } from "../relatorios/sistema-relatorios"

interface MarmitaTamanho {
  nome: string
  capacidadeMl: number
  precoVenda: number
  custoEmbalagem: number
  estimativaVendasDia: number
}

interface PratoMarmiteria {
  pratoId: string
  nome: string
  categoria: string
  custoProducao: number
  custoEditavel: boolean
  disponivel: boolean
  rendimentoPorcoes: number
  tempoConservacao: number
}

interface ConfiguracaoMarmiteria {
  nomeRestaurante: string
  tipoOperacao: "tradicional" | "gourmet" | "fitness"
  tamanhosMarmita: MarmitaTamanho[]
  pratosDisponiveis: PratoMarmiteria[]
  horarioFuncionamento: {
    abertura: string
    fechamento: string
  }
  diasFuncionamento: string[]
  tempoEntrega: number
  raioEntregaKm: number
  taxaEntrega: number
}

const tamanhosPadrao: MarmitaTamanho[] = [
  { nome: "P", capacidadeMl: 500, precoVenda: 12.0, custoEmbalagem: 1.5, estimativaVendasDia: 0 },
  { nome: "M", capacidadeMl: 750, precoVenda: 15.0, custoEmbalagem: 2.0, estimativaVendasDia: 0 },
  { nome: "G", capacidadeMl: 1000, precoVenda: 18.0, custoEmbalagem: 2.5, estimativaVendasDia: 0 },
]

export function MarmiteriaRestaurante() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoMarmiteria>({
    nomeRestaurante: "",
    tipoOperacao: "tradicional",
    tamanhosMarmita: tamanhosPadrao,
    pratosDisponiveis: [],
    horarioFuncionamento: {
      abertura: "10:00",
      fechamento: "15:00",
    },
    diasFuncionamento: ["segunda", "terca", "quarta", "quinta", "sexta"],
    tempoEntrega: 30,
    raioEntregaKm: 3,
    taxaEntrega: 3.0,
  })

  const [pratos, setPratos] = useState<any[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [activeTab, setActiveTab] = useState("configuracao")

  useEffect(() => {
    // Carregar configuração salva
    const configSalva = localStorage.getItem("marmiteria_config")
    if (configSalva) {
      setConfiguracao(JSON.parse(configSalva))
    }

    // Carregar pratos disponíveis
    const pratosData = localStorage.getItem("pratos")
    if (pratosData) {
      const todosPratos = JSON.parse(pratosData)
      setPratos(todosPratos.filter((p: any) => p.disponibilidade.marmiteria))
    }

    // Carregar ingredientes
    const ingredientesData = localStorage.getItem("ingredientes")
    if (ingredientesData) {
      setIngredientes(JSON.parse(ingredientesData))
    }
  }, [])

  const salvarConfiguracao = () => {
    localStorage.setItem("marmiteria_config", JSON.stringify(configuracao))
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

    const novoPratoMarmiteria: PratoMarmiteria = {
      pratoId: prato.id,
      nome: prato.nome,
      categoria: prato.categoria,
      custoProducao: custoCalculado,
      custoEditavel: false,
      disponivel: true,
      rendimentoPorcoes: prato.rendimento || 4,
      tempoConservacao: 24,
    }

    setConfiguracao({
      ...configuracao,
      pratosDisponiveis: [...configuracao.pratosDisponiveis, novoPratoMarmiteria],
    })
  }

  const atualizarPratoMarmiteria = (index: number, campo: string, valor: any) => {
    const pratosAtualizados = [...configuracao.pratosDisponiveis]
    pratosAtualizados[index] = { ...pratosAtualizados[index], [campo]: valor }

    setConfiguracao({
      ...configuracao,
      pratosDisponiveis: pratosAtualizados,
    })
  }

  const removerPratoDoCardapio = (index: number) => {
    setConfiguracao({
      ...configuracao,
      pratosDisponiveis: configuracao.pratosDisponiveis.filter((_, i) => i !== index),
    })
  }

  const atualizarTamanhoMarmita = (index: number, campo: string, valor: any) => {
    const tamanhosAtualizados = [...configuracao.tamanhosMarmita]
    tamanhosAtualizados[index] = { ...tamanhosAtualizados[index], [campo]: valor }

    setConfiguracao({
      ...configuracao,
      tamanhosMarmita: tamanhosAtualizados,
    })
  }

  const calcularReceitaDiaria = () => {
    return configuracao.tamanhosMarmita.reduce(
      (total, tamanho) => total + tamanho.precoVenda * tamanho.estimativaVendasDia,
      0,
    )
  }

  const calcularCustoEmbalagens = () => {
    return configuracao.tamanhosMarmita.reduce(
      (total, tamanho) => total + tamanho.custoEmbalagem * tamanho.estimativaVendasDia,
      0,
    )
  }

  const calcularCustoProducao = () => {
    const pratosAtivos = configuracao.pratosDisponiveis.filter((p) => p.disponivel)
    const custoMedioPrato = pratosAtivos.reduce((acc, prato) => acc + prato.custoProducao, 0) / pratosAtivos.length || 0
    const totalVendas = configuracao.tamanhosMarmita.reduce((acc, tamanho) => acc + tamanho.estimativaVendasDia, 0)

    return custoMedioPrato * totalVendas
  }

  const calcularLucroDiario = () => {
    return calcularReceitaDiaria() - calcularCustoEmbalagens() - calcularCustoProducao()
  }

  const calcularTotalVendas = () => {
    return configuracao.tamanhosMarmita.reduce((total, tamanho) => total + tamanho.estimativaVendasDia, 0)
  }

  // Dados para o sistema de relatórios
  const dadosAtuais = {
    receita: calcularReceitaDiaria(),
    custo: calcularCustoEmbalagens() + calcularCustoProducao(),
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
                <Package className="w-4 h-4" />
                <span className="text-responsive-sm">Configuração</span>
              </TabsTrigger>
              <TabsTrigger
                value="tamanhos"
                className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-responsive-sm">Tamanhos</span>
              </TabsTrigger>
              <TabsTrigger
                value="pratos"
                className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span className="text-responsive-sm">Pratos</span>
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
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-purple-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-6 h-6 text-purple-600" />
                    Configuração da Marmiteria
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Configure as informações básicas da sua marmiteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="form-section">
                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Nome da Marmiteria</Label>
                      <Input
                        placeholder="Ex: Marmiteria da Vovó"
                        value={configuracao.nomeRestaurante}
                        onChange={(e) => setConfiguracao({ ...configuracao, nomeRestaurante: e.target.value })}
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Tipo de Operação</Label>
                      <Select
                        value={configuracao.tipoOperacao}
                        onValueChange={(value: "tradicional" | "gourmet" | "fitness") =>
                          setConfiguracao({ ...configuracao, tipoOperacao: value })
                        }
                      >
                        <SelectTrigger className="input-responsive border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tradicional">Tradicional</SelectItem>
                          <SelectItem value="gourmet">Gourmet</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Horário de Funcionamento</Label>
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={configuracao.horarioFuncionamento.abertura}
                          onChange={(e) =>
                            setConfiguracao({
                              ...configuracao,
                              horarioFuncionamento: {
                                ...configuracao.horarioFuncionamento,
                                abertura: e.target.value,
                              },
                            })
                          }
                          className="input-responsive border-2"
                        />
                        <Input
                          type="time"
                          value={configuracao.horarioFuncionamento.fechamento}
                          onChange={(e) =>
                            setConfiguracao({
                              ...configuracao,
                              horarioFuncionamento: {
                                ...configuracao.horarioFuncionamento,
                                fechamento: e.target.value,
                              },
                            })
                          }
                          className="input-responsive border-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Tempo de Entrega (min)</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 30"
                        value={configuracao.tempoEntrega}
                        onChange={(e) => setConfiguracao({ ...configuracao, tempoEntrega: Number(e.target.value) })}
                        className="input-responsive border-2"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Raio de Entrega (km)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Ex: 3"
                        value={configuracao.raioEntregaKm}
                        onChange={(e) => setConfiguracao({ ...configuracao, raioEntregaKm: Number(e.target.value) })}
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Taxa de Entrega (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 3.00"
                        value={configuracao.taxaEntrega}
                        onChange={(e) => setConfiguracao({ ...configuracao, taxaEntrega: Number(e.target.value) })}
                        className="input-responsive border-2"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={salvarConfiguracao}
                    className="w-full button-responsive bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-responsive"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    <span className="text-responsive-sm">Salvar Configuração</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tamanhos" className="space-y-6">
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-green-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    Tamanhos de Marmita
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Configure os tamanhos, preços e estimativas de venda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {configuracao.tamanhosMarmita.map((tamanho, index) => (
                      <Card key={index} className="card-responsive shadow-responsive">
                        <CardContent className="spacing-responsive">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-responsive-lg font-semibold">Marmita {tamanho.nome}</h5>
                              <Badge variant="outline" className="text-responsive-xs">
                                {tamanho.capacidadeMl}ml
                              </Badge>
                            </div>

                            <div className="form-grid">
                              <div className="space-y-2">
                                <Label className="text-responsive-sm">Capacidade (ml)</Label>
                                <Input
                                  type="number"
                                  value={tamanho.capacidadeMl}
                                  onChange={(e) =>
                                    atualizarTamanhoMarmita(index, "capacidadeMl", Number(e.target.value))
                                  }
                                  className="h-10 text-responsive-sm"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-responsive-sm">Preço de Venda (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={tamanho.precoVenda}
                                  onChange={(e) => atualizarTamanhoMarmita(index, "precoVenda", Number(e.target.value))}
                                  className="h-10 text-responsive-sm"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-responsive-sm">Custo Embalagem (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={tamanho.custoEmbalagem}
                                  onChange={(e) =>
                                    atualizarTamanhoMarmita(index, "custoEmbalagem", Number(e.target.value))
                                  }
                                  className="h-10 text-responsive-sm"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-responsive-sm">Vendas/Dia</Label>
                                <Input
                                  type="number"
                                  value={tamanho.estimativaVendasDia}
                                  onChange={(e) =>
                                    atualizarTamanhoMarmita(index, "estimativaVendasDia", Number(e.target.value))
                                  }
                                  className="h-10 text-responsive-sm"
                                />
                              </div>
                            </div>

                            {/* Resumo financeiro do tamanho */}
                            <div className="bg-gray-50 rounded-xl spacing-responsive">
                              <div className="grid-responsive-3 gap-3 text-center">
                                <div>
                                  <p className="text-responsive-xs text-gray-600">Receita/Dia</p>
                                  <p className="text-responsive-sm font-bold text-green-600">
                                    {formatarMoeda(tamanho.precoVenda * tamanho.estimativaVendasDia)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-responsive-xs text-gray-600">Custo Embalagem/Dia</p>
                                  <p className="text-responsive-sm font-bold text-red-600">
                                    {formatarMoeda(tamanho.custoEmbalagem * tamanho.estimativaVendasDia)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-responsive-xs text-gray-600">Margem Embalagem</p>
                                  <p className="text-responsive-sm font-bold text-blue-600">
                                    {tamanho.precoVenda > 0
                                      ? (
                                          ((tamanho.precoVenda - tamanho.custoEmbalagem) / tamanho.precoVenda) *
                                          100
                                        ).toFixed(1)
                                      : 0}
                                    %
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pratos" className="space-y-6">
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-yellow-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                    Pratos Disponíveis
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Gerencie os pratos que podem ser servidos nas marmitas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pratos disponíveis para adicionar */}
                  <div className="space-y-4">
                    <h4 className="text-responsive-lg font-semibold text-gray-800">Adicionar Pratos</h4>
                    <div className="grid-cards">
                      {pratos
                        .filter((prato) => !configuracao.pratosDisponiveis.some((p) => p.pratoId === prato.id))
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
                                  Adicionar aos Pratos
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>

                  {/* Pratos configurados */}
                  <div className="space-y-4">
                    <h4 className="text-responsive-lg font-semibold text-gray-800">Pratos Configurados</h4>
                    <div className="space-y-4">
                      {configuracao.pratosDisponiveis.map((pratoMarmiteria, index) => (
                        <Card key={pratoMarmiteria.pratoId} className="card-responsive shadow-responsive">
                          <CardContent className="spacing-responsive">
                            <div className="space-y-4">
                              {/* Header do prato */}
                              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                                <div>
                                  <h5 className="text-responsive-lg font-semibold">{pratoMarmiteria.nome}</h5>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge variant="outline" className="text-responsive-xs">
                                      {pratoMarmiteria.categoria}
                                    </Badge>
                                    <Badge
                                      variant={pratoMarmiteria.disponivel ? "default" : "secondary"}
                                      className="text-responsive-xs"
                                    >
                                      {pratoMarmiteria.disponivel ? "Disponível" : "Indisponível"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={pratoMarmiteria.disponivel}
                                    onCheckedChange={(checked) =>
                                      atualizarPratoMarmiteria(index, "disponivel", checked)
                                    }
                                  />
                                  <Label className="text-responsive-xs">Disponível</Label>
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
                                      value={pratoMarmiteria.custoProducao}
                                      onChange={(e) =>
                                        atualizarPratoMarmiteria(index, "custoProducao", Number(e.target.value))
                                      }
                                      disabled={!pratoMarmiteria.custoEditavel}
                                      className="h-10 text-responsive-sm"
                                    />
                                    <Checkbox
                                      checked={pratoMarmiteria.custoEditavel}
                                      onCheckedChange={(checked) =>
                                        atualizarPratoMarmiteria(index, "custoEditavel", checked)
                                      }
                                    />
                                  </div>
                                  <span className="text-responsive-xs text-gray-500">
                                    {pratoMarmiteria.custoEditavel ? "Editável" : "Automático"}
                                  </span>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Rendimento (porções)</Label>
                                  <Input
                                    type="number"
                                    value={pratoMarmiteria.rendimentoPorcoes}
                                    onChange={(e) =>
                                      atualizarPratoMarmiteria(index, "rendimentoPorcoes", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Conservação (horas)</Label>
                                  <Input
                                    type="number"
                                    value={pratoMarmiteria.tempoConservacao}
                                    onChange={(e) =>
                                      atualizarPratoMarmiteria(index, "tempoConservacao", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removerPratoDoCardapio(index)}
                                  className="text-responsive-xs"
                                >
                                  Remover Prato
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {configuracao.pratosDisponiveis.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-responsive-lg">Nenhum prato configurado. Adicione pratos acima.</p>
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
                        <p className="text-responsive-sm font-medium text-gray-600">Custo Embalagens</p>
                        <p className="text-responsive-2xl font-bold text-red-600">
                          {formatarMoeda(calcularCustoEmbalagens())}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Vendas/Dia</p>
                        <p className="text-responsive-2xl font-bold text-blue-600">{calcularTotalVendas()}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Tempo Entrega</p>
                        <p className="text-responsive-2xl font-bold text-purple-600">{configuracao.tempoEntrega}min</p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sistema de Relatórios */}
              <SistemaRelatorios tipoRestaurante="marmiteria" dadosAtuais={dadosAtuais} configuracao={configuracao} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
