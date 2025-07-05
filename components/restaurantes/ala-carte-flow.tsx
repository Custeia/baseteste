"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Plus, Trash2, Save, BarChart3, Settings, AlertCircle, Calendar } from "lucide-react"
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

interface PratoCardapio {
  id: string
  receitaId: string
  nomeReceita: string
  precoVenda: number
  categoria: string
  ativo: boolean
}

interface VendaDia {
  data: string
  vendas: Array<{
    pratoId: string
    nomePrato: string
    quantidade: number
  }>
}

interface AlaCarteFlowProps {
  onResetTipo: () => void
}

const categoriasPrato = ["Entrada", "Prato Principal", "Sobremesa", "Bebida", "Acompanhamento", "Outro"]

export function AlaCarteFlow({ onResetTipo }: AlaCarteFlowProps) {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [cardapio, setCardapio] = useState<PratoCardapio[]>([])
  const [vendas, setVendas] = useState<VendaDia[]>([])
  const [activeTab, setActiveTab] = useState("cardapio")
  const [dataVenda, setDataVenda] = useState<string>(new Date().toISOString().split("T")[0])

  useEffect(() => {
    // Carregar dados
    const receitasData = localStorage.getItem("receitas")
    const ingredientesData = localStorage.getItem("ingredientes")
    const cardapioData = localStorage.getItem("ala_carte_cardapio")
    const vendasData = localStorage.getItem("ala_carte_vendas")

    if (receitasData) setReceitas(JSON.parse(receitasData))
    if (ingredientesData) setIngredientes(JSON.parse(ingredientesData))
    if (cardapioData) setCardapio(JSON.parse(cardapioData))
    if (vendasData) setVendas(JSON.parse(vendasData))
  }, [])

  const salvarCardapio = () => {
    localStorage.setItem("ala_carte_cardapio", JSON.stringify(cardapio))
  }

  const salvarVendas = () => {
    localStorage.setItem("ala_carte_vendas", JSON.stringify(vendas))
  }

  const adicionarPratoCardapio = () => {
    const novoPrato: PratoCardapio = {
      id: Date.now().toString(),
      receitaId: "",
      nomeReceita: "",
      precoVenda: 0,
      categoria: "Prato Principal",
      ativo: true,
    }
    setCardapio([...cardapio, novoPrato])
  }

  const atualizarPratoCardapio = (index: number, campo: string, valor: any) => {
    const novosCardapio = [...cardapio]

    if (campo === "receitaId") {
      const receita = receitas.find((r) => r.id === valor)
      if (receita) {
        novosCardapio[index] = {
          ...novosCardapio[index],
          receitaId: valor,
          nomeReceita: receita.nome,
        }
      }
    } else {
      novosCardapio[index] = {
        ...novosCardapio[index],
        [campo]: valor,
      }
    }

    setCardapio(novosCardapio)
  }

  const removerPratoCardapio = (index: number) => {
    const novosCardapio = cardapio.filter((_, i) => i !== index)
    setCardapio(novosCardapio)
  }

  const registrarVenda = () => {
    const vendaExistente = vendas.find((v) => v.data === dataVenda)
    const pratosAtivos = cardapio.filter((p) => p.ativo)

    const novasVendas = pratosAtivos.map((prato) => ({
      pratoId: prato.id,
      nomePrato: prato.nomeReceita,
      quantidade: 0,
    }))

    if (vendaExistente) {
      // Atualizar venda existente
      const vendasAtualizadas = vendas.map((v) => (v.data === dataVenda ? { ...v, vendas: novasVendas } : v))
      setVendas(vendasAtualizadas)
    } else {
      // Criar nova venda
      const novaVenda: VendaDia = {
        data: dataVenda,
        vendas: novasVendas,
      }
      setVendas([...vendas, novaVenda])
    }
  }

  const atualizarVenda = (pratoId: string, quantidade: number) => {
    const vendasAtualizadas = vendas.map((v) => {
      if (v.data === dataVenda) {
        const vendasDoDia = v.vendas.map((venda) => (venda.pratoId === pratoId ? { ...venda, quantidade } : venda))
        return { ...v, vendas: vendasDoDia }
      }
      return v
    })
    setVendas(vendasAtualizadas)
  }

  const calcularCustoPrato = (pratoId: string) => {
    const prato = cardapio.find((p) => p.id === pratoId)
    if (!prato) return 0

    const receita = receitas.find((r) => r.id === prato.receitaId)
    if (!receita) return 0

    let custoTotal = 0
    receita.ingredientes.forEach((ing) => {
      const ingrediente = ingredientes.find((i) => i.id === ing.ingredienteId)
      if (ingrediente && ingrediente.quantidadeComprada > 0) {
        const custoUnitario = ingrediente.precoCompra / ingrediente.quantidadeComprada
        custoTotal += custoUnitario * ing.quantidade
      }
    })

    return custoTotal / receita.rendimento
  }

  const calcularRelatorioVendas = () => {
    let receitaTotal = 0
    let custoTotal = 0
    let pratosVendidos = 0

    vendas.forEach((vendaDia) => {
      vendaDia.vendas.forEach((venda) => {
        const prato = cardapio.find((p) => p.id === venda.pratoId)
        if (prato && venda.quantidade > 0) {
          receitaTotal += prato.precoVenda * venda.quantidade
          custoTotal += calcularCustoPrato(prato.id) * venda.quantidade
          pratosVendidos += venda.quantidade
        }
      })
    })

    return {
      receitaTotal,
      custoTotal,
      lucroTotal: receitaTotal - custoTotal,
      pratosVendidos,
      margemLucro: receitaTotal > 0 ? ((receitaTotal - custoTotal) / receitaTotal) * 100 : 0,
    }
  }

  const vendaDoDia = vendas.find((v) => v.data === dataVenda)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-green-600" />À la carte - Cardápio Fixo
          </h3>
          <p className="text-gray-600 mt-1">Gerencie cardápio permanente e registre vendas</p>
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
            Você precisa cadastrar receitas primeiro. Acesse a aba <strong className="text-green-600">Receitas</strong>{" "}
            para continuar.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cardapio">Cardápio</TabsTrigger>
          <TabsTrigger value="vendas">Registro de Vendas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="cardapio" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Cardápio Permanente</CardTitle>
                  <CardDescription>Gerencie os pratos disponíveis no seu cardápio</CardDescription>
                </div>
                <Button onClick={adicionarPratoCardapio} disabled={receitas.length === 0}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Prato
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cardapio.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum prato no cardápio</p>
                  <p className="text-sm">Clique em "Adicionar Prato" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cardapio.map((prato, index) => (
                    <div
                      key={prato.id}
                      className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="space-y-2">
                        <Label>Receita</Label>
                        <Select
                          value={prato.receitaId}
                          onValueChange={(value) => atualizarPratoCardapio(index, "receitaId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a receita" />
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
                        <Label>Categoria</Label>
                        <Select
                          value={prato.categoria}
                          onValueChange={(value) => atualizarPratoCardapio(index, "categoria", value)}
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
                        <Label>Preço de Venda (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 25.00"
                          value={prato.precoVenda}
                          onChange={(e) => atualizarPratoCardapio(index, "precoVenda", Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Custo Unitário</Label>
                        <div className="p-2 bg-white rounded border">
                          <span className="text-sm font-medium text-orange-600">
                            R$ {calcularCustoPrato(prato.id).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={prato.ativo ? "ativo" : "inativo"}
                          onValueChange={(value) => atualizarPratoCardapio(index, "ativo", value === "ativo")}
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

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerPratoCardapio(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cardapio.length > 0 && (
                <div className="flex justify-end pt-4">
                  <Button onClick={salvarCardapio}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Cardápio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Registro de Vendas
              </CardTitle>
              <CardDescription>Registre as vendas diárias dos pratos do cardápio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label>Data da Venda</Label>
                  <Input type="date" value={dataVenda} onChange={(e) => setDataVenda(e.target.value)} />
                </div>
                <Button onClick={registrarVenda} disabled={cardapio.filter((p) => p.ativo).length === 0}>
                  Iniciar Registro
                </Button>
              </div>

              {vendaDoDia && (
                <div className="space-y-4">
                  <h4 className="font-medium">Vendas do dia {new Date(dataVenda).toLocaleDateString("pt-BR")}</h4>
                  <div className="space-y-3">
                    {vendaDoDia.vendas.map((venda) => {
                      const prato = cardapio.find((p) => p.id === venda.pratoId)
                      if (!prato) return null

                      return (
                        <div
                          key={venda.pratoId}
                          className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 border rounded-lg"
                        >
                          <div>
                            <Label className="text-sm">Prato</Label>
                            <p className="font-medium">{venda.nomePrato}</p>
                            <Badge variant="secondary">{prato.categoria}</Badge>
                          </div>
                          <div>
                            <Label className="text-sm">Preço Unitário</Label>
                            <p className="font-medium">R$ {prato.precoVenda.toFixed(2)}</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Quantidade Vendida</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={venda.quantidade}
                              onChange={(e) => atualizarVenda(venda.pratoId, Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Total</Label>
                            <p className="font-medium text-green-600">
                              R$ {(prato.precoVenda * venda.quantidade).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={salvarVendas}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Vendas
                    </Button>
                  </div>
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
                Relatório de Vendas
              </CardTitle>
              <CardDescription>Análise consolidada das vendas e lucros</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const relatorio = calcularRelatorioVendas()
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Pratos Vendidos</p>
                      <p className="text-2xl font-bold text-blue-800">{relatorio.pratosVendidos}</p>
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

              {/* Histórico de Vendas */}
              <div className="space-y-4">
                <h4 className="font-medium">Histórico de Vendas</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Data</th>
                        <th className="text-right p-2">Pratos Vendidos</th>
                        <th className="text-right p-2">Receita</th>
                        <th className="text-right p-2">Custo</th>
                        <th className="text-right p-2">Lucro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendas.map((vendaDia) => {
                        let receitaDia = 0
                        let custoDia = 0
                        let pratosDia = 0

                        vendaDia.vendas.forEach((venda) => {
                          const prato = cardapio.find((p) => p.id === venda.pratoId)
                          if (prato && venda.quantidade > 0) {
                            receitaDia += prato.precoVenda * venda.quantidade
                            custoDia += calcularCustoPrato(prato.id) * venda.quantidade
                            pratosDia += venda.quantidade
                          }
                        })

                        const lucroDia = receitaDia - custoDia

                        return (
                          <tr key={vendaDia.data} className="border-b">
                            <td className="p-2">{new Date(vendaDia.data).toLocaleDateString("pt-BR")}</td>
                            <td className="text-right p-2">{pratosDia}</td>
                            <td className="text-right p-2">R$ {receitaDia.toFixed(2)}</td>
                            <td className="text-right p-2">R$ {custoDia.toFixed(2)}</td>
                            <td className={`text-right p-2 ${lucroDia >= 0 ? "text-green-600" : "text-red-600"}`}>
                              R$ {lucroDia.toFixed(2)}
                            </td>
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
