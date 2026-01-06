export type AnalysisStatus = 'idle' | 'analyzing' | 'completed' | 'error'; // Basic types based on our initial discussion
export type ConditionLevel = 'god' | 'middel' | 'dårlig' | 'kritisk';

export interface Project {
    id: string;
    address: string;
    files: UploadedFile[];
    status: AnalysisStatus;
    report?: AnalysisReport;
    createdAt: string;
    created_at?: string; // DB field
    user_id?: string;
}

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string; // 'application/pdf', etc.
}

export interface EstimatedBudget {
    min: number;
    max: number;
    currency: string;
}

export interface AnalysisReport {
    address?: string; // New field for extracted address
    summary: string;
    condition: ConditionLevel;
    requiredRepairs: RepairItem[];
    estimatedBudget: EstimatedBudget;
    financials?: {
        price?: number;
        gross?: number; // Ejerudgift
        sqmPrice?: number;
    };
}

export interface RepairItem {
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedCost: number;
}

export interface SavedComparison {
    id: string;
    user_id: string;
    project_a_id: string;
    project_b_id: string;
    data: any;
    created_at: string;
    // Expanded fields for UI convenience (joined)
    projectA?: { address: string };
    projectB?: { address: string };
}
