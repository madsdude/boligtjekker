import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, projectAId, projectBId, data } = body;

        if (!userId || !projectAId || !projectBId || !data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: saved, error } = await supabase
            .from('saved_comparisons')
            .insert({
                user_id: userId,
                project_a_id: projectAId,
                project_b_id: projectBId,
                data: data
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(saved);
    } catch (error: any) {
        console.error('Error saving comparison:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Fetch comparisons with project addresses joined
        // Note: The syntax for joining with specific foreign keys might vary.
        // If this simple join fails, we might need to rely on the foreign key names or just fetch raw.
        // Using explicit foreign key syntax: table!fk_column
        const { data, error } = await supabase
            .from('saved_comparisons')
            .select(`
                *,
                projectA:projects!project_a_id(address),
                projectB:projects!project_b_id(address)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching comparisons:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
