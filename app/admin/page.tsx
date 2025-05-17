// app/admin/page.tsx
export default function AdminPage() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">BikeEasy Admin</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">NationBuilder Connection</h2>
        <p className="mb-4">
          Connect this application to NationBuilder to enable membership verification.
        </p>
        <a 
          href="/api/auth" 
          className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Connect NationBuilder
        </a>
      </div>
    </div>
  )
}