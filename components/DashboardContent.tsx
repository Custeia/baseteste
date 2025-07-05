"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Calculator, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { ReceitasTab } from "./receitas-tab"
import { IngredientesTab } from "./ingredientes-tab"
import { ProjecoesTab } from "./projecoes-tab"

export default function DashboardContent() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Responsivo */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container-responsive">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-responsive-lg font-bold text-gray-900">Calculadora Artesanal</h1>
                <p className="text-responsive-xs text-gray-600 hidden sm:block">Sistema de custos e receitas</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <span className="text-responsive-sm text-gray-600 order-2 sm:order-1">
                Olá, <span className="font-medium">{user?.email}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="button-responsive order-1 sm:order-2 w-full sm:w-auto bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
                <span className="sm:hidden">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Responsivo */}
      <main className="container-responsive">
        <div className="spacing-responsive-lg">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-responsive-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-responsive-base text-gray-600">
              Gerencie suas receitas, ingredientes e calcule seus lucros
            </p>
          </div>

          <Tabs defaultValue="receitas" className="space-y-6">
            {/* Tabs List Responsiva */}
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-14 bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl p-2 gap-2 sm:gap-0">
              <TabsTrigger
                value="receitas"
                className="flex items-center justify-center space-x-2 h-12 sm:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md text-responsive-sm"
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Receitas</span>
              </TabsTrigger>
              <TabsTrigger
                value="ingredientes"
                className="flex items-center justify-center space-x-2 h-12 sm:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md text-responsive-sm"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Ingredientes</span>
              </TabsTrigger>
              <TabsTrigger
                value="projecoes"
                className="flex items-center justify-center space-x-2 h-12 sm:h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md text-responsive-sm"
              >
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Projeções</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="receitas" className="animate-fade-in-responsive">
              <ReceitasTab />
            </TabsContent>

            <TabsContent value="ingredientes" className="animate-fade-in-responsive">
              <IngredientesTab />
            </TabsContent>

            <TabsContent value="projecoes" className="animate-fade-in-responsive">
              <ProjecoesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
