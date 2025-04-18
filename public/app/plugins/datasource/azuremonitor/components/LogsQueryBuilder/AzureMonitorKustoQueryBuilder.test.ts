import { BuilderQueryEditorExpressionType } from '../../dataquery.gen';

import { AzureMonitorKustoQueryBuilder } from './AzureMonitorKustoQueryBuilder';

describe('AzureMonitorKustoQueryParser', () => {
  it('returns empty string if from table is not specified', () => {
    const builderQuery: any = { from: { property: { name: '' } } };
    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toBe('');
  });

  it('builds a query with table and project', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      columns: { columns: ['TimeGenerated', 'Level', 'Message'] },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain('Logs');
    expect(result).toContain('project TimeGenerated, Level, Message');
  });

  it('includes time filter when needed', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      timeFilter: {
        expressions: [
          {
            type: BuilderQueryEditorExpressionType.Operator,
            operator: { name: '$__timeFilter' },
            property: { name: 'TimeGenerated' },
          },
        ],
      },
      columns: { columns: ['TimeGenerated', 'Level'] },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain('$__timeFilter(TimeGenerated)');
  });

  it('handles fuzzy search expressions', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      fuzzySearch: {
        expressions: [
          {
            type: BuilderQueryEditorExpressionType.Operator,
            operator: { name: 'contains', value: 'fail' },
            property: { name: 'Message' },
          },
        ],
      },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain("Message contains 'fail'");
  });

  it('applies additional filters', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      where: {
        expressions: [
          {
            type: BuilderQueryEditorExpressionType.Operator,
            operator: { name: '==', value: 'Error' },
            property: { name: 'Level' },
          },
          {
            type: BuilderQueryEditorExpressionType.Operator,
            operator: { name: 'contains', value: 'fail' },
            property: { name: 'Message' },
          },
        ],
      },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain("Level == 'Error'");
    expect(result).toContain("Message contains 'fail'");
  });

  it('handles where expressions with operator', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      columns: { columns: ['Level', 'Message'] },
      where: {
        expressions: [
          {
            type: BuilderQueryEditorExpressionType.Operator,
            operator: { name: '==', value: 'Error' },
            property: { name: 'Level' },
          },
        ],
      },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain("Level == 'Error'");
  });

  it('handles summarize with percentile function', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      reduce: {
        expressions: [
          {
            reduce: { name: 'percentile' },
            parameters: [{ value: '95' }, { value: 'Duration' }],
          },
        ],
      },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain('summarize percentile(95, Duration)');
  });

  it('handles summarize with basic aggregation function like avg', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      reduce: {
        expressions: [
          {
            reduce: { name: 'avg' },
            property: { name: 'ResponseTime' },
          },
        ],
      },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain('summarize avg(ResponseTime)');
  });

  it('skips summarize when reduce expressions are invalid', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      reduce: {
        expressions: [
          {
            reduce: null,
          },
        ],
      },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).not.toContain('summarize');
  });

  it('adds summarize with groupBy', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      columns: { columns: ['Level'] },
      groupBy: {
        expressions: [{ property: { name: 'Level' } }],
      },
      reduce: {
        expressions: [
          {
            reduce: { name: 'count' },
            property: { name: 'Level' },
          },
        ],
      },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain('summarize count() by Level');
  });

  it('adds order by clause', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      columns: { columns: ['TimeGenerated', 'Level'] },
      orderBy: {
        expressions: [{ property: { name: 'TimeGenerated' }, order: 'desc' }],
      },
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain('order by TimeGenerated desc');
  });

  it('adds limit clause', () => {
    const builderQuery: any = {
      from: { property: { name: 'Logs' } },
      columns: { columns: ['TimeGenerated', 'Level'] },
      limit: 50,
    };

    const result = AzureMonitorKustoQueryBuilder.toQuery(builderQuery);
    expect(result).toContain('limit 50');
  });
});
