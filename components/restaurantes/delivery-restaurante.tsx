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
import { Save, Truck, TrendingUp, Menu, DollarSign, Package, Percent } from "lucide-react"
import { formatarMoeda, calcularCustoReceita, type IngredienteCalculo } from "../../utils/unit-converter"
import { SistemaRelatorios } from "../relatorios/sistema-relatorios"

interface PratoDelivery {
  pratoId: string
  nome: string
  categoria: string
  precoDelivery: number
  custoEmbalagem: number
  tempoPreparoMinutos: number
  disponivel: boolean
  estimativaPedidosDia: number
  plataformas: {
    ifood: boolean
    ubereats: boolean
    rappi: boolean
    proprio: boolean
  }
  comissaoCalculada: {
    ifood: number
    ubereats: number
    rappi: number
  }
}

interface ConfiguracaoDelivery {
  nomeRestaurante: string
  tipoOperacao: "dark_kitchen" | "restaurante_delivery" | "food_truck"
  taxaEntrega: number
  raioEntregaKm: number
  tempoEntregaMinutos: number
  horarioFuncionamento: {
    abertura: string
    fechamento: string
  }
  diasFuncionamento: string[]
  cardapioDelivery: PratoDelivery[]
  comissaoPlataformas: {
    ifood: number
    ubereats: number
    rappi: number
  }
}

const plataformasConfig = {
  ifood: { nome: "iFood", cor: "bg-red-500", comissaoPadrao: 23 },
  ubereats: { nome: "Uber Eats", cor: "bg-green-500", comissaoPadrao: 20 },
  rappi: { nome: "Rappi", cor: "bg-orange-500", comissaoPadrao: 25 },
  proprio: { nome: "Site Próprio", cor: "bg-blue-500", comissaoPadrao: 0 },
}

