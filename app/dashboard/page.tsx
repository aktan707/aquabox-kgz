"use client"

import { useState } from "react"
import Link from "next/link"
import { useStore } from "@/lib/store"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  Car,
  Banknote,
  Layers,
  Coffee,
  CreditCard,
  TrendingUp,
  Plus,
  FileText,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import { serviceTypeLabels, vehicleCategoryLabels } from "@/lib/types"

type Period = "today" | "week" | "month"

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("today")
  const { getDashboardStats, getEmployeeStats, employees, getFilteredCarEntries } = useStore()
  const { isAdmin } = useAuth()

  const stats = getDashboardStats(period)
  const employeeStats = getEmployeeStats(period)
  const recentEntries = getFilteredCarEntries({ period: "today" }).slice(0, 5)

  const periodLabels: Record<Period, string> = {
    today: "Сегодня",
    week: "Неделя",
    month: "Месяц",
  }

  const statCards = [
    {
      title: "Машины",
      value: stats.carsCount,
      icon: Car,
      suffix: "",
    },
    {
      title: "Общий доход",
      value: stats.totalIncome,
      icon: Banknote,
      suffix: " сом",
    },
    {
      title: "Ковры",
      value: stats.carpetsIncome,
      icon: Layers,
      suffix: " сом",
    },
    {
      title: "Напитки",
      value: stats.drinksExpense,
      icon: Coffee,
      suffix: " сом",
    },
    {
      title: "Долги",
      value: stats.debtsSum,
      icon: CreditCard,
      suffix: " сом",
    },
    {
      title: "Чистая прибыль",
      value: stats.netProfit,
      icon: TrendingUp,
      suffix: " сом",
      highlight: true,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Главная</h1>
          <p className="text-muted-foreground">
            Обзор активности автомойки
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

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className={stat.highlight ? "glass-card glow border-primary/30" : ""}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${stat.highlight ? "text-primary" : ""}`}>
                {stat.value.toLocaleString("ru-RU")}
                <span className="text-sm font-normal text-muted-foreground">
                  {stat.suffix}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Последние записи</CardTitle>
          <Link href="/dashboard/history">
            <Button variant="ghost" size="sm">
              Все записи
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Car className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Нет записей за сегодня</p>
              {isAdmin && (
                <Link href="/dashboard/add-car" className="mt-4">
                  <Button>
                    <Plus data-icon="inline-start" />
                    Добавить машину
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead className="hidden sm:table-cell">Машина</TableHead>
                    <TableHead className="hidden md:table-cell">Услуга</TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEntries.map((entry) => {
                    const employee = employees.find((e) => e.id === entry.employeeId)
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono text-sm">
                          {entry.time}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee?.name || "—"}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col">
                            <span className="font-medium">{entry.vehicleName}</span>
                            <span className="text-xs text-muted-foreground">
                              {vehicleCategoryLabels[entry.vehicleCategory]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {serviceTypeLabels[entry.serviceType]}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.price.toLocaleString("ru-RU")} сом
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Employee Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Статистика сотрудников</CardTitle>
          <Link href="/dashboard/employees">
            <Button variant="ghost" size="sm">
              Все сотрудники
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {employeeStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">Нет данных о сотрудниках</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead className="text-center">Машины</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">Сумма</TableHead>
                    <TableHead className="hidden md:table-cell text-right">50%</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Долги</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Напитки</TableHead>
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
                      <TableCell className="hidden sm:table-cell text-right">
                        {stat.totalSum.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">
                        {stat.fiftyPercent.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-destructive">
                        -{stat.debts.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-destructive">
                        -{stat.drinks.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {stat.netProfit.toLocaleString("ru-RU")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
              <Link href="/dashboard/add-car" className="contents">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                  <Car className="size-5" />
                  <span className="text-xs">Добавить машину</span>
                </Button>
              </Link>
              <Link href="/dashboard/drinks" className="contents">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                  <Coffee className="size-5" />
                  <span className="text-xs">Добавить напиток</span>
                </Button>
              </Link>
              <Link href="/dashboard/debts" className="contents">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                  <CreditCard className="size-5" />
                  <span className="text-xs">Добавить долг</span>
                </Button>
              </Link>
              <Link href="/dashboard/carpets" className="contents">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                  <Layers className="size-5" />
                  <span className="text-xs">Добавить ковры</span>
                </Button>
              </Link>
              <Link href="/dashboard/reports" className="contents">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                  <FileText className="size-5" />
                  <span className="text-xs">Отчёт</span>
                </Button>
              </Link>
              <Link href="/dashboard/history" className="contents">
                <Button variant="outline" className="h-auto flex-col gap-2 py-4">
                  <FileText className="size-5" />
                  <span className="text-xs">История</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
