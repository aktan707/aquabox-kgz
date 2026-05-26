"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DialogTrigger,
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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Users, Plus, Pencil, Trash2 } from "lucide-react"

type Period = "today" | "week" | "month"

export default function EmployeesPage() {
  const { isAdmin } = useAuth()
  const { employees, addEmployee, updateEmployee, deleteEmployee, getEmployeeStats } = useStore()
  
  const [period, setPeriod] = useState<Period>("today")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [editingEmployee, setEditingEmployee] = useState<{ id: string; name: string } | null>(null)

  const employeeStats = getEmployeeStats(period)

  const periodLabels: Record<Period, string> = {
    today: "Сегодня",
    week: "Неделя",
    month: "Месяц",
  }

  const handleAddEmployee = () => {
    if (!newEmployeeName.trim()) {
      toast.error("Введите имя сотрудника")
      return
    }
    addEmployee(newEmployeeName.trim())
    setNewEmployeeName("")
    setIsAddDialogOpen(false)
    toast.success("Сотрудник добавлен")
  }

  const handleEditEmployee = () => {
    if (!editingEmployee || !editingEmployee.name.trim()) {
      toast.error("Введите имя сотрудника")
      return
    }
    updateEmployee(editingEmployee.id, editingEmployee.name.trim())
    setEditingEmployee(null)
    setIsEditDialogOpen(false)
    toast.success("Сотрудник обновлён")
  }

  const handleDeleteEmployee = (id: string) => {
    deleteEmployee(id)
    toast.success("Сотрудник удалён")
  }

  const openEditDialog = (employee: { id: string; name: string }) => {
    setEditingEmployee({ ...employee })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Сотрудники</h1>
          <p className="text-muted-foreground">
            Управление сотрудниками и статистика
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs
            value={period}
            onValueChange={(v) => setPeriod(v as Period)}
          >
            <TabsList>
              {(Object.keys(periodLabels) as Period[]).map((p) => (
                <TabsTrigger key={p} value={p}>
                  {periodLabels[p]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus data-icon="inline-start" />
                  Добавить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить сотрудника</DialogTitle>
                  <DialogDescription>
                    Введите имя нового сотрудника
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      placeholder="Введите имя"
                      value={newEmployeeName}
                      onChange={(e) => setNewEmployeeName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAddEmployee}>Добавить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Статистика сотрудников
          </CardTitle>
          <CardDescription>
            Автоматический расчёт зарплаты и прибыли
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Нет сотрудников</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead className="text-center">Машины</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    <TableHead className="text-right">50%</TableHead>
                    <TableHead className="text-right">Долги</TableHead>
                    <TableHead className="text-right">Напитки</TableHead>
                    <TableHead className="text-right">Прибыль</TableHead>
                    {isAdmin && <TableHead className="w-[100px]">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeStats.map((stat) => (
                    <TableRow key={stat.employeeId}>
                      <TableCell className="font-medium">{stat.employeeName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{stat.carsCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {stat.totalSum.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-right">
                        {stat.fiftyPercent.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        -{stat.debts.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        -{stat.drinks.toLocaleString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {stat.netProfit.toLocaleString("ru-RU")}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() =>
                                openEditDialog({
                                  id: stat.employeeId,
                                  name: stat.employeeName,
                                })
                              }
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
                                  <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Вы уверены, что хотите удалить сотрудника {stat.employeeName}?
                                    Это действие нельзя отменить.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteEmployee(stat.employeeId)}
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
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
            <DialogDescription>
              Измените имя сотрудника
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Имя</Label>
              <Input
                id="edit-name"
                placeholder="Введите имя"
                value={editingEmployee?.name || ""}
                onChange={(e) =>
                  setEditingEmployee((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
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
            <Button onClick={handleEditEmployee}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
