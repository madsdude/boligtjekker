'use client';

import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project } from '../types';
import { Button } from './Button';

interface PDFDownloadButtonProps {
    project: Project;
}

export const PDFDownloadButton = ({ project }: PDFDownloadButtonProps) => {
    if (!project.report) return null;

    const handleDownload = () => {
        const report = project.report!; // Safe due to render guard

        const doc = new jsPDF();
        // ... rest of logic relies on report existing
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('Boligtjekker Rapport', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Dato: ${new Date(project.created_at || Date.now()).toLocaleDateString('da-DK')}`, 14, 28);
        doc.text(`Adresse: ${project.address || 'Ukendt adresse'}`, 14, 33);

        // --- Divider ---
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 40, 196, 40);

        // --- Summary ---
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Konklusion', 14, 50);

        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        const splitSummary = doc.splitTextToSize(report.summary, 180);
        doc.text(splitSummary, 14, 60);

        let finalY = 60 + (splitSummary.length * 5) + 10;

        // --- Repairs Table ---
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Fundne Problemer & Udbedringer', 14, finalY);

        finalY += 5;

        // Prepare table data
        const tableBody = report.requiredRepairs.map(repair => [
            repair.priority.toUpperCase(),
            repair.title,
            repair.description,
            repair.estimatedCost > 0 ? `${repair.estimatedCost.toLocaleString('da-DK')} kr.` : 'Kontakt håndværker'
        ]);

        autoTable(doc, {
            startY: finalY,
            head: [['Prioritet', 'Emne', 'Beskrivelse', 'Estimat']],
            body: tableBody,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Blue header
            columnStyles: {
                0: { cellWidth: 25, fontStyle: 'bold' },
                3: { cellWidth: 35, halign: 'right' }
            },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        // Get final Y position after table and add extra padding
        // @ts-ignore
        finalY = doc.lastAutoTable.finalY + 20; // Increased padding from 15 to 20

        // Ensure we don't run off page
        if (finalY > 250) {
            doc.addPage();
            finalY = 20;
        }

        // --- Financial Summary ---
        doc.setFillColor(240, 248, 255); // Light blue box
        doc.rect(14, finalY, 182, 30, 'F');

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Estimeret Totalbudget', 20, finalY + 10);

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185); // Blue color

        const minPrice = report.estimatedBudget.min.toLocaleString('da-DK');
        const maxPrice = report.estimatedBudget.max.toLocaleString('da-DK');
        doc.text(`${minPrice} - ${maxPrice} DKK`, 20, finalY + 20);

        // --- Footer ---
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'italic');
        doc.text('Genereret af Boligtjekker AI. Dette er et estimat og erstatter ikke rådgivning fra byggesagkyndig.', 105, pageHeight - 10, { align: 'center' });

        // Save
        doc.save(`boligtjekker-rapport-${project.id}.pdf`);
    };

    return (
        <Button onClick={handleDownload} variant="primary">
            Download PDF 📄
        </Button>
    );
};
