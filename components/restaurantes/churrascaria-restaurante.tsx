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
import { Save, Beef, TrendingUp, Utensils, DollarSign, Users, Flame } from "lucide-react"
import { formatarMoeda } from "../../utils/unit-converter"
import { SistemaRelatorios } from "../relatorios/sistema-relatorios"

interface TipoCarne {
  nome: string
  custoKg: number
  precoVenda: number
  consumoMedioPorPessoa: number
  tempoAssado: number
  disponivel: boolean
  estimativaConsumoKgDia: number
}

interface ConfiguracaoChurrascaria {
  nomeRestaurante: string
  tipoOperacao: "rodizio" | "ala_carte" | "misto"
  precoRodizio: number
  precoRodizioInfantil: number
  precoRodizioMelhorIdade: number
  estimativaClientesDia: number
  percentualInfantil: number
  percentualMelhorIdade: number
  tiposCarnes: TipoCarne[]
  horarioFuncionamento: {
    abertura: string
    fechamento: string
  }
  diasFuncionamento: string[]
  tempoMedioRefeicao: number
  capacidadeMaxima: number
}

const carnesPadrao: TipoCarne[] = [
  {
    nome: "Picanha",
    custoKg: 45.0,
    precoVenda: 0,
    consumoMedioPorPessoa: 0.15,
    tempoAssado: 25,
    disponivel: true,
    estimativaConsumoKgDia: 0,
  },
  {
    nome: "Maminha",
    custoKg: 28.0,
    precoVenda: 0,
    consumoMedioPorPessoa: 0.12,
    tempoAssado: 20,
    disponivel: true,
    estimativaConsumoKgDia: 0,
  },
  {
    nome: "Fraldinha",
    custoKg: 32.0,
    precoVenda: 0,
    consumoMedioPorPessoa: 0.1,
    tempoAssado: 18,
    disponivel: true,
    estimativaConsumoKgDia: 0,
  },
  {
    nome: "Costela",
    custoKg: 25.0,
    precoVenda: 0,
    consumoMedioPorPessoa: 0.2,
    tempoAssado: 45,
    disponivel: true,
    estimativaConsumoKgDia: 0,
  },
  {
    nome: "Linguiça",
    custoKg: 18.0,
    precoVenda: 0,
    consumoMedioPorPessoa: 0.08,
    tempoAssado: 15,
    disponivel: true,
    estimativaConsumoKgDia: 0,
  },
  {
    nome: "Coração",
    custoKg: 15.0,
    precoVenda: 0,
    consumoMedioPorPessoa: 0.06,
    tempoAssado: 12,
    disponivel: true,
    estimativaConsumoKgDia: 0,
  },
]

