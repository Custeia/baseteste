"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, TrendingUp, BarChart3, Calculator } from "lucide-react"
import DashboardContent from "@/components/dashboard-content"
import Image from "next/image"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Simular login por enquanto
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular delay de autenticação
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (email && password) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          name: name || email.split("@")[0],
          id: "user123",
        }),
      )
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      setIsLoggedIn(true)
    }
  }, [])

  if (isLoggedIn) {
    return <DashboardContent />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Floating Particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-20 w-3 h-3 bg-white/30 rounded-full animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute top-60 right-1/3 w-2 h-2 bg-white/25 rounded-full animate-pulse"
          style={{ animationDelay: "5s" }}
        ></div>

        {/* Floating Elements */}
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full animate-bounce opacity-20"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full animate-bounce opacity-30"
          style={{ animationDelay: "2s", animationDuration: "8s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/5 rounded-full animate-bounce opacity-20"
          style={{ animationDelay: "4s", animationDuration: "10s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-20 h-20 bg-white/10 rounded-full animate-bounce opacity-25"
          style={{ animationDelay: "1s", animationDuration: "7s" }}
        ></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: "60px 60px",
            }}
          ></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-cyan-500/20"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-10 animate-pulse">
            <div className="space-y-8">
              <div className="flex justify-center lg:justify-start">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className="relative w-28 h-28 lg:w-36 lg:h-36 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
                    <Image
                      src="/custeia-icon.png"
                      alt="Custeia"
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight drop-shadow-lg">Custeia</h1>
                <p className="text-xl lg:text-3xl text-white/90 font-light leading-relaxed drop-shadow-md">
                  Controle total dos seus custos
                </p>
                <p className="text-lg lg:text-xl text-white/70 max-w-lg mx-auto lg:mx-0 leading-relaxed drop-shadow-sm">
                  A plataforma mais completa para calcular custos, definir preços e maximizar seus lucros com precisão
                  profissional
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-6">
              <div className="flex flex-col items-center lg:items-start space-y-4 group transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-all duration-300 shadow-lg">
                  <Calculator className="w-8 h-8 text-white drop-shadow-sm" />
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-lg font-bold text-white drop-shadow-sm">Cálculos Precisos</h3>
                  <p className="text-sm text-white/70 leading-relaxed">Algoritmos avançados para máxima precisão</p>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-start space-y-4 group transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-all duration-300 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white drop-shadow-sm" />
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-lg font-bold text-white drop-shadow-sm">Análises Detalhadas</h3>
                  <p className="text-sm text-white/70 leading-relaxed">Relatórios completos e insights valiosos</p>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-start space-y-4 group transform hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-all duration-300 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white drop-shadow-sm" />
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-lg font-bold text-white drop-shadow-sm">Máxima Rentabilidade</h3>
                  <p className="text-sm text-white/70 leading-relaxed">Otimize seus lucros automaticamente</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-white drop-shadow-md">99%</div>
                <div className="text-sm text-white/70">Precisão</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-white drop-shadow-md">24/7</div>
                <div className="text-sm text-white/70">Disponível</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold text-white drop-shadow-md">∞</div>
                <div className="text-sm text-white/70">Possibilidades</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="transform hover:scale-[1.02] transition-all duration-300">
            <Card className="bg-white/10 backdrop-blur-xl border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="text-center space-y-6 pb-8">
                <div className="space-y-2">
                  <CardTitle className="text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                    {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg leading-relaxed drop-shadow-sm">
                    {isLogin
                      ? "Entre na sua conta para acessar o painel de controle"
                      : "Comece a otimizar seus custos e maximizar lucros hoje mesmo"}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => setIsLogin(value === "login")}>
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border-white/30 h-12">
                    <TabsTrigger
                      value="login"
                      className="data-[state=active]:bg-white data-[state=active]:text-teal-600 text-white/90 font-semibold text-base h-10 transition-all duration-300"
                    >
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger
                      value="register"
                      className="data-[state=active]:bg-white data-[state=active]:text-teal-600 text-white/90 font-semibold text-base h-10 transition-all duration-300"
                    >
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-8 mt-10">
                    <form onSubmit={handleAuth} className="space-y-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-white/95 font-semibold text-base drop-shadow-sm">
                            E-mail
                          </Label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="seu@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-14 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:bg-white/15 h-14 text-base rounded-xl transition-all duration-300 hover:bg-white/15 focus:ring-2 focus:ring-white/20"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="password" className="text-white/95 font-semibold text-base drop-shadow-sm">
                            Senha
                          </Label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Sua senha"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-14 pr-14 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:bg-white/15 h-14 text-base rounded-xl transition-all duration-300 hover:bg-white/15 focus:ring-2 focus:ring-white/20"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-all duration-200"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-white text-teal-600 hover:bg-white/95 h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin"></div>
                            <span>Entrando...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <span>Entrar no Custeia</span>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-8 mt-10">
                    <form onSubmit={handleAuth} className="space-y-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="register-name"
                            className="text-white/95 font-semibold text-base drop-shadow-sm"
                          >
                            Nome completo
                          </Label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
                            <Input
                              id="register-name"
                              type="text"
                              placeholder="Seu nome completo"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="pl-14 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:bg-white/15 h-14 text-base rounded-xl transition-all duration-300 hover:bg-white/15 focus:ring-2 focus:ring-white/20"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="register-email"
                            className="text-white/95 font-semibold text-base drop-shadow-sm"
                          >
                            E-mail
                          </Label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="seu@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-14 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:bg-white/15 h-14 text-base rounded-xl transition-all duration-300 hover:bg-white/15 focus:ring-2 focus:ring-white/20"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="register-password"
                            className="text-white/95 font-semibold text-base drop-shadow-sm"
                          >
                            Senha
                          </Label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
                            <Input
                              id="register-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Crie uma senha segura"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-14 pr-14 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 focus:bg-white/15 h-14 text-base rounded-xl transition-all duration-300 hover:bg-white/15 focus:ring-2 focus:ring-white/20"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-lg transition-all duration-200"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-white text-teal-600 hover:bg-white/95 h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin"></div>
                            <span>Criando conta...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <span>Criar conta gratuita</span>
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {/* Footer */}
                <div className="text-center pt-6 border-t border-white/20">
                  <p className="text-white/70 text-sm leading-relaxed">
                    Ao continuar, você concorda com nossos{" "}
                    <a
                      href="#"
                      className="text-white hover:text-white/80 underline underline-offset-2 transition-colors"
                    >
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a
                      href="#"
                      className="text-white hover:text-white/80 underline underline-offset-2 transition-colors"
                    >
                      Política de Privacidade
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
