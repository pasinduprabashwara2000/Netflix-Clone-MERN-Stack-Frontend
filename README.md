# Simple CRUD (CustomerManagement & ProductManagement)

Frontend: React + TypeScript + Vite

    npm install
    npm run dev

Expects backend at http://localhost:5000/api with:
- GET/POST /customers, PUT/DELETE /customers/:id  (name, contact)
- GET/POST /products,  PUT/DELETE /products/:id   (name, qty, price)

Backend must enable CORS (app.use(cors())).
