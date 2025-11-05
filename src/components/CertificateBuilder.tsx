import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Image as FabricImage, IText, Rect } from 'fabric';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Download, Trash2, Type, Image as ImageIcon, Square } from 'lucide-react';
import { toast } from 'sonner';
import sampleCertificate from '@/assets/certificates/gnacops-sample.jpg';

interface CertificateBuilderProps {
  onSave?: (jsonData: string, previewUrl: string) => void;
  initialData?: string;
}

export const CertificateBuilder = ({ onSave, initialData }: CertificateBuilderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 842, // A4 width in pixels at 96 DPI (approx)
      height: 595, // A4 height in pixels at 96 DPI (landscape)
      backgroundColor: '#ffffff',
    });

    // Load initial data if provided
    if (initialData) {
      try {
        canvas.loadFromJSON(initialData, () => {
          canvas.renderAll();
        });
      } catch (error) {
        console.error('Error loading canvas data:', error);
      }
    }

    canvas.on('selection:created', (e: any) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:updated', (e: any) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    setFabricCanvas(canvas);
    toast.success('Certificate builder ready!');

    return () => {
      canvas.dispose();
    };
  }, [initialData]);

  const addText = () => {
    if (!fabricCanvas) return;

    const text = new IText('Double-click to edit', {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: 'Times New Roman',
      fill: '#000000',
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    toast.success('Text field added');
  };

  const addPlaceholder = (placeholder: string) => {
    if (!fabricCanvas) return;

    const text = new IText(`{{${placeholder}}}`, {
      left: 150,
      top: 150,
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#1e40af',
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    fabricCanvas.renderAll();
    toast.success(`${placeholder} placeholder added`);
  };

  const addBackgroundImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricCanvas || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      addBackgroundFromUrl(imgUrl);
    };

    reader.readAsDataURL(file);
  };

  const addBackgroundFromUrl = (imgUrl: string) => {
    if (!fabricCanvas) return;
    FabricImage.fromURL(imgUrl).then((img) => {
      const scale = Math.min(
        fabricCanvas.width! / (img.width || 1),
        fabricCanvas.height! / (img.height || 1)
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: 0,
        top: 0,
        selectable: true,
      });

      fabricCanvas.add(img);
      fabricCanvas.sendObjectToBack(img);
      fabricCanvas.renderAll();
      toast.success('Background image added');
    });
  };

  const addLogoImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!fabricCanvas || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      
      FabricImage.fromURL(imgUrl).then((img) => {
        img.set({
          left: 50,
          top: 50,
          scaleX: 0.2,
          scaleY: 0.2,
          selectable: true,
        });

        fabricCanvas.add(img);
        fabricCanvas.renderAll();
        toast.success('Logo added');
      });
    };

    reader.readAsDataURL(file);
  };

  const addRectangle = () => {
    if (!fabricCanvas) return;

    const rect = new Rect({
      left: 100,
      top: 100,
      fill: 'transparent',
      stroke: '#2563eb',
      strokeWidth: 2,
      width: 200,
      height: 100,
    });

    fabricCanvas.add(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.renderAll();
    toast.success('Rectangle added');
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;

    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      fabricCanvas.remove(...activeObjects);
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      setSelectedObject(null);
      toast.success('Object deleted');
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    toast.success('Canvas cleared');
  };

  const saveTemplate = () => {
    if (!fabricCanvas) return;

    const jsonData = JSON.stringify(fabricCanvas.toJSON());
    const previewUrl = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    if (onSave) {
      onSave(jsonData, previewUrl);
    }

    toast.success('Template saved successfully');
  };

  const downloadPreview = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement('a');
    link.download = 'certificate-preview.png';
    link.href = dataURL;
    link.click();
    toast.success('Preview downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={addText} variant="outline" size="sm">
              <Type className="mr-2 h-4 w-4" />
              Add Text
            </Button>

            <Button onClick={addRectangle} variant="outline" size="sm">
              <Square className="mr-2 h-4 w-4" />
              Add Border
            </Button>

            <div>
              <Label htmlFor="background-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Background
                  </span>
                </Button>
              </Label>
              <input
                id="background-upload"
                type="file"
                accept="image/*"
                onChange={addBackgroundImage}
                className="hidden"
              />
            </div>

            <Button onClick={() => addBackgroundFromUrl(sampleCertificate)} variant="outline" size="sm">
              <ImageIcon className="mr-2 h-4 w-4" />
              Sample Background
            </Button>

            <Button onClick={deleteSelected} variant="destructive" size="sm" disabled={!selectedObject}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            <div className="ml-auto flex gap-2">
              <Button onClick={clearCanvas} variant="outline" size="sm">
                Clear All
              </Button>
              <Button onClick={downloadPreview} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={saveTemplate} variant="cta" size="sm">
                Save Template
              </Button>
            </div>
          </div>

          {/* Placeholders */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Insert Placeholders:</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => addPlaceholder('FULL_NAME')} variant="outline" size="sm">
                Full Name
              </Button>
              <Button onClick={() => addPlaceholder('GNACOPS_ID')} variant="outline" size="sm">
                GNACOPS ID
              </Button>
              <Button onClick={() => addPlaceholder('MEMBERSHIP_TYPE')} variant="outline" size="sm">
                Membership Type
              </Button>
              <Button onClick={() => addPlaceholder('ISSUE_DATE')} variant="outline" size="sm">
                Issue Date
              </Button>
              <Button onClick={() => addPlaceholder('REGION')} variant="outline" size="sm">
                Region
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card>
        <CardContent className="p-6">
          <div className="border border-border rounded-lg overflow-hidden inline-block">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Add text fields for titles and descriptions</li>
            <li>Use placeholders like {`{{FULL_NAME}}`} to automatically insert user data</li>
            <li>Upload a background image or logo to customize your certificate</li>
            <li>Drag and resize elements to position them as needed</li>
            <li>Double-click text to edit content</li>
            <li>Save your template when finished</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};