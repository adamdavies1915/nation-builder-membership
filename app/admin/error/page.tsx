export default function AuthError() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-500">Authentication Failed</h1>
      <p>There was a problem connecting to NationBuilder.</p>
      <a href="/api/auth" className="mt-4 inline-block text-blue-500 hover:underline">Try again</a>
    </div>
  )
}