"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ChefHat, Copy, Edit3, Save, X } from "lucide-react"
import {
  calcularCustoReceita,
  formatarMoeda,
  formatarQuantidade,
  type IngredienteCalculo,
  type IngredienteReceita,
} from "../utils/unit-converter"

interface Prato {
  id: string
  nome: string
  categoria: string
  tipoMedida: "porcao" | "kg" | "litro"
  ingredientes: IngredienteReceita[]
  rendimento: number
  observacoes: string
  disponibilidade: {
    selfService: boolean
    alaCarte: boolean
    churrascaria: boolean
    marmiteria: boolean
    delivery: boolean
  }
}

const categoriasPrato = [
  "Entrada",
  "Prato Principal",
  "Acompanhamento",
  "Sobremesa",
  "Bebida",
  "Molho/Tempero",
  "Salada",
  "Sopa",
  "Lanche",
  "Outros",
]

const unidadesPadrao = ["g", "kg", "ml", "l", "un"]

export function PratosTab() {
  const [pratos, setPratos] = useState<Prato[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [activeTab, setActiveTab] = useState("lista")
  const [editandoPrato, setEditandoPrato] = useState<Prato | null>(null)

  // Estados para novo prato
  const [novoPrato, setNovoPrato] = useState<Prato>({
    id: "",
    nome: "",
    categoria: "",
    tipoMedida: "porcao",
    ingredientes: [],
    rendimento: 1,
    observacoes: "",
    disponibilidade: {
      selfService: true,
      alaCarte: true,
      churrascaria: false,
      marmiteria: true,
      delivery: true,
    },
  })

  // Estados para adicionar ingrediente ao prato
  const [novoIngrediente, setNovoIngrediente] = useState({
    ingredienteId: "",
    quantidade: "",
    unidade: "g",
  })

  useEffect(() => {
    const pratosData = localStorage.getItem("pratos")
    if (pratosData) {
      setPratos(JSON.parse(pratosData))
    }

    const ingredientesData = localStorage.getItem("ingredientes")
    if (ingredientesData) {
      setIngredientes(JSON.parse(ingredientesData))
    }
  }, [])

  const salvarPratos = (novosPratos: Prato[]) => {
    setPratos(novosPratos)
    localStorage.setItem("pratos", JSON.stringify(novosPratos))
  }

  const adicionarIngredienteAoPrato = () => {
    if (!novoIngrediente.ingredienteId || !novoIngrediente.quantidade) return

    const ingredienteEncontrado = ingredientes.find((ing) => ing.id === novoIngrediente.ingredienteId)
    if (!ingredienteEncontrado) return

    const ingredienteReceita: IngredienteReceita = {
      ingredienteId: novoIngrediente.ingredienteId,
      nome: ingredienteEncontrado.nome,
      quantidade: Number(novoIngrediente.quantidade),
      unidade: novoIngrediente.unidade,
    }

    const pratoAtual = editandoPrato || novoPrato
    const ingredientesAtualizados = [...pratoAtual.ingredientes, ingredienteReceita]

    if (editandoPrato) {
      setEditandoPrato({ ...editandoPrato, ingredientes: ingredientesAtualizados })
    } else {
      setNovoPrato({ ...novoPrato, ingredientes: ingredientesAtualizados })
    }

    setNovoIngrediente({
      ingredienteId: "",
      quantidade: "",
      unidade: "g",
    })
  }

  const removerIngredienteDoPrato = (index: number) => {
    const pratoAtual = editandoPrato || novoPrato
    const ingredientesAtualizados = pratoAtual.ingredientes.filter((_, i) => i !== index)

    if (editandoPrato) {
      setEditandoPrato({ ...editandoPrato, ingredientes: ingredientesAtualizados })
    } else {
      setNovoPrato({ ...novoPrato, ingredientes: ingredientesAtualizados })
    }
  }

  const salvarPrato = () => {
    const pratoParaSalvar = editandoPrato || novoPrato

    if (!pratoParaSalvar.nome.trim() || !pratoParaSalvar.categoria || pratoParaSalvar.ingredientes.length === 0) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    if (editandoPrato) {
      const pratosAtualizados = pratos.map((p) => (p.id === editandoPrato.id ? pratoParaSalvar : p))
      salvarPratos(pratosAtualizados)
      setEditandoPrato(null)
    } else {
      const novoId = Date.now().toString()
      const pratoComId = { ...pratoParaSalvar, id: novoId }
      salvarPratos([...pratos, pratoComId])
    }

    // Reset form
    setNovoPrato({
      id: "",
      nome: "",
      categoria: "",
      tipoMedida: "porcao",
      ingredientes: [],
      rendimento: 1,
      observacoes: "",
      disponibilidade: {
        selfService: true,
        alaCarte: true,
        churrascaria: false,
        marmiteria: true,
        delivery: true,
      },
    })

    setActiveTab("lista")
  }

  const duplicarPrato = (prato: Prato) => {
    const pratoDuplicado = {
      ...prato,
      id: Date.now().toString(),
      nome: `${prato.nome} (Cópia)`,
    }
    salvarPratos([...pratos, pratoDuplicado])
  }

  const excluirPrato = (id: string) => {
    const novosPratos = pratos.filter((p) => p.id !== id)
    salvarPratos(novosPratos)
  }

  const calcularCustoPrato = (prato: Prato) => {
    const { custoTotal, custoUnitario } = calcularCustoReceita(prato.ingredientes, ingredientes, prato.rendimento)
    return { custoTotal, custoUnitario }
  }

  const renderFormularioPrato = (prato: Prato, setPrato: (prato: Prato) => void) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Nome do Prato *</Label>
          <Input
            placeholder="Ex: Lasanha de Frango"
            value={prato.nome}
            onChange={(e) => setPrato({ ...prato, nome: e.target.value })}
            className="h-12 rounded-xl border-2"
          />
        </div>
        <div className="space-y-3">
          <Label className="text-base font-medium">Categoria *</Label>
          <Select value={prato.categoria} onValueChange={(value) => setPrato({ ...prato, categoria: value })}>
            <SelectTrigger className="h-12 rounded-xl border-2">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoriasPrato.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Tipo de Medida</Label>
          <Select
            value={prato.tipoMedida}
            onValueChange={(value: "porcao" | "kg" | "litro") => setPrato({ ...prato, tipoMedida: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="porcao">Porção Individual</SelectItem>
              <SelectItem value="kg">Por Quilograma</SelectItem>
              <SelectItem value="litro">Por Litro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label className="text-base font-medium">Rendimento</Label>
          <Input
            type="number"
            min="1"
            step="0.1"
            placeholder="Ex: 8 (porções)"
            value={prato.rendimento}
            onChange={(e) => setPrato({ ...prato, rendimento: Number(e.target.value) || 1 })}
            className="h-12 rounded-xl border-2"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">Disponível para:</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries({
            selfService: "Self-Service",
            alaCarte: "À La Carte",
            churrascaria: "Churrascaria",
            marmiteria: "Marmiteria",
            delivery: "Delivery",
          }).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={prato.disponibilidade[key as keyof typeof prato.disponibilidade]}
                onCheckedChange={(checked) =>
                  setPrato({
                    ...prato,
                    disponibilidade: {
                      ...prato.disponibilidade,
                      [key]: checked,
                    },
                  })
                }
              />
              <Label htmlFor={key} className="text-sm">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-medium">Observações</Label>
        <Textarea
          placeholder="Ex: Tempo de preparo: 45min, Serve quente, etc."
          value={prato.observacoes}
          onChange={(e) => setPrato({ ...prato, observacoes: e.target.value })}
          className="rounded-xl border-2"
          rows={3}
        />
      </div>

      {/* Adicionar Ingredientes */}
      <Card className="rounded-2xl border-2">
        <CardHeader>
          <CardTitle className="text-lg">Ingredientes do Prato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Select
                value={novoIngrediente.ingredienteId}
                onValueChange={(value) => setNovoIngrediente({ ...novoIngrediente, ingredienteId: value })}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Selecione o ingrediente" />
                </SelectTrigger>
                <SelectContent>
                  {ingredientes.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id}>
                      {ing.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="number"
              step="0.01"
              placeholder="Quantidade"
              value={novoIngrediente.quantidade}
              onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidade: e.target.value })}
              className="h-10 rounded-xl"
            />
            <div className="flex gap-2">
              <Select
                value={novoIngrediente.unidade}
                onValueChange={(value) => setNovoIngrediente({ ...novoIngrediente, unidade: value })}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidadesPadrao.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={adicionarIngredienteAoPrato} size="sm" className="h-10 px-3 rounded-xl">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {prato.ingredientes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Ingredientes adicionados:</h4>
              {prato.ingredientes.map((ing, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <span className="font-medium">{ing.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{formatarQuantidade(ing.quantidade, ing.unidade)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerIngredienteDoPrato(index)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          Gerenciar Pratos
        </h3>
        <p className="text-gray-600 text-lg">
          Cadastre pratos para uso comercial com cálculo de custos e fichas técnicas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-14 bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl p-2">
          <TabsTrigger
            value="lista"
            className="flex items-center space-x-3 h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <ChefHat className="w-5 h-5 text-orange-600" />
            <span className="font-medium">Lista de Pratos</span>
          </TabsTrigger>
          <TabsTrigger
            value="novo"
            className="flex items-center space-x-3 h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
          >
            <Plus className="w-5 h-5 text-red-600" />
            <span className="font-medium">Novo Prato</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pratos.map((prato, index) => {
              const { custoTotal, custoUnitario } = calcularCustoPrato(prato)

              return (
                <Card
                  key={prato.id}
                  className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl border-2 hover:border-orange-200 bg-gradient-to-br from-white to-orange-50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">{prato.nome}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                            {prato.categoria}
                          </Badge>
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicarPrato(prato)}
                          className="hover:bg-blue-50 rounded-xl p-2"
                        >
                          <Copy className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditandoPrato(prato)
                            setActiveTab("novo")
                          }}
                          className="hover:bg-green-50 rounded-xl p-2"
                        >
                          <Edit3 className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirPrato(prato.id)}
                          className="hover:bg-red-50 rounded-xl p-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Rendimento:</span>
                      <span className="font-semibold">
                        {prato.rendimento} {prato.tipoMedida === "porcao" ? "porções" : prato.tipoMedida}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Custo Total:</span>
                      <span className="font-semibold">{formatarMoeda(custoTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Custo/{prato.tipoMedida}:</span>
                      <span className="font-bold text-green-600 text-base">{formatarMoeda(custoUnitario)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Ingredientes:</span>
                      <span className="font-semibold">{prato.ingredientes.length}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2">
                      {Object.entries(prato.disponibilidade).map(([key, value]) => {
                        if (!value) return null
                        const labels = {
                          selfService: "Self",
                          alaCarte: "Carte",
                          churrascaria: "Churr",
                          marmiteria: "Marm",
                          delivery: "Deliv",
                        }
                        return (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {labels[key as keyof typeof labels]}
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {pratos.length === 0 && (
            <Card className="border-dashed border-4 border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-orange-50">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6">
                  <ChefHat className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Nenhum prato cadastrado</h3>
                <p className="text-gray-600 text-center mb-8 max-w-md text-lg">
                  Comece criando pratos para usar em seus restaurantes
                </p>
                <Button
                  onClick={() => setActiveTab("novo")}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Prato
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="novo" className="space-y-6">
          <Card className="rounded-2xl border-2 bg-gradient-to-br from-white to-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <ChefHat className="w-6 h-6 text-orange-600" />
                    {editandoPrato ? "Editar Prato" : "Criar Novo Prato"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {editandoPrato ? "Modifique as informações do prato" : "Adicione um novo prato ao cardápio"}
                  </CardDescription>
                </div>
                {editandoPrato && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditandoPrato(null)
                      setActiveTab("lista")
                    }}
                    className="rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderFormularioPrato(editandoPrato || novoPrato, editandoPrato ? setEditandoPrato : setNovoPrato)}

              <div className="flex gap-4 pt-6">
                <Button
                  onClick={salvarPrato}
                  className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {editandoPrato ? "Salvar Alterações" : "Criar Prato"}
                </Button>
                {editandoPrato && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditandoPrato(null)
                      setActiveTab("lista")
                    }}
                    className="h-12 px-8 rounded-xl"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
