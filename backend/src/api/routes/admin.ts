import { Router, Response } from 'express';
import { dbStore } from '../../db';
import { IngestionRunner } from '../../ingestion/runner';

export const adminRouter = Router();

// List all configured sources and status
adminRouter.get('/sources', (req, res) => {
  const state = dbStore.getState();
  res.json({ success: true, sources: state.sources });
});

// Toggle source active state
adminRouter.patch('/sources/:id/toggle', (req, res) => {
  const state = dbStore.getState();
  const source = state.sources.find(s => s.id === req.params.id);
  if (!source) return res.status(404).json({ success: false, error: 'Source not found' });

  source.isActive = !source.isActive;
  dbStore.save();
  res.json({ success: true, source });
});

// Trigger manual run for a source
adminRouter.post('/sources/:id/run', async (req, res, next) => {
  try {
    const run = await IngestionRunner.runSource(req.params.id);
    res.json({ success: true, run });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger all active sources
adminRouter.post('/sources/run-all', async (req, res) => {
  try {
    const runs = await IngestionRunner.runAllActiveSources();
    res.json({ success: true, runs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List ingestion audit runs
adminRouter.get('/ingestion-runs', (req, res) => {
  const state = dbStore.getState();
  res.json({ success: true, runs: state.ingestionRuns.slice(-50).reverse() });
});

// List detected changes across opportunities
adminRouter.get('/changes', (req, res) => {
  const state = dbStore.getState();
  res.json({ success: true, changes: state.sourceChanges.slice(-50).reverse() });
});

// Edit / correct opportunity details
adminRouter.patch('/opportunities/:id', (req, res) => {
  const state = dbStore.getState();
  const opp = state.opportunities.find(o => o.id === req.params.id);
  if (!opp) return res.status(404).json({ success: false, error: 'Opportunity not found' });

  Object.assign(opp, req.body, { updatedAt: new Date().toISOString(), lastVerifiedAt: new Date().toISOString() });
  dbStore.save();
  res.json({ success: true, opportunity: opp });
});

// Duplicate candidates detector
adminRouter.get('/duplicates', (req, res) => {
  const state = dbStore.getState();
  const duplicates: { source: any; match: any; reason: string }[] = [];

  for (let i = 0; i < state.opportunities.length; i++) {
    for (let j = i + 1; j < state.opportunities.length; j++) {
      const a = state.opportunities[i];
      const b = state.opportunities[j];

      if (a.contentHash === b.contentHash) {
        duplicates.push({ source: a, match: b, reason: 'Identical Content Hash' });
      } else if (
        a.organization.toLowerCase() === b.organization.toLowerCase() &&
        a.title.toLowerCase().trim() === b.title.toLowerCase().trim()
      ) {
        duplicates.push({ source: a, match: b, reason: 'Exact Match on Organization and Title' });
      }
    }
  }

  res.json({ success: true, count: duplicates.length, duplicates });
});
