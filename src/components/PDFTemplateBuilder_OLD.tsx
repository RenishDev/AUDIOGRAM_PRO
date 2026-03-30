"use client";

import React, { useState, useRef } from 'react';
import { Trash2, Copy, Settings, Download, RotateCcw, Eye, Plus, ChevronDown, GripHorizontal, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const AVAILABLE_ELEMENTS = [
  { type: 'title' as const, label: 'Title', icon: '📝', width: 100, height: 20 },
  { type: 'patient-info' as const, label: 'Patient Info', icon: '👤', width: 90, height: 40 },
  { type: 'chart' as const, label: 'Audiogram Chart', icon: '📊', width: 180, height: 100 },
  { type: 'thresholds' as const, label: 'Hearing Thresholds', icon: '📈', width: 180, height: 40 },
  { type: 'date' as const, label: 'Test Date', icon: '📅', width: 80, height: 20 },
  { type: 'notes' as const, label: 'Clinical Notes', icon: '📝', width: 180, height: 30 },
  { type: 'logo' as const, label: 'Logo/Image', icon: '🖼️', width: 30, height: 30 },
  { type: 'text' as const, label: 'Custom Text', icon: '✏️', width: 50, height: 15 },
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

  // Handle drag move
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

  // Handle resize
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

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!isResizing || !selectedElement) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(20, resizeStart.width + deltaX);
    const newHeight = Math.max(15, resizeStart.height + deltaY);

    const updatedElement = {
      ...selectedElement,
      width: newWidth,
      height: newHeight,
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

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Add element to template
  const addElement = (type: TemplateElement['type'], label: string, width: number, height: number) => {
    const newElement: TemplateElement = {
      id: `el-${Date.now()}`,
      type,
      label,
      x: 10,
      y: 10,
      width,
      height,
      fontSize: type === 'title' ? 24 : 12,
      fontWeight: type === 'title' ? 'bold' : 'normal',
    };

    const updatedTemplate = {
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, newElement],
    };

    setTemplates(
      templates.map(t => (t.id === selectedTemplate.id ? updatedTemplate : t))
    );
    setSelectedTemplate(updatedTemplate);
    toast({
      title: 'Element Added',
      description: `${label} added to template`,
    });
  };

  // Delete element
  const deleteElement = (elementId: string) => {
    const updatedTemplate = {
      ...selectedTemplate,
      elements: selectedTemplate.elements.filter(el => el.id !== elementId),
    };

    setTemplates(
      templates.map(t => (t.id === selectedTemplate.id ? updatedTemplate : t))
    );
    setSelectedTemplate(updatedTemplate);
    setSelectedElement(null);
    toast({
      title: 'Element Deleted',
      description: 'Element removed from template',
    });
  };

  // Reset to default
  const resetTemplate = () => {
    const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate.id);
    if (defaultTemplate) {
      setSelectedTemplate(defaultTemplate);
      setTemplates(
        templates.map(t => (t.id === selectedTemplate.id ? { ...defaultTemplate } : t))
      );
      toast({
        title: 'Template Reset',
        description: 'Template reset to default layout',
      });
    }
  };

  // Create new template
  const createNewTemplate = () => {
    const newTemplate: PDFTemplate = {
      id: `template-${Date.now()}`,
      name: `Custom Template ${templates.length}`,
      isDefault: false,
      pageWidth: 210,
      pageHeight: 297,
      createdAt: new Date().toISOString(),
      elements: [],
    };

    setTemplates([...templates, newTemplate]);
    setSelectedTemplate(newTemplate);
    toast({
      title: 'Template Created',
      description: 'New custom template created',
    });
  };

  // Save template
  const saveTemplate = () => {
    localStorage.setItem('pdf-templates', JSON.stringify(templates));
    toast({
      title: 'Saved',
      description: 'All templates saved successfully',
    });
  };

  // Duplicate template
  const duplicateTemplate = () => {
    const duplicated: PDFTemplate = {
      ...selectedTemplate,
      id: `template-${Date.now()}`,
      name: `${selectedTemplate.name} (Copy)`,
      isDefault: false,
    };

    setTemplates([...templates, duplicated]);
    setSelectedTemplate(duplicated);
    toast({
      title: 'Duplicated',
      description: 'Template duplicated successfully',
    });
  };

  // Export template
  const exportTemplate = () => {
    const data = JSON.stringify(selectedTemplate, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">PDF Template Builder</h1>
        <div className="flex gap-2">
          <Button onClick={createNewTemplate} variant="outline">
            + New Template
          </Button>
          <Button onClick={saveTemplate}>Save All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Templates</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-3 rounded cursor-pointer border-2 transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-500">
                  {template.elements.length} elements
                  {template.isDefault && ' • Default'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas & Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Template Editor</h2>
            <div className="flex gap-2">
              {!selectedTemplate.isDefault && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteElement(selectedElement?.id || '')}
                  disabled={!selectedElement}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={duplicateTemplate}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={resetTemplate}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={exportTemplate}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <Card>
            <CardContent className="p-4">
              <div
                ref={canvasRef}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative bg-white border-4 border-gray-300 cursor-move overflow-hidden"
                style={{
                  width: `${selectedTemplate.pageWidth * 2}px`,
                  height: `${selectedTemplate.pageHeight * 2}px`,
                }}
              >
                {selectedTemplate.elements.map(element => (
                  <div
                    key={element.id}
                    onMouseDown={e => handleDragStart(e, element)}
                    onClick={() => setSelectedElement(element)}
                    className={`absolute border-2 transition-all flex items-center justify-center cursor-move ${
                      selectedElement?.id === element.id
                        ? 'border-blue-500 bg-blue-100'
                        : 'border-gray-400 bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{
                      left: `${element.x * 2}px`,
                      top: `${element.y * 2}px`,
                      width: `${element.width * 2}px`,
                      height: `${element.height * 2}px`,
                    }}
                  >
                    <div className="text-center text-xs font-medium text-gray-600 pointer-events-none">
                      {element.label}
                    </div>

                    {/* Resize Handle */}
                    {selectedElement?.id === element.id && (
                      <div
                        onMouseDown={e => handleResizeStart(e, element)}
                        className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-nwse-resize"
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Elements */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Available Elements</h2>
          <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {AVAILABLE_ELEMENTS.map(el => (
              <Button
                key={el.type}
                onClick={() => addElement(el.type, el.label, el.width, el.height)}
                variant="outline"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <span className="text-lg">{el.icon}</span>
                <span className="text-xs text-center">{el.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Element Properties */}
      {selectedElement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Element Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Position X (mm)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={e => {
                    const updated = { ...selectedElement, x: parseFloat(e.target.value) };
                    setSelectedElement(updated);
                    setTemplates(
                      templates.map(t =>
                        t.id === selectedTemplate.id
                          ? {
                              ...t,
                              elements: t.elements.map(el =>
                                el.id === selectedElement.id ? updated : el
                              ),
                            }
                          : t
                      )
                    );
                  }}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Position Y (mm)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={e => {
                    const updated = { ...selectedElement, y: parseFloat(e.target.value) };
                    setSelectedElement(updated);
                    setTemplates(
                      templates.map(t =>
                        t.id === selectedTemplate.id
                          ? {
                              ...t,
                              elements: t.elements.map(el =>
                                el.id === selectedElement.id ? updated : el
                              ),
                            }
                          : t
                      )
                    );
                  }}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Width (mm)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={e => {
                    const updated = { ...selectedElement, width: parseFloat(e.target.value) };
                    setSelectedElement(updated);
                    setTemplates(
                      templates.map(t =>
                        t.id === selectedTemplate.id
                          ? {
                              ...t,
                              elements: t.elements.map(el =>
                                el.id === selectedElement.id ? updated : el
                              ),
                            }
                          : t
                      )
                    );
                  }}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Height (mm)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={e => {
                    const updated = { ...selectedElement, height: parseFloat(e.target.value) };
                    setSelectedElement(updated);
                    setTemplates(
                      templates.map(t =>
                        t.id === selectedTemplate.id
                          ? {
                              ...t,
                              elements: t.elements.map(el =>
                                el.id === selectedElement.id ? updated : el
                              ),
                            }
                          : t
                      )
                    );
                  }}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
