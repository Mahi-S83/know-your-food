import Scanner from './Scanner'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <h1 className="text-3xl font-extrabold text-center text-green-700 mb-2">knowYourFood</h1>
      <p className="text-center text-gray-500 mb-8">AI-Powered Ingredient Analysis</p>
      
      <Scanner />
    </div>
  )
}

export default App