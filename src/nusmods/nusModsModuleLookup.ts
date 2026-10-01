import { mapVenueToPlace, type VenueMapping } from './venueMapper';

export const NUSMODS_ACADEMIC_YEAR = '2026-2027';

export type NusModsLesson = {
  classNo?: string;
  day?: string;
  endTime?: string;
  lessonType?: string;
  startTime?: string;
  venue?: string;
};

export type NusModsModulePayload = {
  moduleCode?: string;
  title?: string;
  semesterData?: Array<{
    semester?: number;
    timetable?: NusModsLesson[];
  }>;
};

export type NusModsVenueSummary = {
  venue: string;
  lessonCount: number;
  mapping: VenueMapping;
};

export type NusModsModuleUiState =
  | { status: 'idle'; message: string }
  | { status: 'loading'; message: string }
  | { status: 'not_found' | 'error'; message: string; moduleCode: string }
  | {
      status: 'ok';
      academicYear: string;
      moduleCode: string;
      title: string;
      venueCount: number;
      venues: NusModsVenueSummary[];
      sourceLabel: string;
    };

export function normalizeModuleCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '');
}

export function toNusModsModuleUiState(
  payload: NusModsModulePayload,
  academicYear = NUSMODS_ACADEMIC_YEAR,
): NusModsModuleUiState {
  const moduleCode = normalizeModuleCode(payload.moduleCode ?? '');
  const lessons = payload.semesterData?.flatMap((semester) => semester.timetable ?? []) ?? [];
  const venueCounts = lessons.reduce<Record<string, number>>((counts, lesson) => {
    const venue = lesson.venue?.trim();

    if (venue) {
      counts[venue] = (counts[venue] ?? 0) + 1;
    }

    return counts;
  }, {});

  const venues = Object.entries(venueCounts)
    .map(([venue, lessonCount]) => ({
      venue,
      lessonCount,
      mapping: mapVenueToPlace(venue),
    }))
    .sort((left, right) => right.lessonCount - left.lessonCount || left.venue.localeCompare(right.venue))
    .slice(0, 6);

  return {
    status: 'ok',
    academicYear,
    moduleCode,
    title: payload.title ?? 'Untitled module',
    venueCount: Object.keys(venueCounts).length,
    venues,
    sourceLabel: 'NUSMods public API',
  };
}

export async function fetchNusModsModuleUiState(
  moduleCodeInput: string,
  fetchImpl: typeof fetch = fetch,
): Promise<NusModsModuleUiState> {
  const moduleCode = normalizeModuleCode(moduleCodeInput);

  if (!/^[A-Z]{2,4}\d{4}[A-Z]?$/.test(moduleCode)) {
    return {
      status: 'not_found',
      moduleCode,
      message: 'Enter a module code such as CS1010S.',
    };
  }

  try {
    const response = await fetchImpl(`https://api.nusmods.com/v2/${NUSMODS_ACADEMIC_YEAR}/modules/${moduleCode}.json`);

    if (response.status === 404) {
      return {
        status: 'not_found',
        moduleCode,
        message: `No NUSMods module found for ${moduleCode}.`,
      };
    }

    if (!response.ok) {
      return {
        status: 'error',
        moduleCode,
        message: 'Unable to load NUSMods module data.',
      };
    }

    return toNusModsModuleUiState(await response.json());
  } catch {
    return {
      status: 'error',
      moduleCode,
      message: 'Unable to reach the NUSMods public API.',
    };
  }
}
