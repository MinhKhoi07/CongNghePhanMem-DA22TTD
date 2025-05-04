'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Meal {
  _id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  date: string
}

export default function EditMeal({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState<Meal>({
    _id: '',
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    date: new Date().toISOString().split('T')[0]
  })
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/meals/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setFormData({
            ...data,
            date: new Date(data.date).toISOString().split('T')[0]
          })
        } else {
          setError('Không thể tải thông tin bữa ăn')
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu')
      }
    }

    fetchMeal()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/meals/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.message || 'Có lỗi xảy ra khi cập nhật bữa ăn')
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bữa ăn này?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/meals/${params.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          router.push('/dashboard')
        } else {
          const data = await response.json()
          setError(data.message || 'Có lỗi xảy ra khi xóa bữa ăn')
        }
      } catch (err) {
        setError('Có lỗi xảy ra, vui lòng thử lại')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa bữa ăn</h2>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tên bữa ăn
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Ngày
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700">
                Calories
              </label>
              <input
                type="number"
                name="calories"
                id="calories"
                required
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.calories}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="protein" className="block text-sm font-medium text-gray-700">
                Protein (g)
              </label>
              <input
                type="number"
                name="protein"
                id="protein"
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.protein}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">
                Carbs (g)
              </label>
              <input
                type="number"
                name="carbs"
                id="carbs"
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.carbs}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="fat" className="block text-sm font-medium text-gray-700">
                Fat (g)
              </label>
              <input
                type="number"
                name="fat"
                id="fat"
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.fat}
                onChange={handleChange}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Xóa
              </button>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 