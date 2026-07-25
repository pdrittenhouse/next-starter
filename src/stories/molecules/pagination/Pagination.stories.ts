import type { Meta, StoryObj } from '@storybook/nextjs';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Design System/Molecules/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Pagination molecule — mirrors the Timberland Pattern Lab pagination. ' +
          'Renders a Bootstrap 5 `<nav>` + `<ul class="pagination">` structure with ' +
          'Previous/Next controls and a configurable set of numbered page links. ' +
          'No atom dependencies — all markup is self-contained.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    size: {
      control: 'select',
      options: [undefined, 'sm', 'lg'],
    },
    pageIcon: { control: 'boolean' },
    prevLink: { control: 'text' },
    nextLink: { control: 'text' },
    otherClasses: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default — text-label controls, page 3 of 7 active
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    title: 'Blog page navigation',
    pageIcon: false,
    prevLink: '/blog?page=2',
    nextLink: '/blog?page=4',
    pageItems: [
      { title: '1', link: '/blog?page=1' },
      { title: '2', link: '/blog?page=2' },
      { title: '3', link: '/blog?page=3', active: true },
      { title: '4', link: '/blog?page=4' },
      { title: '5', link: '/blog?page=5' },
      { title: '6', link: '/blog?page=6' },
      { title: '7', link: '/blog?page=7' },
    ],
  },
};

// ---------------------------------------------------------------------------
// WithIcons — «/» chevrons on Prev/Next; label becomes screen-reader-only
// ---------------------------------------------------------------------------

export const WithIcons: Story = {
  name: 'With Icons',
  args: {
    title: 'Article page navigation',
    pageIcon: true,
    prevLink: '/articles?page=1',
    nextLink: '/articles?page=3',
    pageItems: [
      { title: '1', link: '/articles?page=1' },
      { title: '2', link: '/articles?page=2', active: true },
      { title: '3', link: '/articles?page=3' },
      { title: '4', link: '/articles?page=4' },
      { title: '5', link: '/articles?page=5' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Small — pagination-sm modifier
// ---------------------------------------------------------------------------

export const Small: Story = {
  args: {
    title: 'News page navigation',
    size: 'sm',
    pageIcon: false,
    prevLink: '/news?page=2',
    nextLink: '/news?page=4',
    pageItems: [
      { title: '1', link: '/news?page=1' },
      { title: '2', link: '/news?page=2' },
      { title: '3', link: '/news?page=3', active: true },
      { title: '4', link: '/news?page=4' },
      { title: '5', link: '/news?page=5' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Large — pagination-lg modifier with icon controls
// ---------------------------------------------------------------------------

export const Large: Story = {
  args: {
    title: 'Portfolio page navigation',
    size: 'lg',
    pageIcon: true,
    prevLink: '/portfolio?page=1',
    nextLink: '/portfolio?page=3',
    pageItems: [
      { title: '1', link: '/portfolio?page=1' },
      { title: '2', link: '/portfolio?page=2', active: true },
      { title: '3', link: '/portfolio?page=3' },
    ],
  },
};
