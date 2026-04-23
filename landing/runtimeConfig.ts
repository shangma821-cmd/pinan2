export type LandingRuntimeMode = 'react' | 'legacy';
export type LandingAssetMode = 'bundled' | 'public';

export const LANDING_RUNTIME_MODE: LandingRuntimeMode = 'react';

export const LEGACY_LANDING_IFRAME_SRC = '/entry-station/index.html?v=20260311-3';
export const REACT_LANDING_IFRAME_SRC = '/entry-station';

export const LANDING_IFRAME_SRC =
  LANDING_RUNTIME_MODE === 'react' ? REACT_LANDING_IFRAME_SRC : LEGACY_LANDING_IFRAME_SRC;

export const LANDING_ASSET_MODE: LandingAssetMode =
  LANDING_RUNTIME_MODE === 'react' ? 'bundled' : 'public';
