"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, File, Clock, FileVideo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileItemProps {
  file: File
  onRemove: (file: File) => void
  className?: string
}

export default function FileItem({ file, onRemove, className }: FileItemProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file)
    setThumbnail(objectUrl)

    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      setDuration(video.duration)
      URL.revokeObjectURL(video.src)
    }
    video.src = objectUrl

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  // Function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Function to format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg",
      "border border-gray-200 dark:border-gray-700",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="bg-primary/10 p-2 rounded-md">
          <FileVideo className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(file)}
        className="text-gray-500 hover:text-red-600 dark:text-gray-400"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  )
}

