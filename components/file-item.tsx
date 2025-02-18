"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { X, File, Clock } from "lucide-react"

interface FileItemProps {
  file: File
  onRemove: (file: File) => void
}

export function FileItem({ file, onRemove }: FileItemProps) {
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        {thumbnail && (
          <Image
            src={thumbnail || "/placeholder.svg"}
            alt={file.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium truncate">{file.name}</h3>
          <button
            onClick={() => onRemove(file)}
            className="text-red-500 hover:text-red-700"
            aria-label={`Remove ${file.name}`}
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <File size={14} className="mr-1" />
          <span>{file.type}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</div>
        {duration !== null && (
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <Clock size={14} className="mr-1" />
            <span>{formatDuration(duration)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

