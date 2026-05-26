// AquaBox CRM Types

export type UserRole = 'admin' | 'viewer'

export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  name: string
}

export type VehicleCategory = 'sedan' | 'crossover' | 'suv' | 'minivan' | 'sprinter'

export type ServiceType = 
  | 'full_wash' 
  | 'exterior' 
  | 'interior' 
  | 'general' 
  | 'chemical_cleaning' 
  | 'engine_wash' 
  | 'polishing' 
  | 'dry_fog'

export interface Employee {
  id: string
  name: string
  createdAt: string
}

export interface CarEntry {
  id: string
  employeeId: string
  vehicleName: string
  vehicleCategory: VehicleCategory
  serviceType: ServiceType
  price: number
  date: string
  time: string
  comment?: string
  createdAt: string
}

export interface Drink {
  id: string
  employeeId: string
  name: string
  quantity: number
  price: number
  date: string
  createdAt: string
}

export interface Debt {
  id: string
  employeeId: string
  amount: number
  reason: string
  date: string
  createdAt: string
}

export interface Carpet {
  id: string
  quantity: number
  price: number
  comment?: string
  date: string
  createdAt: string
}

export interface PriceList {
  [key: string]: {
    [service in ServiceType]?: number
  }
}

export interface EmployeeStats {
  employeeId: string
  employeeName: string
  carsCount: number
  totalSum: number
  fiftyPercent: number
  debts: number
  drinks: number
  netProfit: number
}

export interface DashboardStats {
  carsCount: number
  totalIncome: number
  carpetsIncome: number
  drinksExpense: number
  debtsSum: number
  netProfit: number
}

// Labels for display
export const vehicleCategoryLabels: Record<VehicleCategory, string> = {
  sedan: 'Легковая',
  crossover: 'Кроссовер',
  suv: 'Джип',
  minivan: 'Минивен',
  sprinter: 'Спринтер',
}

export const serviceTypeLabels: Record<ServiceType, string> = {
  full_wash: 'Полный душ',
  exterior: 'Снаружи',
  interior: 'Внутри',
  general: 'Генеральная',
  chemical_cleaning: 'Химчистка',
  engine_wash: 'Мойка двигателя',
  polishing: 'Полировка',
  dry_fog: 'Сухой туман',
}

// Default price list
export const defaultPriceList: PriceList = {
  sedan: {
    full_wash: 350,
    exterior: 200,
    interior: 200,
    general: 500,
    chemical_cleaning: 1500,
    engine_wash: 300,
    polishing: 2000,
    dry_fog: 800,
  },
  crossover: {
    full_wash: 400,
    exterior: 250,
    interior: 250,
    general: 600,
    chemical_cleaning: 2000,
    engine_wash: 350,
    polishing: 2500,
    dry_fog: 1000,
  },
  suv: {
    full_wash: 500,
    exterior: 300,
    interior: 300,
    general: 700,
    chemical_cleaning: 2500,
    engine_wash: 400,
    polishing: 3000,
    dry_fog: 1200,
  },
  minivan: {
    full_wash: 500,
    exterior: 300,
    interior: 350,
    general: 700,
    chemical_cleaning: 2500,
    engine_wash: 400,
    polishing: 3000,
    dry_fog: 1200,
  },
  sprinter: {
    full_wash: 600,
    exterior: 400,
    interior: 400,
    general: 800,
    chemical_cleaning: 3000,
    engine_wash: 500,
    polishing: 3500,
    dry_fog: 1500,
  },
}
