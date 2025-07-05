"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Trash2, Save, BarChart3, Settings, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calcularCustoReceitaEspecifica, formatarMoeda, type IngredienteCalculo } from "../../utils/unit-converter"

interface Receita {
  id: string
  nome: string
  rendimento: number
  ingredientes: Array<{
    ingredienteId: string
    nome: string
    quantidade: number
    unidade: string
  }>
  custosFixos: {
    embalagem: number
    etiqueta: number
    gas: number
    energia: number
    transporte: number
  }
}

interface PratoDoDia {
  receitaId: string
  nomeReceita: string
  porcoesPlanejadas: number
  categoria: string
}

interface PlanejamentoDia {
  dia: string
  pratos: PratoDoDia[]
}

interface SelfServiceFlowProps {
  onResetTipo: () => void
}

const diasSemana = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]

const categoriasPrato = ["Proteína", "Carboidrato", "Salada", "Legumes", "Sobremesa", "Bebida", "Outro"]

export function SelfServiceFlow({ onResetTipo }: SelfServiceFlowProps) {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [planejamento, setPlanejamento] = useState<PlanejamentoDia[]>([])
  const [diaSelecionado, setDiaSelecionado] = useState<string>("Segunda-feira")
  const [activeTab, setActiveTab] = useState("planejamento")

  useEffect(() => {
    // Carregar dados
    const receitasData = localStorage.getItem("receitas")
    const ingredientesData = localStorage.getItem("ingredientes")
    const planejamentoData = localStorage.getItem("self_service_planejamento")

    if (receitasData) setReceitas(JSON.parse(receitasData))
    if (ingredientesData) setIngredientes(JSON.parse(ingredientesData))
    if (planejamentoData) setPlanejamento(JSON.parse(planejamentoData))
  }, [])

  const salvarPlanejamento = () => {
    localStorage.setItem("self_service_planejamento", JSON.stringify(planejamento))
  }

  const adicionarPrato = () => {
    const planejamentoDia = planejamento.find((p) => p.dia === diaSelecionado)
    const novosPratos = planejamentoDia ? [...planejamentoDia.pratos] : []

    novosPratos.push({
      receitaId: "",
      nomeReceita: "",
      porcoesPlanejadas: 0,
      categoria: "Proteína",
    })

    const novoPlanejamento = planejamento.filter((p) => p.dia !== diaSelecionado)
    novoPlanejamento.push({
      dia: diaSelecionado,
      pratos: novosPratos,
    })

    setPlanejamento(novoPlanejamento)
  }

  const atualizarPrato = (index: number, campo: string, valor: any) => {
    const planejamentoDia = planejamento.find((p) => p.dia === diaSelecionado)
    if (!planejamentoDia) return

    const novosPratos = [...planejamentoDia.pratos]

    if (campo === "receitaId") {
      const receita = receitas.find((r) => r.id === valor)
      if (receita) {
        novosPratos[index] = {
          ...novosPratos[index],
          receitaId: valor,
          nomeReceita: receita.nome,
        }
      }
    } else {
      novosPratos[index] = {
        ...novosPratos[index],
        [campo]: valor,
      }
    }

    const novoPlanejamento = planejamento.filter((p) => p.dia !== diaSelecionado)
    novoPlanejamento.push({
      dia: diaSelecionado,
      pratos: novosPratos,
    })

    setPlanejamento(novoPlanejamento)
  }

  const removerPrato = (index: number) => {
    const planejamentoDia = planejamento.find((p) => p.dia === diaSelecionado)
    if (!planejamentoDia) return

    const novosPratos = planejamentoDia.pratos.filter((_, i) => i !== index)

    const novoPlanejamento = planejamento.filter((p) => p.dia !== diaSelecionado)
    if (novosPratos.length > 0) {
      novoPlanejamento.push({
        dia: diaSelecionado,
        pratos: novosPratos,
      })
    }

    setPlanejamento(novoPlanejamento)
  }

  const calcularCustoPrato = (prato: PratoDoDia) => {
    const receita = receitas.find((r) => r.id === prato.receitaId)
    if (!receita || prato.porcoesPlanejadas === 0) return 0

    const { custoTotal } = calcularCustoReceitaEspecifica(receita, ingredientes, prato.porcoesPlanejadas)
    return custoTotal
  }

  const calcularCustoDia = (dia: string) => {
    const planejamentoDia = planejamento.find((p) => p.dia === dia)
    if (!planejamentoDia) return 0

    return planejamentoDia.pratos.reduce((total, prato) => total + calcularCustoPrato(prato), 0)
  }

  const calcularIngredientesNecessarios = (dia?: string) => {
    const diasParaCalcular = dia ? [dia] : diasSemana
    const ingredientesNecessarios: { [key: string]: { quantidade: number; unidade: string; nome: string } } = {}

    diasParaCalcular.forEach((diaAtual) => {
      const planejamentoDia = planejamento.find((p) => p.dia === diaAtual)
      if (!planejamentoDia) return

      planejamentoDia.pratos.forEach((prato) => {
        const receita = receitas.find((r) => r.id === prato.receitaId)
        if (!receita) return

        const fatorMultiplicacao = prato.porcoesPlanejadas / receita.rendimento

        receita.ingredientes.forEach((ing) => {
          const quantidadeNecessaria = ing.quantidade * fatorMultiplicacao

          if (ingredientesNecessarios[ing.ingredienteId]) {
            ingredientesNecessarios[ing.ingredienteId].quantidade += quantidadeNecessaria
          } else {
            ingredientesNecessarios[ing.ingredienteId] = {
              quantidade: quantidadeNecessaria,
              unidade: ing.unidade,
              nome: ing.nome,
            }
          }
        })
      })
    })

    return ingredientesNecessarios
  }

  const pratosDoDia = planejamento.find((p) => p.dia === diaSelecionado)?.pratos || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Self-service - Planejamento Semanal
          </h3>
          <p className="text-gray-600 mt-1">Gerencie pratos fixos por dia da semana</p>
        </div>
        <Button variant="outline" onClick={onResetTipo} size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Alterar Tipo
        </Button>
      </div>

      {receitas.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa cadastrar receitas primeiro. Acesse a aba <strong className="text-blue-600">Receitas</strong>{" "}
            para continuar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planejamento">Planejamento Semanal</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="planejamento" className="space-y-6">
          {/* Seleção do Dia */}
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Dia da Semana</CardTitle>
              <CardDescription>Escolha o dia para planejar os pratos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {diasSemana.map((dia) => {
                  const temPratos = planejamento.some((p) => p.dia === dia && p.pratos.length > 0)
                  const custoDia = calcularCustoDia(dia)
                  return (
                    <Button
                      key={dia}
                      variant={diaSelecionado === dia ? "default" : "outline"}
                      className={`h-auto p-3 flex flex-col ${
                        diaSelecionado === dia ? "bg-blue-600 hover:bg-blue-700" : ""
                      }`}
                      onClick={() => setDiaSelecionado(dia)}
                    >
                      <span className="text-sm font-medium">{dia.split("-")[0]}</span>
                      {temPratos && (
                        <>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {planejamento.find((p) => p.dia === dia)?.pratos.length} pratos
                          </Badge>
                          <span className="text-xs mt-1">{formatarMoeda(custoDia)}</span>
                        </>
                      )}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pratos do Dia */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Pratos para {diaSelecionado}</CardTitle>
                  <CardDescription>Adicione os pratos que serão servidos neste dia</CardDescription>
                </div>
                <Button onClick={adicionarPrato} disabled={receitas.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Prato
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pratosDoDia.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum prato planejado para {diaSelecionado}</p>
                  <p className="text-sm">Clique em "Adicionar Prato" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pratosDoDia.map((prato, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50">
                      <div className="space-y-2">
                        <Label>Receita</Label>
                        <Select
                          value={prato.receitaId}
                          onValueChange={(value) => atualizarPrato(index, "receitaId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a receita" />
                          </SelectTrigger>
                          <SelectContent>
                            {receitas.map((receita) => (
                              <SelectItem key={receita.id} value={receita.id}>
                                {receita.nome} (Rende {receita.rendimento})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                          value={prato.categoria}
                          onValueChange={(value) => atualizarPrato(index, "categoria", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriasPrato.map((categoria) => (
                              <SelectItem key={categoria} value={categoria}>
                                {categoria}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Porções Planejadas</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 50"
                          value={prato.porcoesPlanejadas}
                          onChange={(e) => atualizarPrato(index, "porcoesPlanejadas", Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Custo Total</Label>
                        <div className="p-2 bg-white rounded border">
                          <span className="text-sm font-medium text-green-600">
                            {formatarMoeda(calcularCustoPrato(prato))}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerPrato(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pratosDoDia.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-lg font-semibold">
                    <span>Custo total do dia: </span>
                    <span className="text-green-600">{formatarMoeda(calcularCustoDia(diaSelecionado))}</span>
                  </div>
                  <Button onClick={salvarPlanejamento}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Planejamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Relatório Semanal
              </CardTitle>
              <CardDescription>Resumo consolidado do planejamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Total de Pratos Planejados</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {planejamento.reduce((acc, dia) => acc + dia.pratos.length, 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Porções Totais</p>
                  <p className="text-2xl font-bold text-green-800">
                    {planejamento.reduce(
                      (acc, dia) => acc + dia.pratos.reduce((acc2, prato) => acc2 + prato.porcoesPlanejadas, 0),
                      0,
                    )}
                  </p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600">Custo Semanal Estimado</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {formatarMoeda(diasSemana.reduce((acc, dia) => acc + calcularCustoDia(dia), 0))}
                  </p>
                </div>
              </div>

              {/* Ingredientes Necessários */}
              <div className="space-y-4">
                <h4 className="font-medium">Ingredientes Necessários (Semana)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Ingrediente</th>
                        <th className="text-right p-2">Quantidade</th>
                        <th className="text-right p-2">Unidade</th>
                        <th className="text-right p-2">Custo Estimado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(calcularIngredientesNecessarios()).map(([ingredienteId, dados]) => {
                        const ingrediente = ingredientes.find((i) => i.id === ingredienteId)
                        let custoTotal = 0
                        if (ingrediente) {
                          const { custoTotal: custoIng } = calcularCustoReceitaEspecifica(
                            {
                              id: "temp",
                              nome: "temp",
                              ingredientes: [
                                {
                                  ingredienteId,
                                  nome: dados.nome,
                                  quantidade: dados.quantidade,
                                  unidade: dados.unidade,
                                },
                              ],
                              rendimento: 1,
                            },
                            ingredientes,
                            1,
                          )
                          custoTotal = custoIng
                        }

                        return (
                          <tr key={ingredienteId} className="border-b">
                            <td className="p-2">{dados.nome}</td>
                            <td className="text-right p-2">{dados.quantidade.toFixed(1)}</td>
                            <td className="text-right p-2">{dados.unidade}</td>
                            <td className="text-right p-2">{formatarMoeda(custoTotal)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
