import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { productService }   from '../services/product.service'
import { categoryService }  from '../services/category.service'
import ProductFilters       from '../components/products/ProductFilters'
import ProductBulkBar       from '../components/products/ProductBulkBar'
import ProductsTable        from '../components/products/ProductsTable'
import ProductPagination    from '../components/products/ProductPagination'

export default function Products() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('')
  const [status,   setStatus]   = useState('')
  const [sort,     setSort]     = useState('newest')
  const [page,     setPage]     = useState(1)
  const [selected, setSelected] = useState<number[]>([])
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, category, status, sort, page }],
    queryFn:  () => productService.getAll({ search, category, status, sort, page, limit }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn:  categoryService.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: productService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product archived')
      setSelected([])
    },
    onError: () => toast.error('Failed to delete product'),
  })

  const products    = data?.data ?? []
  const meta        = data?.meta ?? { total: 0, totalPages: 1 }
  const allSelected = products.length > 0 && selected.length === products.length

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'search')   setSearch(value)
    if (key === 'category') setCategory(value)
    if (key === 'status')   setStatus(value)
    if (key === 'sort')     setSort(value)
    setPage(1)
  }

  const handleDelete = (id: number) => {
    if (confirm('Archive this product?')) deleteMutation.mutate(id)
  }

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  const toggleAll = () =>
    setSelected(allSelected ? [] : products.map((p: any) => p.id))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{meta.total} products in your store</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/new')}>
          <Plus size={16} />
          Add New Product
        </button>
      </div>

      <ProductFilters
        search={search} category={category} status={status} sort={sort}
        categories={categories} onChange={handleFilterChange}
      />

      <ProductBulkBar
        count={selected.length}
        isDeleting={deleteMutation.isPending}
        onDelete={() => { if (confirm(`Archive ${selected.length} products?`)) selected.forEach((id) => deleteMutation.mutate(id)) }}
        onClear={() => setSelected([])}
      />

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <ProductsTable
          products={products} selected={selected} isLoading={isLoading}
          allSelected={allSelected} onToggle={toggleSelect}
          onToggleAll={toggleAll} onDelete={handleDelete}
        />
        <ProductPagination
          page={page} totalPages={meta.totalPages}
          total={meta.total} limit={limit} onChange={setPage}
        />
      </div>
    </div>
  )
}