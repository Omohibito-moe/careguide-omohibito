import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Product Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">ケアガイド</h1>
          <p className="text-sm text-gray-500">もしもナビ統合版</p>
        </div>

        {/* Catchcopy */}
        <div className="space-y-3">
          <p className="text-xl text-gray-700 leading-relaxed">
            介護の始まりで迷わない。
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            流れ・タスク・相談先がひと目でわかる
            <span className="font-semibold text-blue-700">&ldquo;介護の地図帳&rdquo;</span>
          </p>
        </div>

        {/* 2 CTAs */}
        <div className="pt-4 space-y-4">
          <Link
            href="/diagnosis"
            className="block w-full max-w-xs mx-auto px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            今、困っている
          </Link>
          <p className="text-xs text-gray-400">2問で「次の一手」が分かります（30秒）</p>

          <Link
            href="/preparedness"
            className="block w-full max-w-xs mx-auto px-8 py-4 text-base font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors border border-gray-200"
          >
            将来に備えたい
          </Link>
          <p className="text-xs text-gray-400">家族の「もしも」に備える診断（5分）</p>
        </div>

        {/* Sub info */}
        <div className="pt-6 space-y-2 text-sm text-gray-400">
          <p>登録不要・無料でご利用いただけます</p>
        </div>
      </div>
    </main>
  );
}
