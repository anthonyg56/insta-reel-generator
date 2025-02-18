"use client"

import type React from "react"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { generateReel } from "@/app/actions"
import VideoDropzone from "./video-dropzone"

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

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage("")

    if (files.length === 0) {
      setMessage("Please select at least one video file.")
      return
    }

    if (prompt.trim() === "") {
      setMessage("Please enter a prompt.")
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
      setMessage("An error occurred while generating the reel.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="videos" className="block text-sm font-medium mb-2">
          Upload MP4 Files (Max 5 files, 50MB each, 10 seconds duration)
        </label>
        <VideoDropzone onFilesAdded={handleFilesAdded} files={files} />
      </div>
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium mb-2">
          Prompt
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt for generating the reel"
          className="w-full"
        />
      </div>
      <SubmitButton />
      {message && (
        <p className={`text-sm ${message.includes("error") ? "text-red-500" : "text-green-500"}`}>{message}</p>
      )}
    </form>
  )
}

