"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Truck, Plus, Trash2, Save, BarChart3, Settings, AlertCircle, Package } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface Kit {
  id: string
  nome: string
  descricao: string
  pratos: Array<{
    receitaId: string
    nomeReceita: string
    quantidade: number
  }>
  precoVenda: number
  ativo: boolean
}

interface Pedido {
  id: string
  cliente: string
  dataEntrega: string
  itens: Array<{
    kitId: string
    nomeKit: string
    quantidade: number
  }>
  status: "pendente" | "producao" | "entregue"
  valorTotal: number
}

interface MarmitariaFlowProps {
  onResetTipo: () => void
}

export function MarmitariaFlow({ onResetTipo }: MarmitariaFlowProps) {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [kits, setKits] = useState<Kit[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [activeTab, setActiveTab] = useState("kits")

  useEffect(() => {
    // Carregar dados
    const receitasData = localStorage.getItem("receitas")
    const ingredientesData = localStorage.getItem("ingredientes")
    const kitsData = localStorage.getItem("marmitaria_kits")
    const pedidosData = localStorage.getItem("marmitaria_pedidos")

    if (receitasData) setReceitas(JSON.parse(receitasData))
    if (ingredientesData) setIngredientes(JSON.parse(ingredientesData))
    if (kitsData) setKits(JSON.parse(kitsData))
    if (pedidosData) setPedidos(JSON.parse(pedidosData))
  }, [])

  const salvarKits = () => {
    localStorage.setItem("marmitaria_kits", JSON.stringify(kits))
  }

  const salvarPedidos = () => {
    localStorage.setItem("marmitaria_pedidos", JSON.stringify(pedidos))
  }

  const adicionarKit = () => {
    const novoKit: Kit = {
      id: Date.now().toString(),
      nome: "",
      descricao: "",
      pratos: [],
      precoVenda: 0,
      ativo: true,
    }
    setKits([...kits, novoKit])
  }

  const atualizarKit = (index: number, campo: string, valor: any) => {
    const novosKits = [...kits]
    novosKits[index] = {
      ...novosKits[index],
      [campo]: valor,
    }
    setKits(novosKits)
  }

  const adicionarPratoAoKit = (kitIndex: number) => {
    const novosKits = [...kits]
    novosKits[kitIndex].pratos.push({
      receitaId: "",
      nomeReceita: "",
      quantidade: 1,
    })
    setKits(novosKits)
  }

  const atualizarPratoDoKit = (kitIndex: number, pratoIndex: number, campo: string, valor: any) => {
    const novosKits = [...kits]

    if (campo === "receitaId") {
      const receita = receitas.find((r) => r.id === valor)
      if (receita) {
        novosKits[kitIndex].pratos[pratoIndex] = {
          ...novosKits[kitIndex].pratos[pratoIndex],
          receitaId: valor,
          nomeReceita: receita.nome,
        }
      }
    } else {
      novosKits[kitIndex].pratos[pratoIndex] = {
        ...novosKits[kitIndex].pratos[pratoIndex],
        [campo]: valor,
      }
    }

    setKits(novosKits)
  }

  const removerPratoDoKit = (kitIndex: number, pratoIndex: number) => {
    const novosKits = [...kits]
    novosKits[kitIndex].pratos = novosKits[kitIndex].pratos.filter((_, i) => i !== pratoIndex)
    setKits(novosKits)
  }

  const removerKit = (index: number) => {
    const novosKits = kits.filter((_, i) => i !== index)
    setKits(novosKits)
  }

  const adicionarPedido = () => {
    const novoPedido: Pedido = {
      id: Date.now().toString(),
      cliente: "",
      dataEntrega: new Date().toISOString().split("T")[0],
      itens: [],
      status: "pendente",
      valorTotal: 0,
    }
    setPedidos([...pedidos, novoPedido])
  }

  const atualizarPedido = (index: number, campo: string, valor: any) => {
    const novosPedidos = [...pedidos]
    novosPedidos[index] = {
      ...novosPedidos[index],
      [campo]: valor,
    }

    // Recalcular valor total se necessário
    if (campo === "itens") {
      const valorTotal = valor.reduce((acc: number, item: any) => {
        const kit = kits.find((k) => k.id === item.kitId)
        return acc + (kit ? kit.precoVenda * item.quantidade : 0)
      }, 0)
      novosPedidos[index].valorTotal = valorTotal
    }

    setPedidos(novosPedidos)
  }

  const adicionarItemAoPedido = (pedidoIndex: number) => {
    const novosPedidos = [...pedidos]
    novosPedidos[pedidoIndex].itens.push({
      kitId: "",
      nomeKit: "",
      quantidade: 1,
    })
    setPedidos(novosPedidos)
  }

  const atualizarItemDoPedido = (pedidoIndex: number, itemIndex: number, campo: string, valor: any) => {
    const novosPedidos = [...pedidos]

    if (campo === "kitId") {
      const kit = kits.find((k) => k.id === valor)
      if (kit) {
        novosPedidos[pedidoIndex].itens[itemIndex] = {
          ...novosPedidos[pedidoIndex].itens[itemIndex],
          kitId: valor,
          nomeKit: kit.nome,
        }
      }
    } else {
      novosPedidos[pedidoIndex].itens[itemIndex] = {
        ...novosPedidos[pedidoIndex].itens[itemIndex],
        [campo]: valor,
      }
    }

    // Recalcular valor total
    const valorTotal = novosPedidos[pedidoIndex].itens.reduce((acc, item) => {
      const kit = kits.find((k) => k.id === item.kitId)
      return acc + (kit ? kit.precoVenda * item.quantidade : 0)
    }, 0)
    novosPedidos[pedidoIndex].valorTotal = valorTotal

    setPedidos(novosPedidos)
  }

  const removerItemDoPedido = (pedidoIndex: number, itemIndex: number) => {
    const novosPedidos = [...pedidos]
    novosPedidos[pedidoIndex].itens = novosPedidos[pedidoIndex].itens.filter((_, i) => i !== itemIndex)

    // Recalcular valor total
    const valorTotal = novosPedidos[pedidoIndex].itens.reduce((acc, item) => {
      const kit = kits.find((k) => k.id === item.kitId)
      return acc + (kit ? kit.precoVenda * item.quantidade : 0)
    }, 0)
    novosPedidos[pedidoIndex].valorTotal = valorTotal

    setPedidos(novosPedidos)
  }

  const removerPedido = (index: number) => {
    const novosPedidos = pedidos.filter((_, i) => i !== index)
    setPedidos(novosPedidos)
  }

  const calcularCustoKit = (kit: Kit) => {
    let custoTotal = 0

    kit.pratos.forEach((prato) => {
      const receita = receitas.find((r) => r.id === prato.receitaId)
      if (!receita) return

      const fatorMultiplicacao = prato.quantidade / receita.rendimento

      receita.ingredientes.forEach((ing) => {
        const ingrediente = ingredientes.find((i) => i.id === ing.ingredienteId)
        if (ingrediente && ingrediente.quantidadeComprada > 0) {
          const custoUnitario = ingrediente.precoCompra / ingrediente.quantidadeComprada
          custoTotal += custoUnitario * ing.quantidade * fatorMultiplicacao
        }
      })
    })

    return custoTotal
  }

  const calcularIngredientesNecessarios = () => {
    const ingredientesNecessarios: { [key: string]: { quantidade: number; unidade: string; nome: string } } = {}

    pedidos
      .filter((p) => p.status !== "entregue")
      .forEach((pedido) => {
        pedido.itens.forEach((item) => {
          const kit = kits.find((k) => k.id === item.kitId)
          if (!kit) return

          kit.pratos.forEach((prato) => {
            const receita = receitas.find((r) => r.id === prato.receitaId)
            if (!receita) return

            const fatorMultiplicacao = (prato.quantidade * item.quantidade) / receita.rendimento

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
      })

    return ingredientesNecessarios
  }

  const calcularRelatorios = () => {
    let receitaTotal = 0
    let custoTotal = 0
    let pedidosEntregues = 0

    pedidos
      .filter((p) => p.status === "entregue")
      .forEach((pedido) => {
        receitaTotal += pedido.valorTotal
        pedidosEntregues++

        pedido.itens.forEach((item) => {
          const kit = kits.find((k) => k.id === item.kitId)
          if (kit) {
            custoTotal += calcularCustoKit(kit) * item.quantidade
          }
        })
      })

    return {
      receitaTotal,
      custoTotal,
      lucroTotal: receitaTotal - custoTotal,
      pedidosEntregues,
      margemLucro: receitaTotal > 0 ? ((receitaTotal - custoTotal) / receitaTotal) * 100 : 0,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-purple-600" />
            Marmitaria / Delivery
          </h3>
          <p className="text-gray-600 mt-1">Gerencie kits, pedidos e produção sob encomenda</p>
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
            Você precisa cadastrar receitas primeiro. Acesse a aba <strong className="text-purple-600">Receitas</strong>{" "}
            para continuar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kits">Kits e Combos</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="kits" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Kits e Combos</CardTitle>
                  <CardDescription>Crie combinações de pratos para venda</CardDescription>
                </div>
                <Button onClick={adicionarKit} disabled={receitas.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Kit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {kits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum kit cadastrado</p>
                  <p className="text-sm">Clique em "Novo Kit" para começar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {kits.map((kit, kitIndex) => (
                    <Card key={kit.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Nome do Kit</Label>
                                <Input
                                  placeholder="Ex: Marmita Fitness"
                                  value={kit.nome}
                                  onChange={(e) => atualizarKit(kitIndex, "nome", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Preço de Venda (R$)</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="Ex: 18.00"
                                  value={kit.precoVenda}
                                  onChange={(e) => atualizarKit(kitIndex, "precoVenda", Number(e.target.value))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                  value={kit.ativo ? "ativo" : "inativo"}
                                  onValueChange={(value) => atualizarKit(kitIndex, "ativo", value === "ativo")}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ativo">Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Descrição</Label>
                              <Input
                                placeholder="Descrição do kit..."
                                value={kit.descricao}
                                onChange={(e) => atualizarKit(kitIndex, "descricao", e.target.value)}
                              />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerKit(kitIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Pratos do Kit</h4>
                          <Button variant="outline" size="sm" onClick={() => adicionarPratoAoKit(kitIndex)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Prato
                          </Button>
                        </div>

                        {kit.pratos.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhum prato adicionado ao kit</p>
                        ) : (
                          <div className="space-y-3">
                            {kit.pratos.map((prato, pratoIndex) => (
                              <div
                                key={pratoIndex}
                                className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg bg-gray-50"
                              >
                                <div className="space-y-2">
                                  <Label>Receita</Label>
                                  <Select
                                    value={prato.receitaId}
                                    onValueChange={(value) =>
                                      atualizarPratoDoKit(kitIndex, pratoIndex, "receitaId", value)
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
                                  <Label>Quantidade</Label>
                                  <Input
                                    type="number"
                                    placeholder="1"
                                    value={prato.quantidade}
                                    onChange={(e) =>
                                      atualizarPratoDoKit(kitIndex, pratoIndex, "quantidade", Number(e.target.value))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Custo Estimado</Label>
                                  <div className="p-2 bg-white rounded border">
                                    <span className="text-sm font-medium text-orange-600">
                                      R$ {calcularCustoKit(kit).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removerPratoDoKit(kitIndex, pratoIndex)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t">
                          <div className="flex gap-4">
                            <span className="text-sm">
                              <strong>Custo:</strong> R$ {calcularCustoKit(kit).toFixed(2)}
                            </span>
                            <span className="text-sm">
                              <strong>Preço:</strong> R$ {kit.precoVenda.toFixed(2)}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                kit.precoVenda - calcularCustoKit(kit) >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              <strong>Lucro:</strong> R$ {(kit.precoVenda - calcularCustoKit(kit)).toFixed(2)}
                            </span>
                          </div>
                          <Badge variant={kit.ativo ? "default" : "secondary"}>{kit.ativo ? "Ativo" : "Inativo"}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {kits.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={salvarKits}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Kits
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gerenciar Pedidos</CardTitle>
                  <CardDescription>Registre pedidos e acompanhe a produção</CardDescription>
                </div>
                <Button onClick={adicionarPedido} disabled={kits.filter((k) => k.ativo).length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Pedido
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {pedidos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum pedido registrado</p>
                  <p className="text-sm">Clique em "Novo Pedido" para começar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pedidos.map((pedido, pedidoIndex) => (
                    <Card key={pedido.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label>Cliente</Label>
                                <Input
                                  placeholder="Nome do cliente"
                                  value={pedido.cliente}
                                  onChange={(e) => atualizarPedido(pedidoIndex, "cliente", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Data de Entrega</Label>
                                <Input
                                  type="date"
                                  value={pedido.dataEntrega}
                                  onChange={(e) => atualizarPedido(pedidoIndex, "dataEntrega", e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                  value={pedido.status}
                                  onValueChange={(value) => atualizarPedido(pedidoIndex, "status", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                    <SelectItem value="producao">Em Produção</SelectItem>
                                    <SelectItem value="entregue">Entregue</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerPedido(pedidoIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Itens do Pedido</h4>
                          <Button variant="outline" size="sm" onClick={() => adicionarItemAoPedido(pedidoIndex)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Item
                          </Button>
                        </div>

                        {pedido.itens.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhum item adicionado ao pedido</p>
                        ) : (
                          <div className="space-y-3">
                            {pedido.itens.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg bg-gray-50"
                              >
                                <div className="space-y-2">
                                  <Label>Kit</Label>
                                  <Select
                                    value={item.kitId}
                                    onValueChange={(value) =>
                                      atualizarItemDoPedido(pedidoIndex, itemIndex, "kitId", value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {kits
                                        .filter((k) => k.ativo)
                                        .map((kit) => (
                                          <SelectItem key={kit.id} value={kit.id}>
                                            {kit.nome} - R$ {kit.precoVenda.toFixed(2)}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Quantidade</Label>
                                  <Input
                                    type="number"
                                    placeholder="1"
                                    value={item.quantidade}
                                    onChange={(e) =>
                                      atualizarItemDoPedido(
                                        pedidoIndex,
                                        itemIndex,
                                        "quantidade",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Preço Unitário</Label>
                                  <div className="p-2 bg-white rounded border">
                                    {(() => {
                                      const kit = kits.find((k) => k.id === item.kitId)
                                      return (
                                        <span className="text-sm font-medium">
                                          R$ {kit ? kit.precoVenda.toFixed(2) : "0.00"}
                                        </span>
                                      )
                                    })()}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Total</Label>
                                  <div className="p-2 bg-white rounded border">
                                    {(() => {
                                      const kit = kits.find((k) => k.id === item.kitId)
                                      const total = kit ? kit.precoVenda * item.quantidade : 0
                                      return (
                                        <span className="text-sm font-medium text-green-600">
                                          R$ {total.toFixed(2)}
                                        </span>
                                      )
                                    })()}
                                  </div>
                                </div>
                                <div className="flex items-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removerItemDoPedido(pedidoIndex, itemIndex)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t">
                          <div className="flex gap-4">
                            <span className="text-lg font-semibold">
                              <strong>Total do Pedido:</strong> R$ {pedido.valorTotal.toFixed(2)}
                            </span>
                          </div>
                          <Badge
                            variant={
                              pedido.status === "entregue"
                                ? "default"
                                : pedido.status === "producao"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {pedido.status === "pendente" && "Pendente"}
                            {pedido.status === "producao" && "Em Produção"}
                            {pedido.status === "entregue" && "Entregue"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {pedidos.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={salvarPedidos}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Pedidos
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
                Relatórios e Análises
              </CardTitle>
              <CardDescription>Acompanhe performance e necessidades de produção</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const relatorio = calcularRelatorios()
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Pedidos Entregues</p>
                      <p className="text-2xl font-bold text-blue-800">{relatorio.pedidosEntregues}</p>
                    </div>
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
                )
              })()}

              {/* Ingredientes Necessários para Produção */}
              <div className="space-y-4">
                <h4 className="font-medium">Ingredientes Necessários (Pedidos Pendentes/Produção)</h4>
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
                        const custoUnitario = ingrediente ? ingrediente.precoCompra / ingrediente.quantidadeComprada : 0
                        const custoTotal = custoUnitario * dados.quantidade

                        return (
                          <tr key={ingredienteId} className="border-b">
                            <td className="p-2">{dados.nome}</td>
                            <td className="text-right p-2">{dados.quantidade.toFixed(1)}</td>
                            <td className="text-right p-2">{dados.unidade}</td>
                            <td className="text-right p-2">R$ {custoTotal.toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status dos Pedidos */}
              <div className="space-y-4">
                <h4 className="font-medium">Status dos Pedidos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600">Pendentes</p>
                    <p className="text-xl font-bold text-yellow-800">
                      {pedidos.filter((p) => p.status === "pendente").length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Em Produção</p>
                    <p className="text-xl font-bold text-blue-800">
                      {pedidos.filter((p) => p.status === "producao").length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Entregues</p>
                    <p className="text-xl font-bold text-green-800">
                      {pedidos.filter((p) => p.status === "entregue").length}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
