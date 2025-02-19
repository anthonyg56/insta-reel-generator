"use client"

import type React from "react"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { generateReel } from "@/app/actions"
import VideoDropzone from "./video-dropzone"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Generating..." : "Generate Reel"}
    </Button>
  )
}

export default function ReelGeneratorForm() {
  const [files, setFiles] = useState<File[]>([])
  const [prompt, setPrompt] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage("")
    setError(null)
    setIsLoading(true)

    if (files.length === 0) {
      setError("Please select at least one video file.")
      setIsLoading(false)
      return
    }

    if (prompt.trim() === "") {
      setError("Please enter a prompt.")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("videos", file))
      formData.append("prompt", prompt)

      const result = await generateReel(formData)
      setMessage(result.message)
      if (result.success) {
        setFiles([])
        setPrompt("")
      }
    } catch (error) {
      setError("An error occurred while generating the reel.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <VideoDropzone onFilesAdded={handleFilesAdded} files={files} />

        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-sm font-medium">
            Prompt
          </Label>
          <Textarea
            id="prompt"
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || files.length === 0 || !prompt}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Reel'
        )}
      </Button>
    </form>
  )
}

