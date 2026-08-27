src/
├── api/
│   ├── axios.ts              → axios instance + interceptors
│   └── endpoints/
│       ├── auth.api.ts
│       ├── product.api.ts
│       ├── order.api.ts
│       ├── user.api.ts
│       ├── category.api.ts
│       ├── review.api.ts
│       ├── blog.api.ts
│       └── admin.api.ts
├── components/
│   ├── ui/                   → reusable atoms
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Pagination.tsx
│   │   └── ConfirmDialog.tsx
│   └── admin/                → admin-specific components
│       ├── AdminLayout.tsx
│       ├── AdminSidebar.tsx
│       ├── AdminHeader.tsx
│       └── StatCard.tsx
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── orders/
│   │   │   ├── OrdersList.tsx
│   │   │   └── OrderDetail.tsx
│   │   ├── products/
│   │   │   ├── ProductsList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductVariants.tsx
│   │   ├── categories/
│   │   │   └── CategoriesList.tsx
│   │   ├── customers/
│   │   │   ├── CustomersList.tsx
│   │   │   └── CustomerDetail.tsx
│   │   ├── reviews/
│   │   │   └── ReviewsList.tsx
│   │   ├── blog/
│   │   │   ├── BlogList.tsx
│   │   │   └── BlogEditor.tsx
│   │   ├── reports/
│   │   │   ├── RevenueReport.tsx
│   │   │   └── SalesReport.tsx
│   │   ├── settings/
│   │   │   ├── BannersSettings.tsx
│   │   │   ├── FaqSettings.tsx
│   │   │   ├── ShippingSettings.tsx
│   │   │   └── CouponsSettings.tsx
│   │   └── Login.tsx
│   └── public/               → customer-facing (Phase 2)
├── stores/
│   ├── auth.store.ts
│   └── cart.store.ts
├── hooks/
│   ├── useAuth.ts
│   └── useDebounce.ts
├── types/
│   └── index.ts
├── utils/
│   ├── format.ts
│   └── cn.ts
├── App.tsx
└── main.tsx




src/admin/
├── pages/
│   ├── Products.tsx          ← thin, just imports
│   ├── ProductForm.tsx       ← thin, just imports
│   └── Categories.tsx        ← thin, just imports
└── components/
    ├── products/
    │   ├──
    │   ├── 
    │   ├──
    │   ├──
    │   └── form/
    │       ├── 
    │       ├── 
    │       ├──
    │       ├──
    │       ├──
    │       ├──
    │       ├──
    │       └──
    └── categories/
        ├──
        ├──
        ├──
        └── 