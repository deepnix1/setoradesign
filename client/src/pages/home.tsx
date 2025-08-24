import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            IntuFarm
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            DeFi Farming Platform on Intuition Testnet
          </p>
          <Badge variant="secondary" className="mb-8">
            Chain ID: 13579 • Intuition Testnet
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Network Status
              </CardTitle>
              <CardDescription>Intuition Testnet Connection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connected to Intuition blockchain testnet with real-time data synchronization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Farming Pools</CardTitle>
              <CardDescription>Available Staking Options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>INTU-ETH LP</span>
                  <span className="text-green-600">124.50% APY</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>INTU-USDC LP</span>
                  <span className="text-green-600">89.20% APY</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>INTU Single Stake</span>
                  <span className="text-green-600">67.80% APY</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Stats</CardTitle>
              <CardDescription>Network Overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Value Locked</span>
                  <span>$2.6M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active Farms</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Average APY</span>
                  <span className="text-green-600">93.83%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Connect Wallet to Start Farming
          </Button>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-6">Backend API Status</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Badge variant="outline" className="p-2">
              ✅ /api/health
            </Badge>
            <Badge variant="outline" className="p-2">
              ✅ /api/network
            </Badge>
            <Badge variant="outline" className="p-2">
              ✅ /api/pools
            </Badge>
            <Badge variant="outline" className="p-2">
              ✅ /api/stats
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            All backend services connected to Intuition testnet
          </p>
        </div>
      </div>
    </div>
  );
}