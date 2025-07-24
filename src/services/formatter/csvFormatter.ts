import { Formatter, CostReport } from '../../types/index.js';
import { formatDateTime } from '../../utils/dateHelper.js';

export class CSVFormatter implements Formatter {
  format(data: CostReport): string {
    const headers = [
      'Date',
      'Service',
      'Model',
      'Usage ID',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Input Cost',
      'Output Cost',
      'Total Cost',
      'Currency',
      'Project',
      'Region',
      'Calculated At',
    ];

    let csv = headers.join(',') + '\n';

    for (const detail of data.details) {
      // Handle null usage and cost objects gracefully
      const usage = detail.usage || {
        id: '',
        inputTokens: 0,
        outputTokens: 0,
        project: '',
        region: '',
      };
      const cost = detail.cost || {
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        currency: '',
        calculatedAt: null,
      };

      const row = [
        this.formatCsvValue(formatDateTime(detail.date)),
        this.formatCsvValue(detail.service || ''),
        this.formatCsvValue(detail.model || ''),
        this.formatCsvValue(usage.id),
        usage.inputTokens.toString(),
        usage.outputTokens.toString(),
        (usage.inputTokens + usage.outputTokens).toString(),
        cost.inputCost.toFixed(6),
        cost.outputCost.toFixed(6),
        cost.totalCost.toFixed(6),
        this.formatCsvValue(cost.currency),
        this.formatCsvValue(usage.project || ''),
        this.formatCsvValue(usage.region || ''),
        this.formatCsvValue(formatDateTime(cost.calculatedAt)),
      ];

      csv += row.join(',') + '\n';
    }

    return csv;
  }

  private formatCsvValue(value: string): string {
    // Escape CSV values that contain commas, quotes, or newlines
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
