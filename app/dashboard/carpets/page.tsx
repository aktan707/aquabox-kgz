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
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Layers, Plus, Trash2, Pencil } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ru } from "date-fns/locale"

export default function CarpetsPage() {
  const { isAdmin } = useAuth()
  const { carpets, addCarpet, deleteCarpet, updateCarpet } = useStore()
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [quantity, setQuantity] = useState<number | "">(1)
  const [price, setPrice] = useState<number | "">(300)
  const [comment, setComment] = useState("")
  const [editingCarpet, setEditingCarpet] = useState<{
    id: string
    quantity: number
    price: number
    comment: string
  } | null>(null)

  const handleAddCarpet = () => {
    if (!quantity || !price) {
      toast.error("Заполните количество и цену")
      return
    }

    addCarpet({
      quantity: Number(quantity),
      price: Number(price),
      comment: comment || undefined,
      date: format(new Date(), "yyyy-MM-dd"),
    })

    setQuantity(1)
    setPrice(300)
    setComment("")
    setIsAddDialogOpen(false)
    toast.success("Ковры добавлены")
  }

  const handleEditCarpet = () => {
    if (!editingCarpet || !editingCarpet.quantity || !editingCarpet.price) {
      toast.error("Заполните количество и цену")
      return
    }

    updateCarpet(editingCarpet.id, {
      quantity: editingCarpet.quantity,
      price: editingCarpet.price,
      comment: editingCarpet.comment || undefined,
    })

    setEditingCarpet(null)
    setIsEditDialogOpen(false)
    toast.success("Ковры обновлены")
  }

  const handleDeleteCarpet = (id: string) => {
    deleteCarpet(id)
    toast.success("Запись удалена")
  }

  const openEditDialog = (carpet: typeof carpets[0]) => {
    setEditingCarpet({
      id: carpet.id,
      quantity: carpet.quantity,
      price: carpet.price,
      comment: carpet.comment || "",
    })
    setIsEditDialogOpen(true)
  }

  // Sort carpets by date descending
  const sortedCarpets = [...carpets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Calculate total
  const totalCarpets = carpets.reduce((sum, c) => sum + c.quantity, 0)
  const totalIncome = carpets.reduce((sum, c) => sum + c.price, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ковры</h1>
          <p className="text-muted-foreground">
            Учёт мойки ковров
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus data-icon="inline-start" />
                Добавить ковры
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить ковры</DialogTitle>
                <DialogDescription>
                  Доход от ковров идёт в общую прибыль автомойки
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
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
                <div className="flex flex-col gap-2">
                  <Label htmlFor="comment">Комментарий</Label>
                  <Textarea
                    id="comment"
                    placeholder="Дополнительная информация (необязательно)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddCarpet}>Добавить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего ковров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCarpets}</div>
          </CardContent>
        </Card>
        <Card className="glass-card glow border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общий доход
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalIncome.toLocaleString("ru-RU")} сом
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Carpets Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="size-5" />
            История ковров
          </CardTitle>
          <CardDescription>
            Все записи о мойке ковров
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCarpets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Layers className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Нет записей о коврах</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-center">Количество</TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                    <TableHead className="hidden sm:table-cell">Комментарий</TableHead>
                    {isAdmin && <TableHead className="w-[100px]">Действия</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCarpets.map((carpet) => (
                    <TableRow key={carpet.id}>
                      <TableCell className="text-muted-foreground">
                        {format(parseISO(carpet.date), "dd.MM.yyyy", { locale: ru })}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {carpet.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        +{carpet.price.toLocaleString("ru-RU")} сом
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {carpet.comment || "—"}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => openEditDialog(carpet)}
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
                                    Вы уверены, что хотите удалить эту запись о коврах?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteCarpet(carpet.id)}
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
            <DialogTitle>Редактировать ковры</DialogTitle>
            <DialogDescription>
              Измените данные о коврах
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-quantity">Количество</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min={1}
                  value={editingCarpet?.quantity || ""}
                  onChange={(e) =>
                    setEditingCarpet((prev) =>
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
                  value={editingCarpet?.price || ""}
                  onChange={(e) =>
                    setEditingCarpet((prev) =>
                      prev ? { ...prev, price: Number(e.target.value) } : null
                    )
                  }
                  className="h-12"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-comment">Комментарий</Label>
              <Textarea
                id="edit-comment"
                placeholder="Дополнительная информация (необязательно)"
                value={editingCarpet?.comment || ""}
                onChange={(e) =>
                  setEditingCarpet((prev) =>
                    prev ? { ...prev, comment: e.target.value } : null
                  )
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditCarpet}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
