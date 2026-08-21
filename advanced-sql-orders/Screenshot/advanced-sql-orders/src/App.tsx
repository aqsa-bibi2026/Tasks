import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.ts'

type Order = {
  order_id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  product_name: string
  amount: number
  status: string
  created_at: string
}

function App() {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchOrders = async (searchValue = '') => {
    setLoading(true)

    const { data, error } = await supabase.rpc(
      'search_orders',
      {
        search_text: searchValue
      }
    )

    if (error) {
      console.error('Error:', error)
      setOrders([])
    } else {
      setOrders(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const totalOrders = orders.length

  const completedOrders = orders.filter(
    order => order.status === 'Completed'
  ).length

  const pendingOrders = orders.filter(
    order => order.status === 'Pending'
  ).length

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.amount),
    0
  )

  return (
    <div className="min-h-screen bg-slate-100">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Advanced SQL Orders
            </h1>

            <p className="text-sm text-slate-500">
              Orders & Customers Management Dashboard
            </p>
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="grid gap-5 md:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Orders
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {totalOrders}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Completed
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-600">
              {completedOrders}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending
            </p>

            <h2 className="mt-2 text-3xl font-bold text-amber-500">
              {pendingOrders}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Revenue
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              ${totalRevenue.toLocaleString()}
            </h2>
          </div>

        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Orders & Customers
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              SQL JOIN with PostgreSQL Full-Text Search
            </p>
          </div>

          <div className="relative mb-6">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, email, product or status..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
            />

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                    Order
                  </th>

                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                    Email
                  </th>

                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                    Product
                  </th>

                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                    Amount
                  </th>

                  <th className="px-4 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >

                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-900">
                          #{order.order_id}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {order.customer_name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {order.customer_phone}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {order.customer_email}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-800">
                        {order.product_name}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        ${Number(order.amount).toLocaleString()}
                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {order.status}
                        </span>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  )
}

export default App