import { MembershipChecker } from "@/components/membership-checker"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Bike Easy Membership</h1>
          <p className="text-gray-500 mt-2">Check your current membership status with Bike Easy</p>
        </div>
        <MembershipChecker />
      </div>
    </main>
  )
}
