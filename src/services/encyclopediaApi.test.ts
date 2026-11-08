import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchLiveEncyclopedia } from './encyclopediaApi';

type Json = Record<string, unknown>;

const T_REX_LINEAGE = ['Dinosauria', 'Saurischia', 'Theropoda', 'Tyrannosauridae', 'Tyrannosaurus', 'Tyrannosaurus rex'];
const DODO_LINEAGE = ['Dinosauria', 'Saurischia', 'Theropoda', 'Avialae', 'Aves', 'Columbiformes', 'Columbidae', 'Raphus'];
const SMILODON_LINEAGE = ['Mammalia', 'Carnivora', 'Felidae', 'Machairodontinae', 'Smilodon'];

const T_REX_GBIF: Json = {
  key: 2480528,
  canonicalName: 'Tyrannosaurus rex',
  kingdom: 'Animalia',
  phylum: 'Chordata',
  family: 'Tyrannosauridae',
  extinct: true,
};
const T_REX_PBDB: Json = {
  taxon_no: '54833',
  taxon_name: 'Tyrannosaurus rex',
  is_extant: 'extinct',
  phylum: 'Chordata',
  class: 'Reptilia',
  family: 'Tyrannosauridae',
};

/**
 * Fake GBIF + PBDB endpoints that mirror the live APIs (checked 2026-10-26):
 * - PBDB returns phylum/class/order/family only when `show=class` is requested;
 * - PBDB `rel=all_parents` returns the searched taxon's full lineage;
 * - the GBIF backbone files dinosaurs as extinct taxa with no class or order.
 */
function stubApis(fixture: { gbif?: Json[]; pbdbTaxa?: Json[]; pbdbLineage?: string[] | 'unavailable' }) {
  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      if (url.hostname === 'api.gbif.org') {
        return respond({ results: fixture.gbif ?? [] });
      }
      if (url.hostname === 'paleobiodb.org' && url.searchParams.get('rel') === 'all_parents') {
        if (fixture.pbdbLineage === 'unavailable') return respond({ errors: ['unavailable'] }, 503);
        return respond({ records: (fixture.pbdbLineage ?? []).map((taxon_name) => ({ taxon_name })) });
      }
      if (url.hostname === 'paleobiodb.org') {
        const withClassification = (url.searchParams.get('show') ?? '').split(',').includes('class');
        const records = (fixture.pbdbTaxa ?? []).map(({ phylum, class: taxClass, order, family, ...basic }) =>
          withClassification ? { ...basic, phylum, class: taxClass, order, family } : basic
        );
        return respond({ records });
      }
      throw new Error(`Unexpected request: ${url}`);
    })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Live GBIF + PBDB search leaves dinosaurs to DinoVerse 3D', () => {
  it('returns no records for a dinosaur and flags it so the UI can point kids to DinoVerse 3D', async () => {
    stubApis({ pbdbLineage: T_REX_LINEAGE, gbif: [T_REX_GBIF], pbdbTaxa: [T_REX_PBDB] });

    const result = await searchLiveEncyclopedia('Tyrannosaurus rex');

    expect(result.records).toEqual([]);
    expect(result.excludedDinosaurs).toBe(true);
  });

  it('keeps birds, the only living dinosaurs', async () => {
    stubApis({
      pbdbLineage: DODO_LINEAGE,
      pbdbTaxa: [
        { taxon_no: '1', taxon_name: 'Raphus cucullatus', is_extant: 'extinct', phylum: 'Chordata', class: 'Aves', order: 'Columbiformes', family: 'Columbidae' },
      ],
    });

    const result = await searchLiveEncyclopedia('Raphus');

    expect(result.excludedDinosaurs).toBe(false);
    expect(result.records.map((r) => r.scientificName)).toEqual(['Raphus cucullatus']);
  });

  it('labels a non-dinosaur fossil with its real PBDB class instead of Dinosauria', async () => {
    stubApis({
      pbdbLineage: SMILODON_LINEAGE,
      pbdbTaxa: [
        { taxon_no: '46515', taxon_name: 'Smilodon fatalis', is_extant: 'extinct', phylum: 'Chordata', class: 'Mammalia', order: 'Carnivora', family: 'Felidae' },
      ],
    });

    const { records } = await searchLiveEncyclopedia('Smilodon');

    expect(records).toHaveLength(1);
    expect(records[0].taxonomy.class).toBe('Mammalia');
    expect(records[0].taxonomy.order).toBe('Carnivora');
  });

  it('drops class-less GBIF fossils, which is how the GBIF backbone files dinosaurs', async () => {
    stubApis({
      pbdbLineage: [], // "t rex" is not a PBDB taxon name, so there is no lineage to check
      gbif: [
        T_REX_GBIF,
        { key: 1, canonicalName: 'Lucanus cervus', phylum: 'Arthropoda', class: 'Insecta', order: 'Coleoptera', family: 'Lucanidae' },
      ],
    });

    const { records } = await searchLiveEncyclopedia('t rex');

    expect(records.map((r) => r.scientificName)).toEqual(['Lucanus cervus']);
  });

  it('fails closed: skips PBDB fossils when their lineage cannot be checked', async () => {
    stubApis({ pbdbLineage: 'unavailable', pbdbTaxa: [T_REX_PBDB] });

    const result = await searchLiveEncyclopedia('Tyrannosaurus rex');

    expect(result.records).toEqual([]);
  });
});
