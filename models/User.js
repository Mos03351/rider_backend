const pool = require('../config/db'); // นำเข้า Connection Pool

class User {
    // ดึงข้อมูลผู้ใช้จากอีเมล
    static async findByEmail(email) {
        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0]; // คืนค่าผู้ใช้คนแรกที่พบ (หรือ undefined)
    }

    // สร้างผู้ใช้ใหม่
    static async create(name, email, hashedPassword) {
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        return result.insertId; // คืนค่า ID ของผู้ใช้ที่ถูกสร้างใหม่
    }

    // คุณสามารถเพิ่ม method อื่นๆ เช่น findById, update, delete ได้ที่นี่
    static async findById(id) {
        const [rows] = await pool.execute('SELECT id, name, email,phone,address_text FROM users WHERE id = ?', [id]);
        return rows[0];
    }
    static async update(id, data) {
        // ดึงค่าทั้งหมดออกจาก data object
        const { name, email, phone, address_text, latitude, longitude } = data; // <<< เพิ่ม

        let query = 'UPDATE users SET name = ?, email = ?';
        const params = [name, email];

        // ตรวจสอบแต่ละฟิลด์ก่อนที่จะเพิ่มลงใน query และ params
        // ใช้ !== undefined เพื่อให้สามารถส่งค่าว่าง (empty string '') หรือ null ได้อย่างชัดเจน
        if (phone !== undefined) {
            query += ', phone = ?';
            params.push(phone);
        }
        if (address_text !== undefined) { // <<< เพิ่ม
            query += ', address_text = ?';
            params.push(address_text);
        }
        if (latitude !== undefined) {     // <<< เพิ่ม
            query += ', latitude = ?';
            params.push(latitude);
        }
        if (longitude !== undefined) {    // <<< เพิ่ม
            query += ', longitude = ?';
            params.push(longitude);
        }

        query += ' WHERE id = ?';
        params.push(id);

        console.log('SQL Query for User.update:', query);
        console.log('SQL Params for User.update:', params);
        console.log('Updating user with ID:', id);

        try {
            const [rows] = await pool.execute(query, params);
            if (rows.affectedRows === 0) {
                console.warn('No rows were updated. Check if the user ID exists and if data is actually changing.');
                // คุณอาจเลือกที่จะ throw error หรือส่ง status code พิเศษกลับไป
                // throw new Error('User not found or no changes were made.');
            } else {
                console.log(`Successfully updated ${rows.affectedRows} row(s).`);
            }
        } catch (error) {
            console.error('Error executing update query in User.update:', error);
            throw error; // โยน error กลับไปให้ Controller จัดการ
        }
    }
}

module.exports = User;