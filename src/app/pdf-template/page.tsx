"use client";

import React, { Suspense } from 'react';
import { PDFTemplateBuilder } from '@/components/PDFTemplateBuilder';

export default function PDFTemplateBuilderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <PDFTemplateBuilder />
      </Suspense>
    </div>
  );
}
