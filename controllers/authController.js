const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // นำเข้า User Model
require('dotenv').config();

// Logic สำหรับการลงทะเบียน
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'โปรดกรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        // ตรวจสอบว่าอีเมลถูกใช้ไปแล้วหรือยัง
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'อีเมลนี้ถูกใช้แล้ว' });
        }

        // Hash รหัสผ่าน
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // สร้างผู้ใช้ใหม่ใน Database ผ่าน Model
        const userId = await User.create(name, email, hashedPassword);

        res.status(201).json({ message: 'ลงทะเบียนสำเร็จ!', userId: userId });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'เซิร์ฟเวอร์มีข้อผิดพลาด' });
    }
};

// Logic สำหรับการเข้าสู่ระบบ
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'โปรดระบุอีเมลและรหัสผ่าน' });
    }

    try {
        // ดึงผู้ใช้จากอีเมลผ่าน Model
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        // เปรียบเทียบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        // สร้าง JWT Token
        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token: token,
            user: { id: user.id, email: user.email, name: user.name } // <<< ต้องมี user object ตรงนี้
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'เซิร์ฟเวอร์มีข้อผิดพลาด' });
    }
};

// Logic สำหรับการดึงโปรไฟล์ผู้ใช้ (ตัวอย่าง Protected Route)
exports.getProfile = async (req, res) => {
    try {
        // req.user ถูกเพิ่มเข้ามาจาก authMiddleware
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }
        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address_text: user.address_text,
                latitude: user.latitude,
                longitude: user.longitude,
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'เซิร์ฟเวอร์มีข้อผิดพลาด' });
    }
};
exports.updateProfile = async (req, res) => {
    // req.user มาจาก authMiddleware (ข้อมูลจาก JWT Token)
    const userId = req.user.id;
    const { name, email, phone, address_text, latitude, longitude } = req.body; // <<< เพิ่ม

    // ตรวจสอบข้อมูลที่ได้รับ (ตามความเหมาะสม)
    if (!name || !email) {
        return res.status(400).json({ message: 'โปรดระบุชื่อและอีเมล' });
    }

    try {
        // ตรวจสอบว่าอีเมลใหม่มีการซ้ำกับผู้ใช้อื่นหรือไม่ (ยกเว้นตัวผู้ใช้เอง)
        const existingUserWithEmail = await User.findByEmail(email);
        if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
            return res.status(409).json({ message: 'อีเมลนี้ถูกใช้โดยผู้ใช้คนอื่นแล้ว' });
        }

        // อัปเดตข้อมูลผู้ใช้ใน Database ผ่าน Model
        // User.update method ต้องสร้างขึ้นมาใน models/User.js ด้วย
        await User.update(userId, {
            name,
            email,
            phone,
            address_text, // <<< ส่ง
            latitude,     // <<< ส่ง
            longitude,    // <<< ส่ง
        });
        res.json({ message: 'อัปเดตโปรไฟล์สำเร็จ!' });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'เซิร์ฟเวอร์มีข้อผิดพลาด' });
    }
};