const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (token == null) {
        return res.sendStatus(401); // Unauthorized: ไม่มี Token
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // Token ไม่ถูกต้อง, หมดอายุ, หรือถูกแก้ไข
            return res.sendStatus(403); // Forbidden
        }
        req.user = user; // เก็บข้อมูลผู้ใช้จาก Token ไว้ใน Request
        next(); // ไปยัง Controller ถัดไป
    });
};

module.exports = authenticateToken;