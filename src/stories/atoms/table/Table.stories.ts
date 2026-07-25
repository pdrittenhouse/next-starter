import type { Meta, StoryObj } from '@storybook/nextjs';
import { Table } from './Table';
import type { TableRowData } from './Table';

const HEADER_ROW: TableRowData = {
  cells: [
    { content: 'Name', element: 'th', scope: 'col' },
    { content: 'Role', element: 'th', scope: 'col' },
    { content: 'Department', element: 'th', scope: 'col' },
    { content: 'Status', element: 'th', scope: 'col' },
  ],
};

const BODY_ROWS: TableRowData[] = [
  {
    cells: [
      { content: 'Jordan Reyes' },
      { content: 'Senior Engineer' },
      { content: 'Platform' },
      { content: 'Active' },
    ],
  },
  {
    cells: [
      { content: 'Morgan Ellison' },
      { content: 'Product Designer' },
      { content: 'Design' },
      { content: 'Active' },
    ],
  },
  {
    cells: [
      { content: 'Casey Drummond' },
      { content: 'Engineering Manager' },
      { content: 'Platform' },
      { content: 'On Leave' },
    ],
  },
  {
    cells: [
      { content: 'Avery Nakamura' },
      { content: 'Data Analyst' },
      { content: 'Analytics' },
      { content: 'Active' },
    ],
  },
];

const FOOTER_ROW: TableRowData = {
  cells: [
    { content: '4 employees', element: 'th', colspan: 2 },
    { content: '3 departments' },
    { content: '3 active' },
  ],
};

const WIDE_HEADER: TableRowData = {
  cells: [
    { content: 'ID', element: 'th', scope: 'col' },
    { content: 'Product Name', element: 'th', scope: 'col' },
    { content: 'Category', element: 'th', scope: 'col' },
    { content: 'SKU', element: 'th', scope: 'col' },
    { content: 'Unit Price', element: 'th', scope: 'col' },
    { content: 'Stock', element: 'th', scope: 'col' },
    { content: 'Warehouse', element: 'th', scope: 'col' },
    { content: 'Last Updated', element: 'th', scope: 'col' },
  ],
};

const WIDE_BODY: TableRowData[] = [
  {
    cells: [
      { content: '1001' },
      { content: 'Merino Wool Base Layer' },
      { content: 'Apparel' },
      { content: 'APP-MWB-S-NVY' },
      { content: '$89.00' },
      { content: '142' },
      { content: 'Portland, OR' },
      { content: '2026-07-15' },
    ],
  },
  {
    cells: [
      { content: '1002' },
      { content: 'Trail Running Shoes' },
      { content: 'Footwear' },
      { content: 'FTW-TRS-10-GRN' },
      { content: '$134.00' },
      { content: '58' },
      { content: 'Portland, OR' },
      { content: '2026-07-18' },
    ],
  },
  {
    cells: [
      { content: '1003' },
      { content: 'Hydration Pack 20L' },
      { content: 'Gear' },
      { content: 'GER-HP20-BLK' },
      { content: '$74.95' },
      { content: '203' },
      { content: 'Denver, CO' },
      { content: '2026-07-10' },
    ],
  },
];

