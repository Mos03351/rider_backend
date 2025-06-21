const express = require('express');
const cors = require('cors'); // ถ้า Frontend และ Backend อยู่คนละ Origin
require('dotenv').config(); // โหลด Environment variables

const db = require('./config/db'); // นำเข้าการเชื่อมต่อ Database
const authRoutes = require('./routes/authRoutes'); // นำเข้า Authentication Routes

const app = express();

// Middleware
app.use(cors()); // เปิดใช้งาน CORS สำหรับการพัฒนา
app.use(express.json()); // สำหรับ Parse JSON body ของ Request
 
// กำหนด Base Route สำหรับ Authentication
app.use('/api/auth', authRoutes); // ทุก route ใน authRoutes จะมี prefix เป็น /api/auth

// ตัวอย่าง Default route
app.get('/', (req, res) => {
    res.send('Rider Backend API is running!');
});

// จัดการ Error ที่ไม่ได้ถูกจับ
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});