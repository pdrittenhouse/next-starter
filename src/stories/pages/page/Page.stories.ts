import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';

import { Page } from './Page';

const meta = {
  title: 'Design System/Pages/Page',
  component: Page,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
    docs: {
      category: 'Pages',
      description: {
        component: 'This is a page component.',
      },
    },
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

// More on interaction testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const LoggedIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButtonPromise = canvas.findByRole('button', { name: /Log in/i });
    const loginButton = await loginButtonPromise;
    await expect(loginButton).toBeInTheDocument();
    await userEvent.click(await loginButton);
    await expect(loginButton).not.toBeInTheDocument();

    const logoutButtonPromise = canvas.findByRole('button', { name: /Log out/i });
    const logoutButton = await logoutButtonPromise;
    await expect(logoutButton).toBeInTheDocument();
  },
};
