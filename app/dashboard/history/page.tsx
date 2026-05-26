"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { History, Search, CalendarIcon, Trash2, Pencil, X } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"
import type { VehicleCategory, ServiceType } from "@/lib/types"
import { vehicleCategoryLabels, serviceTypeLabels } from "@/lib/types"

type Period = "today" | "yesterday" | "week" | "month" | "custom"

export default function HistoryPage() {
  const { isAdmin } = useAuth()
  const { employees, getFilteredCarEntries, deleteCarEntry, updateCarEntry, getPrice } = useStore()
  
  const [period, setPeriod] = useState<Period>("today")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [employeeFilter, setEmployeeFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<{
    id: string
    employeeId: string
    vehicleName: string
    vehicleCategory: VehicleCategory
    serviceType: ServiceType
    price: number
    comment: string
  } | null>(null)

  const entries = getFilteredCarEntries({
    period,
    startDate,
    endDate,
    employeeId: employeeFilter || undefined,
    search: searchQuery || undefined,
  })

  const periodLabels: Record<Period, string> = {
    today: "Сегодня",
    yesterday: "Вчера",
    week: "Неделя",
    month: "Месяц",
    custom: "Выбрать дату",
  }

  const handleDeleteEntry = (id: string) => {
    deleteCarEntry(id)
    toast.success("Запись удалена")
  }

  const handleEditEntry = () => {
    if (!editingEntry) return

    updateCarEntry(editingEntry.id, {
      employeeId: editingEntry.employeeId,
      vehicleName: editingEntry.vehicleName,
      vehicleCategory: editingEntry.vehicleCategory,
      serviceType: editingEntry.serviceType,
      price: editingEntry.price,
      comment: editingEntry.comment || undefined,
    })

    setEditingEntry(null)
    setIsEditDialogOpen(false)
    toast.success("Запись обновлена")
  }

  const openEditDialog = (entry: typeof entries[0]) => {
    setEditingEntry({
      id: entry.id,
      employeeId: entry.employeeId,
      vehicleName: entry.vehicleName,
      vehicleCategory: entry.vehicleCategory,
      serviceType: entry.serviceType,
      price: entry.price,
      comment: entry.comment || "",
    })
    setIsEditDialogOpen(true)
  }

  const clearFilters = () => {
    setPeriod("today")
    setStartDate(undefined)
    setEndDate(undefined)
    setEmployeeFilter("")
    setSearchQuery("")
  }

  const totalSum = entries.reduce((sum, e) => sum + e.price, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">История</h1>
          <p className="text-muted-foreground">
            Все записи о машинах
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="size-4" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Period Filter */}
            <div className="flex flex-col gap-2">
              <Label>Период</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(periodLabels) as Period[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {periodLabels[p]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range (shown when custom) */}
            {period === "custom" && (
              <>
                <div className="flex flex-col gap-2">
                  <Label>Начало</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 justify-start font-normal">
                        <CalendarIcon className="mr-2 size-4" />
                        {startDate ? format(startDate, "dd.MM.yyyy", { locale: ru }) : "Выбрать"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Конец</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-10 justify-start font-normal">
                        <CalendarIcon className="mr-2 size-4" />
                        {endDate ? format(endDate, "dd.MM.yyyy", { locale: ru }) : "Выбрать"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        locale={ru}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* Employee Filter */}
            <div className="flex flex-col gap-2">
              <Label>Сотрудник</Label>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Все сотрудники" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Все сотрудники</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-2">
              <Label>Поиск</Label>
              <Input
                placeholder="Поиск по машине..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4">
            <X data-icon="inline-start" />
            Сбросить фильтры
          </Button>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
        <div className="text-sm text-muted-foreground">
          Найдено записей: <span className="font-medium text-foreground">{entries.length}</span>
        </div>
        <div className="text-sm">
          Сумма: <span className="font-bold text-primary">{totalSum.toLocaleString("ru-RU")} сом</span>
        </div>
      </div>

      {/* Entries Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-5" />
            Записи
          </CardTitle>
          <CardDescription>
            {periodLabels[period]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Нет записей за выбранный период</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead className="hidden sm:table-cell">Машина</TableHead>
                    <TableHead className="hidden md:table-cell">Категория</TableHead>
                    <TableHead className="hidden lg:table-cell">Услуга</TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                    {isAdmin && <TableHead className="w-[100px]">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const employee = employees.find((e) => e.id === entry.employeeId)
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(entry.date), "dd.MM", { locale: ru })}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entry.time}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee?.name || "—"}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell font-medium">
                          {entry.vehicleName}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {vehicleCategoryLabels[entry.vehicleCategory]}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {serviceTypeLabels[entry.serviceType]}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {entry.price.toLocaleString("ru-RU")}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => openEditDialog(entry)}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteEntry(entry.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Удалить
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать запись</DialogTitle>
            <DialogDescription>
              Измените данные записи
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Сотрудник</Label>
              <Select
                value={editingEntry?.employeeId || ""}
                onValueChange={(v) =>
                  setEditingEntry((prev) => (prev ? { ...prev, employeeId: v } : null))
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Машина</Label>
              <Input
                value={editingEntry?.vehicleName || ""}
                onChange={(e) =>
                  setEditingEntry((prev) =>
                    prev ? { ...prev, vehicleName: e.target.value } : null
                  )
                }
                className="h-12"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Категория</Label>
              <Select
                value={editingEntry?.vehicleCategory || ""}
                onValueChange={(v) =>
                  setEditingEntry((prev) =>
                    prev ? { ...prev, vehicleCategory: v as VehicleCategory } : null
                  )
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(vehicleCategoryLabels) as VehicleCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {vehicleCategoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Услуга</Label>
              <Select
                value={editingEntry?.serviceType || ""}
                onValueChange={(v) =>
                  setEditingEntry((prev) =>
                    prev ? { ...prev, serviceType: v as ServiceType } : null
                  )
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(serviceTypeLabels) as ServiceType[]).map((svc) => (
                      <SelectItem key={svc} value={svc}>
                        {serviceTypeLabels[svc]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Цена</Label>
              <Input
                type="number"
                value={editingEntry?.price || ""}
                onChange={(e) =>
                  setEditingEntry((prev) =>
                    prev ? { ...prev, price: Number(e.target.value) } : null
                  )
                }
                className="h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditEntry}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
