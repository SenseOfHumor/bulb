import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      // Here you would typically upload the file to your backend
      console.log('Uploading file:', file.name);
      // For now, just navigate to projects page
      navigate('/projects');
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                Upload Your Document
              </h1>
              <p className="text-white/70">
                Upload a transcript, document, or notes to get started with AI-powered analysis
              </p>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-sky-400 bg-sky-400/10'
                  : 'border-white/30 hover:border-white/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="text-white">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold mb-2">{file.name}</h3>
                  <p className="text-white/60 mb-4">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={handleUpload}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Process File
                  </button>
                </div>
              ) : (
                <div className="text-white">
                  <div className="text-4xl mb-4">☁️</div>
                  <h3 className="text-lg font-semibold mb-2">
                    Drop your file here
                  </h3>
                  <p className="text-white/60 mb-4">
                    or click to browse
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".txt,.pdf,.docx,.md"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Supported formats: TXT, PDF, DOCX, MD
              </p>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white/70 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
