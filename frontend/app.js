// API URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const dashboard = document.getElementById('dashboard');
const addMealForm = document.getElementById('addMealForm');
const mealsList = document.getElementById('mealsList');

// State
let currentUser = null;
let token = localStorage.getItem('token');

// Event Listeners
loginBtn.addEventListener('click', () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    dashboard.style.display = 'none';
});

registerBtn.addEventListener('click', () => {
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    dashboard.style.display = 'none';
});

document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
document.getElementById('addMealBtn').addEventListener('click', () => {
    addMealForm.style.display = 'block';
});
document.getElementById('mealForm').addEventListener('submit', handleAddMeal);
logoutBtn.addEventListener('click', handleLogout);

// Functions
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            token = result.token;
            localStorage.setItem('token', token);
            currentUser = result.user;
            updateUI();
            loadDashboard();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Đăng nhập thất bại');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        height: parseFloat(formData.get('height')),
        weight: parseFloat(formData.get('weight')),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        activityLevel: formData.get('activityLevel')
    };

    try {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('Đăng ký thất bại');
    }
}

async function handleAddMeal(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        mealType: formData.get('mealType'),
        calories: parseFloat(formData.get('calories')),
        protein: parseFloat(formData.get('protein')),
        carbs: parseFloat(formData.get('carbs')),
        fat: parseFloat(formData.get('fat')),
        description: formData.get('description'),
        date: new Date()
    };

    try {
        const response = await fetch(`${API_URL}/meals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            addMealForm.style.display = 'none';
            loadDashboard();
        } else {
            const result = await response.json();
            alert(result.message);
        }
    } catch (error) {
        console.error('Add meal error:', error);
        alert('Thêm bữa ăn thất bại');
    }
}

async function loadDashboard() {
    try {
        // Load stats
        const statsResponse = await fetch(`${API_URL}/meals/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const stats = await statsResponse.json();
        updateStats(stats);

        // Load meals
        const mealsResponse = await fetch(`${API_URL}/meals`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const meals = await mealsResponse.json();
        displayMeals(meals);
    } catch (error) {
        console.error('Load dashboard error:', error);
    }
}

function updateStats(stats) {
    document.getElementById('calories').textContent = stats.totalCalories;
    document.getElementById('protein').textContent = `${stats.totalProtein}g`;
    document.getElementById('carbs').textContent = `${stats.totalCarbs}g`;
    document.getElementById('fat').textContent = `${stats.totalFat}g`;
}

function displayMeals(meals) {
    mealsList.innerHTML = '';
    meals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        mealCard.innerHTML = `
            <div class="meal-info">
                <h3>${meal.name}</h3>
                <p>${meal.mealType} - ${meal.calories} calories</p>
            </div>
            <div class="meal-actions">
                <button class="delete-btn" onclick="deleteMeal('${meal._id}')">Xóa</button>
            </div>
        `;
        mealsList.appendChild(mealCard);
    });
}

async function deleteMeal(mealId) {
    try {
        const response = await fetch(`${API_URL}/meals/${mealId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadDashboard();
        } else {
            const result = await response.json();
            alert(result.message);
        }
    } catch (error) {
        console.error('Delete meal error:', error);
        alert('Xóa bữa ăn thất bại');
    }
}

function handleLogout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    updateUI();
}

function updateUI() {
    if (token) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        dashboard.style.display = 'block';
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        profileBtn.style.display = 'inline';
        logoutBtn.style.display = 'inline';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        dashboard.style.display = 'none';
        loginBtn.style.display = 'inline';
        registerBtn.style.display = 'inline';
        profileBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

// Initialize
if (token) {
    updateUI();
    loadDashboard();
} 