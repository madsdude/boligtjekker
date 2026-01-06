import { NextRequest, NextResponse } from 'next/server';
import { AiService } from '@/lib/ai-service';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { projectIds } = body;

        if (!projectIds || !Array.isArray(projectIds) || projectIds.length !== 2) {
            return NextResponse.json(
                { error: 'Exactly two project IDs are required' },
                { status: 400 }
            );
        }

        // Fetch both projects from Supabase
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .in('id', projectIds);

        if (error || !projects || projects.length !== 2) {
            return NextResponse.json(
                { error: 'Could not find both projects' },
                { status: 404 }
            );
        }

        const [p1, p2] = projects;

        // Use AI Service to compare them
        const comparison = await AiService.compareProjects(p1.report, p2.report);

        return NextResponse.json({
            projectA: p1,
            projectB: p2,
            comparison: comparison
        });

    } catch (error: any) {
        console.error('Error in Comparison:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to compare projects' },
            { status: 500 }
        );
    }
}
