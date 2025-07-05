"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Utensils, Scale, ChefHat, Truck, Package, Beef } from "lucide-react"
import { SelfServiceRestaurante } from "./restaurantes/self-service-restaurante"
import { AlaCarteRestaurante } from "./restaurantes/ala-carte-restaurante"
import { DeliveryRestaurante } from "./restaurantes/delivery-restaurante"
import { MarmiteriaRestaurante } from "./restaurantes/marmiteria-restaurante"
import { ChurrascariaRestaurante } from "./restaurantes/churrascaria-restaurante"

const tiposRestaurante = [
  {
    id: "self-service",
    nome: "Self-Service",
    descricao: "Restaurante por peso ou buffet livre",
    icone: Scale,
    cor: "bg-blue-500",
    caracteristicas: ["Por quilograma", "Buffet livre", "Controle de desperdício", "Variedade de pratos"],
    component: SelfServiceRestaurante,
  },
  {
    id: "ala-carte",
    nome: "À La Carte",
    descricao: "Pratos individuais com cardápio fixo",
    icone: ChefHat,
    cor: "bg-green-500",
    caracteristicas: ["Cardápio fixo", "Pratos individuais", "Controle de margem", "Tempo de preparo"],
    component: AlaCarteRestaurante,
  },
  {
    id: "delivery",
    nome: "Delivery",
    descricao: "Entrega em domicílio e dark kitchen",
    icone: Truck,
    cor: "bg-orange-500",
    caracteristicas: ["Múltiplas plataformas", "Controle de comissões", "Embalagens", "Raio de entrega"],
    component: DeliveryRestaurante,
  },
  {
    id: "marmiteria",
    nome: "Marmiteria",
    descricao: "Marmitas por tamanho e tipo",
    icone: Package,
    cor: "bg-purple-500",
    caracteristicas: ["Diferentes tamanhos", "Controle de conservação", "Entrega local", "Preços fixos"],
    component: MarmiteriaRestaurante,
  },
  {
    id: "churrascaria",
    nome: "Churrascaria",
    descricao: "Rodízio de carnes e à la carte",
    icone: Beef,
    cor: "bg-red-500",
    caracteristicas: ["Rodízio", "Tipos de carnes", "Controle de consumo", "Preços diferenciados"],
    component: ChurrascariaRestaurante,
  },
]

export function RestaurantesTab() {
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null)

  if (tipoSelecionado) {
    const tipoRestaurante = tiposRestaurante.find((t) => t.id === tipoSelecionado)
    if (tipoRestaurante) {
      const ComponenteRestaurante = tipoRestaurante.component
      return (
        <div className="layout-main">
          <div className="content-wrapper">
            <div className="container-main">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-responsive-3xl font-bold text-gray-800 flex items-center gap-3">
                    <tipoRestaurante.icone className="w-8 h-8 text-gray-700" />
                    {tipoRestaurante.nome}
                  </h2>
                  <p className="text-responsive-base text-gray-600 mt-2">{tipoRestaurante.descricao}</p>
                </div>
                <button
                  onClick={() => setTipoSelecionado(null)}
                  className="button-responsive bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
                >
                  ← Voltar aos Tipos
                </button>
              </div>
              <ComponenteRestaurante />
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="layout-main">
      <div className="content-wrapper">
        <div className="container-main space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-responsive-4xl font-bold text-gray-800">Tipos de Restaurante</h2>
            <p className="text-responsive-lg text-gray-600 max-w-3xl mx-auto">
              Escolha o tipo de restaurante que melhor se adequa ao seu negócio para configurar custos, preços e
              relatórios específicos
            </p>
          </div>

          <div className="grid-cards">
            {tiposRestaurante.map((tipo) => {
              const IconeComponente = tipo.icone
              return (
                <Card
                  key={tipo.id}
                  className="restaurant-card cursor-pointer group"
                  onClick={() => setTipoSelecionado(tipo.id)}
                >
                  <CardHeader className="text-center space-y-4">
                    <div
                      className={`w-16 h-16 lg:w-20 lg:h-20 ${tipo.cor} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconeComponente className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-responsive-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {tipo.nome}
                      </CardTitle>
                      <CardDescription className="text-responsive-base mt-2">{tipo.descricao}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="text-responsive-sm font-semibold text-gray-700">Características:</h4>
                      <div className="flex flex-wrap gap-2">
                        {tipo.caracteristicas.map((caracteristica, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-responsive-xs bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            {caracteristica}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-responsive-sm text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                        Clique para configurar →
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl spacing-responsive border border-blue-200">
            <div className="text-center space-y-4">
              <Utensils className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-responsive-2xl font-bold text-gray-800">Dica Importante</h3>
              <p className="text-responsive-base text-gray-700 max-w-2xl mx-auto">
                Cada tipo de restaurante possui configurações específicas para otimizar seus custos e maximizar seus
                lucros. Configure primeiro seus ingredientes e pratos antes de escolher o tipo de restaurante.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
