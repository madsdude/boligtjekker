import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisReport } from '../app/types';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AiService {
  /**
   * Analyzes listing documents using Google Gemini to generate a building inspection report.
   */
  static async analyzeDocuments(files: { mimeType: string; data: string; type: string }[]): Promise<AnalysisReport> {
    console.log(`AiService received ${files.length} files for analysis.`);

    try {
      // Use 'gemini-flash-latest' (Alias for 1.5 Flash) for better free tier stability
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      // Generate a context map for the AI
      const fileContext = files.map((f, i) => `Fil ${i + 1}: [${f.type}]`).join('\n');

      const prompt = `
Du er en erfaren dansk byggesagkyndig. Din opgave er at analysere byggetekniske dokumenter og udarbejde en kort, præcis risikovurdering for en potentiel huskøber.

Dine modtagne dokumenter er organiseret således:
${fileContext}
(Brug denne viden til at forstå konteksten af hver PDF).

Output skal være valid JSON der følger denne struktur nøjagtigt:
{
  "address": "Adressen på ejendommen fundet i dokumenterne (f.eks. 'Strandvejen 1, 9990 Skagen') eller null",
  "summary": "En overordnet, letforståelig konklusion på husets stand baseret på ALLE dokumenter (på dansk).",
  "condition": "En af følgende værdier: 'god', 'middel', 'dårlig', 'kritisk'",
  "requiredRepairs": [
    {
      "id": "1",
      "title": "Kort overskrift på skaden",
      "description": "Forklaring af problemet (Henvis gerne til kilde, f.eks. 'Ifølge Tilstandsrapporten...')",
      "priority": "high" | "medium" | "low",
      "estimatedCost": 0 // Et groft estimat i DKK (kun tal, ingen valuta)
    }
  ],
  "estimatedBudget": {
    "min": 0, // Minimum samlet pris for udbedringer
    "max": 0, // Maksimum samlet pris for udbedringer
    "currency": "DKK"
  },
  "financials": {
    "price": 0, // Kontantpris (hvis fundet)
    "gross": 0, // Ejerudgift pr måned (hvis fundet)
    "sqmPrice": 0 // Pris pr m² (hvis fundet)
  }
}

Instruktioner:
1. Baser KUN din vurdering på det givne materiale (tekst og billeder).
2. Citer konkrete fakta fra teksten hvor muligt.
3. Hvis der er vedhæftet billeder, så analyser dem for synlige skader eller tegn på problemer (f.eks. revner, fugt, skimmel) og nævn dem specifikt.
4. Hvis teksten er tom, uforståelig eller meget kort, så SKRIV DET i resumeet.
5. Gæt IKKE på husets alder eller stand hvis det ikke står i materialet.
6. Svar KUN med JSON.
`;

      const result = await model.generateContent([
        prompt,
        ...files.map(f => {
          if (f.mimeType === 'text/plain') {
            return {
              text: `\n--- DOKUMENT START (${f.type}) ---\n${f.data}\n--- DOKUMENT SLUT ---\n`
            };
          }
          return {
            inlineData: {
              mimeType: f.mimeType,
              data: f.data
            }
          };
        })
      ]);
      const response = await result.response;
      const text = response.text();

      console.log("Gemini Raw Response:", text); // Debugging

      if (!text) {
        throw new Error("Ingen svar fra Gemini AI");
      }

      // Gemini usually returns clean JSON if responseMimeType is set, but good to be safe
      const report = JSON.parse(text) as AnalysisReport;
      return report;

    } catch (error) {
      console.error("Fejl ved AI analyse (Gemini):", error);
      throw error;
    }
  }

  /**
   * Compares two analysis reports and generates a comparison summary.
   */
  static async compareProjects(reportA: AnalysisReport, reportB: AnalysisReport): Promise<any> {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const prompt = `
Du er en erfaren dansk ejendomsmægler og byggesagkyndig. Din opgave er at sammenligne to ejendomme baseret på deres tilstandsrapporter, analyser og økonomi.

HUS A:
Adresse: ${reportA.address}
Pris: ${reportA.financials?.price || 'Ikke oplyst'} DKK
Ejerudgift: ${reportA.financials?.gross || 'Ikke oplyst'} DKK/md
Stand: ${reportA.condition}
Resume: ${reportA.summary}
Estimerede Udbedringer: ${reportA.estimatedBudget.min} - ${reportA.estimatedBudget.max} DKK
Væsentlige Skader: ${JSON.stringify(reportA.requiredRepairs)}

HUS B:
Adresse: ${reportB.address}
Pris: ${reportB.financials?.price || 'Ikke oplyst'} DKK
Ejerudgift: ${reportB.financials?.gross || 'Ikke oplyst'} DKK/md
Stand: ${reportB.condition}
Resume: ${reportB.summary}
Estimerede Udbedringer: ${reportB.estimatedBudget.min} - ${reportB.estimatedBudget.max} DKK
Væsentlige Skader: ${JSON.stringify(reportB.requiredRepairs)}

Output JSON format:
{
  "winner": "A" | "B", // Hvilket hus er det bedste køb når man vægter stand og pris?
  "winnerReason": "Kort forklaring på hvorfor vinderen er et bedre køb. Brug adresserne i stedet for 'Hus A/B' hvor det giver mening.",
  "costDifference": 0, // Forskel i gennemsnitlig udbedringspris (Hus A pris - Hus B pris). Positivt tal betyder A er dyrest at fixe.
  "comparisonPoints": [
    {
      "category": "Tag",
      "p1Score": 8, // 1-10 (10 er bedst)
      "p2Score": 4, 
      "comment": "Hus B har revner i tagpladerne."
    },
    {
      "category": "Økonomi",
      "p1Score": 5,
      "p2Score": 8,
      "comment": "Hus A er væsentligt dyrere i ejerudgift."
    }
  ],
  "recommendation": "En konkluderende anbefaling til køberen der inddrager både stand og økonomi."
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());

    } catch (error) {
      console.error("Fejl ved sammenligning (Gemini):", error);
      throw error;
    }
  }
}
