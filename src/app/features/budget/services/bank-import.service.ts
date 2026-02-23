import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ImportedTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  rawData: string[];
  matchedCategory?: string;
  isDuplicate?: boolean;
}

export interface ImportResult {
  success: boolean;
  transactions: ImportedTransaction[];
  totalImported: number;
  totalCredits: number;
  totalDebits: number;
  errors: string[];
}

export interface CsvColumnMapping {
  dateColumn: number;
  descriptionColumn: number;
  amountColumn: number;
  dateFormat: string;
  separator: string;
  hasHeader: boolean;
}

export type BankFormat = 'standard' | 'bnp' | 'sg' | 'credit-agricole' | 'revolut' | 'n26' | 'boursobank' | 'unknown';

@Injectable({
  providedIn: 'root'
})
export class BankImportService {

  private readonly bankPatterns: Record<BankFormat, { patterns: string[]; separator: string; dateFormat: string }> = {
    'bnp': {
      patterns: ['BNP PARIBAS', 'PARIBAS', 'Code des lumineuses'],
      separator: ';',
      dateFormat: 'DD/MM/YYYY'
    },
    'sg': {
      patterns: ['SOCIETE GENERALE', 'Société Générale'],
      separator: ';',
      dateFormat: 'DD/MM/YYYY'
    },
    'credit-agricole': {
      patterns: ['CREDIT AGRICOLE', 'Crédit Agricole'],
      separator: ';',
      dateFormat: 'DD/MM/YYYY'
    },
    'revolut': {
      patterns: ['Revolut', 'Completed Date', 'Paid Out (EUR)'],
      separator: ',',
      dateFormat: 'YYYY-MM-DD'
    },
    'n26': {
      patterns: ['N26', 'Date', 'Payee', 'Amount (EUR)'],
      separator: ',',
      dateFormat: 'YYYY-MM-DD'
    },
    'boursobank': {
      patterns: [' date operation ', ' date valeur '],
      separator: ';',
      dateFormat: 'DD/MM/YYYY'
    },
    'standard': {
      patterns: [],
      separator: ';',
      dateFormat: 'DD/MM/YYYY'
    },
    'unknown': {
      patterns: [],
      separator: ';',
      dateFormat: 'DD/MM/YYYY'
    }
  };

