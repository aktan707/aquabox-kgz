"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  FileText,
  Car,
  Banknote,
  Layers,
  Coffee,
  CreditCard,
  TrendingUp,
  MessageCircle,
  Send,
} from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

type Period = "today" | "week" | "month"

export default function ReportsPage() {
  const { getDashboardStats, getEmployeeStats, bossWhatsApp, bossTelegram, setBossWhatsApp, setBossTelegram } = useStore()
  const [period, setPeriod] = useState<Period>("today")
  const [editingWhatsApp, setEditingWhatsApp] = useState(false)
  const [editingTelegram, setEditingTelegram] = useState(false)
  const [tempWhatsApp, setTempWhatsApp] = useState(bossWhatsApp)
  const [tempTelegram, setTempTelegram] = useState(bossTelegram)

  const stats = getDashboardStats(period)
  const employeeStats = getEmployeeStats(period)

  const periodLabels: Record<Period, string> = {
    today: "Сегодня",
    week: "Неделя",
    month: "Месяц",
  }

  const periodDates: Record<Period, string> = {
    today: format(new Date(), "dd.MM.yyyy", { locale: ru }),
    week: `${format(new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)), "dd.MM", { locale: ru })} - ${format(new Date(), "dd.MM.yyyy", { locale: ru })}`,
    month: format(new Date(), "MMMM yyyy", { locale: ru }),
  }

  const handleSaveWhatsApp = () => {
    setBossWhatsApp(tempWhatsApp)
    setEditingWhatsApp(false)
    toast.success("Номер WhatsApp сохранён")
  }

  const handleSaveTelegram = () => {
    setBossTelegram(tempTelegram)
    setEditingTelegram(false)
    toast.success("Username Telegram сохранён")
  }

  const openWhatsApp = () => {
    if (!bossWhatsApp) {
      toast.error("Добавьте номер WhatsApp шефа")
      return
    }
    const phone = bossWhatsApp.replace(/\D/g, "")
    window.open(`https://wa.me/${phone}`, "_blank")
  }

  const openTelegram = () => {
    if (!bossTelegram) {
      toast.error("Добавьте username Telegram шефа")
      return
    }
    const username = bossTelegram.replace("@", "")
    window.open(`https://t.me/${username}`, "_blank")
  }

  const statCards = [
    { title: "Машины", value: stats.carsCount, icon: Car, suffix: "" },
    { title: "Общая сумма", value: stats.totalIncome, icon: Banknote, suffix: " сом" },
    { title: "Ковры", value: stats.carpetsIncome, icon: Layers, suffix: " сом" },
    { title: "Напитки", value: stats.drinksExpense, icon: Coffee, suffix: " сом" },
    { title: "Долги", value: stats.debtsSum, icon: CreditCard, suffix: " сом" },
    { title: "Чистая прибыль", value: stats.netProfit, icon: TrendingUp, suffix: " сом", highlight: true },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Отчёты</h1>
          <p className="text-muted-foreground">
            Полная статистика автомойки
          </p>
        </div>
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as Period)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <TabsTrigger key={p} value={p}>
                {periodLabels[p]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Report Card */}
      <Card className="glass-card glow border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Отчёт за {periodLabels[period].toLowerCase()}
          </CardTitle>
          <CardDescription>
            Дата: {periodDates[period]}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Stats Grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {statCards.map((stat) => (
              <div
                key={stat.title}
                className={`flex items-center gap-3 rounded-lg border p-4 ${
                  stat.highlight ? "border-primary/50 bg-primary/10" : "border-border/50"
                }`}
              >
                <div className={`rounded-lg p-2 ${stat.highlight ? "bg-primary/20" : "bg-muted"}`}>
                  <stat.icon className={`size-5 ${stat.highlight ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={`text-lg font-bold ${stat.highlight ? "text-primary" : ""}`}>
                    {stat.value.toLocaleString("ru-RU")}
                    <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Employee Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Сотрудники</h3>
            {employeeStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Нет данных о сотрудниках</p>
            ) : (
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Сотрудник</TableHead>
                      <TableHead className="text-center">Машины</TableHead>
                      <TableHead className="text-right">Сумма</TableHead>
                      <TableHead className="text-right">50%</TableHead>
                      <TableHead className="text-right">Напитки</TableHead>
                      <TableHead className="text-right">Долг</TableHead>
                      <TableHead className="text-right">Прибыль</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeStats.map((stat) => (
                      <TableRow key={stat.employeeId}>
                        <TableCell className="font-medium">{stat.employeeName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{stat.carsCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{stat.totalSum.toLocaleString("ru-RU")}</TableCell>
                        <TableCell className="text-right">{stat.fiftyPercent.toLocaleString("ru-RU")}</TableCell>
                        <TableCell className="text-right text-destructive">-{stat.drinks.toLocaleString("ru-RU")}</TableCell>
                        <TableCell className="text-right text-destructive">-{stat.debts.toLocaleString("ru-RU")}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {stat.netProfit.toLocaleString("ru-RU")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
            <span className="text-lg font-semibold">Итог за {periodLabels[period].toLowerCase()}:</span>
            <span className="text-2xl font-bold text-primary">
              {stats.netProfit.toLocaleString("ru-RU")} сом
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Share with Boss */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-5" />
            Отправить шефу
          </CardTitle>
          <CardDescription>
            Пожалуйста, сделайте скриншот отчёта и отправьте шефу
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* WhatsApp */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5 text-green-500" />
              <span className="font-medium">WhatsApp</span>
            </div>
            {editingWhatsApp ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="+996 XXX XXX XXX"
                  value={tempWhatsApp}
                  onChange={(e) => setTempWhatsApp(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={handleSaveWhatsApp}>
                  Сохранить
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingWhatsApp(false)}>
                  Отмена
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {bossWhatsApp ? (
                  <>
                    <span className="text-muted-foreground">{bossWhatsApp}</span>
                    <Button size="sm" variant="outline" onClick={() => setEditingWhatsApp(true)}>
                      Изменить
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={openWhatsApp}>
                      Открыть
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditingWhatsApp(true)}>
                    Добавить номер
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Telegram */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Send className="size-5 text-blue-500" />
              <span className="font-medium">Telegram</span>
            </div>
            {editingTelegram ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="@username"
                  value={tempTelegram}
                  onChange={(e) => setTempTelegram(e.target.value)}
                  className="w-48"
                />
                <Button size="sm" onClick={handleSaveTelegram}>
                  Сохранить
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingTelegram(false)}>
                  Отмена
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {bossTelegram ? (
                  <>
                    <span className="text-muted-foreground">{bossTelegram}</span>
                    <Button size="sm" variant="outline" onClick={() => setEditingTelegram(true)}>
                      Изменить
                    </Button>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={openTelegram}>
                      Открыть
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setEditingTelegram(true)}>
                    Добавить username
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
