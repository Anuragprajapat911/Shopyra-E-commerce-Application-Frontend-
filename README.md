# Shopyra Frontend (User + Admin)

Production-style React frontend for your Spring Boot backend APIs.

## What this app covers

- Auth: register, login, refresh token (auto refresh on 401)
- User: profile view/update, password change
- Catalog: list/search/sort/filter by category
- Cart: get/add/update/remove/clear
- Orders: create from cart, list mine, get by id, cancel
- Payments: create Razorpay order, verify payment, get payment by order id
- Admin Users: list/get/promote/delete
- Admin Categories: create/update/delete/list
- Admin Products: create/update/soft delete/hard delete/restore/admin list
- Admin Orders: list all + update status

## Run locally

1. Configure API URL (optional):

```bash
cp .env.example .env
```

Default is already `http://localhost:8080`.

2. Install and run:

```bash
npm install
npm run dev
```

Vite dev server is configured on `http://localhost:3000` to match your backend `app.frontend-url`.

3. Build:

```bash
npm run build
```

## Main files

- `src/api.js` - all endpoint integrations and auth-refresh request client
- `src/App.jsx` - full user and admin dashboards
- `src/App.css` - responsive dashboard styling
