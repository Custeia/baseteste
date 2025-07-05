"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Package, ShoppingCart, TrendingUp, Store, LogOut } from "lucide-react"

interface MenuPrincipalProps {
  onNavigate: (page: string) => void
}

export default function MenuPrincipal({ onNavigate }: MenuPrincipalProps) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.reload()
  }

  const menuItems = [
    {
      id: "receitas",
      title: "Receitas",
      description: "Gerencie suas receitas e calcule custos de produção",
      icon: Package,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "ingredientes",
      title: "Ingredientes",
      description: "Cadastre ingredientes e registre preços de compra",
      icon: ShoppingCart,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "projecoes",
      title: "Projeções",
      description: "Calcule lucros e defina metas de vendas",
      icon: TrendingUp,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      id: "restaurantes",
      title: "Restaurantes",
      description: "Gerencie seu restaurante e calcule necessidades",
      icon: Store,
      color: "bg-orange-500 hover:bg-orange-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Calculadora Artesanal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">Olá, {user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao seu Dashboard</h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Escolha uma das opções abaixo para gerenciar seus produtos, calcular custos e maximizar seus lucros
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Card
                key={item.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-gray-300"
                onClick={() => onNavigate(item.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm sm:text-base">{item.description}</CardDescription>
                  <Button
                    className={`mt-4 w-full ${item.color} text-white`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigate(item.id)
                    }}
                  >
                    Acessar {item.title}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {JSON.parse(localStorage.getItem("receitas") || "[]").length}
              </div>
              <p className="text-sm text-gray-600">Receitas Cadastradas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {JSON.parse(localStorage.getItem("ingredientes") || "[]").length}
              </div>
              <p className="text-sm text-gray-600">Ingredientes Cadastrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {localStorage.getItem("restaurante_configuracao") ? "1" : "0"}
              </div>
              <p className="text-sm text-gray-600">Restaurantes Configurados</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
