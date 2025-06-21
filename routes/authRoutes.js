const express = require('express');
const router = express.Router(); // ใช้ express.Router()
const authController = require('../controllers/authController'); // นำเข้า Controller
const authMiddleware = require('../middleware/authMiddleware'); // นำเข้า Middleware

// Route สำหรับการลงทะเบียน
router.post('/register', authController.register);

// Route สำหรับการเข้าสู่ระบบ
router.post('/login', authController.login);

// Route สำหรับดึงโปรไฟล์ (Protected - ต้องมี JWT Token)
router.get('/profile', authMiddleware, authController.getProfile);

router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;