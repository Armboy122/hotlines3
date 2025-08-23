# วิธีการเพิ่มเมนูใหม่

เมื่อต้องการเพิ่มเมนูใหม่ ให้แก้ไขแค่ไฟล์เดียว: `src/config/navigation.ts`

## ตัวอย่างการเพิ่มเมนู "รายงาน"

```typescript
export const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "รายงานงาน",
    mobileLabel: "เพิ่ม",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/list",
    label: "รายการงาน",
    mobileLabel: "รายการ",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/admin",
    label: "จัดการข้อมูล",
    mobileLabel: "จัดการ",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  // ✅ เพิ่มเมนูใหม่ที่นี่
  {
    href: "/reports",
    label: "รายงาน",
    mobileLabel: "รายงาน", 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  }
];
```

## คุณสมบัติพิเศษ

### 1. เมนูเฉพาะ Mobile หรือ Desktop
```typescript
{
  href: "/mobile-only",
  label: "เฉพาะ Mobile",
  mobileOnly: true,  // จะแสดงแค่ใน mobile navbar
  icon: <YourIcon />
},
{
  href: "/desktop-only", 
  label: "เฉพาะ Desktop",
  desktopOnly: true,  // จะแสดงแค่ใน desktop header
}
```

### 2. ป้ายชื่อต่างกันระหว่าง Mobile และ Desktop
```typescript
{
  href: "/long-name",
  label: "ชื่อยาวสำหรับ Desktop",
  mobileLabel: "สั้น",  // ใช้ชื่อสั้นใน mobile
  icon: <YourIcon />
}
```

## ผลลัพธ์
- เมนูจะปรากฏใน **Desktop Header** (บนหน้าจอ)
- เมนูจะปรากฏใน **Mobile Navbar** (ล่างหน้าจอ)
- Active state จะทำงานอัตโนมัติ
- Responsive design ทำงานได้ทันที

**ไม่ต้องแก้ไขไฟล์อื่น!** 🎉
