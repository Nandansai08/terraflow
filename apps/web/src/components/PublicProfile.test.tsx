import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import PublicProfile from './PublicProfile';

describe('PublicProfile', () => {
  const baseUser = {
    id: 'user-1',
    username: 'traveler',
    name: 'Traveler',
    createdAt: '2026-01-01T00:00:00.000Z',
    _count: { posts: 0, followers: 0, following: 0 },
    posts: [],
  };

  it('renders visitor empty state when viewing another profile', () => {
    render(<PublicProfile user={baseUser} onFlyTo={vi.fn()} />);

    expect(screen.getByText(/no public memories yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /share your first memory/i })).not.toBeInTheDocument();
  });

  it('renders owner empty state with CTA when profile owner has no posts', () => {
    const onPublish = vi.fn();

    render(
      <PublicProfile
        user={baseUser}
        onFlyTo={vi.fn()}
        onPublish={onPublish}
        isOwner
      />,
    );

    expect(screen.getByText(/you haven’t shared a public memory yet/i)).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /share your first memory/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(onPublish).toHaveBeenCalled();
  });
});
