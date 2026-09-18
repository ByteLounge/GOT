import { dbStore } from '../db';
import { UPSCAdapter } from './upsc-adapter';
import { SSCAdapter } from './ssc-adapter';
import { ScholarshipAdapter } from './scholarship-adapter';
import { SourceAdapter } from './source-adapter';
import { IngestionRun } from '@govalert/types';

export class IngestionRunner {
  private static getAdapter(sourceCode: string): SourceAdapter | null {
    switch (sourceCode.toUpperCase()) {
      case 'UPSC':
        return new UPSCAdapter();
      case 'SSC':
        return new SSCAdapter();
      case 'NSP':
        return new ScholarshipAdapter();
      default:
        return null;
    }
  }

  static async runSource(sourceId: string): Promise<IngestionRun> {
    const state = dbStore.getState();
    const source = state.sources.find(s => s.id === sourceId || s.code === sourceId);
    if (!source) throw new Error(`Source ${sourceId} not found.`);

    const adapter = this.getAdapter(source.code);
    if (!adapter) throw new Error(`No adapter implementation found for code ${source.code}`);

    const startTime = new Date().toISOString();
    const runRecord: IngestionRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sourceId: source.id,
      sourceName: source.name,
      startTime,
      status: 'RUNNING',
      itemsScanned: 0,
      itemsCreated: 0,
      itemsUpdated: 0,
    };

    state.ingestionRuns.push(runRecord);
    source.lastStatus = 'RUNNING';
    dbStore.save();

    try {
      const result = await adapter.run();
      runRecord.status = 'SUCCESS';
      runRecord.itemsScanned = result.scanned;
      runRecord.itemsCreated = result.created;
      runRecord.itemsUpdated = result.updated;
      runRecord.endTime = new Date().toISOString();

      source.lastStatus = 'SUCCESS';
      source.lastRunAt = runRecord.endTime;
      source.errorMessage = null;
    } catch (err: any) {
      runRecord.status = 'FAILED';
      runRecord.errorMessage = err.message || 'Unknown error occurred during ingestion run.';
      runRecord.endTime = new Date().toISOString();

      source.lastStatus = 'FAILED';
      source.errorMessage = runRecord.errorMessage;
    }

    dbStore.save();
    return runRecord;
  }

  static async runAllActiveSources(): Promise<IngestionRun[]> {
    const state = dbStore.getState();
    const active = state.sources.filter(s => s.isActive);
    const results: IngestionRun[] = [];

    for (const source of active) {
      try {
        const run = await this.runSource(source.id);
        results.push(run);
      } catch (err) {
        console.error(`Error running source ${source.code}:`, err);
      }
    }

    return results;
  }
}
