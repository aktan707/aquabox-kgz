import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User,
  UserRole,
  Employee,
  CarEntry,
  Drink,
  Debt,
  Carpet,
  PriceList,
  EmployeeStats,
  DashboardStats,
  VehicleCategory,
  ServiceType,
} from './types'
import { defaultPriceList } from './types'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from 'date-fns'

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36)

// Default users
const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Администратор',
  },
  {
    id: '2',
    username: 'boss',
    password: 'boss123',
    role: 'viewer',
    name: 'Шеф',
  },
]

// Default employees
const defaultEmployees: Employee[] = [
  { id: '1', name: 'Бек', createdAt: new Date().toISOString() },
  { id: '2', name: 'Азамат', createdAt: new Date().toISOString() },
  { id: '3', name: 'Актан', createdAt: new Date().toISOString() },
  { id: '4', name: 'Дастан', createdAt: new Date().toISOString() },
]

// Default drinks list
const defaultDrinksList = ['Cola', 'Pepsi', 'Fanta', 'Суу', 'Coffee', 'Чай']

interface StoreState {
  // Auth
  currentUser: User | null
  users: User[]
  login: (username: string, password: string) => boolean
  logout: () => void

  // Employees
  employees: Employee[]
  addEmployee: (name: string) => void
  updateEmployee: (id: string, name: string) => void
  deleteEmployee: (id: string) => void

  // Car Entries
  carEntries: CarEntry[]
  addCarEntry: (entry: Omit<CarEntry, 'id' | 'createdAt'>) => void
  updateCarEntry: (id: string, entry: Partial<CarEntry>) => void
  deleteCarEntry: (id: string) => void

  // Drinks
  drinks: Drink[]
  drinksList: string[]
  addDrink: (drink: Omit<Drink, 'id' | 'createdAt'>) => void
  updateDrink: (id: string, drink: Partial<Drink>) => void
  deleteDrink: (id: string) => void
  addDrinkToList: (name: string) => void
  removeDrinkFromList: (name: string) => void

  // Debts
  debts: Debt[]
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void
  updateDebt: (id: string, debt: Partial<Debt>) => void
  deleteDebt: (id: string) => void

  // Carpets
  carpets: Carpet[]
  addCarpet: (carpet: Omit<Carpet, 'id' | 'createdAt'>) => void
  updateCarpet: (id: string, carpet: Partial<Carpet>) => void
  deleteCarpet: (id: string) => void

  // Price List
  priceList: PriceList
  updatePrice: (category: VehicleCategory, service: ServiceType, price: number) => void

  // Settings
  bossWhatsApp: string
  bossTelegram: string
  setBossWhatsApp: (number: string) => void
  setBossTelegram: (number: string) => void

  // Computed
  getPrice: (category: VehicleCategory, service: ServiceType) => number
  getDashboardStats: (period: 'today' | 'week' | 'month') => DashboardStats
  getEmployeeStats: (period: 'today' | 'week' | 'month') => EmployeeStats[]
  getFilteredCarEntries: (filters: {
    period?: 'today' | 'yesterday' | 'week' | 'month' | 'custom'
    startDate?: Date
    endDate?: Date
    employeeId?: string
    search?: string
  }) => CarEntry[]
}

