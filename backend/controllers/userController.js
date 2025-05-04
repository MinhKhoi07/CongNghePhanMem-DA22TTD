const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Đăng ký người dùng mới
exports.register = async (req, res) => {
    try {
        const { username, email, password, height, weight, age, gender, activityLevel, dietaryPreferences } = req.body;
        
        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Tạo người dùng mới
        const user = new User({
            username,
            email,
            password,
            height,
            weight,
            age,
            gender,
            activityLevel,
            dietaryPreferences
        });

        await user.save();

        // Tạo token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm người dùng
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Lấy thông tin người dùng
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
};

// Cập nhật thông tin người dùng
exports.updateUserProfile = async (req, res) => {
    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile', error: error.message });
    }
}; 