import ReelGeneratorForm from "@/components/reel-generator-form"

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Video Reel Generator</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Create engaging video reels from your content in seconds
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <ReelGeneratorForm />
      </div>
    </div>
  )
}

