# Backend TODO - รายการที่ต้องแก้ไขฝั่ง Go Backend

## CRITICAL - ต้องทำก่อน Frontend V3 จะใช้งานได้

### 1. ลงทะเบียน Auth Routes ใน Router
**ไฟล์:** `internal/router/router.go`

โค้ด Auth handler มีอยู่แล้วที่ `internal/handlers/v1/auth.go` แต่ยังไม่ได้ลงทะเบียนใน router

ต้องเพิ่ม:
```
POST /v1/auth/login    -> authHandler.Login
POST /v1/auth/logout   -> authHandler.Logout
POST /v1/auth/refresh  -> authHandler.RefreshToken
GET  /v1/auth/me       -> authHandler.Me (ต้องใช้ RequireAuth middleware)
```

### 2. ลงทะเบียน User Management Routes
**ไฟล์:** `internal/router/router.go`

โค้ด User handler มีอยู่แล้วที่ `internal/handlers/v1/user.go` แต่ยังไม่ได้ลงทะเบียน

ต้องเพิ่ม (ทุก route ต้องใช้ RequireAuth + RequireRole("admin")):
```
GET    /v1/users              -> userHandler.List
GET    /v1/users/:id          -> userHandler.GetByID
POST   /v1/users              -> userHandler.Create
PUT    /v1/users/:id          -> userHandler.Update
DELETE /v1/users/:id          -> userHandler.Delete
PUT    /v1/users/:id/password -> userHandler.ChangePassword
```

### 3. ใช้งาน Auth Middleware กับ Protected Routes
**ไฟล์:** `internal/router/router.go` + `internal/middleware/auth.go`

Middleware มีอยู่แล้ว 3 ตัว:
- `RequireAuth()` - ตรวจ Bearer token
- `RequireRole(roles ...string)` - ตรวจ role (admin/user/viewer)
- `OptionalAuth()` - ตรวจ token แต่ไม่บังคับ

ต้อง apply middleware กับ route groups:
- Public routes: `/health`, `/v1/auth/login`, `/v1/auth/refresh` (ไม่ต้อง auth)
- Protected routes: ทุก CRUD endpoint ต้องใช้ `RequireAuth()`
- Admin routes: User management ต้องใช้ `RequireAuth()` + `RequireRole("admin")`

### 4. สร้าง Admin User คนแรก
ต้องมี script/migration สร้าง admin user เริ่มต้น เพื่อให้ login ได้ครั้งแรก

---

## NICE TO HAVE - ทำภายหลังได้

### 5. CORS Configuration
ปัจจุบัน CORS hardcode `*` (allow all origins) แม้ config.yaml จะกำหนด specific origins ไว้
ควรแก้ให้อ่านจาก config.yaml เพื่อความปลอดภัย

### 6. Register Upload Direct Route (Optional)
มี `UploadDirect` handler แต่ไม่ได้ลงทะเบียน - อาจไม่จำเป็นเพราะใช้ presigned URL อยู่แล้ว
