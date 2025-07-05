"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Plus, Trash2, Save, BarChart3, AlertCircle, Utensils } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

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
}

interface Ingrediente {
  id: string
  nome: string
  unidadeCompra: string
  quantidadeComprada: number
  precoCompra: number
  tipoPreco: "total" | "unitario"
}

interface GrupoPersonalizado {
  id: string
  nome: string
  descricao: string
  pratos: Array<{
    receitaId: string
    nomeReceita: string
    metaProducao: number
    unidadeMeta: string
  }>
}

interface RegistroProducao {
  id: string
  data: string
  grupoId: string
  nomeGrupo: string
  itens: Array<{
    receitaId: string
    nomeReceita: string
    quantidadeProduzida: number
    quantidadeVendida: number
    precoVenda: number
  }>
}

interface OutrosFlowProps {
  onResetTipo: () => void
}

const unidadesMeta = ["unidades", "kg", "porções", "litros", "pessoas servidas"]

export function OutrosFlow({ onResetTipo }: OutrosFlowProps) {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [grupos, setGrupos] = useState<GrupoPersonalizado[]>([])
  const [registros, setRegistros] = useState<RegistroProducao[]>([])
  const [activeTab, setActiveTab] = useState("grupos")

  useEffect(() => {
    // Carregar dados
    const receitasData = localStorage.getItem("receitas")
    const ingredientesData = localStorage.getItem("ingredientes")
    const gruposData = localStorage.getItem("outros_grupos")
    const registrosData = localStorage.getItem("outros_registros")

    if (receitasData) setReceitas(JSON.parse(receitasData))
    if (ingredientesData) setIngredientes(JSON.parse(ingredientesData))
    if (gruposData) setGrupos(JSON.parse(gruposData))
    if (registrosData) setRegistros(JSON.parse(registrosData))
  }, [])

  const salvarGrupos = () => {
    localStorage.setItem("outros_grupos", JSON.stringify(grupos))
  }

  const salvarRegistros = () => {
    localStorage.setItem("outros_registros", JSON.stringify(registros))
  }

  const adicionarGrupo = () => {
    const novoGrupo: GrupoPersonalizado = {
      id: Date.now().toString(),
      nome: "",
      descricao: "",
      pratos: [],
    }
    setGrupos([...grupos, novoGrupo])
  }

  const atualizarGrupo = (index: number, campo: string, valor: any) => {
    const novosGrupos = [...grupos]
    novosGrupos[index] = {
      ...novosGrupos[index],
      [campo]: valor,
    }
    setGrupos(novosGrupos)
  }

  const adicionarPratoAoGrupo = (grupoIndex: number) => {
    const novosGrupos = [...grupos]
    novosGrupos[grupoIndex].pratos.push({
      receitaId: "",
      nomeReceita: "",
      metaProducao: 0,
      unidadeMeta: "unidades",
    })
    setGrupos(novosGrupos)
  }

  const atualizarPratoDoGrupo = (grupoIndex: number, pratoIndex: number, campo: string, valor: any) => {
    const novosGrupos = [...grupos]

    if (campo === "receitaId") {
      const receita = receitas.find((r) => r.id === valor)
      if (receita) {
        novosGrupos[grupoIndex].pratos[pratoIndex] = {
          ...novosGrupos[grupoIndex].pratos[pratoIndex],
          receitaId: valor,
          nomeReceita: receita.nome,
        }
      }
    } else {
      novosGrupos[grupoIndex].pratos[pratoIndex] = {
        ...novosGrupos[grupoIndex].pratos[pratoIndex],
        [campo]: valor,
      }
    }

    setGrupos(novosGrupos)
  }

  const removerPratoDoGrupo = (grupoIndex: number, pratoIndex: number) => {
    const novosGrupos = [...grupos]
    novosGrupos[grupoIndex].pratos = novosGrupos[grupoIndex].pratos.filter((_, i) => i !== pratoIndex)
    setGrupos(novosGrupos)
  }

  const removerGrupo = (index: number) => {
    const novosGrupos = grupos.filter((_, i) => i !== index)
    setGrupos(novosGrupos)
  }

  const adicionarRegistro = () => {
    const novoRegistro: RegistroProducao = {
      id: Date.now().toString(),
      data: new Date().toISOString().split("T")[0],
      grupoId: "",
      nomeGrupo: "",
      itens: [],
    }
    setRegistros([...registros, novoRegistro])
  }

  const atualizarRegistro = (index: number, campo: string, valor: any) => {
    const novosRegistros = [...registros]

    if (campo === "grupoId") {
      const grupo = grupos.find((g) => g.id === valor)
      if (grupo) {
        novosRegistros[index] = {
          ...novosRegistros[index],
          grupoId: valor,
          nomeGrupo: grupo.nome,
          itens: grupo.pratos.map((prato) => ({
            receitaId: prato.receitaId,
            nomeReceita: prato.nomeReceita,
            quantidadeProduzida: 0,
            quantidadeVendida: 0,
            precoVenda: 0,
          })),
        }
      }
    } else {
      novosRegistros[index] = {
        ...novosRegistros[index],
        [campo]: valor,
      }
    }

    setRegistros(novosRegistros)
  }

  const atualizarItemRegistro = (registroIndex: number, itemIndex: number, campo: string, valor: any) => {
    const novosRegistros = [...registros]
    novosRegistros[registroIndex].itens[itemIndex] = {
      ...novosRegistros[registroIndex].itens[itemIndex],
      [campo]: valor,
    }
    setRegistros(novosRegistros)
  }

  const removerRegistro = (index: number) => {
    const novosRegistros = registros.filter((_, i) => i !== index)
    setRegistros(novosRegistros)
  }

  const calcularCustoPrato = (receitaId: string, quantidade: number) => {
    const receita = receitas.find((r) => r.id === receitaId)
    if (!receita) return 0

    let custoTotal = 0
    const fatorMultiplicacao = quantidade / receita.rendimento

    receita.ingredientes.forEach((ing) => {
      const ingrediente = ingredientes.find((i) => i.id === ing.ingredienteId)
      if (ingrediente && ingrediente.quantidadeComprada > 0) {
        const custoUnitario = ingrediente.precoCompra / ingrediente.quantidadeComprada
        custoTotal += custoUnitario * ing.quantidade * fatorMultiplicacao
      }
    })

    return custoTotal
  }

  const calcularRelatorios = () => {
    let receitaTotal = 0
    let custoTotal = 0
    let quantidadeProduzida = 0
    let quantidadeVendida = 0

    registros.forEach((registro) => {
      registro.itens.forEach((item) => {
        quantidadeProduzida += item.quantidadeProduzida
        quantidadeVendida += item.quantidadeVendida
        receitaTotal += item.precoVenda * item.quantidadeVendida
        custoTotal += calcularCustoPrato(item.receitaId, item.quantidadeProduzida)
      })
    })

    return {
      receitaTotal,
      custoTotal,
      lucroTotal: receitaTotal - custoTotal,
      quantidadeProduzida,
      quantidadeVendida,
      desperdicio: quantidadeProduzida - quantidadeVendida,
      percentualDesperdicio:
        quantidadeProduzida > 0 ? ((quantidadeProduzida - quantidadeVendida) / quantidadeProduzida) * 100 : 0,
      margemLucro: receitaTotal > 0 ? ((receitaTotal - custoTotal) / receitaTotal) * 100 : 0,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" />
            Modelo Personalizado
          </h3>
          <p className="text-gray-600 mt-1">Configure grupos personalizados e registre produção</p>
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
            Você precisa cadastrar receitas primeiro. Acesse a aba <strong className="text-orange-600">Receitas</strong>{" "}
            para continuar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grupos">Grupos Personalizados</TabsTrigger>
          <TabsTrigger value="registros">Registros</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="grupos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Grupos Personalizados</CardTitle>
                  <CardDescription>Crie categorias ou grupos de pratos para seu modelo de negócio</CardDescription>
                </div>
                <Button onClick={adicionarGrupo} disabled={receitas.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Grupo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {grupos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum grupo cadastrado</p>
                  <p className="text-sm">Clique em "Novo Grupo" para começar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {grupos.map((grupo, grupoIndex) => (
                    <Card key={grupo.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nome do Grupo</Label>
                                <Input
                                  placeholder="Ex: Churrasco Premium"
                                  value={grupo.nome}
                                  onChange={(e) => atualizarGrupo(grupoIndex, "nome", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Textarea
                                  placeholder="Descrição do grupo..."
                                  value={grupo.descricao}
                                  onChange={(e) => atualizarGrupo(grupoIndex, "descricao", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerGrupo(grupoIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Pratos do Grupo</h4>
                          <Button variant="outline" size="sm" onClick={() => adicionarPratoAoGrupo(grupoIndex)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Prato
                          </Button>
                        </div>

                        {grupo.pratos.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhum prato adicionado ao grupo</p>
                        ) : (
                          <div className="space-y-3">
                            {grupo.pratos.map((prato, pratoIndex) => (
                              <div
                                key={pratoIndex}
                                className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg bg-gray-50"
                              >
                                <div className="space-y-2">
                                  <Label>Receita</Label>
                                  <Select
                                    value={prato.receitaId}
                                    onValueChange={(value) =>
                                      atualizarPratoDoGrupo(grupoIndex, pratoIndex, "receitaId", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {receitas.map((receita) => (
                                        <SelectItem key={receita.id} value={receita.id}>
                                          {receita.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Meta de Produção</Label>
                                  <Input
                                    type="number"
                                    placeholder="Ex: 50"
                                    value={prato.metaProducao}
                                    onChange={(e) =>
                                      atualizarPratoDoGrupo(
                                        grupoIndex,
                                        pratoIndex,
                                        "metaProducao",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Unidade</Label>
                                  <Select
                                    value={prato.unidadeMeta}
                                    onValueChange={(value) =>
                                      atualizarPratoDoGrupo(grupoIndex, pratoIndex, "unidadeMeta", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {unidadesMeta.map((unidade) => (
                                        <SelectItem key={unidade} value={unidade}>
                                          {unidade}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removerPratoDoGrupo(grupoIndex, pratoIndex)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {grupos.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={salvarGrupos}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Grupos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registros" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Registros de Produção</CardTitle>
                  <CardDescription>Registre produção e vendas por período</CardDescription>
                </div>
                <Button onClick={adicionarRegistro} disabled={grupos.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Registro
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {registros.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum registro cadastrado</p>
                  <p className="text-sm">Clique em "Novo Registro" para começar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {registros.map((registro, registroIndex) => (
                    <Card key={registro.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Data</Label>
                                <Input
                                  type="date"
                                  value={registro.data}
                                  onChange={(e) => atualizarRegistro(registroIndex, "data", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Grupo</Label>
                                <Select
                                  value={registro.grupoId}
                                  onValueChange={(value) => atualizarRegistro(registroIndex, "grupoId", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o grupo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {grupos.map((grupo) => (
                                      <SelectItem key={grupo.id} value={grupo.id}>
                                        {grupo.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerRegistro(registroIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {registro.itens.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            Selecione um grupo para registrar a produção
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <h4 className="font-medium">
                              Produção do dia {new Date(registro.data).toLocaleDateString("pt-BR")}
                            </h4>
                            {registro.itens.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg bg-gray-50"
                              >
                                <div>
                                  <Label className="text-sm">Prato</Label>
                                  <p className="font-medium">{item.nomeReceita}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Quantidade Produzida</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.quantidadeProduzida}
                                    onChange={(e) =>
                                      atualizarItemRegistro(
                                        registroIndex,
                                        itemIndex,
                                        "quantidadeProduzida",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Quantidade Vendida</Label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    value={item.quantidadeVendida}
                                    onChange={(e) =>
                                      atualizarItemRegistro(
                                        registroIndex,
                                        itemIndex,
                                        "quantidadeVendida",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Preço de Venda (R$)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={item.precoVenda}
                                    onChange={(e) =>
                                      atualizarItemRegistro(
                                        registroIndex,
                                        itemIndex,
                                        "precoVenda",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">Custo Estimado</Label>
                                  <p className="font-medium text-orange-600">
                                    R$ {calcularCustoPrato(item.receitaId, item.quantidadeProduzida).toFixed(2)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Desperdício: {item.quantidadeProduzida - item.quantidadeVendida}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {registros.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={salvarRegistros}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Registros
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
                Análise de Performance
              </CardTitle>
              <CardDescription>Acompanhe produção, vendas e desperdício</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const relatorio = calcularRelatorios()
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600">Quantidade Produzida</p>
                        <p className="text-2xl font-bold text-blue-800">{relatorio.quantidadeProduzida}</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Quantidade Vendida</p>
                        <p className="text-2xl font-bold text-green-800">{relatorio.quantidadeVendida}</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">Desperdício</p>
                        <p className="text-2xl font-bold text-red-800">{relatorio.desperdicio}</p>
                        <p className="text-xs text-gray-500">{relatorio.percentualDesperdicio.toFixed(1)}%</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600">Eficiência</p>
                        <p className="text-2xl font-bold text-purple-800">
                          {(100 - relatorio.percentualDesperdicio).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Receita Total</p>
                        <p className="text-2xl font-bold text-green-800">R$ {relatorio.receitaTotal.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-600">Custo Total</p>
                        <p className="text-2xl font-bold text-orange-800">R$ {relatorio.custoTotal.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600">Lucro Líquido</p>
                        <p
                          className={`text-2xl font-bold ${relatorio.lucroTotal >= 0 ? "text-purple-800" : "text-red-600"}`}
                        >
                          R$ {relatorio.lucroTotal.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{relatorio.margemLucro.toFixed(1)}% margem</p>
                      </div>
                    </div>

                    {/* Histórico de Registros */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Histórico de Registros</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Data</th>
                              <th className="text-left p-2">Grupo</th>
                              <th className="text-right p-2">Produzido</th>
                              <th className="text-right p-2">Vendido</th>
                              <th className="text-right p-2">Desperdício</th>
                              <th className="text-right p-2">Receita</th>
                              <th className="text-right p-2">Custo</th>
                              <th className="text-right p-2">Lucro</th>
                            </tr>
                          </thead>
                          <tbody>
                            {registros.map((registro) => {
                              let produzido = 0
                              let vendido = 0
                              let receita = 0
                              let custo = 0

                              registro.itens.forEach((item) => {
                                produzido += item.quantidadeProduzida
                                vendido += item.quantidadeVendida
                                receita += item.precoVenda * item.quantidadeVendida
                                custo += calcularCustoPrato(item.receitaId, item.quantidadeProduzida)
                              })

                              const desperdicio = produzido - vendido
                              const lucro = receita - custo

                              return (
                                <tr key={registro.id} className="border-b">
                                  <td className="p-2">{new Date(registro.data).toLocaleDateString("pt-BR")}</td>
                                  <td className="p-2">{registro.nomeGrupo}</td>
                                  <td className="text-right p-2">{produzido}</td>
                                  <td className="text-right p-2">{vendido}</td>
                                  <td className="text-right p-2">{desperdicio}</td>
                                  <td className="text-right p-2">R$ {receita.toFixed(2)}</td>
                                  <td className="text-right p-2">R$ {custo.toFixed(2)}</td>
                                  <td className={`text-right p-2 ${lucro >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    R$ {lucro.toFixed(2)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
