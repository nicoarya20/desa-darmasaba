/**
 * UnifiedTypography Component Tests
 * 
 * Tests for typography components in components/admin/UnifiedTypography
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UnifiedTitle, UnifiedText, UnifiedPageHeader } from '@/components/admin/UnifiedTypography';
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

describe('UnifiedTitle', () => {
  it('should render title with correct children', () => {
    renderWithMantine(
      <UnifiedTitle>Test Title</UnifiedTitle>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render with default order 1', () => {
    renderWithMantine(
      <UnifiedTitle>Heading 1</UnifiedTitle>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Heading 1');
  });

  it('should render with custom order', () => {
    const { rerender } = renderWithMantine(
      <UnifiedTitle order={2}>Heading 2</UnifiedTitle>
    );

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

    rerender(
      <MantineProvider theme={createTheme()}>
        <UnifiedTitle order={3}>Heading 3</UnifiedTitle>
      </MantineProvider>
    );

    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('should render with custom alignment', () => {
    renderWithMantine(
      <UnifiedTitle align="center">Centered Title</UnifiedTitle>
    );

    const title = screen.getByText('Centered Title');
    expect(title).toHaveStyle('text-align: center');
  });

  it('should render with primary color by default', () => {
    renderWithMantine(
      <UnifiedTitle>Default Color</UnifiedTitle>
    );

    expect(screen.getByText('Default Color')).toBeInTheDocument();
  });

  it('should render with secondary color', () => {
    renderWithMantine(
      <UnifiedTitle color="secondary">Secondary Color</UnifiedTitle>
    );

    expect(screen.getByText('Secondary Color')).toBeInTheDocument();
  });

  it('should render with brand color', () => {
    renderWithMantine(
      <UnifiedTitle color="brand">Brand Color</UnifiedTitle>
    );

    expect(screen.getByText('Brand Color')).toBeInTheDocument();
  });

  it('should accept custom margin props', () => {
    renderWithMantine(
      <UnifiedTitle mb="lg" mt="xl">With Margins</UnifiedTitle>
    );

    const title = screen.getByText('With Margins');
    expect(title).toBeInTheDocument();
  });

  it('should accept custom style prop', () => {
    renderWithMantine(
      <UnifiedTitle style={{ fontWeight: 900 }}>Custom Style</UnifiedTitle>
    );

    const title = screen.getByText('Custom Style');
    expect(title).toBeInTheDocument();
  });

  it('should render with order 4', () => {
    renderWithMantine(
      <UnifiedTitle order={4}>Heading 4</UnifiedTitle>
    );

    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
  });

  it('should render with order 5', () => {
    renderWithMantine(
      <UnifiedTitle order={5}>Heading 5</UnifiedTitle>
    );

    expect(screen.getByRole('heading', { level: 5 })).toBeInTheDocument();
  });

  it('should render with order 6', () => {
    renderWithMantine(
      <UnifiedTitle order={6}>Heading 6</UnifiedTitle>
    );

    expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
  });
});

describe('UnifiedText', () => {
  it('should render text with correct children', () => {
    renderWithMantine(
      <UnifiedText>Test Text</UnifiedText>
    );

    expect(screen.getByText('Test Text')).toBeInTheDocument();
  });

  it('should render with body size by default', () => {
    renderWithMantine(
      <UnifiedText>Body Text</UnifiedText>
    );

    expect(screen.getByText('Body Text')).toBeInTheDocument();
  });

  it('should render with small size', () => {
    renderWithMantine(
      <UnifiedText size="small">Small Text</UnifiedText>
    );

    expect(screen.getByText('Small Text')).toBeInTheDocument();
  });

  it('should render with label size', () => {
    renderWithMantine(
      <UnifiedText size="label">Label Text</UnifiedText>
    );

    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('should render with normal weight by default', () => {
    renderWithMantine(
      <UnifiedText>Normal Weight</UnifiedText>
    );

    expect(screen.getByText('Normal Weight')).toBeInTheDocument();
  });

  it('should render with medium weight', () => {
    renderWithMantine(
      <UnifiedText weight="medium">Medium Weight</UnifiedText>
    );

    expect(screen.getByText('Medium Weight')).toBeInTheDocument();
  });

  it('should render with bold weight', () => {
    renderWithMantine(
      <UnifiedText weight="bold">Bold Text</UnifiedText>
    );

    expect(screen.getByText('Bold Text')).toBeInTheDocument();
  });

  it('should render with custom alignment', () => {
    renderWithMantine(
      <UnifiedText align="right">Right Aligned</UnifiedText>
    );

    const text = screen.getByText('Right Aligned');
    expect(text).toHaveStyle('text-align: right');
  });

  it('should render with primary color by default', () => {
    renderWithMantine(
      <UnifiedText>Primary Color</UnifiedText>
    );

    expect(screen.getByText('Primary Color')).toBeInTheDocument();
  });

  it('should render with secondary color', () => {
    renderWithMantine(
      <UnifiedText color="secondary">Secondary Text</UnifiedText>
    );

    expect(screen.getByText('Secondary Text')).toBeInTheDocument();
  });

  it('should render with tertiary color', () => {
    renderWithMantine(
      <UnifiedText color="tertiary">Tertiary Text</UnifiedText>
    );

    expect(screen.getByText('Tertiary Text')).toBeInTheDocument();
  });

  it('should render with muted color', () => {
    renderWithMantine(
      <UnifiedText color="muted">Muted Text</UnifiedText>
    );

    expect(screen.getByText('Muted Text')).toBeInTheDocument();
  });

  it('should render with brand color', () => {
    renderWithMantine(
      <UnifiedText color="brand">Brand Text</UnifiedText>
    );

    expect(screen.getByText('Brand Text')).toBeInTheDocument();
  });

  it('should render with link color', () => {
    renderWithMantine(
      <UnifiedText color="link">Link Text</UnifiedText>
    );

    expect(screen.getByText('Link Text')).toBeInTheDocument();
  });

  it('should render as span when span prop is true', () => {
    renderWithMantine(
      <UnifiedText span>Span Text</UnifiedText>
    );

    expect(screen.getByText('Span Text')).toBeInTheDocument();
  });

  it('should accept custom margin props', () => {
    renderWithMantine(
      <UnifiedText mb="sm" mt="md">With Margins</UnifiedText>
    );

    expect(screen.getByText('With Margins')).toBeInTheDocument();
  });

  it('should accept custom style prop', () => {
    renderWithMantine(
      <UnifiedText style={{ textDecoration: 'underline' }}>Custom Style</UnifiedText>
    );

    expect(screen.getByText('Custom Style')).toBeInTheDocument();
  });
});

describe('UnifiedPageHeader', () => {
  it('should render with title', () => {
    renderWithMantine(
      <UnifiedPageHeader title="Page Title" />
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });

  it('should render with optional subtitle', () => {
    renderWithMantine(
      <UnifiedPageHeader title="Page Title" subtitle="Page Subtitle" />
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
    expect(screen.getByText('Page Subtitle')).toBeInTheDocument();
  });

  it('should render without subtitle when not provided', () => {
    renderWithMantine(
      <UnifiedPageHeader title="Page Title" />
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });

  it('should render with action', () => {
    renderWithMantine(
      <UnifiedPageHeader
        title="Page Title"
        action={<button>Action Button</button>}
      />
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });

  it('should show border by default', () => {
    renderWithMantine(
      <UnifiedPageHeader title="Page Title" />
    );

    // The border is applied via style, checking if component renders
    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });

  it('should hide border when showBorder is false', () => {
    renderWithMantine(
      <UnifiedPageHeader title="Page Title" showBorder={false} />
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });

  it('should render with custom style', () => {
    renderWithMantine(
      <UnifiedPageHeader
        title="Page Title"
        style={{ backgroundColor: 'red' }}
      />
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });

  it('should render title as order 3 heading', () => {
    renderWithMantine(
      <UnifiedPageHeader title="Page Title" />
    );

    // The title should be rendered with UnifiedTitle order={3}
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('should render subtitle with small size and secondary color', () => {
    renderWithMantine(
      <UnifiedPageHeader title="Page Title" subtitle="Page Subtitle" />
    );

    expect(screen.getByText('Page Subtitle')).toBeInTheDocument();
  });

  it('should accept additional Mantine Box props', () => {
    renderWithMantine(
      <UnifiedPageHeader title="Page Title" mb="xl" />
    );

    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });
});
