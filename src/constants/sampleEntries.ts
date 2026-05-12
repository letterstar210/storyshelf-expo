import { Entry } from '../types/entry';

const DEFAULT_CREATED_AT = '2026-04-01T09:00:00.000Z';
const DEFAULT_UPDATED_AT = '2026-04-01T09:00:00.000Z';

export const SAMPLE_ENTRIES: Entry[] = [
  {
    id: 'sample-1',
    title: 'Attack on Titan',
    episode: '139',
    link: 'https://attackontitan.fandom.com/wiki/Main_Page',
    coverImage:
      'https://m.media-amazon.com/images/I/81WyxGYU35L._AC_UF1000,1000_QL80_.jpg',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_UPDATED_AT,
  },
  {
    id: 'sample-2',
    title: 'Demon Slayer',
    episode: '44',
    link: 'https://kimetsu.com/',
    coverImage:
      'https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2Y4YS00NmM4LTljMmItZTFkOTExNGI3ODRhXkEyXkFqcGdeQXVyNjc3MjQzNTI@._V1_.jpg',
    createdAt: '2026-04-05T09:00:00.000Z',
    updatedAt: '2026-04-05T09:00:00.000Z',
  },
];
