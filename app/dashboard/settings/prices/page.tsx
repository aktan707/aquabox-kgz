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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Settings, Save, RotateCcw } from "lucide-react"
import type { VehicleCategory, ServiceType } from "@/lib/types"
import { vehicleCategoryLabels, serviceTypeLabels, defaultPriceList } from "@/lib/types"

export default function PricesPage() {
  const { isAdmin } = useAuth()
  const { priceList, updatePrice } = useStore()
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({})
  const [activeCategory, setActiveCategory] = useState<VehicleCategory>("sedan")

  const categories = Object.keys(vehicleCategoryLabels) as VehicleCategory[]
  const services = Object.keys(serviceTypeLabels) as ServiceType[]

  const getKey = (category: VehicleCategory, service: ServiceType) => `${category}-${service}`

  const getCurrentPrice = (category: VehicleCategory, service: ServiceType) => {
    const key = getKey(category, service)
    if (key in editedPrices) {
      return editedPrices[key]
    }
    return priceList[category]?.[service] || 0
  }

  const handlePriceChange = (category: VehicleCategory, service: ServiceType, value: string) => {
    const key = getKey(category, service)
    const numValue = parseInt(value) || 0
    setEditedPrices((prev) => ({ ...prev, [key]: numValue }))
  }

  const handleSave = () => {
    Object.entries(editedPrices).forEach(([key, value]) => {
      const [category, service] = key.split("-") as [VehicleCategory, ServiceType]
      updatePrice(category, service, value)
    })
    setEditedPrices({})
    toast.success("Цены сохранены")
  }

  const handleReset = () => {
    // Reset to default prices
    categories.forEach((category) => {
      services.forEach((service) => {
        const defaultPrice = defaultPriceList[category]?.[service] || 0
        updatePrice(category, service, defaultPrice)
      })
    })
    setEditedPrices({})
    toast.success("Цены сброшены к значениям по умолчанию")
  }

  const hasChanges = Object.keys(editedPrices).length > 0

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Settings className="size-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">Только администратор может изменять цены</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Прайс-лист</h1>
          <p className="text-muted-foreground">
            Настройка цен на услуги
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw data-icon="inline-start" />
            Сбросить
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save data-icon="inline-start" />
            Сохранить
          </Button>
        </div>
      </div>

      {/* Price List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Цены на услуги
          </CardTitle>
          <CardDescription>
            Цены автоматически применяются при добавлении машины
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as VehicleCategory)}>
            <TabsList className="mb-4 flex flex-wrap h-auto gap-1">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="flex-shrink-0">
                  {vehicleCategoryLabels[category]}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <ScrollArea className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Услуга</TableHead>
                        <TableHead className="w-[150px]">Цена (сом)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service}>
                          <TableCell className="font-medium">
                            {serviceTypeLabels[service]}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              value={getCurrentPrice(category, service)}
                              onChange={(e) => handlePriceChange(category, service, e.target.value)}
                              className="w-[120px]"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Как это работает</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex flex-col gap-2">
          <p>
            1. Выберите категорию машины (вкладки сверху)
          </p>
          <p>
            2. Измените цены на нужные услуги
          </p>
          <p>
            3. Нажмите кнопку &quot;Сохранить&quot;
          </p>
          <p>
            При добавлении новой записи о машине, цена будет автоматически заполняться 
            на основе выбранной категории и услуги. Администратор может изменить цену вручную.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
