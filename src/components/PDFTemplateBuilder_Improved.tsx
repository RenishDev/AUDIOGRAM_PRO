"use client";

import React, { useState, useRef } from 'react';
import { Trash2, Copy, Download, RotateCcw, Plus, Info, ChevronDown, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TemplateElement {
  id: string;
  type: 'title' | 'patient-info' | 'chart' | 'thresholds' | 'date' | 'notes' | 'logo' | 'text';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
}

interface PDFTemplate {
  id: string;
  name: string;
  elements: TemplateElement[];
  pageWidth: number;
  pageHeight: number;
  isDefault: boolean;
  createdAt: string;
}

const DEFAULT_TEMPLATES: PDFTemplate[] = [
  {
    id: 'default-1',
    name: 'Professional Report',
    isDefault: true,
    pageWidth: 210,
    pageHeight: 297,
    createdAt: new Date().toISOString(),
    elements: [
      { id: '1', type: 'logo', label: 'Logo', x: 10, y: 10, width: 30, height: 30 },
      { id: '2', type: 'title', label: 'Audiogram Report', x: 50, y: 15, width: 100, height: 20, fontSize: 24, fontWeight: 'bold' },
      { id: '3', type: 'patient-info', label: 'Patient Information', x: 10, y: 50, width: 90, height: 40 },
      { id: '4', type: 'date', label: 'Test Date', x: 110, y: 50, width: 80, height: 20 },
      { id: '5', type: 'chart', label: 'Audiogram Chart', x: 10, y: 100, width: 180, height: 100 },
      { id: '6', type: 'thresholds', label: 'Hearing Thresholds', x: 10, y: 210, width: 180, height: 60 },
      { id: '7', type: 'notes', label: 'Notes', x: 10, y: 275, width: 180, height: 15 },
    ],
  },
  {
    id: 'default-2',
    name: 'Compact Summary',
    isDefault: true,
    pageWidth: 210,
    pageHeight: 297,
    createdAt: new Date().toISOString(),
    elements: [
      { id: '1', type: 'title', label: 'Audiogram', x: 10, y: 10, width: 100, height: 15, fontSize: 20, fontWeight: 'bold' },
      { id: '2', type: 'patient-info', label: 'Patient Info', x: 10, y: 30, width: 90, height: 30 },
      { id: '3', type: 'chart', label: 'Chart', x: 10, y: 65, width: 180, height: 80 },
      { id: '4', type: 'thresholds', label: 'Thresholds', x: 10, y: 150, width: 180, height: 40 },
    ],
  },
  {
    id: 'default-3',
    name: 'Detailed Analysis',
    isDefault: true,
    pageWidth: 210,
    pageHeight: 297,
    createdAt: new Date().toISOString(),
    elements: [
      { id: '1', type: 'logo', label: 'Logo', x: 10, y: 10, width: 25, height: 25 },
      { id: '2', type: 'title', label: 'Complete Audiometric Analysis', x: 40, y: 12, width: 150, height: 20, fontSize: 22, fontWeight: 'bold' },
      { id: '3', type: 'patient-info', label: 'Patient Details', x: 10, y: 40, width: 85, height: 50 },
      { id: '4', type: 'date', label: 'Date & Type', x: 105, y: 40, width: 85, height: 50 },
      { id: '5', type: 'chart', label: 'Hearing Curve', x: 10, y: 100, width: 180, height: 90 },
      { id: '6', type: 'thresholds', label: 'Frequency Analysis', x: 10, y: 200, width: 180, height: 50 },
      { id: '7', type: 'notes', label: 'Clinical Notes', x: 10, y: 255, width: 180, height: 35 },
    ],
  },
];

const ELEMENT_PRESETS = [
  { type: 'title' as const, label: 'Title', icon: '📝', width: 100, height: 20, color: '#000' },
  { type: 'patient-info' as const, label: 'Patient Info', icon: '👤', width: 90, height: 40, color: '#333' },
  { type: 'chart' as const, label: 'Chart', icon: '📊', width: 180, height: 100, color: '#666' },
  { type: 'thresholds' as const, label: 'Thresholds', icon: '📈', width: 180, height: 40, color: '#444' },
  { type: 'date' as const, label: 'Date', icon: '📅', width: 80, height: 20, color: '#555' },
  { type: 'notes' as const, label: 'Notes', icon: '📝', width: 180, height: 30, color: '#666' },
  { type: 'logo' as const, label: 'Logo', icon: '🖼️', width: 30, height: 30, color: '#999' },
  { type: 'text' as const, label: 'Text', icon: '✏️', width: 50, height: 15, color: '#000' },
];

export function PDFTemplateBuilder() {
  const [templates, setTemplates] = useState<PDFTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>(DEFAULT_TEMPLATES[0]);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, element: TemplateElement) => {
    setSelectedElement(element);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  // Handle canvas mouse move
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    const maxX = selectedTemplate.pageWidth - selectedElement.width;
    const maxY = selectedTemplate.pageHeight - selectedElement.height;

    const updatedElement = {
      ...selectedElement,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    };

    setSelectedElement(updatedElement);
    setTemplates(
      templates.map(t =>
        t.id === selectedTemplate.id
          ? {
              ...t,
              elements: t.elements.map(el =>
                el.id === selectedElement.id ? updatedElement : el
              ),
            }
          : t
      )
    );
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, element: TemplateElement) => {
    e.stopPropagation();
    setSelectedElement(element);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Add element
  const addElement = (type: TemplateElement['type'], label: string, width: number, height: number) => {
    const newElement: TemplateElement = {
      id: `el-${Date.now()}`,
      type,
      label,
      x: 10,
      y: 10,
      width,
      height,
      fontSize: 12,
      fontWeight: 'normal',
    };

    setTemplates(
      templates.map(t =>
        t.id === selectedTemplate.id
          ? { ...t, elements: [...t.elements, newElement] }
          : t
      )
    );
    setSelectedTemplate({
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, newElement],
    });
    toast({ title: "Element added", description: `Added ${label} to template` });
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    setTemplates(
      templates.map(t =>
        t.id === selectedTemplate.id
          ? { ...t, elements: t.elements.filter(el => el.id !== elementId) }
          : t
      )
    );
    setSelectedTemplate({
      ...selectedTemplate,
      elements: selectedTemplate.elements.filter(el => el.id !== elementId),
    });
    setSelectedElement(null);
    toast({ title: "Element removed", variant: "destructive" });
  };

  // Reset template to default
  const resetTemplate = () => {
    if (selectedTemplate.isDefault) {
      const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate.id);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate);
        setTemplates(templates.map(t => (t.id === selectedTemplate.id ? defaultTemplate : t)));
        toast({ title: "Template reset", description: "Restored to default layout" });
      }
    }
  };

  // Export template
  const exportTemplate = () => {
    const dataStr = JSON.stringify(selectedTemplate, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.name}.json`;
    link.click();
    toast({ title: "Template exported", description: `${selectedTemplate.name}.json` });
  };

  // Duplicate template
  const duplicateTemplate = () => {
    const newTemplate = {
      ...selectedTemplate,
      id: `template-${Date.now()}`,
      name: `${selectedTemplate.name} (Copy)`,
      isDefault: false,
    };
    setTemplates([...templates, newTemplate]);
    toast({ title: "Template duplicated", description: newTemplate.name });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">PDF Template Builder</h1>
          <p className="text-slate-600">Customize your PDF report layouts with drag-and-drop ease</p>
        </div>

        {/* Help Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 ml-2">
            <strong>How to use:</strong> Select a template, drag elements to reposition, or click "+" to add new elements to your layout.
          </AlertDescription>
        </Alert>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Templates & Elements */}
          <div className="space-y-6">
            {/* Templates Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setSelectedElement(null);
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedTemplate.id === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{template.elements.length} elements</div>
                    {template.isDefault && <div className="text-xs text-blue-600 font-medium mt-1">Default</div>}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={duplicateTemplate} className="w-full" variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                </Button>
                {!selectedTemplate.isDefault && (
                  <Button onClick={resetTemplate} className="w-full" variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset
                  </Button>
                )}
                <Button onClick={exportTemplate} className="w-full" variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </CardContent>
            </Card>

            {/* Elements List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Elements on Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedTemplate.elements.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No elements yet</p>
                  ) : (
                    selectedTemplate.elements.map(el => (
                      <button
                        key={el.id}
                        onClick={() => setSelectedElement(el)}
                        className={`w-full p-2 rounded text-left text-sm font-medium transition-all ${
                          selectedElement?.id === el.id
                            ? 'bg-blue-100 text-blue-900 border-2 border-blue-500'
                            : 'bg-slate-100 text-slate-700 border-2 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div>{el.label}</div>
                            <div className="text-xs text-slate-600 mt-1">{el.type}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(el.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Canvas (A4 Page)</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-6 bg-slate-100 rounded-lg">
                <div
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="relative bg-white shadow-2xl"
                  style={{
                    width: '420px',
                    height: '594px',
                    border: '2px solid #ccc',
                  }}
                >
                  {selectedTemplate.elements.map(element => (
                    <div
                      key={element.id}
                      onMouseDown={e => handleDragStart(e, element)}
                      onClick={() => setSelectedElement(element)}
                      className={`absolute border-2 flex items-center justify-center cursor-move transition-all ${
                        selectedElement?.id === element.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                      }`}
                      style={{
                        left: `${element.x * 2}px`,
                        top: `${element.y * 2}px`,
                        width: `${element.width * 2}px`,
                        height: `${element.height * 2}px`,
                      }}
                    >
                      <div className="text-center text-xs font-semibold text-slate-600 pointer-events-none">
                        {element.label}
                      </div>

                      {/* Resize Handle */}
                      {selectedElement?.id === element.id && (
                        <div
                          onMouseDown={e => handleResizeStart(e, element)}
                          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Add Elements & Properties */}
          <div className="space-y-6">
            {/* Add Elements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Element</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {ELEMENT_PRESETS.map(el => (
                    <button
                      key={el.type}
                      onClick={() => addElement(el.type, el.label, el.width, el.height)}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <span className="text-2xl">{el.icon}</span>
                      <span className="text-xs font-medium text-center text-slate-700">{el.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Properties */}
            {selectedElement && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Label</label>
                    <input
                      type="text"
                      value={selectedElement.label}
                      onChange={e => {
                        const updated = { ...selectedElement, label: e.target.value };
                        setSelectedElement(updated);
                        setTemplates(
                          templates.map(t =>
                            t.id === selectedTemplate.id
                              ? { ...t, elements: t.elements.map(el => (el.id === selectedElement.id ? updated : el)) }
                              : t
                          )
                        );
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">X (mm)</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={e => {
                          const updated = { ...selectedElement, x: parseFloat(e.target.value) || 0 };
                          setSelectedElement(updated);
                          setTemplates(
                            templates.map(t =>
                              t.id === selectedTemplate.id
                                ? { ...t, elements: t.elements.map(el => (el.id === selectedElement.id ? updated : el)) }
                                : t
                            )
                          );
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Y (mm)</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={e => {
                          const updated = { ...selectedElement, y: parseFloat(e.target.value) || 0 };
                          setSelectedElement(updated);
                          setTemplates(
                            templates.map(t =>
                              t.id === selectedTemplate.id
                                ? { ...t, elements: t.elements.map(el => (el.id === selectedElement.id ? updated : el)) }
                                : t
                            )
                          );
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Width (mm)</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.width)}
                        onChange={e => {
                          const updated = { ...selectedElement, width: parseFloat(e.target.value) || 20 };
                          setSelectedElement(updated);
                          setTemplates(
                            templates.map(t =>
                              t.id === selectedTemplate.id
                                ? { ...t, elements: t.elements.map(el => (el.id === selectedElement.id ? updated : el)) }
                                : t
                            )
                          );
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Height (mm)</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.height)}
                        onChange={e => {
                          const updated = { ...selectedElement, height: parseFloat(e.target.value) || 20 };
                          setSelectedElement(updated);
                          setTemplates(
                            templates.map(t =>
                              t.id === selectedTemplate.id
                                ? { ...t, elements: t.elements.map(el => (el.id === selectedElement.id ? updated : el)) }
                                : t
                            )
                          );
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => deleteElement(selectedElement.id)}
                    variant="destructive"
                    className="w-full"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Element
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
