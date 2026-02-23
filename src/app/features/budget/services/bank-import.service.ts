import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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

  /**
   * Importe un fichier CSV bancaire
   */
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

          // Détection automatique du format
          const detectedFormat = this.detectBankFormat(content);
          const separator = customMapping?.separator || this.bankPatterns[detectedFormat].separator;
          
          // Parsing du CSV
          const lines = content.split('\n').filter(line => line.trim());
          const hasHeader = customMapping?.hasHeader ?? this.hasHeaderRow(lines[0]);
          const startIndex = hasHeader ? 1 : 0;

          const transactions: ImportedTransaction[] = [];
          const errors: string[] = [];

          for (let i = startIndex; i < lines.length; i++) {
            try {
              const line = lines[i];
              const columns = this.parseCsvLine(line, separator);
              
              if (columns.length < 3) {
                continue; // Ligne ignorée (trop peu de colonnes)
              }

              const transaction = this.parseTransactionRow(
                columns,
                customMapping || this.getDefaultMapping(detectedFormat, columns.length)
              );

              if (transaction) {
                transactions.push(transaction);
              }
            } catch (error) {
              errors.push(`Ligne ${i + 1}: ${error}`);
            }
          }

          const result: ImportResult = {
            success: true,
            transactions,
            totalImported: transactions.length,
            totalCredits: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
            totalDebits: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
            errors
          };

          observer.next(result);
          observer.complete();
        } catch (error) {
          observer.error({ success: false, errors: [error instanceof Error ? error.message : 'Erreur inconnue'] });
        }
      };

      reader.onerror = () => {
        observer.error({ success: false, errors: ['Erreur de lecture du fichier'] });
      };

      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Importe un fichier OFX (XML)
   */
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

          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/xml');
          
          // Parsing des transactions OFX
          const transactions: ImportedTransaction[] = [];
          const transactionNodes = doc.querySelectorAll('STMTTRN');

          transactionNodes.forEach((node, index) => {
            try {
              const dateNode = node.querySelector('DTPOSTED');
              const amountNode = node.querySelector('TRNAMT');
              const nameNode = node.querySelector('NAME');
              const memoNode = node.querySelector('MEMO');

              if (!dateNode || !amountNode) return;

              const dateStr = dateNode.textContent || '';
              const amountStr = amountNode.textContent || '0';
              const description = nameNode?.textContent || memoNode?.textContent || 'Transaction';

              // Format OFX : YYYYMMDD ou YYYYMMDDHHMMSS
              const year = parseInt(dateStr.substring(0, 4));
              const month = parseInt(dateStr.substring(4, 6)) - 1;
              const day = parseInt(dateStr.substring(6, 8));

              const amount = parseFloat(amountStr);

              transactions.push({
                id: `ofx_${index}_${Date.now()}`,
                date: new Date(year, month, day),
                description: description.trim(),
                amount: Math.abs(amount),
                type: amount >= 0 ? 'credit' : 'debit',
                rawData: [dateStr, description, amountStr]
              });
            } catch (error) {
              console.warn('Erreur parsing transaction OFX:', error);
            }
          });

          const totalCredits = transactions
            .filter(t => t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const totalDebits = transactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

          const result: ImportResult = {
            success: true,
            transactions,
            totalImported: transactions.length,
            totalCredits,
            totalDebits,
            errors: []
          };

          observer.next(result);
          observer.complete();
        } catch (error) {
          observer.error({ 
            success: false, 
            errors: [error instanceof Error ? error.message : 'Erreur parsing OFX'] 
          });
        }
      };

      reader.onerror = () => {
        observer.error({ success: false, errors: ['Erreur de lecture du fichier'] });
      };

      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Détecte automatiquement le format de la banque
   */
  detectBankFormat(content: string): BankFormat {
    const firstLines = content.split('\n').slice(0, 10).join(' ').toUpperCase();

    for (const [format, config] of Object.entries(this.bankPatterns)) {
      if (format === 'standard' || format === 'unknown') continue;
      
      for (const pattern of config.patterns) {
        if (firstLines.includes(pattern.toUpperCase())) {
          return format as BankFormat;
        }
      }
    }

    // Détection par colonnes pour les néo-banques
    if (content.includes('Completed Date') && content.includes('Paid Out')) {
      return 'revolut';
    }

    if (content.includes('Date,"Payee","Account number","Transaction type"')) {
      return 'n26';
    }

    return 'unknown';
  }

  /**
   * Détecte si la première ligne est un header
   */
  private hasHeaderRow(firstLine: string): boolean {
    const headerKeywords = ['DATE', 'LIBELLE', 'MONTANT', 'SOLDE', 'DESCRIPTION', 'AMOUNT', 'BALANCE'];
    const lineUpper = firstLine.toUpperCase();
    
    return headerKeywords.some(keyword => lineUpper.includes(keyword));
  }

  /**
   * Parse une ligne CSV en respectant les guillemets
   */
  private parseCsvLine(line: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Parse une ligne de transaction
   */
  private parseTransactionRow(columns: string[], mapping: CsvColumnMapping): ImportedTransaction | null {
    try {
      const dateStr = columns[mapping.dateColumn];
      const description = columns[mapping.descriptionColumn];
      const amountStr = columns[mapping.amountColumn];

      if (!dateStr || !description || !amountStr) {
        return null;
      }

      // Parsing de la date selon le format
      const date = this.parseDate(dateStr, mapping.dateFormat);
      
      // Parsing du montant
      const amountClean = amountStr.replace(/\s/g, '').replace(',', '.');
      const amount = parseFloat(amountClean);

      if (isNaN(amount)) {
        return null;
      }

      return {
        id: `csv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
        description: description.trim(),
        amount: Math.abs(amount),
        type: amount >= 0 ? 'credit' : 'debit',
        rawData: columns
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse une date selon différents formats
   */
  private parseDate(dateStr: string, format: string): Date {
    const cleanDate = dateStr.trim();

    // Format DD/MM/YYYY
    if (format === 'DD/MM/YYYY') {
      const parts = cleanDate.split(/[\/\.\-]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }

    // Format YYYY-MM-DD
    if (format === 'YYYY-MM-DD') {
      return new Date(cleanDate);
    }

    // Format MM/DD/YYYY (US)
    if (format === 'MM/DD/YYYY') {
      const parts = cleanDate.split(/[\/\.\-]/);
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }

    // Format par défaut
    return new Date(cleanDate);
  }

  /**
   * Retourne un mapping par défaut selon le format détecté
   */
  private getDefaultMapping(format: BankFormat, columnCount: number): CsvColumnMapping {
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

  /**
   * Détecte automatiquement le mapping des colonnes
   */
  detectColumnMapping(firstRow: string[], hasHeader: boolean): CsvColumnMapping {
    const mapping: CsvColumnMapping = {
      dateColumn: 0,
      descriptionColumn: 1,
      amountColumn: 2,
      dateFormat: 'DD/MM/YYYY',
      separator: ';',
      hasHeader
    };

    // Si header présent, on essaie de détecter les colonnes par leur nom
    if (hasHeader) {
      firstRow.forEach((col, index) => {
        const colLower = col.toLowerCase();

        if (colLower.includes('date') || colLower.includes('date op')) {
          mapping.dateColumn = index;
        }

        if (colLower.includes('libelle') || colLower.includes('description') || 
            colLower.includes('intitule') || colLower.includes('label') ||
            colLower.includes('payee') || colLower.includes('merchant')) {
          mapping.descriptionColumn = index;
        }

        if (colLower.includes('montant') || colLower.includes('amount') || 
            colLower.includes('paiement') || colLower.includes('credit') ||
            colLower.includes('debit')) {
          mapping.amountColumn = index;
        }
      });
    }

    // Détection du format de date
    const dateSample = firstRow[mapping.dateColumn];
    if (dateSample) {
      if (dateSample.match(/^\d{4}-\d{2}-\d{2}$/)) {
        mapping.dateFormat = 'YYYY-MM-DD';
      } else if (dateSample.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        mapping.dateFormat = 'DD/MM/YYYY';
      }
    }

    return mapping;
  }
}
