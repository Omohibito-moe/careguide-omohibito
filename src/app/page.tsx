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
            2つの質問で、あなたの
            <span className="font-semibold text-blue-700">&ldquo;次の一手&rdquo;</span>
            がわかります。
          </p>
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Link
            href="/diagnosis"
            className="inline-block w-full max-w-xs px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            いまの状況を診断する
          </Link>
          <p className="mt-3 text-sm text-gray-400">所要時間：30秒</p>
        </div>

        {/* Sub info */}
        <div className="pt-8 space-y-2 text-sm text-gray-400">
          <p>登録不要・無料でご利用いただけます</p>
        </div>
      </div>
    </main>
  );
}
