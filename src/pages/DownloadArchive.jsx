import { Download, FileText, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DownloadArchive() {
  const navigate = useNavigate();

  const handleDownload = async () => {
    try {
      // Fetch the file content
      const response = await fetch('/docs/PROMPT_HISTORY_ARCHIVE.md');
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'PROMPT_HISTORY_ARCHIVE.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main card */}
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-xl">
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Prompt Archive
            </h1>
            <p className="text-sm text-muted-foreground">
              Download the complete build history and system prompts for this project.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">File:</span> PROMPT_HISTORY_ARCHIVE.md
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">Type:</span> Markdown (1.7 KB)
            </p>
          </div>

          <Button
            onClick={handleDownload}
            className="w-full gap-2 h-12 bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4" />
            Download Archive
          </Button>

          <p className="text-xs text-muted-foreground">
            One-click download. No signup required.
          </p>
        </div>
      </div>
    </div>
  );
}