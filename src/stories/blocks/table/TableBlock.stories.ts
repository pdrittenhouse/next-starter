import type { Meta, StoryObj } from '@storybook/nextjs';
import { TableBlock } from './TableBlock';

const meta = {
  title: 'Design System/Blocks/Table',
  component: TableBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Table block. Maps ACF styling fields (striped, hover, bordered, borderless, small, responsive, variant, caption) to the Table atom. Structural content (thead/tbody/tfoot) is provided by inner blocks and falls back to renderedHtml in headless contexts.',
      },
    },
  },
} satisfies Meta<typeof TableBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/table',
      clientId: 'table-1',
      renderedHtml:
        '<div class="table-block"><table class="table table-striped table-hover"><thead><tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Status</th></tr></thead><tbody><tr><th scope="row">1</th><td>Alice Johnson</td><td>Developer</td><td>Active</td></tr><tr><th scope="row">2</th><td>Bob Smith</td><td>Designer</td><td>Active</td></tr><tr><th scope="row">3</th><td>Carol White</td><td>Manager</td><td>Away</td></tr></tbody></table></div>',
    },
  },
};

export const Bordered: Story = {
  args: {
    block: {
      name: 'acf/table',
      clientId: 'table-2',
      renderedHtml:
        '<div class="table-block"><table class="table table-bordered"><caption>Quarterly Revenue Summary</caption><thead class="table-dark"><tr><th scope="col">Quarter</th><th scope="col">Revenue</th><th scope="col">Growth</th></tr></thead><tbody><tr><td>Q1</td><td>$120,000</td><td>+8%</td></tr><tr><td>Q2</td><td>$145,000</td><td>+21%</td></tr><tr><td>Q3</td><td>$138,000</td><td>−5%</td></tr><tr><td>Q4</td><td>$162,000</td><td>+17%</td></tr></tbody></table></div>',
    },
  },
};
