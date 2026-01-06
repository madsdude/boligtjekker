# Boligtjekker AI - Fremtidsplan & Roadmap 🚀

Dette dokument beskriver de næste skridt for at gøre Boligtjekker AI til en fuldt funktionel tjeneste.

## 🟢 Fase 1: Motoren (Nuværende Fokus)
Få systemet til at virke med rigtige data i stedet for test-data.

- [x] **PDF Læsning**: Systemet kan nu åbne og udtrække tekst fra uploadede filer.
- [x] **AI Forbindelse ("Hjernen")**:
    - [x] Opret en API-nøgle hos OpenAI (ChatGPT) eller Google Gemini.
    - [x] **Opgradering til Native PDF**:
        - [x] Fjern ineffektiv `pdf-parse` tekst-udtrækning.
        - [x] Opdater `src/lib/ai-service.ts` til at sende PDF-filer direkte til Gemini (Multimodal).
        - [x] Opdater `route.ts` til at håndtere fil-buffers.
    - [x] Skriv en "System Prompt" (instruks) der lærer AI'en at være byggesagkyndig.

## � Fase 2: Hukommelse (Database)
Lige nu gemmes rapporter kun i browseren. Hvis du sletter din historik, forsvinder de.

- [x] **Opret Database**: (Supabase implementeret kode-mæssigt).
- [x] **Gem Projekter**: Når en analyse er færdig, gemmes den i skyen.
- [ ] **Deling**: Gør det muligt at sende et link til rapporten til andre (f.eks. kæresten eller banken).


## 🟢 Fase 3: Brugere & Betaling
Gør det til en forretning.


- [x] **Brugerlogin**: "Min side" med oversigt over alle analyserede huse.

## 🟢 Fase 4: Avanceret Analyse (Færdig)
Gør AI'en endnu klogere.

- [x] **Billedanalyse**: Lær AI'en at kigge på billeder i tilstandsrapporten (f.eks. revner i muren).
- [-] **Lovgivning & Servitutter**: (Sprunget over)
- [-] **Markedstjek**: (Sprunget over)

## � Fase 5: Tillid & UX (Færdig)
Før vi beder om penge, skal brugeren føle sig tryg og forstå produktet.

- [x] **Trust & Sikkerhed (HØJ PRIORITET)**:
    - [x] "GDPR Compliant" & "Krypteret forbindelse" badges ved upload.
    - [x] Tydelig tekst om data-sletning ("Dine filer gemmes ikke").
    - [x] "Om os" / Kontakt information i footer for troværdighed (Email link).
    - [x] Opret dedikerede sider: "Om os" og "Privatlivspolitik".
- [x] **Gennemsigtighed & Pris**:
    - [x] Tydelig kommunikation om pris *før* upload (Gratis vs. Premium).
    - [x] Fjern "Bait-and-switch" frygt.
- [x] **Design & Tilgængelighed**:
    - [x] **Højere Kontrast**: Gør "Boligtjekker AI" overskrift hvid/lysere.
    - [x] Tydeligere hjælpetekster (højere kontrast).
    - [x] "Sådan virker det" sektion (3 trin) på forsiden.
- [ ] **Mobil & Input**:
    - [ ] Mulighed for at indsætte URL (Boliga/Boligsiden) i stedet for fil-upload (Mobil-venlighed).

## � Fase 6: Monetarisering (Nuværende Fokus)
Nu er produktet troværdigt nok til at sælge.

- [x] **Betalingsmur Implementering**:
    - [x] Opret "Premium Lock" komponent på rapportsiden.
    - [x] Slør/skjul sektionerne 4-10 for gratis brugere.
    - [x] Implementer "Køb Fuld Rapport" knap (Stripe Integration færdig).
    - [x] **Domæne & Sikkerhed (Live)**:
        - [x] Køb og opsæt `boligtjekker.dk`.
        - [x] Implementer HTTPS via Caddy (Reverse Proxy).
        - [x] Opdater alle redirects (Supabase/Stripe) til nyt domæne.

## 🟢 Fase 7: Næste Skridt (Fokus Nu) 🚀
Fokus på tilgængelighed og kvalitetssikring.

- [ ] **Mobil & URL Input (Høj Prioritet)**:
    - [ ] Lav input-felt til URL på forsiden (UI oprettet, mangler logik).
    - [ ] Implementer "Scraper" der henter salgsopstilling fra linket.
    - [ ] **Hent Billeder**: Scraperen skal også hente galleriet, så AI'en kan tjekke for visuelle skader (revner, fugt).
    - [ ] Gør det muligt at bruge Boligtjekker uden at have en PDF-fil klar.

- [x] **Sammenligning af Huse (Færdig)**:
    - [x] Mulighed for at vælge 2 projekter på dashboardet.
    - [x] Generer en "Vs." rapport: Hvilket hus er i bedst stand?
    - [x] Sammenlign estimerede udbedringsomkostninger direkte.
    - [x] **Økonomi**: Inkluder priser, ejerudgift og m²-pris.
    - [x] **Gem**: Mulighed for at gemme og genfinde sammenligninger.

## 🟡 Fase 8: Fremtiden (Post-Launch)
- [ ] **Markedsføring & SEO**:
    - [ ] Opret blog/indhold for at tiltrække trafik.
    - [ ] Google Ads / Facebook Ads kampagner.
- [ ] **Avanceret Analyse**:
    - [ ] Billedanalyse af plantegninger.
    - [ ] Tjek for lokalplaner og servitutter.

- [ ] **System Test & Polering**:
    - [ ] **Stress Test**: Hvad sker der hvis 2 brugere uploader samtidig?
    - [ ] **Fejlhåndtering**: Pænere beskeder hvis PDF er korrupt eller betaling fejler.
    - [ ] **Mobil-test**: Tjek at "Lås op" knappen og rapporter ser godt ud på en telefon.
    - [ ] **Smart Login**: Sørg for at den originale fane opdaterer automatisk, når man klikker på login-linket i en ny fane (Magic Link UX).

---

## 🛠 Teknisk Gæld / Vedligehold
Ting der skal fikses for at siden kører stabilt.

- **Bedre Håndtering af Store Filer**: Sikr at meget store PDF'er ikke crasher serveren.
- **Sikkerhed**: Begræns hvor mange filer en bruger kan uploade (Rate Limiting).
