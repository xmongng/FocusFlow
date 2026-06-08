const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Tuyến đường đăng ký
router.post('/register', authController.register);

// Tuyến đường đăng nhập
router.post('/login', authController.login);

// Tuyến đường đăng nhập bằng Google
router.post('/google-login', authController.googleLogin);

// Tuyến đường yêu cầu khôi phục mật khẩu (Quên mật khẩu)
router.post('/forgot-password', authController.forgotPassword);

// Tuyến đường thực hiện đặt lại mật khẩu mới
router.post('/reset-password', authController.resetPassword);

module.exports = router;
