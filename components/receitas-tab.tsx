"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Edit, Trash2, Package, ChefHat, Sparkles } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { calcularCustoReceita, formatarMoeda, type IngredienteCalculo } from "../utils/unit-converter"

interface IngredienteReceita {
  ingredienteId: string
  nome: string
  quantidade: number
  unidade: string
}

interface Receita {
  id: string
  nome: string
  descricao: string
  ingredientes: IngredienteReceita[]
  rendimento: number
  custosFixos: {
    embalagem: number
    etiqueta: number
    gas: number
    energia: number
    transporte: number
  }
  precoVenda: number
  tipoPrecoVenda: "por_unidade" | "total_receita"
  taxaPlataforma: number
}

const unidadesPadrao = ["g", "ml", "un"]

export function ReceitasTab() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [ingredientes, setIngredientes] = useState<IngredienteCalculo[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReceita, setEditingReceita] = useState<Receita | null>(null)
  const [formData, setFormData] = useState<Partial<Receita>>({
    nome: "",
    descricao: "",
    ingredientes: [],
    rendimento: 1,
    custosFixos: {
      embalagem: 0,
      etiqueta: 0,
      gas: 0,
      energia: 0,
      transporte: 0,
    },
    precoVenda: 0,
    tipoPrecoVenda: "por_unidade",
    taxaPlataforma: 0,
  })

  useEffect(() => {
    const receitasData = localStorage.getItem("receitas")
    const ingredientesData = localStorage.getItem("ingredientes")

    if (receitasData) {
      const receitasParsed = JSON.parse(receitasData)
      const receitasMigradas = receitasParsed.map((receita: any) => ({
        ...receita,
        tipoPrecoVenda: receita.tipoPrecoVenda || "por_unidade",
      }))
      setReceitas(receitasMigradas)
    }
    if (ingredientesData) {
      setIngredientes(JSON.parse(ingredientesData))
    }
  }, [])

  const abrirNovaReceita = () => {
    setEditingReceita(null)
    setFormData({
      nome: "",
      descricao: "",
      ingredientes: [],
      rendimento: 1,
      custosFixos: {
        embalagem: 0,
        etiqueta: 0,
        gas: 0,
        energia: 0,
        transporte: 0,
      },
      precoVenda: 0,
      tipoPrecoVenda: "por_unidade",
      taxaPlataforma: 0,
    })
    setIsDialogOpen(true)
  }

  const salvarReceita = () => {
    if (!formData.nome) return

    const novaReceita: Receita = {
      id: editingReceita?.id || Date.now().toString(),
      nome: formData.nome,
      descricao: formData.descricao || "",
      ingredientes: formData.ingredientes || [],
      rendimento: formData.rendimento || 1,
      custosFixos: formData.custosFixos || {
        embalagem: 0,
        etiqueta: 0,
        gas: 0,
        energia: 0,
        transporte: 0,
      },
      precoVenda: formData.precoVenda || 0,
      tipoPrecoVenda: formData.tipoPrecoVenda || "por_unidade",
      taxaPlataforma: formData.taxaPlataforma || 0,
    }

    let novasReceitas
    if (editingReceita) {
      novasReceitas = receitas.map((r) => (r.id === editingReceita.id ? novaReceita : r))
    } else {
      novasReceitas = [...receitas, novaReceita]
    }

    setReceitas(novasReceitas)
    localStorage.setItem("receitas", JSON.stringify(novasReceitas))

    setIsDialogOpen(false)
    setEditingReceita(null)
    setFormData({
      nome: "",
      descricao: "",
      ingredientes: [],
      rendimento: 1,
      custosFixos: {
        embalagem: 0,
        etiqueta: 0,
        gas: 0,
        energia: 0,
        transporte: 0,
      },
      precoVenda: 0,
      tipoPrecoVenda: "por_unidade",
      taxaPlataforma: 0,
    })
  }

  const editarReceita = (receita: Receita) => {
    setEditingReceita(receita)
    setFormData({
      ...receita,
      tipoPrecoVenda: receita.tipoPrecoVenda || "por_unidade",
    })
    setIsDialogOpen(true)
  }

  const excluirReceita = (id: string) => {
    const novasReceitas = receitas.filter((r) => r.id !== id)
    setReceitas(novasReceitas)
    localStorage.setItem("receitas", JSON.stringify(novasReceitas))
  }

  const adicionarIngrediente = () => {
    setFormData({
      ...formData,
      ingredientes: [...(formData.ingredientes || []), { ingredienteId: "", nome: "", quantidade: 0, unidade: "g" }],
    })
  }

  const atualizarIngrediente = (index: number, campo: string, valor: any) => {
    const novosIngredientes = [...(formData.ingredientes || [])]

    if (campo === "ingredienteId") {
      const ingrediente = ingredientes.find((i) => i.id === valor)
      if (ingrediente) {
        novosIngredientes[index] = {
          ...novosIngredientes[index],
          ingredienteId: valor,
          nome: ingrediente.nome,
        }
      }
    } else {
      novosIngredientes[index] = {
        ...novosIngredientes[index],
        [campo]: valor,
      }
    }

    setFormData({
      ...formData,
      ingredientes: novosIngredientes,
    })
  }

  const removerIngrediente = (index: number) => {
    const novosIngredientes = (formData.ingredientes || []).filter((_, i) => i !== index)
    setFormData({
      ...formData,
      ingredientes: novosIngredientes,
    })
  }

  const calcularCustosReceita = (receita: Receita) => {
    const { custoTotal: custoIngredientes, custoUnitario } = calcularCustoReceita(
      receita.ingredientes,
      ingredientes,
      receita.rendimento,
    )

    const custoFixoTotal = Object.values(receita.custosFixos).reduce((acc, val) => acc + val, 0)
    const custoTotalComFixos = custoIngredientes + custoFixoTotal * receita.rendimento
    const custoUnitarioFinal = custoTotalComFixos / receita.rendimento

    let receitaBruta = 0
    let precoUnitario = 0

    if (receita.tipoPrecoVenda === "por_unidade") {
      precoUnitario = receita.precoVenda
      receitaBruta = receita.precoVenda * receita.rendimento
    } else {
      receitaBruta = receita.precoVenda
      precoUnitario = receita.precoVenda / receita.rendimento
    }

    const lucroTotal = receitaBruta - custoTotalComFixos
    const lucroUnitario = lucroTotal / receita.rendimento

    return {
      custoIngredientes,
      custoFixoTotal: custoFixoTotal * receita.rendimento,
      custoTotal: custoTotalComFixos,
      custoUnitario: custoUnitarioFinal,
      receitaBruta,
      precoUnitario,
      lucroTotal,
      lucroUnitario,
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h3 className="text-responsive-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Suas Receitas
          </h3>
          <p className="text-responsive-base text-gray-600">Gerencie suas receitas e calcule os custos de produção</p>
        </div>
        <Button
          onClick={abrirNovaReceita}
          className="button-responsive bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 rounded-xl w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Nova Receita
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="modal-responsive">
          <DialogHeader>
            <DialogTitle className="text-responsive-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {editingReceita ? "Editar Receita" : "Nova Receita"}
            </DialogTitle>
            <DialogDescription className="text-responsive-base">
              Preencha os dados da sua receita para calcular os custos automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 sm:space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Informações Básicas */}
            <div className="grid-responsive-form">
              <div className="space-y-3">
                <Label htmlFor="nome" className="text-responsive-base font-medium">
                  Nome da Receita
                </Label>
                <Input
                  id="nome"
                  placeholder="Ex: Bolo de Chocolate Gourmet"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="input-responsive rounded-xl border-2 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="rendimento" className="text-responsive-base font-medium">
                  Rendimento (unidades produzidas)
                </Label>
                <Input
                  id="rendimento"
                  type="number"
                  placeholder="Ex: 8 fatias"
                  value={formData.rendimento}
                  onChange={(e) => setFormData({ ...formData, rendimento: Number(e.target.value) })}
                  className="input-responsive rounded-xl border-2 focus:border-blue-500 transition-colors"
                />
                <p className="text-responsive-sm text-gray-600">
                  Quantas unidades esta receita produz (ex: 8 fatias, 12 brigadeiros)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="descricao" className="text-responsive-base font-medium">
                Descrição (opcional)
              </Label>
              <Textarea
                id="descricao"
                placeholder="Descreva sua receita, ingredientes especiais, modo de preparo..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="min-h-[100px] rounded-xl border-2 focus:border-blue-500 transition-colors text-responsive-sm"
              />
            </div>

            {/* Ingredientes */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h4 className="text-responsive-xl font-semibold text-gray-800">Ingredientes</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarIngrediente}
                  className="button-responsive rounded-xl border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 bg-transparent w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-4">
                {formData.ingredientes?.map((ing, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 spacing-responsive-md border-2 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                  >
                    <Select
                      value={ing.ingredienteId}
                      onValueChange={(value) => atualizarIngrediente(index, "ingredienteId", value)}
                    >
                      <SelectTrigger className="input-responsive rounded-xl border-2">
                        <SelectValue placeholder="Selecione o ingrediente" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredientes.map((ingrediente) => (
                          <SelectItem key={ingrediente.id} value={ingrediente.id}>
                            {ingrediente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Quantidade"
                      value={ing.quantidade}
                      onChange={(e) => atualizarIngrediente(index, "quantidade", Number(e.target.value))}
                      className="input-responsive rounded-xl border-2"
                    />

                    <Select
                      value={ing.unidade}
                      onValueChange={(value) => atualizarIngrediente(index, "unidade", value)}
                    >
                      <SelectTrigger className="input-responsive rounded-xl border-2">
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

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removerIngrediente(index)}
                      className="input-responsive text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 rounded-xl transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custos Fixos */}
            <div className="space-y-6">
              <h4 className="text-responsive-xl font-semibold text-gray-800">Custos Fixos por Unidade (R$)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { key: "embalagem", label: "Embalagem" },
                  { key: "etiqueta", label: "Etiqueta" },
                  { key: "gas", label: "Gás" },
                  { key: "energia", label: "Energia" },
                  { key: "transporte", label: "Transporte" },
                ].map((item) => (
                  <div key={item.key} className="space-y-3">
                    <Label className="text-responsive-sm font-medium">{item.label}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.custosFixos?.[item.key as keyof typeof formData.custosFixos]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          custosFixos: {
                            ...formData.custosFixos!,
                            [item.key]: Number(e.target.value),
                          },
                        })
                      }
                      className="input-responsive rounded-xl border-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preço de Venda */}
            <div className="space-y-6 spacing-responsive-md bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border-2">
              <h4 className="text-responsive-xl font-semibold text-gray-800">💰 Preço de Venda</h4>

              <div className="space-y-4">
                <Label className="text-responsive-base font-medium">Como você quer definir o preço?</Label>
                <RadioGroup
                  value={formData.tipoPrecoVenda}
                  onValueChange={(value: "por_unidade" | "total_receita") =>
                    setFormData({ ...formData, tipoPrecoVenda: value })
                  }
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-3 spacing-responsive-sm border-2 rounded-xl hover:bg-white transition-colors">
                    <RadioGroupItem value="por_unidade" id="por_unidade" className="flex-shrink-0" />
                    <Label htmlFor="por_unidade" className="flex-1 cursor-pointer">
                      <div className="font-medium text-responsive-sm">Preço por unidade</div>
                      <div className="text-responsive-xs text-gray-600">Ex: R$ 5,00 por fatia</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 spacing-responsive-sm border-2 rounded-xl hover:bg-white transition-colors">
                    <RadioGroupItem value="total_receita" id="total_receita" className="flex-shrink-0" />
                    <Label htmlFor="total_receita" className="flex-1 cursor-pointer">
                      <div className="font-medium text-responsive-sm">Preço total da receita</div>
                      <div className="text-responsive-xs text-gray-600">Ex: R$ 40,00 pelo bolo inteiro</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid-responsive-form">
                <div className="space-y-3">
                  <Label className="text-responsive-base font-medium">
                    {formData.tipoPrecoVenda === "por_unidade"
                      ? "Preço por unidade (R$)"
                      : "Preço total da receita (R$)"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={formData.tipoPrecoVenda === "por_unidade" ? "Ex: 5.00" : "Ex: 40.00"}
                    value={formData.precoVenda}
                    onChange={(e) => setFormData({ ...formData, precoVenda: Number(e.target.value) })}
                    className="input-responsive rounded-xl border-2 focus:border-green-500 transition-colors"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-responsive-base font-medium">Prévia do faturamento</Label>
                  <div className="input-responsive px-4 rounded-xl border-2 bg-white flex items-center justify-between">
                    <span className="text-responsive-lg font-bold text-green-600">
                      {formData.tipoPrecoVenda === "por_unidade"
                        ? formatarMoeda((formData.precoVenda || 0) * (formData.rendimento || 1))
                        : formatarMoeda(formData.precoVenda || 0)}
                    </span>
                    <span className="text-responsive-sm text-gray-600">({formData.rendimento || 1} unidades)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Taxa da Plataforma */}
            <div className="space-y-3">
              <Label className="text-responsive-base font-medium">Taxa da Plataforma (%)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 10"
                value={formData.taxaPlataforma}
                onChange={(e) => setFormData({ ...formData, taxaPlataforma: Number(e.target.value) })}
                className="input-responsive rounded-xl border-2 focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="button-responsive rounded-xl border-2 hover:bg-gray-50 transition-all duration-200 order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={salvarReceita}
                className="button-responsive bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 order-1 sm:order-2"
              >
                {editingReceita ? "Atualizar" : "Salvar"} Receita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de Receitas */}
      <div className="grid-responsive-cards">
        {receitas.map((receita, index) => {
          const custos = calcularCustosReceita(receita)

          return (
            <Card
              key={receita.id}
              className="card-responsive hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl border-2 hover:border-blue-200 bg-gradient-to-br from-white to-gray-50 card-enter-responsive"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-responsive-xl text-gray-900 font-bold text-truncate-responsive">
                      {receita.nome}
                    </CardTitle>
                    <CardDescription className="text-responsive-base mt-2">
                      Rende {receita.rendimento} unidades
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editarReceita(receita)}
                      className="hover:bg-blue-50 rounded-xl p-2"
                    >
                      <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => excluirReceita(receita.id)}
                      className="hover:bg-red-50 rounded-xl p-2"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-responsive-base">
                    <span className="text-gray-600 font-medium">Custo unitário:</span>
                    <span className="font-bold text-gray-900">{formatarMoeda(custos.custoUnitario)}</span>
                  </div>
                  <div className="flex justify-between text-responsive-base">
                    <span className="text-gray-600 font-medium">Preço unitário:</span>
                    <span className="font-bold text-gray-900">{formatarMoeda(custos.precoUnitario)}</span>
                  </div>
                  <div className="flex justify-between text-responsive-base">
                    <span className="text-gray-600 font-medium">Receita bruta:</span>
                    <span className="font-bold text-green-600">{formatarMoeda(custos.receitaBruta)}</span>
                  </div>
                  <div className="flex justify-between text-responsive-base border-t pt-2">
                    <span className="text-gray-600 font-medium">Lucro total:</span>
                    <span
                      className={`font-bold text-responsive-lg ${custos.lucroTotal >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatarMoeda(custos.lucroTotal)}
                    </span>
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Badge
                    variant={receita.ingredientes.length > 0 ? "default" : "secondary"}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-responsive-xs"
                  >
                    {receita.ingredientes.length} ingredientes
                  </Badge>
                  {custos.lucroTotal >= 0 ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-responsive-xs"
                    >
                      Lucrativo
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-responsive-xs"
                    >
                      Prejuízo
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {receitas.length === 0 && (
        <Card className="border-dashed border-4 border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50">
          <CardContent className="flex flex-col items-center justify-center spacing-responsive-xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-responsive-2xl font-bold text-gray-900 mb-3 text-center">Nenhuma receita cadastrada</h3>
            <p className="text-responsive-base text-gray-600 text-center mb-8 max-w-md">
              Comece criando sua primeira receita para calcular os custos de produção e definir preços ideais
            </p>
            <Button
              onClick={abrirNovaReceita}
              className="button-responsive bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
              Criar Primeira Receita
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 ml-3" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
