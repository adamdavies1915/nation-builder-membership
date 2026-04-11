import { MembershipChecker } from "@/components/membership-checker"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <MembershipChecker />
      </div>
    </main>
  )
}
