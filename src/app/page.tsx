export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          HomeMemo
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          百岁照生成功能
        </p>
        <div className="space-y-4">
          <a
            href="/upload"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            开始生成百岁照
          </a>
        </div>
      </div>
    </div>
  )
}
