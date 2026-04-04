# 📡 API CONTRACT — CHARBUCKS POS SYSTEM

## 🧠 RULES

* Do NOT change request/response structure without updating this file
* Use consistent naming everywhere
* All IDs are strings
* All responses are JSON

---

## 🟢 1. GET ALL PRODUCTS

### Request

```
GET /api/products
```

### Response

```json
[
  {
    "id": "p1",
    "name": "Pizza",
    "price": 250,
    "category": "Food"
  }
]
```

---

## 🟢 2. GET TABLES

### Request

```
GET /api/tables
```

### Response

```json
[
  {
    "id": "t1",
    "name": "Table 1",
    "seats": 4,
    "status": "available"
  }
]
```

---

## 🟡 3. CREATE ORDER

### Request

```
POST /api/orders
```

```json
{
  "tableId": "t1",
  "items": [
    {
      "productId": "p1",
      "name": "Pizza",
      "price": 250,
      "quantity": 2
    }
  ],
  "totalAmount": 500
}
```

### Response

```json
{
  "orderId": "o123",
  "status": "created"
}
```

---

## 🔵 4. GET ORDERS

### Request

```
GET /api/orders
```

### Response

```json
[
  {
    "orderId": "o123",
    "tableId": "t1",
    "items": [],
    "status": "created",
    "totalAmount": 500
  }
]
```

---

## 🔴 5. SEND ORDER TO KITCHEN

### Request

```
POST /api/orders/:id/send
```

### Response

```json
{
  "message": "Order sent to kitchen",
  "status": "to_cook"
}
```

---

## 🟠 6. UPDATE ORDER STATUS (Kitchen)

### Request

```
PATCH /api/orders/:id
```

```json
{
  "status": "preparing"
}
```

### Status Values

* created
* to_cook
* preparing
* completed

---

## 🟣 7. PAYMENT

### Request

```
POST /api/payments
```

```json
{
  "orderId": "o123",
  "method": "UPI"
}
```

### Response

```json
{
  "paymentId": "pay123",
  "status": "success"
}
```

---

## 🧾 8. ORDER AFTER PAYMENT

### Expected Update

```json
{
  "orderId": "o123",
  "status": "paid"
}
```

---

## ⚡ NOTES

* No authentication required (hackathon simplification)
* Use dummy data initially
* Focus on flow, not perfection