export function ChurrascariaRestaurante() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoChurrascaria>({
    nomeRestaurante: "",
    tipoOperacao: "rodizio",
    precoRodizio: 45.0,
    precoRodizioInfantil: 22.5,
    precoRodizioMelhorIdade: 35.0,
    estimativaClientesDia: 0,
    percentualInfantil: 15,
    percentualMelhorIdade: 20,
    tiposCarnes: carnesPadrao,
    horarioFuncionamento: {
      abertura: "11:00",
      fechamento: "15:00",
    },
    diasFuncionamento: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"],
    tempoMedioRefeicao: 90,
    capacidadeMaxima: 100,
  })

  const [activeTab, setActiveTab] = useState("configuracao")

  useEffect(() => {
    // Carregar configuração salva
    const configSalva = localStorage.getItem("churrascaria_config")
    if (configSalva) {
      setConfiguracao(JSON.parse(configSalva))
    }
  }, [])

  const salvarConfiguracao = () => {
    localStorage.setItem("churrascaria_config", JSON.stringify(configuracao))
    alert("Configuração salva com sucesso!")
  }

  const atualizarTipoCarne = (index: number, campo: string, valor: any) => {
    const carnesAtualizadas = [...configuracao.tiposCarnes]
    carnesAtualizadas[index] = { ...carnesAtualizadas[index], [campo]: valor }

    // Calcular estimativa de consumo baseada no número de clientes
    if (campo === "disponivel" || configuracao.estimativaClientesDia > 0) {
      carnesAtualizadas[index].estimativaConsumoKgDia = carnesAtualizadas[index].disponivel
        ? configuracao.estimativaClientesDia * carnesAtualizadas[index].consumoMedioPorPessoa
        : 0
    }

    setConfiguracao({
      ...configuracao,
      tiposCarnes: carnesAtualizadas,
    })
  }

  const adicionarTipoCarne = () => {
    const novaCarne: TipoCarne = {
      nome: "",
      custoKg: 0,
      precoVenda: 0,
      consumoMedioPorPessoa: 0.1,
      tempoAssado: 20,
      disponivel: true,
      estimativaConsumoKgDia: 0,
    }

    setConfiguracao({
      ...configuracao,
      tiposCarnes: [...configuracao.tiposCarnes, novaCarne],
    })
  }

  const removerTipoCarne = (index: number) => {
    setConfiguracao({
      ...configuracao,
      tiposCarnes: configuracao.tiposCarnes.filter((_, i) => i !== index),
    })
  }

  const calcularReceitaDiaria = () => {
    const clientesAdultos =
      configuracao.estimativaClientesDia *
      (1 - (configuracao.percentualInfantil + configuracao.percentualMelhorIdade) / 100)
    const clientesInfantis = configuracao.estimativaClientesDia * (configuracao.percentualInfantil / 100)
    const clientesMelhorIdade = configuracao.estimativaClientesDia * (configuracao.percentualMelhorIdade / 100)

    if (configuracao.tipoOperacao === "rodizio" || configuracao.tipoOperacao === "misto") {
      return (
        clientesAdultos * configuracao.precoRodizio +
        clientesInfantis * configuracao.precoRodizioInfantil +
        clientesMelhorIdade * configuracao.precoRodizioMelhorIdade
      )
    }

    // Para à la carte, calcular baseado no preço das carnes
    return configuracao.tiposCarnes
      .filter((c) => c.disponivel)
      .reduce((total, carne) => total + carne.precoVenda * carne.estimativaConsumoKgDia, 0)
  }

  const calcularCustoDiario = () => {
    return configuracao.tiposCarnes
      .filter((c) => c.disponivel)
      .reduce((total, carne) => total + carne.custoKg * carne.estimativaConsumoKgDia, 0)
  }

  const calcularLucroDiario = () => {
    return calcularReceitaDiaria() - calcularCustoDiario()
  }

  const calcularConsumoTotalKg = () => {
    return configuracao.tiposCarnes
      .filter((c) => c.disponivel)
      .reduce((total, carne) => total + carne.estimativaConsumoKgDia, 0)
  }

  const recalcularEstimativasConsumo = () => {
    const carnesAtualizadas = configuracao.tiposCarnes.map((carne) => ({
      ...carne,
      estimativaConsumoKgDia: carne.disponivel ? configuracao.estimativaClientesDia * carne.consumoMedioPorPessoa : 0,
    }))

    setConfiguracao({
      ...configuracao,
      tiposCarnes: carnesAtualizadas,
    })
  }

  useEffect(() => {
    if (configuracao.estimativaClientesDia > 0) {
      recalcularEstimativasConsumo()
    }
  }, [configuracao.estimativaClientesDia])

  // Dados para o sistema de relatórios
  const dadosAtuais = {
    receita: calcularReceitaDiaria(),
    custo: calcularCustoDiario(),
    lucro: calcularLucroDiario(),
    vendas: configuracao.estimativaClientesDia,
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
                <Beef className="w-4 h-4" />
                <span className="text-responsive-sm">Configuração</span>
              </TabsTrigger>
              <TabsTrigger
                value="carnes"
                className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Flame className="w-4 h-4" />
                <span className="text-responsive-sm">Carnes</span>
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
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-red-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <Beef className="w-6 h-6 text-red-600" />
                    Configuração da Churrascaria
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Configure as informações básicas da sua churrascaria
                  </CardDescription>
                </CardHeader>
                <CardContent className="form-section">
                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Nome da Churrascaria</Label>
                      <Input
                        placeholder="Ex: Churrascaria Boi na Brasa"
                        value={configuracao.nomeRestaurante}
                        onChange={(e) => setConfiguracao({ ...configuracao, nomeRestaurante: e.target.value })}
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Tipo de Operação</Label>
                      <Select
                        value={configuracao.tipoOperacao}
                        onValueChange={(value: "rodizio" | "ala_carte" | "misto") =>
                          setConfiguracao({ ...configuracao, tipoOperacao: value })
                        }
                      >
                        <SelectTrigger className="input-responsive border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rodizio">Rodízio</SelectItem>
                          <SelectItem value="ala_carte">À La Carte</SelectItem>
                          <SelectItem value="misto">Misto (Rodízio + À La Carte)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(configuracao.tipoOperacao === "rodizio" || configuracao.tipoOperacao === "misto") && (
                    <div className="space-y-4">
                      <h4 className="text-responsive-lg font-semibold text-gray-800">Preços do Rodízio</h4>
                      <div className="grid-responsive-3">
                        <div className="space-y-3">
                          <Label className="text-responsive-base font-medium">Adulto (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 45.00"
                            value={configuracao.precoRodizio}
                            onChange={(e) => setConfiguracao({ ...configuracao, precoRodizio: Number(e.target.value) })}
                            className="input-responsive border-2"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-responsive-base font-medium">Infantil (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 22.50"
                            value={configuracao.precoRodizioInfantil}
                            onChange={(e) =>
                              setConfiguracao({ ...configuracao, precoRodizioInfantil: Number(e.target.value) })
                            }
                            className="input-responsive border-2"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-responsive-base font-medium">Melhor Idade (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 35.00"
                            value={configuracao.precoRodizioMelhorIdade}
                            onChange={(e) =>
                              setConfiguracao({ ...configuracao, precoRodizioMelhorIdade: Number(e.target.value) })
                            }
                            className="input-responsive border-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Estimativa de Clientes/Dia</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 80"
                        value={configuracao.estimativaClientesDia}
                        onChange={(e) =>
                          setConfiguracao({ ...configuracao, estimativaClientesDia: Number(e.target.value) })
                        }
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Capacidade Máxima</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 100"
                        value={configuracao.capacidadeMaxima}
                        onChange={(e) => setConfiguracao({ ...configuracao, capacidadeMaxima: Number(e.target.value) })}
                        className="input-responsive border-2"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">% Clientes Infantis</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 15"
                        value={configuracao.percentualInfantil}
                        onChange={(e) =>
                          setConfiguracao({ ...configuracao, percentualInfantil: Number(e.target.value) })
                        }
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">% Melhor Idade</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 20"
                        value={configuracao.percentualMelhorIdade}
                        onChange={(e) =>
                          setConfiguracao({ ...configuracao, percentualMelhorIdade: Number(e.target.value) })
                        }
                        className="input-responsive border-2"
                      />
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
                      <Label className="text-responsive-base font-medium">Tempo Médio de Refeição (min)</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 90"
                        value={configuracao.tempoMedioRefeicao}
                        onChange={(e) =>
                          setConfiguracao({ ...configuracao, tempoMedioRefeicao: Number(e.target.value) })
                        }
                        className="input-responsive border-2"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={salvarConfiguracao}
                    className="w-full button-responsive bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-responsive"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    <span className="text-responsive-sm">Salvar Configuração</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="carnes" className="space-y-6">
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-orange-50 shadow-responsive">
                <CardHeader>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                        <Flame className="w-6 h-6 text-orange-600" />
                        Tipos de Carnes
                      </CardTitle>
                      <CardDescription className="text-responsive-base">
                        Configure os tipos de carnes, custos e consumo
                      </CardDescription>
                    </div>
                    <Button onClick={adicionarTipoCarne} className="button-responsive">
                      Adicionar Carne
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {configuracao.tiposCarnes.map((carne, index) => (
                      <Card key={index} className="card-responsive shadow-responsive">
                        <CardContent className="spacing-responsive">
                          <div className="space-y-4">
                            {/* Header da carne */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                              <div className="flex items-center gap-3">
                                <Input
                                  placeholder="Nome da carne"
                                  value={carne.nome}
                                  onChange={(e) => atualizarTipoCarne(index, "nome", e.target.value)}
                                  className="text-responsive-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                                />
                                <Badge
                                  variant={carne.disponivel ? "default" : "secondary"}
                                  className="text-responsive-xs"
                                >
                                  {carne.disponivel ? "Disponível" : "Indisponível"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={carne.disponivel}
                                  onCheckedChange={(checked) => atualizarTipoCarne(index, "disponivel", checked)}
                                />
                                <Label className="text-responsive-xs">Disponível</Label>
                              </div>
                            </div>

                            {/* Campos de configuração */}
                            <div className="form-grid">
                              <div className="space-y-2">
                                <Label className="text-responsive-sm">Custo por Kg (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={carne.custoKg}
                                  onChange={(e) => atualizarTipoCarne(index, "custoKg", Number(e.target.value))}
                                  className="h-10 text-responsive-sm"
                                />
                              </div>

                              {configuracao.tipoOperacao === "ala_carte" && (
                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Preço de Venda por Kg (R$)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={carne.precoVenda}
                                    onChange={(e) => atualizarTipoCarne(index, "precoVenda", Number(e.target.value))}
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label className="text-responsive-sm">Consumo Médio/Pessoa (kg)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={carne.consumoMedioPorPessoa}
                                  onChange={(e) =>
                                    atualizarTipoCarne(index, "consumoMedioPorPessoa", Number(e.target.value))
                                  }
                                  className="h-10 text-responsive-sm"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-responsive-sm">Tempo de Assado (min)</Label>
                                <Input
                                  type="number"
                                  value={carne.tempoAssado}
                                  onChange={(e) => atualizarTipoCarne(index, "tempoAssado", Number(e.target.value))}
                                  className="h-10 text-responsive-sm"
                                />
                              </div>
                            </div>

                            {/* Estimativas */}
                            <div className="bg-gray-50 rounded-xl spacing-responsive">
                              <div className="grid-responsive-4 gap-3 text-center">
                                <div>
                                  <p className="text-responsive-xs text-gray-600">Consumo/Dia</p>
                                  <p className="text-responsive-sm font-bold text-blue-600">
                                    {carne.estimativaConsumoKgDia.toFixed(1)} kg
                                  </p>
                                </div>
                                <div>
                                  <p className="text-responsive-xs text-gray-600">Custo/Dia</p>
                                  <p className="text-responsive-sm font-bold text-red-600">
                                    {formatarMoeda(carne.custoKg * carne.estimativaConsumoKgDia)}
                                  </p>
                                </div>
                                {configuracao.tipoOperacao === "ala_carte" && (
                                  <>
                                    <div>
                                      <p className="text-responsive-xs text-gray-600">Receita/Dia</p>
                                      <p className="text-responsive-sm font-bold text-green-600">
                                        {formatarMoeda(carne.precoVenda * carne.estimativaConsumoKgDia)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-responsive-xs text-gray-600">Margem</p>
                                      <p className="text-responsive-sm font-bold text-purple-600">
                                        {carne.precoVenda > 0
                                          ? (((carne.precoVenda - carne.custoKg) / carne.precoVenda) * 100).toFixed(1)
                                          : 0}
                                        %
                                      </p>
                                    </div>
                                  </>
                                )}
                                {configuracao.tipoOperacao === "rodizio" && (
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Tempo Assado</p>
                                    <p className="text-responsive-sm font-bold text-orange-600">
                                      {carne.tempoAssado}min
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removerTipoCarne(index)}
                                className="text-responsive-xs"
                              >
                                Remover Carne
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {configuracao.tiposCarnes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Beef className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-responsive-lg">Nenhuma carne configurada. Adicione carnes acima.</p>
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
                        <p className="text-responsive-sm font-medium text-gray-600">Custo Carnes</p>
                        <p className="text-responsive-2xl font-bold text-red-600">
                          {formatarMoeda(calcularCustoDiario())}
                        </p>
                      </div>
                      <Beef className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Clientes/Dia</p>
                        <p className="text-responsive-2xl font-bold text-blue-600">
                          {configuracao.estimativaClientesDia}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Consumo Total</p>
                        <p className="text-responsive-2xl font-bold text-orange-600">
                          {calcularConsumoTotalKg().toFixed(1)} kg
                        </p>
                      </div>
                      <Utensils className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sistema de Relatórios */}
              <SistemaRelatorios tipoRestaurante="churrascaria" dadosAtuais={dadosAtuais} configuracao={configuracao} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
