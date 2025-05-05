import { Button } from "@heroui/button";
import { useState, useCallback } from "react";

interface UploadProps {
  accept?: string;
  onFileUpload: (file: File) => void;
}

const Upload = ({ accept = "image/*,.pdf", onFileUpload }: UploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.removeAttribute("webkitdirectory");
      node.removeAttribute("directory");
      node.removeAttribute("mozdirectory");
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          if (file) {
            handleFiles([file]);
          }
        }
      }
    } else if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    const hasDirectory = fileArray.some(file => {
      return file.name === '' || 
             file.size === 0 || 
             (file as any).webkitRelativePath;
    });

    if (hasDirectory) {
      alert("Silakan unggah file saja, bukan folder.");
      return;
    }

    const validFiles = fileArray.filter(file => {
      return file.name.match(/\.(jpg|jpeg|png|pdf)$/i) || 
             file.type.match("image.*") || 
             file.type === "application/pdf";
    });

    if (validFiles.length > 0) {
      onFileUpload(validFiles[0]);
    } else {
      alert("Format file tidak didukung. Harap unggah gambar (JPG/PNG) atau PDF.");
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
        dragActive ? "border-primary-500 bg-primary-50" : "border-default-300"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file"
        id="file-upload"
        ref={fileInputRef}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept={accept}
        onChange={handleChange}
        multiple={false}
      />
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-default-500">
          {dragActive ? "Lepaskan file di sini" : "Drag & drop file di sini atau klik untuk memilih"}
        </p>
        <Button 
          size="sm" 
          variant="bordered"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('file-upload')?.click();
          }}
        >
          Pilih File
        </Button>
        <p className="text-xs text-default-400">
          Format yang didukung: JPG, PNG, PDF
        </p>
      </div>
    </div>
  );
};

export default Upload;