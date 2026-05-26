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
import { Coffee, Plus, Trash2, Pencil } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"

export default function DrinksPage() {
  const { isAdmin } = useAuth()
  const { employees, drinks, drinksList, addDrink, deleteDrink, updateDrink } = useStore()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState("")
  const [drinkName, setDrinkName] = useState("")
  const [quantity, setQuantity] = useState<number | "">(1)
  const [price, setPrice] = useState<number | "">(50)
  const [editingDrink, setEditingDrink] = useState<{
    id: string
    employeeId: string
    name: string
    quantity: number
    price: number
  } | null>(null)

  const handleAddDrink = () => {
    if (!employeeId || !drinkName || !quantity || !price) {
      toast.error("Заполните все поля")
      return
    }

    addDrink({
      employeeId,
      name: drinkName,
      quantity: Number(quantity),
      price: Number(price),
      date: format(new Date(), "yyyy-MM-dd"),
    })

    setEmployeeId("")
    setDrinkName("")
    setQuantity(1)
    setPrice(50)
    setIsAddDialogOpen(false)
    toast.success("Напиток добавлен")
  }

  const handleEditDrink = () => {
    if (!editingDrink || !editingDrink.employeeId || !editingDrink.name || !editingDrink.quantity || !editingDrink.price) {
      toast.error("Заполните все поля")
      return
    }

    updateDrink(editingDrink.id, {
      employeeId: editingDrink.employeeId,
      name: editingDrink.name,
      quantity: editingDrink.quantity,
      price: editingDrink.price,
    })

    setEditingDrink(null)
    setIsEditDialogOpen(false)
    toast.success("Напиток обновлён")
  }

  const handleDeleteDrink = (id: string) => {
    deleteDrink(id)
    toast.success("Напиток удалён")
  }

  const openEditDialog = (drink: typeof drinks[0]) => {
    setEditingDrink({
      id: drink.id,
      employeeId: drink.employeeId,
      name: drink.name,
      quantity: drink.quantity,
      price: drink.price,
    })
    setIsEditDialogOpen(true)
  }

  // Sort drinks by date descending
  const sortedDrinks = [...drinks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Напитки</h1>
          <p className="text-muted-foreground">
            Учёт напитков сотрудников
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus data-icon="inline-start" />
                Добавить напиток
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить напиток</DialogTitle>
                <DialogDescription>
                  Напиток будет вычтен из зарплаты сотрудника
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
                  <Label htmlFor="drink">Напиток</Label>
                  <Select value={drinkName} onValueChange={setDrinkName}>
                    <SelectTrigger id="drink" className="h-12">
                      <SelectValue placeholder="Выберите напиток" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {drinksList.map((drink) => (
                          <SelectItem key={drink} value={drink}>
                            {drink}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="quantity">Количество</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
                      className="h-12"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="price">Цена (сом)</Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddDrink}>Добавить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Drinks Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="size-5" />
            История напитков
          </CardTitle>
          <CardDescription>
            Все записи о напитках сотрудников
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDrinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Coffee className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Нет записей о напитках</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Напиток</TableHead>
                    <TableHead className="text-center">Кол-во</TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                    <TableHead className="text-right">Сумма</TableHead>
                    {isAdmin && <TableHead className="w-[100px]">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDrinks.map((drink) => {
                    const employee = employees.find((e) => e.id === drink.employeeId)
                    return (
                      <TableRow key={drink.id}>
                        <TableCell className="text-muted-foreground">
                          {format(parseISO(drink.date), "dd.MM.yyyy", { locale: ru })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee?.name || "—"}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{drink.name}</TableCell>
                        <TableCell className="text-center">{drink.quantity}</TableCell>
                        <TableCell className="text-right">{drink.price}</TableCell>
                        <TableCell className="text-right font-medium text-destructive">
                          -{(drink.price * drink.quantity).toLocaleString("ru-RU")}
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => openEditDialog(drink)}
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
                                      Вы уверены, что хотите удалить эту запись о напитке?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteDrink(drink.id)}
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
            <DialogTitle>Редактировать напиток</DialogTitle>
            <DialogDescription>
              Измените данные о напитке
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-employee">Сотрудник</Label>
              <Select
                value={editingDrink?.employeeId || ""}
                onValueChange={(v) =>
                  setEditingDrink((prev) => (prev ? { ...prev, employeeId: v } : null))
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
              <Label htmlFor="edit-drink">Напиток</Label>
              <Select
                value={editingDrink?.name || ""}
                onValueChange={(v) =>
                  setEditingDrink((prev) => (prev ? { ...prev, name: v } : null))
                }
              >
                <SelectTrigger id="edit-drink" className="h-12">
                  <SelectValue placeholder="Выберите напиток" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {drinksList.map((drink) => (
                      <SelectItem key={drink} value={drink}>
                        {drink}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-quantity">Количество</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min={1}
                  value={editingDrink?.quantity || ""}
                  onChange={(e) =>
                    setEditingDrink((prev) =>
                      prev ? { ...prev, quantity: Number(e.target.value) } : null
                    )
                  }
                  className="h-12"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-price">Цена (сом)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min={0}
                  value={editingDrink?.price || ""}
                  onChange={(e) =>
                    setEditingDrink((prev) =>
                      prev ? { ...prev, price: Number(e.target.value) } : null
                    )
                  }
                  className="h-12"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditDrink}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
