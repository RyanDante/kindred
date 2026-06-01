export const CAMEROON_REGIONS = [
  'Adamawa',
  'Central',
  'East',
  'Far North',
  'Littoral',
  'North',
  'North-West',
  'South',
  'South-West',
  'West',
] as const;

export const ALL_REGIONS_OPTION = 'All Regions';

export const REGIONS_WITH_ALL = [ALL_REGIONS_OPTION, ...CAMEROON_REGIONS] as const;
