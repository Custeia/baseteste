"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Calculator, Package, ShoppingCart, TrendingUp, Store, X, Menu, ChefHat } from "lucide-react"
import { ReceitasTab } from "./receitas-tab"
import { IngredientesTab } from "./ingredientes-tab"
import { ProjecoesTab } from "./projecoes-tab"
import { RestaurantesTab } from "./restaurantes-tab"
import { PratosTab } from "./pratos-tab"

export default function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("receitas")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    { id: "receitas", label: "Receitas", icon: Package, color: "text-blue-600", bgColor: "bg-blue-500" },
    { id: "pratos", label: "Pratos", icon: ChefHat, color: "text-purple-600", bgColor: "bg-purple-500" },
    { id: "ingredientes", label: "Ingredientes", icon: ShoppingCart, color: "text-green-600", bgColor: "bg-green-500" },
    { id: "restaurantes", label: "Restaurantes", icon: Store, color: "text-orange-600", bgColor: "bg-orange-500" },
    { id: "projecoes", label: "Projeções", icon: TrendingUp, color: "text-indigo-600", bgColor: "bg-indigo-500" },
  ]

  const getPageTitle = () => {
    const item = menuItems.find((item) => item.id === activeTab)
    return item ? item.label : "Dashboard"
  }

  const handleMenuItemClick = (tabId: string) => {
    setActiveTab(tabId)
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Overlay para fechar menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            <div className="flex items-center space-x-3">
              {/* Menu Hambúrguer */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100 transition-all duration-200 rounded-xl z-50 relative"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
              </Button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-500 hidden sm:block">Calculadora Artesanal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden md:block font-medium max-w-32 truncate">{user?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden sm:flex bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Lateral */}
      <div
        className={`fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header do Menu */}
          <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Calculator className="w-7 h-7 text-orange-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-white text-lg">Menu</h2>
                  <p className="text-orange-100 text-sm truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon
              const isActive = activeTab === item.id
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start h-14 text-left transition-all duration-200 rounded-xl ${
                    isActive
                      ? `${item.bgColor} text-white hover:${item.bgColor}/90 shadow-lg`
                      : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                  }`}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <IconComponent className={`w-6 h-6 mr-4 flex-shrink-0 ${isActive ? "text-white" : item.color}`} />
                  <span className="font-medium text-base">{item.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Footer do Menu */}
          <div className="p-4 border-t bg-gray-50">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-4 flex-shrink-0" />
              <span className="font-medium">Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Tabs Navigation - Visível apenas em desktop */}
            <TabsList className="hidden lg:grid w-full grid-cols-5 h-14 bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-2xl p-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="flex items-center space-x-3 h-10 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md"
                  >
                    <IconComponent className={`w-5 h-5 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <div className="animate-in fade-in-50 duration-500">
              <TabsContent value="receitas" className="space-y-6 mt-0">
                <ReceitasTab />
              </TabsContent>

              <TabsContent value="pratos" className="space-y-6 mt-0">
                <PratosTab />
              </TabsContent>

              <TabsContent value="ingredientes" className="space-y-6 mt-0">
                <IngredientesTab />
              </TabsContent>

              <TabsContent value="restaurantes" className="space-y-6 mt-0">
                <RestaurantesTab />
              </TabsContent>

              <TabsContent value="projecoes" className="space-y-6 mt-0">
                <ProjecoesTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
