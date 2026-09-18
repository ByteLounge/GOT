import { dbStore } from './db';
import { SEED_OPPORTUNITIES, SEED_SOURCES } from './data/seedOpportunities';

async function seed() {
  console.log('Seeding GovAlert opportunities and sources...');
  const state = dbStore.getState();
  state.opportunities = [...SEED_OPPORTUNITIES];
  state.sources = [...SEED_SOURCES];
  dbStore.save();
  console.log(`Successfully seeded ${SEED_OPPORTUNITIES.length} opportunities and ${SEED_SOURCES.length} sources!`);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
