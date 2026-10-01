import { describe, expect, it, vi } from 'vitest';
import { fetchNusModsModuleUiState, normalizeModuleCode, toNusModsModuleUiState } from './nusModsModuleLookup';

describe('nusModsModuleLookup', () => {
  it('normalizes module codes for lookup', () => {
    expect(normalizeModuleCode(' cs 1010s ')).toBe('CS1010S');
  });

  it('summarizes venues and mapping confidence from module payloads', () => {
    const result = toNusModsModuleUiState({
      moduleCode: 'CS1010S',
      title: 'Programming Methodology',
      semesterData: [
        {
          semester: 1,
          timetable: [
            { lessonType: 'Tutorial', venue: 'BIZ2-0224' },
            { lessonType: 'Tutorial', venue: 'BIZ2-0224' },
            { lessonType: 'Lecture', venue: 'COM3-01-23' },
            { lessonType: 'Lecture', venue: 'LT27' },
          ],
        },
      ],
    });

    expect(result).toMatchObject({
      status: 'ok',
      moduleCode: 'CS1010S',
      venueCount: 3,
    });

    if (result.status === 'ok') {
      expect(result.venues[0]).toMatchObject({
        venue: 'BIZ2-0224',
        lessonCount: 2,
        mapping: {
          confidence: 'medium',
          place: expect.objectContaining({ id: 'biz2-building' }),
        },
      });
      expect(result.venues.find((venue) => venue.venue === 'LT27')?.mapping.confidence).toBe('unknown');
    }
  });

  it('fetches module data from the current academic year endpoint', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        moduleCode: 'CS1010S',
        title: 'Programming Methodology',
        semesterData: [],
      }),
    })) as unknown as typeof fetch;

    const result = await fetchNusModsModuleUiState('CS1010S', fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith('https://api.nusmods.com/v2/2026-2027/modules/CS1010S.json');
    expect(result).toMatchObject({ status: 'ok', moduleCode: 'CS1010S' });
  });
});
