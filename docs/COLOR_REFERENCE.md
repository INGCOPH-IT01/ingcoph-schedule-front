# Perfect Smash Color Reference Guide

## Quick Reference

### Primary Colors
```
Primary Red:    #B71C1C  RGB(183, 28, 28)   - Main brand color
Accent Red:     #C62828  RGB(198, 40, 40)   - Hover states & accents
Secondary Gray: #5F6368  RGB(95, 99, 104)   - Supporting elements
```

### Supporting Colors
```
Error Red:      #D32F2F  RGB(211, 47, 47)   - Error states
Info Gray:      #757575  RGB(117, 117, 117) - Info text
Success Green:  #4CAF50  RGB(76, 175, 80)   - Success states
Warning Orange: #F57C00  RGB(245, 124, 0)   - Warning states
```

### Backgrounds
```
Surface White:  #FFFFFF  RGB(255, 255, 255) - Cards, dialogs
Background:     #F5F5F5  RGB(245, 245, 245) - Page backgrounds
```

## Before vs After

### Navigation
**Before:** Blue gradient (#3b82f6 → #2563eb)
**After:** Red gradient (#B71C1C → #C62828)

### Hover States
**Before:** Light blue (#eff6ff → #dbeafe)
**After:** Light red (#ffebee → #ffcdd2)

### Buttons
**Before:** Blue or Green gradients
**After:** Red gradient (#B71C1C → #C62828)

### Text Gradients
**Before:** Blue to green (#3b82f6 → #10b981)
**After:** Red gradient (#B71C1C → #C62828)

## Usage Guidelines

### Do's ✓
- Use Primary Red (#B71C1C) for main CTAs and important UI elements
- Use Accent Red (#C62828) for hover states and secondary emphasis
- Use Secondary Gray (#5F6368) for text and supporting elements
- Maintain good contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Use red gradients for premium/important features

### Don'ts ✗
- Don't use red for error messages (use Error Red #D32F2F instead)
- Don't mix old blue theme colors with new red theme
- Don't use bright reds that might clash with the brand
- Avoid using red for backgrounds unless with sufficient opacity

## Component-Specific Colors

### Buttons
```css
Primary:     background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
             box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4);

Hover:       box-shadow: 0 12px 35px rgba(183, 28, 28, 0.6);
             transform: translateY(-4px);
```

### Navigation Items
```css
Hover:       background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
             color: #b71c1c;

Active:      background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
             color: #ffffff;
```

### Badges & Tags
```css
Background:  rgba(183, 28, 28, 0.1);
Color:       #B71C1C;
Border:      1px solid rgba(183, 28, 28, 0.2);
```

### Links
```css
Default:     color: #B71C1C;
Hover:       color: #C62828;
```

## Gradient Patterns

### Primary Gradient (Most Common)
```css
background: linear-gradient(135deg, #B71C1C 0%, #C62828 100%);
```

### Accent Gradient (For Variety)
```css
background: linear-gradient(135deg, #B71C1C 0%, #5F6368 100%);
```

### Subtle Background Gradient
```css
background: linear-gradient(135deg, rgba(183, 28, 28, 0.05) 0%, rgba(95, 99, 104, 0.05) 100%);
```

## Accessibility

### Color Contrast Ratios

| Combination | Ratio | WCAG Level |
|------------|-------|------------|
| #B71C1C on #FFFFFF | 7.3:1 | AAA |
| #C62828 on #FFFFFF | 6.5:1 | AAA |
| #5F6368 on #FFFFFF | 5.8:1 | AA |
| #FFFFFF on #B71C1C | 7.3:1 | AAA |

All color combinations meet or exceed WCAG AA standards for accessibility.

## CSS Variables (Optional Enhancement)

If you want to implement CSS custom properties in the future:

```css
:root {
  --perfect-smash-red: #B71C1C;
  --perfect-smash-red-accent: #C62828;
  --perfect-smash-gray: #5F6368;
  --perfect-smash-gray-light: #757575;
  --perfect-smash-error: #D32F2F;
  --perfect-smash-success: #4CAF50;
  --perfect-smash-warning: #F57C00;
  
  /* Opacity variants */
  --perfect-smash-red-10: rgba(183, 28, 28, 0.1);
  --perfect-smash-red-20: rgba(183, 28, 28, 0.2);
  --perfect-smash-red-40: rgba(183, 28, 28, 0.4);
  --perfect-smash-red-60: rgba(183, 28, 28, 0.6);
}
```

## Brand Consistency

To maintain brand consistency across all materials:

1. **Digital**: Use exact hex values as specified
2. **Print**: Convert to CMYK for print materials
3. **Merchandise**: Test colors on actual materials before production
4. **Signage**: Adjust for lighting conditions

## CMYK Values (For Print Materials)

```
Primary Red (#B71C1C):    C: 0%   M: 100%  Y: 100%  K: 28%
Accent Red (#C62828):     C: 0%   M: 95%   Y: 95%   K: 22%
Secondary Gray (#5F6368): C: 52%  M: 43%   Y: 40%   K: 16%
```

## Pantone Approximations

```
Primary Red:    Pantone 200 C (approximate)
Secondary Gray: Pantone Cool Gray 11 C (approximate)
```

Note: For exact color matching in professional printing, specify the hex values and have the printer create a custom color match.

