"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { FileItem } from "./file-item"

interface VideoDropzoneProps {
  onFilesAdded: (files: File[]) => void
  files: File[]
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_DURATION = 11 // 11 seconds (allowing a small margin)

export default function VideoDropzone({ onFilesAdded, files }: VideoDropzoneProps) {
  const [error, setError] = useState<string | null>(null)

  const checkVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "metadata"

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }

      video.onerror = (e) => {
        reject("Error loading video file")
      }

      video.src = URL.createObjectURL(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null)
    const newFiles = [...files]

    for (const file of acceptedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} exceeds the 50MB size limit.`)
        continue
      }

      try {
        const duration = await checkVideoDuration(file)
        if (duration > MAX_DURATION) {
          setError(`File ${file.name} exceeds the 10 second duration limit.`)
          continue
        }

        newFiles.push(file)
      } catch (e) {
        setError(`Error processing file ${file.name}: ${e}`)
      }
    }

    if (newFiles.length > 5) {
      setError("You can only upload a maximum of 5 files.")
      return
    }

    onFilesAdded(newFiles)
  }, [files, onFilesAdded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
    },
    maxFiles: 5,
  })

  const removeFile = (fileToRemove: File) => {
    onFilesAdded(files.filter((file) => file !== fileToRemove))
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">Drag & drop MP4 files here, or click to select files</p>
        <p className="mt-1 text-xs text-gray-500">(Max 5 files, {5 - files.length} remaining)</p>
        <p className="mt-1 text-xs text-gray-500">Max file size: 50MB, Max duration: 10 seconds</p>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {files.map((file, index) => (
            <FileItem key={index} file={file} onRemove={removeFile} />
          ))}
        </div>
      )}
    </div>
  )
}

