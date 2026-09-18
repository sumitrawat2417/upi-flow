import { Activity } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100">
        <div className="mx-auto bg-primary-100 text-primary-600 h-16 w-16 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Activity size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">UPI Flow</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The scaffolding is complete! Tailwind CSS is working perfectly, and all dependencies are installed.
        </p>
        <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl w-full transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg">
          Zapp Zapp! ⚡️
        </button>
      </div>
    </div>
  )
}

export default App;
