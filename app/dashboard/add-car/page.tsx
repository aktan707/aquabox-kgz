"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import { Car, Loader2, Check } from "lucide-react"
import { format } from "date-fns"
import type { VehicleCategory, ServiceType } from "@/lib/types"
import { vehicleCategoryLabels, serviceTypeLabels } from "@/lib/types"

export default function AddCarPage() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const { employees, getPrice, addCarEntry } = useStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [employeeId, setEmployeeId] = useState("")
  const [vehicleName, setVehicleName] = useState("")
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory | "">("")
  const [serviceType, setServiceType] = useState<ServiceType | "">("")
  const [price, setPrice] = useState<number | "">("")
  const [comment, setComment] = useState("")

  // Auto-fill price when category and service are selected
  useEffect(() => {
    if (vehicleCategory && serviceType) {
      const autoPrice = getPrice(vehicleCategory as VehicleCategory, serviceType as ServiceType)
      setPrice(autoPrice)
    }
  }, [vehicleCategory, serviceType, getPrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employeeId || !vehicleName || !vehicleCategory || !serviceType || !price) {
      toast.error("Заполните все обязательные поля")
      return
    }

    setIsLoading(true)
    
    const now = new Date()
    
    addCarEntry({
      employeeId,
      vehicleName,
      vehicleCategory: vehicleCategory as VehicleCategory,
      serviceType: serviceType as ServiceType,
      price: Number(price),
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
      comment: comment || undefined,
    })

    toast.success("Запись добавлена!")
    
    // Reset form
    setEmployeeId("")
    setVehicleName("")
    setVehicleCategory("")
    setServiceType("")
    setPrice("")
    setComment("")
    
    setIsLoading(false)
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Car className="size-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Только администратор может добавлять записи</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Добавить машину</h1>
        <p className="text-muted-foreground">
          Добавьте новую запись о мойке машины
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="size-5" />
            Новая запись
          </CardTitle>
          <CardDescription>
            Дата и время заполняются автоматически
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Employee Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="employee">Сотрудник *</Label>
              <Select value={employeeId} onValueChange={(v) => setEmployeeId(v ?? "")}>
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

            {/* Vehicle Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicleName">Машина *</Label>
              <Input
                id="vehicleName"
                placeholder="Toyota Camry 70"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Vehicle Category */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="vehicleCategory">Категория машины *</Label>
              <Select
                value={vehicleCategory}
                onValueChange={(v) => setVehicleCategory(v as VehicleCategory)}
              >
                <SelectTrigger id="vehicleCategory" className="h-12">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(vehicleCategoryLabels) as VehicleCategory[]).map((category) => (
                      <SelectItem key={category} value={category}>
                        {vehicleCategoryLabels[category]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Service Type */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="serviceType">Услуга *</Label>
              <Select
                value={serviceType}
                onValueChange={(v) => setServiceType(v as ServiceType)}
              >
                <SelectTrigger id="serviceType" className="h-12">
                  <SelectValue placeholder="Выберите услугу" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(Object.keys(serviceTypeLabels) as ServiceType[]).map((service) => (
                      <SelectItem key={service} value={service}>
                        {serviceTypeLabels[service]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Цена (сом) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                ��ена заполняется автоматически, но можно изменить вручную
              </p>
            </div>

            {/* Comment */}
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

            {/* Submit Button */}
            <Button type="submit" className="h-12 mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Check data-icon="inline-start" />
                  Сохранить
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
