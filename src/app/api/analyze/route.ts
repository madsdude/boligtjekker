import { NextRequest, NextResponse } from 'next/server';
import { AiService } from '@/lib/ai-service';
import { supabase } from '@/lib/supabase';


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];
        const userId = formData.get('userId') as string | null;

        // Parse metadata
        const fileTypesRaw = formData.get('fileTypes') as string | null;
        const fileTypes = fileTypesRaw ? JSON.parse(fileTypesRaw) : [];

        if (files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // Prepare files for AI Service (Convert to Base64)
        const fileParts: { mimeType: string; data: string; type: string }[] = [];

        files.forEach(async (file, index) => {
            // Note: forEach with async inside doesn't await. We should use for...of loop below.
        });

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64Data = buffer.toString('base64');
            const fileType = fileTypes[i] || 'Ukendt Dokument';

            fileParts.push({
                mimeType: file.type,
                data: base64Data,
                type: fileType // Pass the document type (e.g., "Tilstandsrapport")
            });
        }

        // Call the AI Service with the file data (Native PDF support)
        const report = await AiService.analyzeDocuments(fileParts);

        // Save to Supabase
        const filesMetadata = files.map(f => ({
            id: Math.random().toString(36).substring(7),
            name: f.name,
            size: f.size,
            type: f.type
        }));

        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                address: report.address || 'Ukendt Adresse', // Use extracted address
                files: filesMetadata,
                status: 'completed',
                report: report,
                user_id: userId // Save the user link
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase save error:', error);
            // Fallback: return report so UI at least shows something, though it might fail redirect if expecting ID
            // Ideally we throw, but let's try to return a "virtual" project if DB fails
            return NextResponse.json({
                id: 'temp_' + Date.now(),
                address: 'Ukendt (Ikke gemt)',
                files: filesMetadata,
                status: 'completed',
                createdAt: new Date().toISOString(),
                report: report
            });
        }

        return NextResponse.json(project);


    } catch (error) {
        console.error('Analysis failed:', error);
        return NextResponse.json({
            error: 'Analysis Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