const getDateRange = (period: 'today' | 'week' | 'month') => {
  const now = new Date()
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      users: defaultUsers,

      login: (username, password) => {
        const user = get().users.find(
          (u) => u.username === username && u.password === password
        )
        if (user) {
          set({ currentUser: user })
          return true
        }
        return false
      },

      logout: () => set({ currentUser: null }),

      // Employees
      employees: defaultEmployees,

      addEmployee: (name) =>
        set((state) => ({
          employees: [
            ...state.employees,
            { id: generateId(), name, createdAt: new Date().toISOString() },
          ],
        })),

      updateEmployee: (id, name) =>
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === id ? { ...e, name } : e
          ),
        })),

      deleteEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        })),

      // Car Entries
      carEntries: [],

      addCarEntry: (entry) =>
        set((state) => ({
          carEntries: [
            ...state.carEntries,
            { ...entry, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateCarEntry: (id, entry) =>
        set((state) => ({
          carEntries: state.carEntries.map((e) =>
            e.id === id ? { ...e, ...entry } : e
          ),
        })),

      deleteCarEntry: (id) =>
        set((state) => ({
          carEntries: state.carEntries.filter((e) => e.id !== id),
        })),

      // Drinks
      drinks: [],
      drinksList: defaultDrinksList,

      addDrink: (drink) =>
        set((state) => ({
          drinks: [
            ...state.drinks,
            { ...drink, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateDrink: (id, drink) =>
        set((state) => ({
          drinks: state.drinks.map((d) =>
            d.id === id ? { ...d, ...drink } : d
          ),
        })),

      deleteDrink: (id) =>
        set((state) => ({
          drinks: state.drinks.filter((d) => d.id !== id),
        })),

      addDrinkToList: (name) =>
        set((state) => ({
          drinksList: [...state.drinksList, name],
        })),

      removeDrinkFromList: (name) =>
        set((state) => ({
          drinksList: state.drinksList.filter((d) => d !== name),
        })),

      // Debts
      debts: [],

      addDebt: (debt) =>
        set((state) => ({
          debts: [
            ...state.debts,
            { ...debt, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateDebt: (id, debt) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, ...debt } : d
          ),
        })),

      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        })),

      // Carpets
      carpets: [],

      addCarpet: (carpet) =>
        set((state) => ({
          carpets: [
            ...state.carpets,
            { ...carpet, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateCarpet: (id, carpet) =>
        set((state) => ({
          carpets: state.carpets.map((c) =>
            c.id === id ? { ...c, ...carpet } : c
          ),
        })),

      deleteCarpet: (id) =>
        set((state) => ({
          carpets: state.carpets.filter((c) => c.id !== id),
        })),

      // Price List
      priceList: defaultPriceList,

      updatePrice: (category, service, price) =>
        set((state) => ({
          priceList: {
            ...state.priceList,
            [category]: {
              ...state.priceList[category],
              [service]: price,
            },
          },
        })),

      // Settings
      bossWhatsApp: '',
      bossTelegram: '',
      setBossWhatsApp: (number) => set({ bossWhatsApp: number }),
      setBossTelegram: (number) => set({ bossTelegram: number }),

      // Computed
      getPrice: (category, service) => {
        return get().priceList[category]?.[service] || 0
      },

      getDashboardStats: (period) => {
        const { start, end } = getDateRange(period)
        const state = get()

        const filteredCars = state.carEntries.filter((entry) => {
          const date = parseISO(entry.date)
          return isWithinInterval(date, { start, end })
        })

        const filteredCarpets = state.carpets.filter((carpet) => {
          const date = parseISO(carpet.date)
          return isWithinInterval(date, { start, end })
        })

        const filteredDrinks = state.drinks.filter((drink) => {
          const date = parseISO(drink.date)
          return isWithinInterval(date, { start, end })
        })

        const filteredDebts = state.debts.filter((debt) => {
          const date = parseISO(debt.date)
          return isWithinInterval(date, { start, end })
        })

        const carsCount = filteredCars.length
        const totalIncome = filteredCars.reduce((sum, car) => sum + car.price, 0)
        const carpetsIncome = filteredCarpets.reduce((sum, c) => sum + c.price, 0)
        const drinksExpense = filteredDrinks.reduce((sum, d) => sum + d.price * d.quantity, 0)
        const debtsSum = filteredDebts.reduce((sum, d) => sum + d.amount, 0)
        const netProfit = totalIncome + carpetsIncome

        return {
          carsCount,
          totalIncome,
          carpetsIncome,
          drinksExpense,
          debtsSum,
          netProfit,
        }
      },

      getEmployeeStats: (period) => {
        const { start, end } = getDateRange(period)
        const state = get()

        return state.employees.map((employee) => {
          const cars = state.carEntries.filter((entry) => {
            const date = parseISO(entry.date)
            return (
              entry.employeeId === employee.id &&
              isWithinInterval(date, { start, end })
            )
          })

          const employeeDrinks = state.drinks.filter((drink) => {
            const date = parseISO(drink.date)
            return (
              drink.employeeId === employee.id &&
              isWithinInterval(date, { start, end })
            )
          })

          const employeeDebts = state.debts.filter((debt) => {
            const date = parseISO(debt.date)
            return (
              debt.employeeId === employee.id &&
              isWithinInterval(date, { start, end })
            )
          })

          const carsCount = cars.length
          const totalSum = cars.reduce((sum, car) => sum + car.price, 0)
          const fiftyPercent = totalSum * 0.5
          const debts = employeeDebts.reduce((sum, d) => sum + d.amount, 0)
          const drinks = employeeDrinks.reduce((sum, d) => sum + d.price * d.quantity, 0)
          const netProfit = fiftyPercent - debts - drinks

          return {
            employeeId: employee.id,
            employeeName: employee.name,
            carsCount,
            totalSum,
            fiftyPercent,
            debts,
            drinks,
            netProfit,
          }
        })
      },

      getFilteredCarEntries: (filters) => {
        const state = get()
        let entries = [...state.carEntries]

        // Filter by period
        if (filters.period && filters.period !== 'custom') {
          const now = new Date()
          let start: Date
          let end: Date

          switch (filters.period) {
            case 'today':
              start = startOfDay(now)
              end = endOfDay(now)
              break
            case 'yesterday':
              const yesterday = new Date(now)
              yesterday.setDate(yesterday.getDate() - 1)
              start = startOfDay(yesterday)
              end = endOfDay(yesterday)
              break
            case 'week':
              start = startOfWeek(now, { weekStartsOn: 1 })
              end = endOfWeek(now, { weekStartsOn: 1 })
              break
            case 'month':
              start = startOfMonth(now)
              end = endOfMonth(now)
              break
            default:
              start = startOfDay(now)
              end = endOfDay(now)
          }

          entries = entries.filter((entry) => {
            const date = parseISO(entry.date)
            return isWithinInterval(date, { start, end })
          })
        }

        // Filter by custom date range
        if (filters.period === 'custom' && filters.startDate && filters.endDate) {
          entries = entries.filter((entry) => {
            const date = parseISO(entry.date)
            return isWithinInterval(date, {
              start: startOfDay(filters.startDate!),
              end: endOfDay(filters.endDate!),
            })
          })
        }

        // Filter by employee
        if (filters.employeeId) {
          entries = entries.filter(
            (entry) => entry.employeeId === filters.employeeId
          )
        }

        // Filter by search
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          entries = entries.filter(
            (entry) =>
              entry.vehicleName.toLowerCase().includes(searchLower) ||
              state.employees
                .find((e) => e.id === entry.employeeId)
                ?.name.toLowerCase()
                .includes(searchLower)
          )
        }

        // Sort by date descending
        return entries.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      },
    }),
    {
      name: 'aquabox-storage',
    }
  )
)
