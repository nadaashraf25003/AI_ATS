import jwt from 'jsonwebtoken';
import Company from '../models/Company.js';


export const protectCompany = async (req, res, next) => {
    console.log("TOKEN RECEIVED IN BACKEND:", req.headers.token);
    console.log("🔥 protectCompany called");
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, Login Again' });
    }

    // 🛡️ Bypass for Mock Admin Token (Testing/Demo)
    if (token === "adminToken") {
        req.adminId = "ADMIN_ID_MOCK"; // إضافة معرف للأدمن
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.id) {
            return res.status(400).json({ success: false, message: 'Invalid token, no companyId found' });
        }

        req.company = await Company.findById(decoded.id).select('-password');
        req.companyId = decoded.id;   // ← ← إضافة مهمة جدًا

        if (!req.company) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(401).json({ success: false, message: error.message || 'Invalid or expired token' });
    }
};