const meta: Meta<typeof Table> = {
  title: 'Design System/Atoms/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Table atom — mirrors the theme\'s Pattern Lab `timberland/table` pattern. ' +
          'Renders a full HTML table with Bootstrap 5 modifiers, optional caption, ' +
          'and explicit thead / tbody / tfoot sections.',
      },
    },
  },
  argTypes: {
    striped: { control: 'boolean' },
    hover: { control: 'boolean' },
    active: { control: 'boolean' },
    bordered: { control: 'boolean' },
    borderless: { control: 'boolean' },
    small: { control: 'boolean' },
    captionTop: { control: 'boolean' },
    variant: {
      control: 'select',
      options: [
        undefined,
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'light',
        'dark',
      ],
    },
    verticalAlign: {
      control: 'select',
      options: [undefined, 'top', 'middle', 'bottom'],
    },
    responsive: {
      control: 'select',
      options: [undefined, true, 'sm', 'md', 'lg', 'xl', 'xxl'],
    },
    borderCollapse: {
      control: 'select',
      options: [undefined, true, false],
    },
    borderSpacing: { control: 'number' },
    caption: { control: 'text' },
    tableId: { control: 'text' },
    className: { control: 'text' },
  },
  args: {
    thead: { rows: [HEADER_ROW] },
    tbody: { rows: BODY_ROWS },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Striped: Story = {
  args: { striped: true },
  parameters: {
    docs: {
      description: { story: 'Adds `table-striped` for alternating row backgrounds.' },
    },
  },
};

export const Hover: Story = {
  args: { hover: true },
  parameters: {
    docs: {
      description: { story: 'Adds `table-hover` to highlight the row under the cursor.' },
    },
  },
};

export const StripedAndHover: Story = {
  name: 'Striped + Hover',
  args: { striped: true, hover: true },
};

export const Bordered: Story = {
  args: { bordered: true },
  parameters: {
    docs: {
      description: { story: 'Adds `table-bordered` for borders on all four sides of every cell.' },
    },
  },
};

export const Borderless: Story = {
  args: { borderless: true },
  parameters: {
    docs: {
      description: { story: 'Adds `table-borderless` to remove all cell borders.' },
    },
  },
};

export const Small: Story = {
  args: { small: true },
  parameters: {
    docs: {
      description: { story: 'Adds `table-sm` to halve cell padding for a denser layout.' },
    },
  },
};

export const VariantDark: Story = {
  name: 'Variant: Dark',
  args: { variant: 'dark' },
};

export const VariantSuccess: Story = {
  name: 'Variant: Success',
  args: { variant: 'success' },
};

export const VariantWarning: Story = {
  name: 'Variant: Warning',
  args: { variant: 'warning' },
};

export const WithCaption: Story = {
  name: 'With Caption',
  args: {
    caption: 'Q3 2026 staffing snapshot',
  },
  parameters: {
    docs: {
      description: { story: 'Caption rendered below the table by default.' },
    },
  },
};

export const CaptionTop: Story = {
  name: 'Caption Top',
  args: {
    caption: 'Q3 2026 staffing snapshot',
    captionTop: true,
  },
  parameters: {
    docs: {
      description: { story: 'Adds `caption-top` to position the caption above the table.' },
    },
  },
};

export const WithFooter: Story = {
  name: 'With Footer (tfoot)',
  args: {
    tfoot: { rows: [FOOTER_ROW] },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Explicit `tfoot` section. The first cell spans two columns using `colspan`.',
      },
    },
  },
};

export const Responsive: Story = {
  args: {
    responsive: true,
    thead: { rows: [WIDE_HEADER] },
    tbody: { rows: WIDE_BODY },
    bordered: true,
    small: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Wraps the table in a `div.table-responsive` so it scrolls horizontally on small viewports.',
      },
    },
  },
};

export const ResponsiveMd: Story = {
  name: 'Responsive (md breakpoint)',
  args: {
    responsive: 'md',
    thead: { rows: [WIDE_HEADER] },
    tbody: { rows: WIDE_BODY },
    bordered: true,
    small: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Uses `table-responsive-md` — only scrolls below the md breakpoint.',
      },
    },
  },
};

export const VerticalAlignMiddle: Story = {
  name: 'Vertical Align: Middle',
  args: {
    verticalAlign: 'middle',
    tbody: {
      rows: [
        {
          cells: [
            { content: 'Top-aligned header', element: 'th', scope: 'row' },
            {
              content: (
                'A longer block of text that wraps to demonstrate how vertical ' +
                'alignment affects multi-line cell content.'
              ),
            },
            { content: 'Short' },
          ],
        },
        {
          cells: [
            { content: 'Second row', element: 'th', scope: 'row' },
            { content: 'Normal content' },
            { content: 'Short' },
          ],
        },
      ],
    },
    thead: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Adds `align-middle` to the table element, centering all cell content vertically.',
      },
    },
  },
};

export const ImplicitTbody: Story = {
  name: 'Rows (implicit tbody)',
  args: {
    thead: undefined,
    tbody: undefined,
    rows: BODY_ROWS,
  },
  parameters: {
    docs: {
      description: {
        story:
          'When the `rows` shorthand prop is used without `thead`/`tbody`, the rows ' +
          'are wrapped in an implicit `<tbody>`.',
      },
    },
  },
};

export const BorderSeparate: Story = {
  name: 'Border Separate + Spacing',
  args: {
    bordered: true,
    borderCollapse: false,
    borderSpacing: 4,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Sets `border-collapse: separate` and `border-spacing` via inline style. ' +
          'Also applies `table-border-separate` and `table-border-spacing-4` classes ' +
          'which map to the custom SCSS utilities.',
      },
    },
  },
};

export const ColspanRowspan: Story = {
  name: 'Colspan / Rowspan',
  args: {
    bordered: true,
    thead: undefined,
    tbody: undefined,
    rows: [
      {
        cells: [
          { content: 'Spans 2 cols', element: 'th', scope: 'col', colspan: 2 },
          { content: 'Spans 2 rows', element: 'th', scope: 'row', rowspan: 2 },
        ],
      },
      {
        cells: [
          { content: 'Cell A' },
          { content: 'Cell B' },
        ],
      },
      {
        cells: [
          { content: 'Full width', colspan: 3 },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates `colspan` and `rowspan` on individual cells.',
      },
    },
  },
};
