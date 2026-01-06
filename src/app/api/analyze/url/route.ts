import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { AiService } from '@/lib/ai-service';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, userId } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        console.log(`Fetching URL: ${url} `);

        // Fetch the HTML content
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText} `);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract relevant content
        // This is a generic extraction strategy. Specialized selectors for Boliga/Boligsiden could be added later.

        // Remove scripts and styles
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();

        const title = $('h1').text().trim() || $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || '';

        // Extract main content - simplistic approach: grab all paragraphs and headers
        let content = '';
        $('h1, h2, h3, h4, p, li').each((_, el) => {
            const text = $(el).text().trim();
            if (text.length > 20) { // Filter out very short snippets
                content += text + '\n';
            }
        });

        const scrapedData = `
Titel: ${title}
URL: ${url}
Beskrivelse: ${description}

Indhold:
${content}
`;

        console.log(`Extracted ${content.length} characters from ${url} `);

        // Analyze using the existing AI Service
        // We treat the text as a "file" with mimeType 'text/plain'
        const report = await AiService.analyzeDocuments([
            {
                mimeType: 'text/plain',
                data: scrapedData,
                type: 'Salgsopstilling (Web)'
            }
        ]);

        // Save to Supabase
        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                address: report.address || title || 'Ukendt Adresse',
                files: [{ name: title || url, type: 'url', size: content.length }],
                status: 'completed',
                report: report,
                user_id: userId
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase save error:', error);
            // Fallback: return virtual project
            return NextResponse.json({
                id: 'temp_' + Date.now(),
                address: report.address || title,
                files: [{ name: title || url, type: 'url', size: content.length }],
                status: 'completed',
                createdAt: new Date().toISOString(),
                report: report
            });
        }

        return NextResponse.json(project);

    } catch (error: any) {
        console.error('Error in URL analysis:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to analyze URL' },
            { status: 500 }
        );
    }
}
