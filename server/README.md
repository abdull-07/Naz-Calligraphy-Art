src/
├── generated/ <!-- TODO: Done -->
│   └── prisma/ <!-- TODO: Done -->         ← auto-generated, don't touch
├── prisma/ <!-- TODO: Done -->
│   ├── prisma.service.ts <!-- TODO: Done -->
│   └── prisma.module.ts <!-- TODO: Done -->
├── auth/ <!-- TODO: Done -->
│   ├── guards/ <!-- TODO: Done -->
│   ├── decorators/ <!-- TODO: Done -->
│   ├── dto/ <!-- TODO: Done -->
│   ├── auth.controller.ts <!-- TODO: Done -->
│   ├── auth.service.ts <!-- TODO: Done -->
│   └── auth.module.ts <!-- TODO: Done -->
├── product/
│   ├── dto/
│   ├── product.controller.ts
│   ├── product.service.ts
│   └── product.module.ts
├── order/
├── cart/
├── user/
├── cloudinary/
├── app.module.ts
├── app.controller.ts
└── main.ts



# Auth API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/register` | None | Register new customer |
| **POST** | `/api/v1/auth/login` | None | Login, returns access token |
| **POST** | `/api/v1/auth/logout` | JWT | Logout, clears cookie |
| **POST** | `/api/v1/auth/refresh` | Cookie | Get new access token |
| **GET** | `/api/v1/auth/verify-email/:token` | None | Verify email |
| **POST** | `/api/v1/auth/forgot-password` | None | Send reset email |
| **POST** | `/api/v1/auth/reset-password` | None | Reset password |
| **GET** | `/api/v1/auth/me` | JWT | Get current user |

