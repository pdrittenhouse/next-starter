import type { Meta, StoryObj } from '@storybook/nextjs';
import { TabsBlock } from './TabsBlock';

const meta = {
  title: 'Design System/Blocks/Tabs',
  component: TabsBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tabs block. Builds tab items from acf/tab inner blocks; falls back to renderedHtml when no inner blocks are present. Supports Bootstrap and jQuery responsive-tabs modes, pills, fill/justified nav, vertical orientation, collapsible panels, and hash-based deep linking.',
      },
    },
  },
} satisfies Meta<typeof TabsBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    block: {
      name: 'acf/tabs',
      clientId: 'tabs-1',
      renderedHtml:
        '<div class="block-tabs"><ul class="nav nav-tabs" id="tabs1" role="tablist"><li class="nav-item" role="presentation"><button class="nav-link active" id="tab-overview-tab" data-bs-toggle="tab" data-bs-target="#tab-overview" type="button" role="tab" aria-controls="tab-overview" aria-selected="true">Overview</button></li><li class="nav-item" role="presentation"><button class="nav-link" id="tab-features-tab" data-bs-toggle="tab" data-bs-target="#tab-features" type="button" role="tab" aria-controls="tab-features" aria-selected="false">Features</button></li><li class="nav-item" role="presentation"><button class="nav-link" id="tab-pricing-tab" data-bs-toggle="tab" data-bs-target="#tab-pricing" type="button" role="tab" aria-controls="tab-pricing" aria-selected="false">Pricing</button></li></ul><div class="tab-content" id="tabs1Content"><div class="tab-pane fade show active" id="tab-overview" role="tabpanel" aria-labelledby="tab-overview-tab"><p>An overview of the product and its core value proposition.</p></div><div class="tab-pane fade" id="tab-features" role="tabpanel" aria-labelledby="tab-features-tab"><p>A detailed list of features and capabilities.</p></div><div class="tab-pane fade" id="tab-pricing" role="tabpanel" aria-labelledby="tab-pricing-tab"><p>Pricing tiers and plan comparison.</p></div></div></div>',
    },
  },
};

export const Pills: Story = {
  args: {
    block: {
      name: 'acf/tabs',
      clientId: 'tabs-2',
      renderedHtml:
        '<div class="block-tabs"><ul class="nav nav-pills" id="tabs2" role="tablist"><li class="nav-item" role="presentation"><button class="nav-link active" id="pill-home-tab" data-bs-toggle="pill" data-bs-target="#pill-home" type="button" role="tab" aria-selected="true">Home</button></li><li class="nav-item" role="presentation"><button class="nav-link" id="pill-profile-tab" data-bs-toggle="pill" data-bs-target="#pill-profile" type="button" role="tab" aria-selected="false">Profile</button></li><li class="nav-item" role="presentation"><button class="nav-link" id="pill-settings-tab" data-bs-toggle="pill" data-bs-target="#pill-settings" type="button" role="tab" aria-selected="false">Settings</button></li></ul><div class="tab-content mt-3" id="tabs2Content"><div class="tab-pane fade show active" id="pill-home" role="tabpanel"><p>Home panel content.</p></div><div class="tab-pane fade" id="pill-profile" role="tabpanel"><p>Profile panel content.</p></div><div class="tab-pane fade" id="pill-settings" role="tabpanel"><p>Settings panel content.</p></div></div></div>',
    },
  },
};
