export type TransitCapabilityStatus =
  | 'available'
  | 'requires_key'
  | 'requires_official_access'
  | 'source_pending'
  | 'unavailable';

export type TransitCapabilityId =
  | 'publicBusArrivals'
  | 'publicBusRoutes'
  | 'nusIsbStaticRoutes'
  | 'nusIsbLiveArrivals'
  | 'nusIsbLiveVehicles'
  | 'nusIsbCrowdLevel';

export type TransitCapability = {
  id: TransitCapabilityId;
  label: string;
  status: TransitCapabilityStatus;
  sourceId?: string;
  userFacingState: string;
};

export const transitCapabilities: TransitCapability[] = [
  {
    id: 'publicBusArrivals',
    label: 'Public bus arrivals',
    status: 'requires_key',
    sourceId: 'lta-datamall-dynamic-apis',
    userFacingState: 'Requires server-side LTA DataMall AccountKey.',
  },
  {
    id: 'publicBusRoutes',
    label: 'Public bus routes',
    status: 'requires_key',
    sourceId: 'lta-datamall-dynamic-apis',
    userFacingState: 'Requires server-side LTA DataMall AccountKey.',
  },
  {
    id: 'nusIsbStaticRoutes',
    label: 'NUS shuttle prototype routes',
    status: 'source_pending',
    sourceId: 'nus-campus-map-shuttle-routes',
    userFacingState: 'Prototype route mode is available with source-pending geometry and unverified stop positions.',
  },
  {
    id: 'nusIsbLiveArrivals',
    label: 'NUS shuttle live arrivals',
    status: 'requires_official_access',
    userFacingState: 'Official NUS shuttle API access is not documented.',
  },
  {
    id: 'nusIsbLiveVehicles',
    label: 'NUS shuttle live vehicles',
    status: 'requires_official_access',
    userFacingState: 'Official NUS shuttle API access is not documented.',
  },
  {
    id: 'nusIsbCrowdLevel',
    label: 'NUS shuttle crowd level',
    status: 'requires_official_access',
    userFacingState: 'Official NUS shuttle API access is not documented.',
  },
];

export function getTransitCapability(id: TransitCapabilityId) {
  return transitCapabilities.find((capability) => capability.id === id);
}
