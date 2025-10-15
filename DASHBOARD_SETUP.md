# Dashboard Setup for LegalOps Platform
*Create the user dashboard and navigation structure*

## Step 1: Create Dashboard Layout

### Create `app/dashboard/layout.tsx`:
```typescript
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={session.user} />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

### Create `components/dashboard-nav.tsx`:
```typescript
"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: pathname === '/dashboard' },
    { name: 'Orders', href: '/dashboard/orders', current: pathname === '/dashboard/orders' },
    { name: 'Documents', href: '/dashboard/documents', current: pathname === '/dashboard/documents' },
    { name: 'New Order', href: '/dashboard/new-order', current: pathname === '/dashboard/new-order' },
  ]

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                LegalOps
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-gray-700 text-sm mr-4">
                Welcome, {user.name || user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

## Step 2: Create Dashboard Home Page

### Create `app/dashboard/page.tsx`:
```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return <div>Loading...</div>
  }

  // Get user's orders and stats
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const stats = {
    totalOrders: await prisma.order.count({
      where: { userId: session.user.id }
    }),
    completedOrders: await prisma.order.count({
      where: { 
        userId: session.user.id,
        status: 'COMPLETED'
      }
    }),
    pendingOrders: await prisma.order.count({
      where: { 
        userId: session.user.id,
        status: { in: ['PENDING', 'PAID', 'IN_REVIEW', 'SUBMITTED_TO_STATE'] }
      }
    }),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening with your legal operations.
        </p>
      </div>

      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={orders} />
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Quick Actions
            </h3>
            <div className="mt-4 space-y-3">
              <a
                href="/dashboard/new-order"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 px-4 rounded-md text-sm font-medium"
              >
                Start New LLC Formation
              </a>
              <a
                href="/dashboard/documents"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium"
              >
                View Documents
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Step 3: Create Dashboard Components

### Create `components/dashboard-stats.tsx`:
```typescript
interface DashboardStatsProps {
  stats: {
    totalOrders: number
    completedOrders: number
    pendingOrders: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      name: 'Completed',
      value: stats.completedOrders,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'In Progress',
      value: stats.pendingOrders,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {statItems.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${item.bgColor} rounded-md flex items-center justify-center`}>
                  <span className={`text-sm font-medium ${item.color}`}>
                    {item.value}
                  </span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className={`text-lg font-medium ${item.color}`}>
                    {item.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Create `components/recent-orders.tsx`:
```typescript
import { Order } from "@prisma/client"

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-blue-100 text-blue-800'
      case 'IN_REVIEW':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Recent Orders
        </h3>
        <div className="mt-4">
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.businessName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.entityType} • {order.orderNumber}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

## Step 4: Update Home Page

### Update `app/page.tsx`:
```typescript
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Legal Operations</span>
            <span className="block text-indigo-600">Made Simple</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your business formation, registered agent services, and legal compliance with our AI-powered platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {session ? (
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="space-y-3 sm:space-y-0 sm:space-x-3 sm:flex">
                <Link
                  href="/auth/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/signin"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Step 5: Test Your Setup

After creating all files:

```bash
# Make sure you're in the legalops-platform directory
cd legalops-platform

# Install dependencies if you haven't already
npm install

# Set up the database
npx prisma generate
npx prisma db push

# Run the development server
npm run dev
```

Visit these URLs to test:
- http://localhost:3000 - Home page
- http://localhost:3000/auth/signup - Create account
- http://localhost:3000/auth/signin - Sign in
- http://localhost:3000/dashboard - Dashboard (after signing in)

You should now have:
✅ Complete authentication system
✅ Protected dashboard
✅ User registration and login
✅ Basic navigation
✅ Database integration

**You've completed Month 1 foundation! Ready to start Month 2 core features next week.**
