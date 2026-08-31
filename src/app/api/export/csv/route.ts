import { NextResponse } from 'next/server';
import { FileService } from '@/core/FileService';
import Papa from 'papaparse';

export async function GET() {
  try {
    const results = await FileService.loadResults();
    
    // Format data for CSV
    const csvData = results.map(lead => ({
      'Name': lead.name || 'N/A',
      'Company': lead.company || 'N/A',
      'Job Title': lead.jobTitle || 'N/A',
      'Email': lead.email || 'N/A',
      'LinkedIn URL': lead.linkedinUrl,
      'Status': lead.status === 'success' && lead.email ? 'Valid' : lead.status === 'success' ? 'No Email' : 'Failed',
      'Processed At': lead.processedAt ? new Date(lead.processedAt).toLocaleString() : 'N/A'
    }));

    // Convert to CSV using PapaParse
    const csvString = Papa.unparse(csvData);

    // Prepend UTF-8 BOM (\uFEFF) to make sure Excel handles special characters correctly
    const bomCsv = '\uFEFF' + csvString;

    return new Response(bomCsv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bulkreach_results.csv"',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error('API export/csv Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
