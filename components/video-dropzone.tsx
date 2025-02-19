"use client"

import type React from "react"

import { useCallback, useState, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import FileItem from "./file-item"

interface VideoDropzoneProps {
  onFilesAdded: (files: File[]) => void
  files: File[]
}

interface FileError {
  file: string
  error: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_DURATION = 11 // 11 seconds (allowing a small margin)

export default function VideoDropzone({ onFilesAdded, files }: VideoDropzoneProps) {
  const [errors, setErrors] = useState<FileError[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const processFiles = async (newFiles: File[]) => {
    setIsProcessing(true)
    setErrors([])
    const processedFiles = [...files]
    const newErrors: FileError[] = []

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push({ file: file.name, error: "File exceeds the 50MB size limit." })
        continue
      }

      try {
        const duration = await checkVideoDuration(file)
        if (duration > MAX_DURATION) {
          newErrors.push({ file: file.name, error: "File exceeds the 10 second duration limit." })
          continue
        }

        processedFiles.push(file)
      } catch (e) {
        newErrors.push({ file: file.name, error: "Error processing file." })
      }
    }

    if (processedFiles.length > 5) {
      newErrors.push({ file: "Multiple files", error: "You can only upload a maximum of 5 files." })
    } else {
      onFilesAdded(processedFiles)
    }

    setErrors(newErrors)
    setIsProcessing(false)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    processFiles(acceptedFiles)
  }, []) // Corrected dependency

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [".mp4"],
    },
    maxFiles: 5,
    noClick: true, // Disable click on the dropzone
  })

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(Array.from(event.target.files))
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (fileToRemove: File) => {
    onFilesAdded(files.filter((file) => file !== fileToRemove))
  }

  const retryFailedUploads = () => {
    const failedFiles = errors.map((error) => files.find((file) => file.name === error.file)).filter(Boolean) as File[]
    processFiles(failedFiles)
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-primary/50 ${isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
      >
        <input {...getInputProps()} />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="video/mp4"
          multiple
          className="hidden"
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Drag & drop MP4 files here, or click the button below to select files
        </p>
        <p className="mt-1 text-xs text-gray-500">(Max 5 files, {5 - files.length} remaining)</p>
        <p className="mt-1 text-xs text-gray-500">Max file size: 50MB, Max duration: 10 seconds</p>
        <Button onClick={handleButtonClick} type="button" className="mt-4">
          Select Files
        </Button>
      </div>
      {isProcessing && (
        <div className="mt-4 flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Processing files...</span>
        </div>
      )}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errors occurred during file processing</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              {errors.map((error, index) => (
                <li key={index}>{`${error.file}: ${error.error}`}</li>
              ))}
            </ul>
            <Button onClick={retryFailedUploads} variant="outline" className="mt-2">
              Retry Failed Uploads
            </Button>
          </AlertDescription>
        </Alert>
      )}
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

