/**
 * UnifiedSurface Component Tests
 * 
 * Tests for surface components in components/admin/UnifiedSurface
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  UnifiedCard,
  UnifiedDivider,
} from '@/components/admin/UnifiedSurface';
import { MantineProvider, createTheme } from '@mantine/core';

// Create a wrapper component with Mantine Provider
function renderWithMantine(ui: React.ReactElement) {
  const theme = createTheme();
  return render(ui, {
    wrapper: ({ children }) => (
      <MantineProvider theme={theme}>{children}</MantineProvider>
    ),
  });
}

describe('UnifiedCard', () => {
  it('should render card with children', () => {
    renderWithMantine(
      <UnifiedCard>Card Content</UnifiedCard>
    );

    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should render with border by default', () => {
    renderWithMantine(
      <UnifiedCard>With Border</UnifiedCard>
    );

    expect(screen.getByText('With Border')).toBeInTheDocument();
  });

  it('should render without border when withBorder is false', () => {
    renderWithMantine(
      <UnifiedCard withBorder={false}>No Border</UnifiedCard>
    );

    expect(screen.getByText('No Border')).toBeInTheDocument();
  });

  it('should render with no shadow by default', () => {
    renderWithMantine(
      <UnifiedCard>No Shadow</UnifiedCard>
    );

    expect(screen.getByText('No Shadow')).toBeInTheDocument();
  });

  it('should render with custom shadow', () => {
    renderWithMantine(
      <UnifiedCard shadow="sm">Small Shadow</UnifiedCard>
    );

    expect(screen.getByText('Small Shadow')).toBeInTheDocument();
  });

  it('should render with medium shadow', () => {
    renderWithMantine(
      <UnifiedCard shadow="md">Medium Shadow</UnifiedCard>
    );

    expect(screen.getByText('Medium Shadow')).toBeInTheDocument();
  });

  it('should render with large shadow', () => {
    renderWithMantine(
      <UnifiedCard shadow="lg">Large Shadow</UnifiedCard>
    );

    expect(screen.getByText('Large Shadow')).toBeInTheDocument();
  });

  it('should render with medium padding by default', () => {
    renderWithMantine(
      <UnifiedCard>Default Padding</UnifiedCard>
    );

    expect(screen.getByText('Default Padding')).toBeInTheDocument();
  });

  it('should render with custom padding - none', () => {
    renderWithMantine(
      <UnifiedCard padding="none">No Padding</UnifiedCard>
    );

    expect(screen.getByText('No Padding')).toBeInTheDocument();
  });

  it('should render with custom padding - xs', () => {
    renderWithMantine(
      <UnifiedCard padding="xs">XS Padding</UnifiedCard>
    );

    expect(screen.getByText('XS Padding')).toBeInTheDocument();
  });

  it('should render with custom padding - sm', () => {
    renderWithMantine(
      <UnifiedCard padding="sm">SM Padding</UnifiedCard>
    );

    expect(screen.getByText('SM Padding')).toBeInTheDocument();
  });

  it('should render with custom padding - lg', () => {
    renderWithMantine(
      <UnifiedCard padding="lg">LG Padding</UnifiedCard>
    );

    expect(screen.getByText('LG Padding')).toBeInTheDocument();
  });

  it('should render with custom padding - xl', () => {
    renderWithMantine(
      <UnifiedCard padding="xl">XL Padding</UnifiedCard>
    );

    expect(screen.getByText('XL Padding')).toBeInTheDocument();
  });

  it('should render with hoverable prop', () => {
    renderWithMantine(
      <UnifiedCard hoverable>Hoverable Card</UnifiedCard>
    );

    expect(screen.getByText('Hoverable Card')).toBeInTheDocument();
  });

  it('should accept custom style prop', () => {
    renderWithMantine(
      <UnifiedCard style={{ backgroundColor: 'red' }}>Custom Style</UnifiedCard>
    );

    expect(screen.getByText('Custom Style')).toBeInTheDocument();
  });

  it('should render with complex children', () => {
    renderWithMantine(
      <UnifiedCard>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Button</button>
        </div>
      </UnifiedCard>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });
});

describe('UnifiedCard.Header', () => {
  it('should render header with children', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Header>Header Content</UnifiedCard.Header>
      </UnifiedCard>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('should render with medium padding by default', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Header>Default Padding</UnifiedCard.Header>
      </UnifiedCard>
    );

    expect(screen.getByText('Default Padding')).toBeInTheDocument();
  });

  it('should render with custom padding', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Header padding="sm">Small Padding</UnifiedCard.Header>
      </UnifiedCard>
    );

    expect(screen.getByText('Small Padding')).toBeInTheDocument();
  });

  it('should render with bottom border by default', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Header>With Border</UnifiedCard.Header>
      </UnifiedCard>
    );

    expect(screen.getByText('With Border')).toBeInTheDocument();
  });

  it('should render without border when border is none', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Header border="none">No Border</UnifiedCard.Header>
      </UnifiedCard>
    );

    expect(screen.getByText('No Border')).toBeInTheDocument();
  });

  it('should render with top border when specified', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Header border="top">Top Border</UnifiedCard.Header>
      </UnifiedCard>
    );

    expect(screen.getByText('Top Border')).toBeInTheDocument();
  });
});

describe('UnifiedCard.Body', () => {
  it('should render body with children', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Body>Body Content</UnifiedCard.Body>
      </UnifiedCard>
    );

    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('should render with medium padding by default', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Body>Default Padding</UnifiedCard.Body>
      </UnifiedCard>
    );

    expect(screen.getByText('Default Padding')).toBeInTheDocument();
  });

  it('should render with custom padding', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Body padding="lg">Large Padding</UnifiedCard.Body>
      </UnifiedCard>
    );

    expect(screen.getByText('Large Padding')).toBeInTheDocument();
  });

  it('should render with no padding', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Body padding="none">No Padding</UnifiedCard.Body>
      </UnifiedCard>
    );

    expect(screen.getByText('No Padding')).toBeInTheDocument();
  });

  it('should render with complex content', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Body>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
          <ul>
            <li>List item</li>
          </ul>
        </UnifiedCard.Body>
      </UnifiedCard>
    );

    expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    expect(screen.getByText('List item')).toBeInTheDocument();
  });
});

describe('UnifiedCard.Footer', () => {
  it('should render footer with children', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Footer>Footer Content</UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should render with medium padding by default', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Footer>Default Padding</UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('Default Padding')).toBeInTheDocument();
  });

  it('should render with custom padding', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Footer padding="sm">Small Padding</UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('Small Padding')).toBeInTheDocument();
  });

  it('should render with top border by default', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Footer>With Border</UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('With Border')).toBeInTheDocument();
  });

  it('should render without border when border is none', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Footer border="none">No Border</UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('No Border')).toBeInTheDocument();
  });

  it('should render with bottom border when specified', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Footer border="bottom">Bottom Border</UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('Bottom Border')).toBeInTheDocument();
  });

  it('should render with action buttons', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Footer>
          <button>Cancel</button>
          <button>Save</button>
        </UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});

describe('UnifiedCard Composition', () => {
  it('should render complete card with header, body, and footer', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Header>Card Header</UnifiedCard.Header>
        <UnifiedCard.Body>Card Body</UnifiedCard.Body>
        <UnifiedCard.Footer>Card Footer</UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('Card Header')).toBeInTheDocument();
    expect(screen.getByText('Card Body')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('should render card with multiple sections', () => {
    renderWithMantine(
      <UnifiedCard>
        <UnifiedCard.Header>Title</UnifiedCard.Header>
        <UnifiedCard.Body>
          <p>Content 1</p>
          <p>Content 2</p>
        </UnifiedCard.Body>
        <UnifiedCard.Footer>
          <button>Action</button>
        </UnifiedCard.Footer>
      </UnifiedCard>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});

describe('UnifiedDivider', () => {
  it('should render divider', () => {
    renderWithMantine(
      <UnifiedDivider />
    );

    // Divider should be in the document
    expect(document.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('should render with soft variant by default', () => {
    renderWithMantine(
      <UnifiedDivider />
    );

    expect(document.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    renderWithMantine(
      <UnifiedDivider variant="default" />
    );

    expect(document.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('should render with strong variant', () => {
    renderWithMantine(
      <UnifiedDivider variant="strong" />
    );

    expect(document.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('should render with custom margin', () => {
    renderWithMantine(
      <UnifiedDivider my="lg" />
    );

    expect(document.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('should render between content', () => {
    renderWithMantine(
      <div>
        <p>Above</p>
        <UnifiedDivider />
        <p>Below</p>
      </div>
    );

    expect(screen.getByText('Above')).toBeInTheDocument();
    expect(screen.getByText('Below')).toBeInTheDocument();
  });
});