export function DeliveryRestaurante() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoDelivery>({
    nomeRestaurante: "",
    tipoOperacao: "restaurante_delivery",
    taxaEntrega: 5.0,
    raioEntregaKm: 5,
    tempoEntregaMinutos: 45,
    horarioFuncionamento: {
      abertura: "18:00",
      fechamento: "23:00",
    },
    diasFuncionamento: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"],
    cardapioDelivery: [],
    comissaoPlataformas: {
      ifood: 23,
      ubereats: 20,
      rappi: 25,
    },
  })

  const [pratos, setPratos] = useState<any[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [activeTab, setActiveTab] = useState("configuracao")

  useEffect(() => {
    // Carregar configuração salva
    const configSalva = localStorage.getItem("delivery_config")
    if (configSalva) {
      setConfiguracao(JSON.parse(configSalva))
    }

    // Carregar pratos disponíveis
    const pratosData = localStorage.getItem("pratos")
    if (pratosData) {
      const todosPratos = JSON.parse(pratosData)
      setPratos(todosPratos.filter((p: any) => p.disponibilidade.delivery))
    }

    // Carregar ingredientes
    const ingredientesData = localStorage.getItem("ingredientes")
    if (ingredientesData) {
      setIngredientes(JSON.parse(ingredientesData))
    }
  }, [])

  const salvarConfiguracao = () => {
    localStorage.setItem("delivery_config", JSON.stringify(configuracao))
    alert("Configuração salva com sucesso!")
  }

  const calcularCustoPrato = (pratoId: string): number => {
    const prato = pratos.find((p) => p.id === pratoId)
    if (!prato || !ingredientes.length) return 0

    const { custoUnitario } = calcularCustoReceita(prato.ingredientes || [], ingredientes, prato.rendimento || 1)

    return custoUnitario
  }

  const calcularComissaoPrato = (prato: PratoDelivery): number => {
    let comissaoTotal = 0
    const receitaPrato = prato.precoDelivery * prato.estimativaPedidosDia

    if (prato.plataformas.ifood) {
      comissaoTotal += receitaPrato * (configuracao.comissaoPlataformas.ifood / 100)
    }
    if (prato.plataformas.ubereats) {
      comissaoTotal += receitaPrato * (configuracao.comissaoPlataformas.ubereats / 100)
    }
    if (prato.plataformas.rappi) {
      comissaoTotal += receitaPrato * (configuracao.comissaoPlataformas.rappi / 100)
    }

    return comissaoTotal
  }

  const adicionarPratoAoCardapio = (prato: any) => {
    const custoCalculado = calcularCustoPrato(prato.id)

    const novoPratoDelivery: PratoDelivery = {
      pratoId: prato.id,
      nome: prato.nome,
      categoria: prato.categoria,
      precoDelivery: 0,
      custoEmbalagem: 2.0,
      tempoPreparoMinutos: 20,
      disponivel: true,
      estimativaPedidosDia: 0,
      plataformas: {
        ifood: true,
        ubereats: false,
        rappi: false,
        proprio: true,
      },
      comissaoCalculada: {
        ifood: 0,
        ubereats: 0,
        rappi: 0,
      },
    }

    setConfiguracao({
      ...configuracao,
      cardapioDelivery: [...configuracao.cardapioDelivery, novoPratoDelivery],
    })
  }

  const atualizarPratoDelivery = (index: number, campo: string, valor: any) => {
    const cardapioAtualizado = [...configuracao.cardapioDelivery]
    cardapioAtualizado[index] = { ...cardapioAtualizado[index], [campo]: valor }

    // Recalcular comissões quando necessário
    if (campo === "precoDelivery" || campo === "estimativaPedidosDia" || campo === "plataformas") {
      const prato = cardapioAtualizado[index]
      prato.comissaoCalculada = {
        ifood: prato.plataformas.ifood
          ? prato.precoDelivery * prato.estimativaPedidosDia * (configuracao.comissaoPlataformas.ifood / 100)
          : 0,
        ubereats: prato.plataformas.ubereats
          ? prato.precoDelivery * prato.estimativaPedidosDia * (configuracao.comissaoPlataformas.ubereats / 100)
          : 0,
        rappi: prato.plataformas.rappi
          ? prato.precoDelivery * prato.estimativaPedidosDia * (configuracao.comissaoPlataformas.rappi / 100)
          : 0,
      }
    }

    setConfiguracao({
      ...configuracao,
      cardapioDelivery: cardapioAtualizado,
    })
  }

  const removerPratoDoCardapio = (index: number) => {
    setConfiguracao({
      ...configuracao,
      cardapioDelivery: configuracao.cardapioDelivery.filter((_, i) => i !== index),
    })
  }

  const calcularReceitaDiaria = () => {
    return configuracao.cardapioDelivery
      .filter((p) => p.disponivel)
      .reduce((total, prato) => total + prato.precoDelivery * prato.estimativaPedidosDia, 0)
  }

  const calcularComissaoTotal = () => {
    return configuracao.cardapioDelivery
      .filter((p) => p.disponivel)
      .reduce((total, prato) => total + calcularComissaoPrato(prato), 0)
  }

  const calcularCustoEmbalagens = () => {
    return configuracao.cardapioDelivery
      .filter((p) => p.disponivel)
      .reduce((total, prato) => total + prato.custoEmbalagem * prato.estimativaPedidosDia, 0)
  }

  const calcularReceitaLiquida = () => {
    return calcularReceitaDiaria() - calcularComissaoTotal() - calcularCustoEmbalagens()
  }

  const calcularTotalVendas = () => {
    return configuracao.cardapioDelivery
      .filter((p) => p.disponivel)
      .reduce((total, prato) => total + prato.estimativaPedidosDia, 0)
  }

  // Dados para o sistema de relatórios
  const dadosAtuais = {
    receita: calcularReceitaLiquida(),
    custo: calcularComissaoTotal() + calcularCustoEmbalagens(),
    lucro: calcularReceitaLiquida() - (calcularComissaoTotal() + calcularCustoEmbalagens()),
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
                <Truck className="w-4 h-4" />
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
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-orange-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <Truck className="w-6 h-6 text-orange-600" />
                    Configuração do Delivery
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Configure as informações básicas do seu delivery
                  </CardDescription>
                </CardHeader>
                <CardContent className="form-section">
                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Nome do Restaurante</Label>
                      <Input
                        placeholder="Ex: Burger Express Delivery"
                        value={configuracao.nomeRestaurante}
                        onChange={(e) => setConfiguracao({ ...configuracao, nomeRestaurante: e.target.value })}
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Tipo de Operação</Label>
                      <Select
                        value={configuracao.tipoOperacao}
                        onValueChange={(value: "dark_kitchen" | "restaurante_delivery" | "food_truck") =>
                          setConfiguracao({ ...configuracao, tipoOperacao: value })
                        }
                      >
                        <SelectTrigger className="input-responsive border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark_kitchen">Dark Kitchen</SelectItem>
                          <SelectItem value="restaurante_delivery">Restaurante + Delivery</SelectItem>
                          <SelectItem value="food_truck">Food Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Taxa de Entrega (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 5.00"
                        value={configuracao.taxaEntrega}
                        onChange={(e) => setConfiguracao({ ...configuracao, taxaEntrega: Number(e.target.value) })}
                        className="input-responsive border-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Raio de Entrega (km)</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 5"
                        value={configuracao.raioEntregaKm}
                        onChange={(e) => setConfiguracao({ ...configuracao, raioEntregaKm: Number(e.target.value) })}
                        className="input-responsive border-2"
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="space-y-3">
                      <Label className="text-responsive-base font-medium">Tempo de Entrega (min)</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 45"
                        value={configuracao.tempoEntregaMinutos}
                        onChange={(e) =>
                          setConfiguracao({ ...configuracao, tempoEntregaMinutos: Number(e.target.value) })
                        }
                        className="input-responsive border-2"
                      />
                    </div>
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
                  </div>

                  {/* Comissões das Plataformas */}
                  <div className="space-y-4">
                    <h4 className="text-responsive-lg font-semibold text-gray-800">Comissões das Plataformas (%)</h4>
                    <div className="grid-responsive-3">
                      <div className="space-y-3">
                        <Label className="text-responsive-base font-medium flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded"></div>
                          iFood
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="23"
                          value={configuracao.comissaoPlataformas.ifood}
                          onChange={(e) =>
                            setConfiguracao({
                              ...configuracao,
                              comissaoPlataformas: {
                                ...configuracao.comissaoPlataformas,
                                ifood: Number(e.target.value),
                              },
                            })
                          }
                          className="input-responsive border-2"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-responsive-base font-medium flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded"></div>
                          Uber Eats
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="20"
                          value={configuracao.comissaoPlataformas.ubereats}
                          onChange={(e) =>
                            setConfiguracao({
                              ...configuracao,
                              comissaoPlataformas: {
                                ...configuracao.comissaoPlataformas,
                                ubereats: Number(e.target.value),
                              },
                            })
                          }
                          className="input-responsive border-2"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-responsive-base font-medium flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded"></div>
                          Rappi
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="25"
                          value={configuracao.comissaoPlataformas.rappi}
                          onChange={(e) =>
                            setConfiguracao({
                              ...configuracao,
                              comissaoPlataformas: {
                                ...configuracao.comissaoPlataformas,
                                rappi: Number(e.target.value),
                              },
                            })
                          }
                          className="input-responsive border-2"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={salvarConfiguracao}
                    className="w-full button-responsive bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-responsive"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    <span className="text-responsive-sm">Salvar Configuração</span>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cardapio" className="space-y-6">
              <Card className="card-responsive border-2 bg-gradient-to-br from-white to-red-50 shadow-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                    <Menu className="w-6 h-6 text-red-600" />
                    Cardápio Delivery
                  </CardTitle>
                  <CardDescription className="text-responsive-base">
                    Configure pratos, preços e plataformas de venda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pratos disponíveis para adicionar */}
                  <div className="space-y-4">
                    <h4 className="text-responsive-lg font-semibold text-gray-800">Pratos Disponíveis</h4>
                    <div className="grid-cards">
                      {pratos
                        .filter((prato) => !configuracao.cardapioDelivery.some((c) => c.pratoId === prato.id))
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
                                  Adicionar ao Delivery
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>

                  {/* Cardápio delivery atual */}
                  <div className="space-y-4">
                    <h4 className="text-responsive-lg font-semibold text-gray-800">Cardápio Delivery</h4>
                    <div className="space-y-4">
                      {configuracao.cardapioDelivery.map((pratoDelivery, index) => (
                        <Card key={pratoDelivery.pratoId} className="card-responsive shadow-responsive">
                          <CardContent className="spacing-responsive">
                            <div className="space-y-4">
                              {/* Header do prato */}
                              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                                <div>
                                  <h5 className="text-responsive-lg font-semibold">{pratoDelivery.nome}</h5>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge variant="outline" className="text-responsive-xs">
                                      {pratoDelivery.categoria}
                                    </Badge>
                                    <Badge
                                      variant={pratoDelivery.disponivel ? "default" : "secondary"}
                                      className="text-responsive-xs"
                                    >
                                      {pratoDelivery.disponivel ? "Disponível" : "Indisponível"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={pratoDelivery.disponivel}
                                    onCheckedChange={(checked) => atualizarPratoDelivery(index, "disponivel", checked)}
                                  />
                                  <Label className="text-responsive-xs">Disponível</Label>
                                </div>
                              </div>

                              {/* Campos de configuração */}
                              <div className="form-grid">
                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Preço Delivery</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={pratoDelivery.precoDelivery}
                                    onChange={(e) =>
                                      atualizarPratoDelivery(index, "precoDelivery", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Custo Embalagem</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="2.00"
                                    value={pratoDelivery.custoEmbalagem}
                                    onChange={(e) =>
                                      atualizarPratoDelivery(index, "custoEmbalagem", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Pedidos/Dia</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={pratoDelivery.estimativaPedidosDia}
                                    onChange={(e) =>
                                      atualizarPratoDelivery(index, "estimativaPedidosDia", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-responsive-sm">Tempo Preparo (min)</Label>
                                  <Input
                                    type="number"
                                    placeholder="20"
                                    value={pratoDelivery.tempoPreparoMinutos}
                                    onChange={(e) =>
                                      atualizarPratoDelivery(index, "tempoPreparoMinutos", Number(e.target.value))
                                    }
                                    className="h-10 text-responsive-sm"
                                  />
                                </div>
                              </div>

                              {/* Plataformas */}
                              <div className="space-y-3">
                                <Label className="text-responsive-sm font-medium">Plataformas de Venda</Label>
                                <div className="grid-responsive-4 gap-3">
                                  {Object.entries(plataformasConfig).map(([key, config]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={
                                          pratoDelivery.plataformas[key as keyof typeof pratoDelivery.plataformas]
                                        }
                                        onCheckedChange={(checked) =>
                                          atualizarPratoDelivery(index, "plataformas", {
                                            ...pratoDelivery.plataformas,
                                            [key]: checked,
                                          })
                                        }
                                      />
                                      <Label className="text-responsive-xs flex items-center gap-1">
                                        <div className={`w-2 h-2 ${config.cor} rounded`}></div>
                                        {config.nome}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Resumo financeiro */}
                              <div className="bg-gray-50 rounded-xl spacing-responsive">
                                <div className="grid-responsive-4 gap-3 text-center">
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Receita/Dia</p>
                                    <p className="text-responsive-sm font-bold text-green-600">
                                      {formatarMoeda(pratoDelivery.precoDelivery * pratoDelivery.estimativaPedidosDia)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Comissão/Dia</p>
                                    <p className="text-responsive-sm font-bold text-red-600">
                                      {formatarMoeda(calcularComissaoPrato(pratoDelivery))}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Embalagem/Dia</p>
                                    <p className="text-responsive-sm font-bold text-orange-600">
                                      {formatarMoeda(pratoDelivery.custoEmbalagem * pratoDelivery.estimativaPedidosDia)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-responsive-xs text-gray-600">Líquido/Dia</p>
                                    <p className="text-responsive-sm font-bold text-blue-600">
                                      {formatarMoeda(
                                        pratoDelivery.precoDelivery * pratoDelivery.estimativaPedidosDia -
                                          calcularComissaoPrato(pratoDelivery) -
                                          pratoDelivery.custoEmbalagem * pratoDelivery.estimativaPedidosDia,
                                      )}
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
                                  Remover do Delivery
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {configuracao.cardapioDelivery.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-responsive-lg">Nenhum prato no cardápio delivery. Adicione pratos acima.</p>
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
                        <p className="text-responsive-sm font-medium text-gray-600">Receita Bruta</p>
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
                        <p className="text-responsive-sm font-medium text-gray-600">Comissões</p>
                        <p className="text-responsive-2xl font-bold text-red-600">
                          {formatarMoeda(calcularComissaoTotal())}
                        </p>
                      </div>
                      <Percent className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Embalagens</p>
                        <p className="text-responsive-2xl font-bold text-orange-600">
                          {formatarMoeda(calcularCustoEmbalagens())}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardContent className="spacing-responsive">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-responsive-sm font-medium text-gray-600">Receita Líquida</p>
                        <p className="text-responsive-2xl font-bold text-blue-600">
                          {formatarMoeda(calcularReceitaLiquida())}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sistema de Relatórios */}
              <SistemaRelatorios tipoRestaurante="delivery" dadosAtuais={dadosAtuais} configuracao={configuracao} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
