import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useState, useMemo, useEffect } from 'react'
import { useUpdateInventoryStock } from '@/hooks/useInventory'
import { Loader } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { useWarehouseInventories } from '@/hooks/useWarehouse'

export const Route = createFileRoute('/store/stock-management')({
  component: RouteComponent,
})

function RouteComponent() {
  const warehouse_id = 1;
  const { data: inventory, isLoading, isError } = useWarehouseInventories(warehouse_id);
  const inventories = React.useMemo(() => {
    if (!inventory) return [];
    return inventory.flatMap(w => w.inventories);
  }, [inventory]);
  const { data: products } = useProducts() // Fetch all products once
  const [editId, setEditId] = useState<number | null>(null)
  const [newStock, setNewStock] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const updateStockMutation = useUpdateInventoryStock(editId ?? 0)
  const navigate = useNavigate()

  useEffect(() => {
    if (updateStockMutation.isSuccess) {
      navigate({ to: '/warehouse/success' });
    }
  }, [updateStockMutation.isSuccess, navigate]);

  const productNameMap = useMemo(() => {
    if (!products) return {}
    const map: Record<number, string> = {}
    products.forEach((p: any) => {
      map[p.product_id] = p.name
    })
    return map
  }, [products])

  const handleEdit = (inventory_id: number, currentStock: number) => {
    setEditId(inventory_id)
    setNewStock(String(currentStock))
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleCancel = () => {
    setEditId(null)
    setNewStock('')
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleSave = async (updateInventoryId: number) => {
    try {
      await updateStockMutation.mutateAsync({ stock_qty: Number(newStock) })
      setSuccessMsg('Stock updated successfully!')
      setEditId(null)
      setNewStock('')
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update stock')
    }
  }

  return (
    <>
      {isLoading ? (
        <div className="text-center mt-10">
          <Loader className="animate-spin h-6 w-6 text-blue-600 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : isError ? (
        <div className="text-red-600 text-center mt-10">Failed to load inventories.</div>
      ) : (
        <div className="max-w-3xl mx-auto mt-10">
          <h2 className="text-3xl font-bold text-[#005A61] mb-6">Stock Management</h2>
          {successMsg && <div className="text-green-600 mb-2">{successMsg}</div>}
          {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
          <table className="min-w-full divide-y divide-[#005A61]/30 text-sm">
            <thead className="bg-[#6A89A7] text-white rounded-2xl">
              <tr >
                <th className="py-2 px-4 border">Inventory ID</th>
                <th className="py-2 px-4 border">Product Name</th>
                <th className="py-2 px-4 border">Current Stock</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventories && inventories.length > 0 ? (
                inventories.map(inv => (
                  <tr key={inv.inventory_id}>
                    <td className="px-4 py-3 text-left font-semibold tracking-wide bg-white">{inv.inventory_id}</td>
                    <td className="px-4 py-3 text-left font-semibold tracking-wide bg-white">
                      {productNameMap[inv.product?.product_id] || 'Unknown Product'}
                    </td>
                    <td className="px-4 py-3 text-left font-semibold tracking-wide bg-white">
                      {editId === inv.inventory_id ? (
                        <input
                          type="number"
                          value={newStock}
                          onChange={e => setNewStock(e.target.value)}
                          className="border px-2 py-1 w-20"
                        />
                      ) : (
                        inv.stock_qty
                      )}
                    </td>
                    <td className="px-4 py-3 text-left font-semibold tracking-wide bg-white">
                      {editId === inv.inventory_id ? (
                        <>
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                            onClick={() => handleSave(inv.inventory_id)}
                            disabled={updateStockMutation.isPending}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-400 text-white px-2 py-1 rounded"
                            onClick={handleCancel}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="bg-blue-600 text-white px-2 py-1 rounded"
                          onClick={() => handleEdit(inv.inventory_id, inv.stock_qty)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No inventories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}