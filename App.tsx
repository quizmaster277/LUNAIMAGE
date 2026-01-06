
import React, { useState, useCallback } from 'react';
import { Button } from './components/Button';
import { VoiceAssistant } from './components/VoiceAssistant';
import { generateImage, editImage } from './services/geminiService';
import { AppMode, GeneratedImage } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('generate');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    if (!prompt.trim()) return;
    setError(null);
    setIsLoading(true);

    try {
      let resultUrl: string | null = null;
      
      if (mode === 'generate') {
        resultUrl = await generateImage(prompt);
      } else if (mode === 'edit' && currentImage) {
        resultUrl = await editImage(prompt, currentImage);
      }

      if (resultUrl) {
        setCurrentImage(resultUrl);
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: resultUrl,
          prompt,
          timestamp: Date.now()
        };
        setGallery(prev => [newImage, ...prev]);
        setPrompt('');
      }
    } catch (err) {
      setError('An error occurred during processing. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = (img: GeneratedImage) => {
    setCurrentImage(img.url);
    setMode('edit');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentImage(event.target?.result as string);
        setMode('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-slate-400">
              Lumina Studio
            </h1>
            <p className="text-xs text-slate-500 font-medium">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button 
            variant={mode === 'generate' ? 'primary' : 'ghost'} 
            onClick={() => setMode('generate')}
            className="text-sm px-3 py-1.5"
          >
            Create
          </Button>
          <Button 
            variant={mode === 'edit' ? 'primary' : 'ghost'} 
            onClick={() => setMode('edit')}
            className="text-sm px-3 py-1.5"
          >
            Edit
          </Button>
          <Button 
            variant={mode === 'gallery' ? 'primary' : 'ghost'} 
            onClick={() => setMode('gallery')}
            className="text-sm px-3 py-1.5"
          >
            Gallery
          </Button>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Canvas/Gallery */}
        <div className="flex-1 flex flex-col gap-6">
          {mode === 'gallery' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.length === 0 ? (
                <div className="col-span-full h-64 glass rounded-3xl flex flex-col items-center justify-center text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Your creations will appear here</p>
                </div>
              ) : (
                gallery.map(img => (
                  <div 
                    key={img.id} 
                    className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer ring-1 ring-white/10 hover:ring-indigo-500 transition-all"
                    onClick={() => selectFromGallery(img)}
                  >
                    <img src={img.url} alt={img.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                      <p className="text-xs text-white line-clamp-2">{img.prompt}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="aspect-square w-full max-w-2xl mx-auto glass rounded-3xl overflow-hidden flex items-center justify-center relative shadow-2xl group">
                {currentImage ? (
                  <>
                    <img src={currentImage} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = currentImage;
                          link.download = `lumina-${Date.now()}.png`;
                          link.click();
                        }}
                        className="bg-black/50 backdrop-blur-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-500">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-center px-8">Enter a prompt below to generate your first masterpiece or upload an image to edit</p>
                    <label className="cursor-pointer">
                      <Button variant="secondary" className="pointer-events-none">Upload Image</Button>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </div>
                )}
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-200 font-medium animate-pulse">
                      {mode === 'generate' ? 'Imagining...' : 'Processing your edits...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Interaction Bar */}
              <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
                <div className="relative group">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'generate' ? "A cyberpunk cat riding a motorcycle in rain-slicked Tokyo streets..." : "Make the lighting warmer and add a retro film filter..."}
                    className="w-full glass bg-slate-900/50 rounded-2xl p-4 pr-16 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none h-28"
                  />
                  <div className="absolute bottom-4 right-4">
                    <Button 
                      onClick={handleAction} 
                      isLoading={isLoading}
                      disabled={!prompt.trim() || (mode === 'edit' && !currentImage)}
                      className="h-10 w-10 p-0 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </Button>
                  </div>
                </div>
                {error && <p className="text-rose-400 text-sm px-2">● {error}</p>}
                
                {mode === 'edit' && currentImage && (
                  <div className="flex justify-between items-center px-2">
                    <p className="text-xs text-slate-400">Targeting current image for modification</p>
                    <button onClick={() => setCurrentImage(null)} className="text-xs text-rose-400 hover:text-rose-300">Clear Canvas</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tips & Styles */}
        <aside className="lg:w-80 flex flex-col gap-6">
          <section className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Quick Presets
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Photorealistic', 'Cyberpunk', 'Impressionist', 'Studio Ghibli', 'Synthwave', 'Vintage Film'].map(style => (
                <button 
                  key={style}
                  onClick={() => setPrompt(prev => prev + (prev ? ', ' : '') + style)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-white/5"
                >
                  {style}
                </button>
              ))}
            </div>
          </section>

          <section className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-100">Editing Ideas</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2">
                <span className="text-indigo-400">✦</span>
                "Add a retro VHS grain filter"
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">✦</span>
                "Change the sky to a sunset"
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">✦</span>
                "Make it look like a pencil sketch"
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400">✦</span>
                "Replace the background with Mars"
              </li>
            </ul>
          </section>

          <section className="glass rounded-2xl p-5 border-indigo-500/20 bg-indigo-500/5">
            <h3 className="font-semibold text-indigo-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Did you know?
            </h3>
            <p className="text-xs text-indigo-200/70 mt-2 leading-relaxed">
              You can talk to our voice assistant while you work! Ask for inspiration or feedback on your current canvas.
            </p>
          </section>
        </aside>
      </main>

      {/* Voice Assistant - Floating Component */}
      <VoiceAssistant />

      <footer className="py-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; 2024 Lumina Creative Studio. All creative rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
