import type { Meta, StoryObj } from '@storybook/nextjs';
import { AccordionBlock } from './AccordionBlock';

const meta = {
  title: 'Design System/Blocks/Accordion',
  component: AccordionBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Accordion wrapper block. Reads ACF fields to build a Bootstrap accordion from nested acf/accordion-item inner blocks. Falls back to renderedHtml when no inner blocks are present.',
      },
    },
  },
} satisfies Meta<typeof AccordionBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/accordion',
      clientId: 'accordion-1',
      renderedHtml:
        '<div class="accordion" id="accordion1"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">What is headless WordPress?</button></h2><div id="collapse1" class="accordion-collapse collapse show" data-bs-parent="#accordion1"><div class="accordion-body"><p>Headless WordPress decouples the CMS backend from the front-end presentation layer, allowing Next.js to consume content via WPGraphQL.</p></div></div></div><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">How does WPGraphQL work?</button></h2><div id="collapse2" class="accordion-collapse collapse" data-bs-parent="#accordion1"><div class="accordion-body"><p>WPGraphQL exposes your WordPress content model as a fully typed GraphQL API endpoint, enabling structured queries from any client.</p></div></div></div><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">What ACF fields does this block support?</button></h2><div id="collapse3" class="accordion-collapse collapse" data-bs-parent="#accordion1"><div class="accordion-body"><p>The accordion block supports id, flush mode, always-open mode, layout modifiers, and per-item button styling via ACF field groups.</p></div></div></div></div>',
    },
  },
};

export const Flush: Story = {
  args: {
    block: {
      name: 'acf/accordion',
      clientId: 'accordion-2',
      renderedHtml:
        '<div class="accordion accordion-flush" id="accordion2"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#flush1" aria-expanded="true" aria-controls="flush1">Section One</button></h2><div id="flush1" class="accordion-collapse collapse show"><div class="accordion-body"><p>Flush accordions remove the outer border and rounded corners for a cleaner inline appearance.</p></div></div></div><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush2" aria-expanded="false" aria-controls="flush2">Section Two</button></h2><div id="flush2" class="accordion-collapse collapse"><div class="accordion-body"><p>Each item still collapses and expands independently using Bootstrap data attributes.</p></div></div></div></div>',
    },
  },
};
