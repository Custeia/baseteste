"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Calculator, Menu, Home, Package, ShoppingCart, TrendingUp, Store, LogOut } from "lucide-react"
import { ReceitasTab } from "./receitas-tab"
import { IngredientesTab } from "./ingredientes-tab"
import { ProjecoesTab } from "./projecoes-tab"
import { RestaurantesTab } from "./restaurantes-tab"

interface AppLayoutProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export default function AppLayout({ currentPage, onNavigate }: AppLayoutProps) {
  const [user, setUser] = useState<any>(null)
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
    { id: "menu", label: "Início", icon: Home },
    { id: "receitas", label: "Receitas", icon: Package },
    { id: "ingredientes", label: "Ingredientes", icon: ShoppingCart },
    { id: "restaurantes", label: "Restaurantes", icon: Store },
    { id: "projecoes", label: "Projeções", icon: TrendingUp },
  ]

  const getPageTitle = () => {
    switch (currentPage) {
      case "receitas":
        return "Receitas"
      case "ingredientes":
        return "Ingredientes"
      case "projecoes":
        return "Projeções"
      case "restaurantes":
        return "Restaurantes"
      default:
        return "Dashboard"
    }
  }

  const renderContent = () => {
    switch (currentPage) {
      case "receitas":
        return <ReceitasTab />
      case "ingredientes":
        return <IngredientesTab />
      case "projecoes":
        return <ProjecoesTab />
      case "restaurantes":
        return <RestaurantesTab />
      default:
        return <div>Página não encontrada</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              {/* Menu Hambúrguer */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold">Menu</span>
                      </div>
                    </div>
                    <nav className="flex-1 p-4">
                      <ul className="space-y-2">
                        {menuItems.map((item) => {
                          const IconComponent = item.icon
                          return (
                            <li key={item.id}>
                              <Button
                                variant={currentPage === item.id ? "default" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => {
                                  onNavigate(item.id)
                                  setIsMenuOpen(false)
                                }}
                              >
                                <IconComponent className="w-4 h-4 mr-3" />
                                {item.label}
                              </Button>
                            </li>
                          )
                        })}
                      </ul>
                    </nav>
                    <div className="p-4 border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">{getPageTitle()}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">{renderContent()}</main>
    </div>
  )
}
