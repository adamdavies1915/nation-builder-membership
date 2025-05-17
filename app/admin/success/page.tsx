export default function AuthSuccess() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Authentication Successful</h1>
      <p>NationBuilder has been successfully connected.</p>
      <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">Return to home page</a>
    </div>
  )
}