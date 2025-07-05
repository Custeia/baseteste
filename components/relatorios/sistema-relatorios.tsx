"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, TrendingUp, BarChart3, Target, AlertCircle, Database } from "lucide-react"
import { formatarMoeda } from "../../utils/unit-converter"

interface ProjecaoPersonalizada {
  tipo: "receita" | "vendas" | "lucro"
  valor: number
  periodo: "dia" | "semana" | "mes"
  descricao: string
}

interface RelatoriosProps {
  tipoRestaurante: string
  dadosAtuais: {
    receita: number
    custo: number
    lucro: number
    vendas: number
  }
  configuracao?: any
}

export function SistemaRelatorios({ tipoRestaurante, dadosAtuais, configuracao }: RelatoriosProps) {
  const [activeTab, setActiveTab] = useState("projecoes")
  const [metaLucro, setMetaLucro] = useState<number>(50)
  const [projecaoPersonalizada, setProjecaoPersonalizada] = useState<ProjecaoPersonalizada>({
    tipo: "receita",
    valor: 0,
    periodo: "dia",
    descricao: "",
  })

  // Cálculos de projeções baseados apenas nos dados reais atuais
  const calcularProjecaoDiaria = () => {
    return {
      receita: dadosAtuais.receita || 0,
      custo: dadosAtuais.custo || 0,
      lucro: dadosAtuais.lucro || 0,
      vendas: dadosAtuais.vendas || 0,
    }
  }

  const calcularProjecaoSemanal = () => {
    const projecaoDiaria = calcularProjecaoDiaria()
    return {
      receita: projecaoDiaria.receita * 7,
      custo: projecaoDiaria.custo * 7,
      lucro: projecaoDiaria.lucro * 7,
      vendas: projecaoDiaria.vendas * 7,
    }
  }

  const calcularProjecaoMensal = () => {
    const projecaoDiaria = calcularProjecaoDiaria()
    return {
      receita: projecaoDiaria.receita * 30,
      custo: projecaoDiaria.custo * 30,
      lucro: projecaoDiaria.lucro * 30,
      vendas: projecaoDiaria.vendas * 30,
    }
  }

  const calcularPrecoIdealParaMeta = () => {
    if (!dadosAtuais.custo || dadosAtuais.vendas === 0) return 0
    const lucroDesejado = (dadosAtuais.custo * metaLucro) / 100
    return (dadosAtuais.custo + lucroDesejado) / dadosAtuais.vendas
  }

  const projecaoDiaria = calcularProjecaoDiaria()
  const projecaoSemanal = calcularProjecaoSemanal()
  const projecaoMensal = calcularProjecaoMensal()

  return (
    <div className="content-wrapper">
      <div className="container-main space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="menu-responsive h-12 lg:h-14 bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-responsive rounded-2xl p-2">
            <TabsTrigger
              value="projecoes"
              className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <Target className="w-4 h-4" />
              <span className="text-responsive-sm">Projeções</span>
            </TabsTrigger>
            <TabsTrigger
              value="metas"
              className="flex items-center space-x-2 h-8 lg:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-responsive-sm">Metas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projecoes" className="space-y-6 animate-slide-up">
            {/* Aviso sobre dados reais */}
            <Alert className="border-blue-200 bg-blue-50">
              <Database className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-responsive-sm">
                <strong>Dados Baseados na Configuração Atual:</strong> As projeções são calculadas com base nas
                configurações e estimativas que você definiu. Para dados históricos reais, será necessário integração
                com banco de dados.
              </AlertDescription>
            </Alert>

            {/* Projeções Baseadas nos Dados Atuais */}
            <div className="stats-grid">
              <Card className="stat-card animate-fade-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-responsive-lg font-bold text-blue-600 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Projeção Diária
                  </CardTitle>
                  <CardDescription className="text-responsive-sm">Baseada na configuração atual</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Receita:</span>
                    <span className="text-responsive-lg font-bold text-green-600">
                      {formatarMoeda(projecaoDiaria.receita)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Custo:</span>
                    <span className="text-responsive-lg font-bold text-red-600">
                      {formatarMoeda(projecaoDiaria.custo)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Lucro:</span>
                    <span className="text-responsive-lg font-bold text-blue-600">
                      {formatarMoeda(projecaoDiaria.lucro)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Vendas:</span>
                    <span className="text-responsive-lg font-bold text-purple-600">{projecaoDiaria.vendas}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card animate-fade-scale" style={{ animationDelay: "0.1s" }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-responsive-lg font-bold text-green-600 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Projeção Semanal
                  </CardTitle>
                  <CardDescription className="text-responsive-sm">Próximos 7 dias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Receita:</span>
                    <span className="text-responsive-lg font-bold text-green-600">
                      {formatarMoeda(projecaoSemanal.receita)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Custo:</span>
                    <span className="text-responsive-lg font-bold text-red-600">
                      {formatarMoeda(projecaoSemanal.custo)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Lucro:</span>
                    <span className="text-responsive-lg font-bold text-blue-600">
                      {formatarMoeda(projecaoSemanal.lucro)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Vendas:</span>
                    <span className="text-responsive-lg font-bold text-purple-600">{projecaoSemanal.vendas}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card animate-fade-scale" style={{ animationDelay: "0.2s" }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-responsive-lg font-bold text-purple-600 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Projeção Mensal
                  </CardTitle>
                  <CardDescription className="text-responsive-sm">Próximos 30 dias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Receita:</span>
                    <span className="text-responsive-lg font-bold text-green-600">
                      {formatarMoeda(projecaoMensal.receita)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Custo:</span>
                    <span className="text-responsive-lg font-bold text-red-600">
                      {formatarMoeda(projecaoMensal.custo)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Lucro:</span>
                    <span className="text-responsive-lg font-bold text-blue-600">
                      {formatarMoeda(projecaoMensal.lucro)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-responsive-sm text-gray-600">Vendas:</span>
                    <span className="text-responsive-lg font-bold text-purple-600">{projecaoMensal.vendas}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Projeção Personalizada */}
              <Card className="stat-card animate-fade-scale" style={{ animationDelay: "0.3s" }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-responsive-lg font-bold text-orange-600 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Meta Personalizada
                  </CardTitle>
                  <CardDescription className="text-responsive-sm">Configure suas próprias metas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="form-grid">
                    <div className="space-y-2">
                      <Label className="text-responsive-xs">Tipo</Label>
                      <Select
                        value={projecaoPersonalizada.tipo}
                        onValueChange={(value: "receita" | "vendas" | "lucro") =>
                          setProjecaoPersonalizada({ ...projecaoPersonalizada, tipo: value })
                        }
                      >
                        <SelectTrigger className="h-8 text-responsive-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receita">Receita</SelectItem>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="lucro">Lucro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-responsive-xs">Período</Label>
                      <Select
                        value={projecaoPersonalizada.periodo}
                        onValueChange={(value: "dia" | "semana" | "mes") =>
                          setProjecaoPersonalizada({ ...projecaoPersonalizada, periodo: value })
                        }
                      >
                        <SelectTrigger className="h-8 text-responsive-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dia">Por Dia</SelectItem>
                          <SelectItem value="semana">Por Semana</SelectItem>
                          <SelectItem value="mes">Por Mês</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-responsive-xs">Valor da Meta</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={projecaoPersonalizada.valor}
                      onChange={(e) =>
                        setProjecaoPersonalizada({ ...projecaoPersonalizada, valor: Number(e.target.value) })
                      }
                      className="h-8 text-responsive-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-responsive-xs">Descrição</Label>
                    <Input
                      placeholder="Ex: Meta de vendas para Black Friday"
                      value={projecaoPersonalizada.descricao}
                      onChange={(e) =>
                        setProjecaoPersonalizada({ ...projecaoPersonalizada, descricao: e.target.value })
                      }
                      className="h-8 text-responsive-xs"
                    />
                  </div>
                  {projecaoPersonalizada.valor > 0 && (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <p className="text-responsive-xs font-medium text-orange-800">
                        Meta: {formatarMoeda(projecaoPersonalizada.valor)} de {projecaoPersonalizada.tipo} por{" "}
                        {projecaoPersonalizada.periodo}
                      </p>
                      {projecaoPersonalizada.descricao && (
                        <p className="text-responsive-xs text-orange-600 mt-1">{projecaoPersonalizada.descricao}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metas" className="space-y-6 animate-slide-up">
            {/* Meta de Lucro */}
            <Card className="card-responsive border-2 bg-gradient-to-br from-white to-purple-50 shadow-responsive">
              <CardHeader>
                <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  Calculadora de Meta de Lucro
                </CardTitle>
                <CardDescription className="text-responsive-base">
                  Calcule o preço ideal baseado na sua meta de lucro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="form-grid">
                  <div className="space-y-3">
                    <Label className="text-responsive-base font-medium">Meta de lucro (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex: 50"
                      value={metaLucro}
                      onChange={(e) => setMetaLucro(Number(e.target.value) || 0)}
                      className="input-responsive border-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-responsive-base font-medium">Preço ideal por unidade</Label>
                    <div className="input-responsive px-4 border-2 bg-gray-50 flex items-center">
                      <span className="text-responsive-lg font-bold text-purple-600">
                        {formatarMoeda(calcularPrecoIdealParaMeta())}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="spacing-responsive bg-purple-100 rounded-xl border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-4 text-responsive-lg">
                    Para atingir {metaLucro}% de lucro:
                  </h4>
                  <div className="grid-responsive-3 gap-4 text-responsive-sm">
                    <div>
                      <span className="text-purple-700 font-medium">Custo atual:</span>
                      <p className="font-bold text-lg">{formatarMoeda(dadosAtuais.custo)}</p>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Lucro desejado:</span>
                      <p className="font-bold text-lg">{formatarMoeda((dadosAtuais.custo * metaLucro) / 100)}</p>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium">Receita necessária:</span>
                      <p className="font-bold text-lg">
                        {formatarMoeda(dadosAtuais.custo + (dadosAtuais.custo * metaLucro) / 100)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo Executivo */}
            <Card className="card-responsive border-2 bg-gradient-to-br from-white to-gray-50 shadow-responsive">
              <CardHeader>
                <CardTitle className="text-responsive-xl font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-gray-700" />
                  Resumo Executivo
                </CardTitle>
                <CardDescription className="text-responsive-base">
                  Análise dos dados atuais da configuração
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid-responsive-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-responsive-lg text-gray-800">📊 Números Atuais</h4>
                    <div className="space-y-3 text-responsive-sm">
                      <div className="flex justify-between">
                        <span>Receita estimada:</span>
                        <span className="font-medium text-green-600">{formatarMoeda(dadosAtuais.receita)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custo estimado:</span>
                        <span className="font-medium text-red-600">{formatarMoeda(dadosAtuais.custo)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vendas estimadas:</span>
                        <span className="font-medium text-blue-600">{dadosAtuais.vendas}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Lucro estimado:</span>
                        <span className={`font-bold ${dadosAtuais.lucro >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatarMoeda(dadosAtuais.lucro)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-responsive-lg text-gray-800">💡 Análise</h4>
                    <div className="space-y-3 text-responsive-sm">
                      <div className="spacing-responsive bg-white rounded-lg border">
                        <p className="font-medium text-gray-800">
                          {dadosAtuais.receita > 0 && dadosAtuais.custo > 0
                            ? `Margem: ${(((dadosAtuais.receita - dadosAtuais.custo) / dadosAtuais.receita) * 100).toFixed(1)}%`
                            : "Configure valores para ver a margem"}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {dadosAtuais.receita > 0 && dadosAtuais.custo > 0
                            ? ((dadosAtuais.receita - dadosAtuais.custo) / dadosAtuais.receita) * 100 >= 30
                              ? "✅ Margem Excelente"
                              : ((dadosAtuais.receita - dadosAtuais.custo) / dadosAtuais.receita) * 100 >= 15
                                ? "⚠️ Margem Razoável"
                                : "❌ Margem Baixa"
                            : "Aguardando configuração"}
                        </p>
                      </div>

                      <div className="spacing-responsive bg-white rounded-lg border">
                        <p className="font-medium text-gray-800">💰 Por Unidade:</p>
                        <p className="text-gray-600 break-words">
                          {dadosAtuais.vendas > 0
                            ? `Custo: ${formatarMoeda(dadosAtuais.custo / dadosAtuais.vendas)} • Receita: ${formatarMoeda(dadosAtuais.receita / dadosAtuais.vendas)} • Lucro: ${formatarMoeda(dadosAtuais.lucro / dadosAtuais.vendas)}`
                            : "Configure o número de vendas para ver os valores unitários"}
                        </p>
                      </div>

                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-responsive-xs">
                          <strong>Nota:</strong> Estes valores são baseados nas suas configurações atuais. Para
                          relatórios com dados históricos reais, será necessário integração com banco de dados.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