  importCsv(file: File, customMapping?: CsvColumnMapping): Observable<ImportResult> {
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          if (!content) {
            observer.error({ success: false, errors: ['Fichier vide ou illisible'] });
            return;
          }

          const detectedFormat = this.detectBankFormat(content);
          const separator = customMapping?.separator || this.bankPatterns[detectedFormat].separator;
          const lines = content.split('\n').filter(line => line.trim());
          const hasHeader = customMapping?.hasHeader ?? this.hasHeaderRow(lines[0]);
          const startIndex = hasHeader ? 1 : 0;
          const transactions: ImportedTransaction[] = [];
          const errors: string[] = [];

          for (let i = startIndex; i < lines.length; i++) {
            try {
              const line = lines[i];
              const columns = this.parseCsvLine(line, separator);
              if (columns.length < 3) continue;
              const transaction = this.parseTransactionRow(columns, customMapping || this.getDefaultMapping(detectedFormat));
              if (transaction) transactions.push(transaction);
            } catch (error) {
              errors.push(`Ligne ${i + 1}: ${error}`);
            }
          }

          observer.next({
            success: true,
            transactions,
            totalImported: transactions.length,
            totalCredits: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
            totalDebits: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
            errors
          });
          observer.complete();
        } catch (error) {
          observer.error({ success: false, errors: [error instanceof Error ? error.message : 'Erreur inconnue'] });
        }
      };

      reader.onerror = () => observer.error({ success: false, errors: ['Erreur de lecture du fichier'] });
      reader.readAsText(file, 'UTF-8');
    });
  }

  importOfx(file: File): Observable<ImportResult> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          if (!content) {
            observer.error({ success: false, errors: ['Fichier vide ou illisible'] });
            return;
          }

          console.log('📄 OFX parsing started...');
          const transactions = this.parseOfxWithRegex(content);
          console.log(`✅ Found ${transactions.length} transactions`);

          const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
          const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

          observer.next({
            success: true,
            transactions,
            totalImported: transactions.length,
            totalCredits,
            totalDebits,
            errors: transactions.length === 0 ? ['Aucune transaction trouvée'] : []
          });
          observer.complete();
        } catch (error) {
          console.error('❌ OFX import error:', error);
          observer.error({ success: false, errors: [error instanceof Error ? error.message : 'Erreur parsing OFX'] });
        }
      };
      reader.onerror = () => observer.error({ success: false, errors: ['Erreur de lecture du fichier'] });
      reader.readAsText(file, 'UTF-8');
    });
  }

  private parseOfxWithRegex(content: string): ImportedTransaction[] {
    const transactions: ImportedTransaction[] = [];
    console.log('🔍 Starting regex parsing...');

    // Pattern 1: Balises standard <STMTTRN>...</STMTTRN>
    const patterns = [
      { regex: /<STMTTRN\b[^>]*>([\s\S]*?)<\/STMTTRN>/gi, name: 'standard' },
      { regex: /<STMTTRN[^>]*>\s*([\s\S]*?)(?=<STMTTRN|$)/gi, name: 'malformed' }
    ];

    for (const pattern of patterns) {
      const matches = Array.from(content.matchAll(pattern.regex));
      console.log(`🔍 Pattern "${pattern.name}" found ${matches.length} matches`);

      if (matches.length > 0) {
        matches.forEach((match, index) => {
          try {
            const block = match[1];
            const getField = (tagName: string): string => {
              const regexList = [
                new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'),
                new RegExp(`<${tagName}[^>]*>([^<\\n]+)`, 'i'),
                new RegExp(`<${tagName}>([\\s\\S]*?)(?=<[A-Z]|$)`, 'i')
              ];
              for (const regex of regexList) {
                const m = block.match(regex);
                if (m && m[1]) return m[1].trim();
              }
              return '';
            };

            const dtposted = getField('DTPOSTED');
            const trnamt = getField('TRNAMT');
            const name = getField('NAME') || getField('PAYEE');
            const memo = getField('MEMO');

            console.log(`📝 Transaction ${transactions.length}:`, { dtposted: dtposted.substring(0, 20), trnamt, name: name.substring(0, 30) });

            if (!dtposted && !trnamt) return;

            const date = this.parseOfxDate(dtposted);
            const amount = parseFloat(trnamt.replace(',', '.'));
            const description = name || memo || 'Transaction';

            if (isNaN(amount)) return;

            transactions.push({
              id: `ofx_${pattern.name}_${index}_${Date.now()}`,
              date,
              description: description.trim().substring(0, 100),
              amount: Math.abs(amount),
              type: amount >= 0 ? 'credit' : 'debit',
              rawData: [dtposted.substring(0, 20), description.substring(0, 50), trnamt]
            });
          } catch (error) {
            console.warn('⚠️ Error parsing block:', error);
          }
        });

        if (transactions.length > 0) {
          console.log(`✅ Found ${transactions.length} transactions with pattern "${pattern.name}"`);
          break;
        }
      }
    }

    return transactions;
  }

  private parseOfxDate(dateStr: string): Date {
    const clean = dateStr.trim();
    if (clean.length >= 8 && /^\d{8}/.test(clean)) {
      const year = parseInt(clean.substring(0, 4));
      const month = parseInt(clean.substring(4, 6)) - 1;
      const day = parseInt(clean.substring(6, 8));
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
    const date = new Date(clean);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  private parseCsvLine(line: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else current += char;
    }
    result.push(current.trim());
    return result;
  }

  private parseTransactionRow(columns: string[], mapping: CsvColumnMapping): ImportedTransaction | null {
    try {
      const dateStr = columns[mapping.dateColumn];
      const description = columns[mapping.descriptionColumn];
      const amountStr = columns[mapping.amountColumn];
      if (!dateStr || !description || !amountStr) return null;

      const date = this.parseDate(dateStr, mapping.dateFormat);
      const amount = parseFloat(amountStr.replace(/\s/g, '').replace(',', '.'));
      if (isNaN(amount)) return null;

      return {
        id: `csv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
        description: description.trim(),
        amount: Math.abs(amount),
        type: amount >= 0 ? 'credit' : 'debit',
        rawData: columns
      };
    } catch {
      return null;
    }
  }

  private parseDate(dateStr: string, format: string): Date {
    const cleanDate = dateStr.trim();
    if (format === 'DD/MM/YYYY') {
      const parts = cleanDate.split(/[/.,\-]+/);
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    if (format === 'YYYY-MM-DD') return new Date(cleanDate);
    return new Date(cleanDate);
  }

  detectBankFormat(content: string): BankFormat {
    const firstLines = content.split('\n').slice(0, 10).join(' ').toUpperCase();
    for (const [format, config] of Object.entries(this.bankPatterns)) {
      if (format === 'standard' || format === 'unknown') continue;
      for (const pattern of config.patterns) {
        if (firstLines.includes(pattern.toUpperCase())) return format as BankFormat;
      }
    }
    if (content.includes('Completed Date') && content.includes('Paid Out')) return 'revolut';
    if (content.includes('Date,"Payee","Account number","Transaction type"')) return 'n26';
    return 'unknown';
  }

  detectColumnMapping(firstRow: string[], hasHeader: boolean): CsvColumnMapping {
    const mapping: CsvColumnMapping = { dateColumn: 0, descriptionColumn: 1, amountColumn: 2, dateFormat: 'DD/MM/YYYY', separator: ';', hasHeader };
    if (hasHeader) {
      firstRow.forEach((col, index) => {
        const colLower = col.toLowerCase();
        if (colLower.includes('date') || colLower.includes('date op')) mapping.dateColumn = index;
        if (colLower.includes('libelle') || colLower.includes('description') || colLower.includes('label') || colLower.includes('payee')) mapping.descriptionColumn = index;
        if (colLower.includes('montant') || colLower.includes('amount')) mapping.amountColumn = index;
      });
    }
    const dateSample = firstRow[mapping.dateColumn];
    if (dateSample?.match(/^\d{4}-\d{2}-\d{2}$/)) mapping.dateFormat = 'YYYY-MM-DD';
    return mapping;
  }

  private hasHeaderRow(firstLine: string): boolean {
    return ['DATE', 'LIBELLE', 'MONTANT', 'DESCRIPTION', 'AMOUNT'].some(k => firstLine.toUpperCase().includes(k));
  }

  private getDefaultMapping(format: BankFormat): CsvColumnMapping {
    const configs: Record<BankFormat, CsvColumnMapping> = {
      'bnp': { dateColumn: 0, descriptionColumn: 1, amountColumn: 2, dateFormat: 'DD/MM/YYYY', separator: ';', hasHeader: true },
      'sg': { dateColumn: 0, descriptionColumn: 1, amountColumn: 2, dateFormat: 'DD/MM/YYYY', separator: ';', hasHeader: true },
      'credit-agricole': { dateColumn: 0, descriptionColumn: 2, amountColumn: 3, dateFormat: 'DD/MM/YYYY', separator: ';', hasHeader: true },
      'revolut': { dateColumn: 0, descriptionColumn: 4, amountColumn: 5, dateFormat: 'YYYY-MM-DD', separator: ',', hasHeader: true },
      'n26': { dateColumn: 0, descriptionColumn: 1, amountColumn: 5, dateFormat: 'YYYY-MM-DD', separator: ',', hasHeader: true },
      'boursobank': { dateColumn: 0, descriptionColumn: 3, amountColumn: 4, dateFormat: 'DD/MM/YYYY', separator: ';', hasHeader: true },
      'standard': { dateColumn: 0, descriptionColumn: 1, amountColumn: 2, dateFormat: 'DD/MM/YYYY', separator: ';', hasHeader: true },
      'unknown': { dateColumn: 0, descriptionColumn: 1, amountColumn: 2, dateFormat: 'DD/MM/YYYY', separator: ';', hasHeader: true }
    };
    return configs[format] || configs['standard'];
  }
}
