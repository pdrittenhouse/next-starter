import type { Meta, StoryObj } from '@storybook/nextjs';
import { AccordionItemBlock } from './AccordionItemBlock';

const meta = {
  title: 'Design System/Blocks/Accordion Item',
  component: AccordionItemBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Inner block rendered recursively by AccordionBlock. When rendered standalone it falls back to renderedHtml.',
      },
    },
  },
} satisfies Meta<typeof AccordionItemBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/accordion-item',
      clientId: 'accordion-item-1',
      renderedHtml:
        '<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" type="button">Accordion Item</button></h2><div class="accordion-collapse collapse show"><div class="accordion-body"><p>Accordion item content.</p></div></div></div>',
    },
  },
};
