import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';

vi.mock('../map/CampusMap', () => ({
  CampusMap: () => <div>Mock campus map</div>,
}));

describe('App', () => {
  it('renders the map-first application shell', () => {
    render(<App />);

    expect(screen.getByLabelText('NUSpace Phase 0 base map')).toBeInTheDocument();
    expect(screen.getByText('Mock campus map')).toBeInTheDocument();
  });
});
