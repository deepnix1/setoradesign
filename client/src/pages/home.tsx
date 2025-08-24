import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Earn High Yields on
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Intuition</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Stake your tokens in our optimized farming pools and earn up to 124% APY with secure, automated reward distribution.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="outline" className="px-4 py-2">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Chain ID: 13579
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              3 Active Pools
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              $2.6M TVL
            </Badge>
          </div>
        </div>

        {/* Featured Pools */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Featured Farming Pools
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">INTU-ETH LP</CardTitle>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Hot 🔥
                  </Badge>
                </div>
                <CardDescription>Liquidity Provider Token</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">APY</span>
                    <span className="text-2xl font-bold text-green-600">124.50%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">TVL</span>
                    <span className="font-semibold">$486K</span>
                  </div>
                  <Button className="w-full mt-4" data-testid="button-stake-intu-eth">
                    Stake Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">INTU-USDC LP</CardTitle>
                  <Badge variant="secondary">Stable</Badge>
                </div>
                <CardDescription>Stable Pair Liquidity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">APY</span>
                    <span className="text-2xl font-bold text-green-600">89.20%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">TVL</span>
                    <span className="font-semibold">$1.23M</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline" data-testid="button-stake-intu-usdc">
                    Stake Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">INTU Single</CardTitle>
                  <Badge variant="outline">Simple</Badge>
                </div>
                <CardDescription>Single Asset Staking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">APY</span>
                    <span className="text-2xl font-bold text-green-600">67.80%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">TVL</span>
                    <span className="font-semibold">$892K</span>
                  </div>
                  <Button className="w-full mt-4" variant="outline" data-testid="button-stake-intu-single">
                    Stake Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Platform Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">$2.6M</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Value Locked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">93.83%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average APY</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Farms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">1,247</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Farmers</div>
            </div>
          </div>
        </div>

        {/* Network Status */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Network Status
              </CardTitle>
              <CardDescription>All systems operational on Intuition testnet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-green-500 text-xl">✅</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">API Health</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-green-500 text-xl">🌐</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Network</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-green-500 text-xl">🏊</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Pools</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-green-500 text-xl">📊</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Analytics</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}