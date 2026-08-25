import { useState, useEffect }      from 'react'
import { useNavigate, useParams }   from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm }                  from 'react-hook-form'
import { zodResolver }              from '@hookform/resolvers/zod'
import { z }                        from 'zod'
import { ArrowLeft, Trash2 }        from 'lucide-react'
import toast                        from 'react-hot-toast'
import { productService }           from '../services/product.service'
import { categoryService }          from '../services/category.service'
import BasicInfoSection             from '../components/products/form/BasicInfoSection'
import VariantsSection              from '../components/products/form/VariantsSection'
import ImagesSection                from '../components/products/form/ImagesSection'
import SeoSection                   from '../components/products/form/SeoSection'
import PublishPanel                 from '../components/products/form/PublishPanel'
import CategoryPanel                from '../components/products/form/CategoryPanel'
import OptionsPanel                 from '../components/products/form/OptionsPanel'
import TagsPanel                    from '../components/products/form/TagsPanel'

const schema = z.object({
  name:              z.string().min(3, 'Name must be at least 3 characters'),
  slug:              z.string().optional(),
  description:       z.string().optional(),
  categoryId:        z.number({ invalid_type_error: 'Select a category' }).min(1),
  status:            z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  isFeatured:        z.boolean().default(false),
  localShippingOnly: z.boolean().default(false),
  tags:              z.string().optional(),
  seoTitle:          z.string().max(60).optional(),
  seoDescription:    z.string().max(160).optional(),
})

type FormData = z.infer<typeof schema>

interface Variant {
  id?:          number
  label:        string
  sku:          string
  price:        number
  comparePrice: number | null
  stockQty:     number
  isDefault:    boolean
}

interface ProductImage {
  id:        number
  url:       string
  isPrimary: boolean
  sortOrder: number
}

