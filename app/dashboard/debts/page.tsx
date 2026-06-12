"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import { CreditCard, Plus, Trash2, Pencil } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"

const debtReasons = ["Аванс", "Взял деньги", "Долг", "Другое"]

export default function DebtsPage() {
  const { isAdmin } = useAuth()
  const { employees, debts, addDebt, deleteDebt, updateDebt } = useStore()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState("")
  const [amount, setAmount] = useState<number | "">(0)
  const [reason, setReason] = useState("")
  const [editingDebt, setEditingDebt] = useState<{
    id: string
    employeeId: string
    amount: number
    reason: string
  } | null>(null)

  const handleAddDebt = () => {
    if (!employeeId || !amount || !reason) {
      toast.error("Заполните все поля")
      return
    }

    addDebt({
      employeeId,
      amount: Number(amount),
      reason,
      date: format(new Date(), "yyyy-MM-dd"),
    })

    setEmployeeId("")
    setAmount(0)
    setReason("")
    setIsAddDialogOpen(false)
    toast.success("Долг добавлен")
  }

  const handleEditDebt = () => {
    if (!editingDebt || !editingDebt.employeeId || !editingDebt.amount || !editingDebt.reason) {
      toast.error("Заполните все поля")
      return
    }

    updateDebt(editingDebt.id, {
      employeeId: editingDebt.employeeId,
      amount: editingDebt.amount,
      reason: editingDebt.reason,
    })

    setEditingDebt(null)
    setIsEditDialogOpen(false)
    toast.success("Долг обновлён")
  }

  const handleDeleteDebt = (id: string) => {
    deleteDebt(id)
    toast.success("Долг удалён")
  }

  const openEditDialog = (debt: typeof debts[0]) => {
    setEditingDebt({
      id: debt.id,
      employeeId: debt.employeeId,
      amount: debt.amount,
      reason: debt.reason,
    })
    setIsEditDialogOpen(true)
  }

  // Sort debts by date descending
  const sortedDebts = [...debts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Calculate total debts per employee
  const totalDebts = employees.map((employee) => {
    const employeeDebts = debts.filter((d) => d.employeeId === employee.id)
    const total = employeeDebts.reduce((sum, d) => sum + d.amount, 0)
    return { employeeId: employee.id, name: employee.name, total }
  }).filter((e) => e.total > 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Долги</h1>
          <p className="text-muted-foreground">
            Учёт долгов и авансов сотрудников
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus data-icon="inline-start" />
                Добавить долг
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить долг</DialogTitle>
                <DialogDescription>
                  Долг будет вычтен из зарплаты сотрудника
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="employee">Сотрудник</Label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger id="employee" className="h-12">
                      <SelectValue placeholder="Выберите сотрудника" />
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
                  <Label htmlFor="amount">Сумма (сом)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                    className="h-12"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reason">Причина</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger id="reason" className="h-12">
                      <SelectValue placeholder="Выберите причину" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {debtReasons.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddDebt}>Добавить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      {totalDebts.length > 0 && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {totalDebts.map((item) => (
            <Card key={item.employeeId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-destructive">
                  -{item.total.toLocaleString("ru-RU")} сом
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Debts Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            История долгов
          </CardTitle>
          <CardDescription>
            Все записи о долгах и авансах
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDebts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Нет записей о долгах</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Причина</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    {isAdmin && <TableHead className="w-[100px]">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDebts.map((debt) => {
                    const employee = employees.find((e) => e.id === debt.employeeId)
                    return (
                      <TableRow key={debt.id}>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(debt.date), "dd.MM.yyyy", { locale: ru })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee?.name || "—"}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{debt.reason}</TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          -{debt.amount.toLocaleString("ru-RU")} сом
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => openEditDialog(debt)}
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
                                      Вы уверены, что хотите удалить эту запись о долге?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteDebt(debt.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать долг</DialogTitle>
            <DialogDescription>
              Измените данные о долге
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-employee">Сотрудник</Label>
              <Select
                value={editingDebt?.employeeId || ""}
                onValueChange={(v) =>
                  setEditingDebt((prev) => (prev ? { ...prev, employeeId: v } : null))
                }
              >
                <SelectTrigger id="edit-employee" className="h-12">
                  <SelectValue placeholder="Выберите сотрудника" />
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
              <Label htmlFor="edit-amount">Сумма (сом)</Label>
              <Input
                id="edit-amount"
                type="number"
                min={0}
                value={editingDebt?.amount || ""}
                onChange={(e) =>
                  setEditingDebt((prev) =>
                    prev ? { ...prev, amount: Number(e.target.value) } : null
                  )
                }
                className="h-12"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-reason">Причина</Label>
              <Select
                value={editingDebt?.reason || ""}
                onValueChange={(v) =>
                  setEditingDebt((prev) => (prev ? { ...prev, reason: v } : null))
                }
              >
                <SelectTrigger id="edit-reason" className="h-12">
                  <SelectValue placeholder="Выберите причину" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {debtReasons.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditDebt}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
