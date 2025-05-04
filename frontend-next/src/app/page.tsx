import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">
          Quản lý chế độ ăn thông minh
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Ứng dụng giúp bạn quản lý chế độ ăn và nhận tư vấn từ chatbot AI
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link 
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </Link>
          <Link 
            href="/register"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đăng ký
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-3">Theo dõi bữa ăn</h3>
            <p className="text-gray-600">Ghi lại và quản lý các bữa ăn hàng ngày</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-3">Tư vấn dinh dưỡng</h3>
            <p className="text-gray-600">Nhận tư vấn từ chatbot AI về chế độ ăn</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-3">Báo cáo thống kê</h3>
            <p className="text-gray-600">Theo dõi tiến độ và kết quả</p>
          </div>
        </div>
      </div>
    </div>
  )
}