export default function ProductForm() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const isEdit      = !!id && id !== 'new'

  const [variants, setVariants] = useState<Variant[]>([
    { label: 'Default', sku: '', price: 0, comparePrice: null, stockQty: 0, isDefault: true },
  ])
  const [hasVariants, setHasVariants] = useState(false)
  const [images,         setImages]         = useState<ProductImage[]>([])
  const [uploading,      setUploading]      = useState(false)
  const [savedProductId, setSavedProductId] = useState<number | null>(null)

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn:  () => productService.getAll({ search: id }),
    enabled:  isEdit,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn:  categoryService.getAll,
  })

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(schema) as any,
      defaultValues: { status: 'DRAFT', isFeatured: false, localShippingOnly: false },
    })

  // auto-generate slug
  const nameValue = watch('name')
  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', nameValue.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'))
    }
  }, [nameValue, isEdit])

  // populate form for edit
  useEffect(() => {
    if (isEdit && productData?.data?.[0]) {
      const p = productData.data[0]
      reset({
        name:              p.name,
        slug:              p.slug,
        description:       p.description ?? '',
        categoryId:        p.categoryId,
        status:            p.status,
        isFeatured:        p.isFeatured,
        localShippingOnly: p.localShippingOnly,
        tags:              p.tags?.join(', ') ?? '',
        seoTitle:          p.seoTitle ?? '',
        seoDescription:    p.seoDescription ?? '',
      })
      const loadedVariants = p.variants?.map((v: any) => ({
        id: v.id, label: v.label, sku: v.sku ?? '',
        price: Number(v.price), comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
        stockQty: v.stockQty, isDefault: v.isDefault,
      })) ?? []
      setVariants(loadedVariants)
      const hasMultiple = loadedVariants.length > 1
      const hasLabel    = loadedVariants[0]?.label && loadedVariants[0].label !== 'Default'
      setHasVariants(hasMultiple || Boolean(hasLabel))
      setImages(p.images ?? [])
      setSavedProductId(p.id)
    }
  }, [productData, isEdit])

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: async (data) => {
      setSavedProductId(data.id)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created!')
    },
    onError: () => toast.error('Failed to create product'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      productService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated!')
    },
    onError: () => toast.error('Failed to update product'),
  })

  const onSubmit = async (values: FormData) => {
    const payload = {
      ...values,
      tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    }

    if (isEdit && savedProductId) {
      updateMutation.mutate({ id: savedProductId, payload })
    } else {
      const created = await createMutation.mutateAsync(payload)
      setSavedProductId(created.id)
      for (const v of variants) {
        await productService.createVariant(created.id, {
          label: v.label, sku: v.sku || undefined, price: v.price,
          comparePrice: v.comparePrice || undefined, stockQty: v.stockQty, isDefault: v.isDefault,
        })
      }
    }
  }

  const handleToggleMode = () => {
    setHasVariants((prev) => {
      const next = !prev
      if (!next) {
        setVariants((vPrev) =>
          vPrev.length > 0
            ? [{ ...vPrev[0], label: 'Default', isDefault: true }]
            : [{ label: 'Default', sku: '', price: 0, comparePrice: null, stockQty: 0, isDefault: true }]
        )
      } else {
        setVariants((vPrev) =>
          vPrev.map((v, i) => (i === 0 && v.label === 'Default' ? { ...v, label: '' } : v))
        )
      }
      return next
    })
  }

  const handleVariantAdd = () =>
    setVariants((prev) => [
      ...prev,
      {
        label:        hasVariants ? '' : 'Default',
        sku:          '',
        price:        0,
        comparePrice: null,
        stockQty:     0,
        isDefault:    prev.length === 0,
      },
    ])

  const handleVariantUpdate = (index: number, key: keyof Variant, value: any) =>
    setVariants((prev) => prev.map((v, i) => i === index ? { ...v, [key]: value } : v))

  const handleVariantRemove = async (index: number) => {
    const variant = variants[index]
    if (variant.id && savedProductId) {
      try {
        await productService.deleteVariant(savedProductId, variant.id)
        toast.success('Variant deleted')
      } catch {
        toast.error('Failed to delete variant')
        return
      }
    }
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageDrop = async (files: File[]) => {
    if (!savedProductId) { toast.error('Save product first'); return }
    setUploading(true)
    try {
      for (const file of files) {
        const uploaded = await productService.uploadImage(savedProductId, file, images.length === 0)
        setImages((prev) => [...prev, uploaded])
      }
      toast.success(`${files.length} image(s) uploaded`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleImageRemove = async (imageId: number) => {
    if (!savedProductId) return
    try {
      await productService.deleteImage(savedProductId, imageId)
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      toast.success('Image removed')
    } catch {
      toast.error('Failed to remove image')
    }
  }

  if (productLoading && isEdit) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/admin/products')}
          style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', color: '#6B7280', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="page-subtitle">
            Products / <span style={{ color: '#C9A84C' }}>{isEdit ? 'Edit Product' : 'New Product'}</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <BasicInfoSection
            register={register} errors={errors}
            setValue={setValue} isEdit={isEdit} slugWatch={watch('slug') ?? ''}
          />
          <VariantsSection
            variants={variants}
            hasVariants={hasVariants}
            onToggleMode={handleToggleMode}
            onAdd={handleVariantAdd}
            onUpdate={handleVariantUpdate}
            onRemove={handleVariantRemove}
          />
          <SeoSection register={register} />
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PublishPanel
            status={watch('status')}
            isSubmitting={isSubmitting}
            isEdit={isEdit}
            onSaveDraft={() => { setValue('status', 'DRAFT'); handleSubmit(onSubmit)() }}
            onPublish={() => { setValue('status', 'ACTIVE'); handleSubmit(onSubmit)() }}
            onStatusChange={(val) => setValue('status', val as any)}
          />
          <CategoryPanel
            categories={categories}
            selectedId={watch('categoryId')}
            onChange={(id) => setValue('categoryId', id, { shouldValidate: true })}
            error={errors.categoryId?.message}
          />
          <ImagesSection
            images={images} savedProductId={savedProductId}
            uploading={uploading} onDrop={handleImageDrop} onRemove={handleImageRemove}
          />
          <OptionsPanel
            isFeatured={watch('isFeatured')}
            localShippingOnly={watch('localShippingOnly')}
            onToggle={(key) => setValue(key, !watch(key))}
          />
          <TagsPanel register={register} />

          {isEdit && (
            <div className="card" style={{ border: '1px solid #FEE2E2' }}>
              <button
                type="button"
                onClick={() => { if (confirm('Delete this product?')) navigate('/admin/products') }}
                className="btn btn-danger"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Trash2 size={15} />
                Delete Product
              </button>
              <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', marginTop: '6px' }}>
                This action cannot be undone
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}