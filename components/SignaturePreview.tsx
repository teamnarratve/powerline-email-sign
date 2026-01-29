import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import html2canvas from 'html2canvas';

interface SignaturePreviewProps {
  htmlContent: string;
}

export interface PreviewHandle {
  captureImage: () => Promise<Blob | null>;
}

const SignaturePreview = forwardRef<PreviewHandle, SignaturePreviewProps>(({ htmlContent }, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Expose capture functionality to parent
  // Expose capture functionality to parent
  useImperativeHandle(ref, () => ({
    captureImage: async () => {
      if (!iframeRef.current || !iframeRef.current.contentDocument) return null;

      const doc = iframeRef.current.contentDocument;
      // Select the table directly. We know it's the first child of body or we can query it.
      const elementToCapture = doc.querySelector('table'); 

      if (!elementToCapture) {
          console.error("No table found in iframe to capture");
          return null;
      }

      // Ensure all images within the table are loaded
      const images = Array.from(elementToCapture.getElementsByTagName('img')) as HTMLImageElement[];
      
      // DEBUG: Check QR code src
      images.forEach((img: HTMLImageElement) => {
          if (img.alt === 'QR') {
            const srcStart = img.src ? img.src.substring(0, 50) : 'null';
            console.log('QR Code SRC detected:', srcStart + '...');
          }
      });

      await Promise.all(images.map((img: HTMLImageElement) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
              const loadHandler = () => {
                  img.removeEventListener('load', loadHandler);
                  img.removeEventListener('error', loadHandler);
                  resolve();
              };
              img.addEventListener('load', loadHandler);
              img.addEventListener('error', loadHandler);
          });
      }));
      
      // Small delay to ensure rendering is stable
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const canvas = await html2canvas(elementToCapture as HTMLElement, {
            scale: 3, // Increased scale for better quality
            useCORS: true, 
            allowTaint: true, // Allow tainted images (helpful for some data URIs)
            backgroundColor: null, 
            logging: true, // Enable logging for debugging
            // Allow html2canvas to determine size from the element
        });
        
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
        });
      } catch (error) {
        console.error("Image capture failed", error);
        return null;
      }
    }
  }));

  // Update Iframe for Live Preview
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        
        // Adjust height automatically
        const updateHeight = () => {
          if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
            iframe.style.height = '100px'; 
            const newHeight = iframe.contentDocument.documentElement.scrollHeight + 20; // Added extra padding
            iframe.style.height = `${newHeight}px`;
          }
        };

        // Call immediately
        updateHeight();
        
        // Also ensure we wait for images to load inside iframe to get correct height
        const images = doc.getElementsByTagName('img');
        if (images.length > 0) {
            Array.from(images).forEach(img => {
                img.onload = updateHeight;
            });
        }
        
        // Disable scrollbars on body
        doc.body.style.overflow = 'hidden';
      }
    }
  }, [htmlContent]);

  return (
    <div className="w-full bg-white transition-all duration-300">
      
      {/* Visual Preview */}
      <div className="relative">
        <iframe
            ref={iframeRef}
            title="Signature Preview"
            className="w-full border-none block relative z-10"
            sandbox="allow-same-origin allow-scripts"
            scrolling="no"
            style={{ minHeight: '250px', overflow: 'hidden' }} 
        />
        
        {/* Watermark Overlay - Visible in UI, but NOT captured by html2canvas (since it captures iframe content) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="transform -rotate-12 opacity-[0.03] select-none">
                <span className="text-9xl font-black text-slate-900 whitespace-nowrap">PREVIEW</span>
            </div>
        </div>
      </div>

    </div>
  );
});

export default SignaturePreview;