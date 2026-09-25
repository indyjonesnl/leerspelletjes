import { describe, it, expect } from 'vitest';
import { el, svgEl } from './ui';

describe('el', () => {
  it('sets attributes, skips false/undefined, and appends children', () => {
    const node = el('button', { class: 'x', disabled: true, hidden: false, title: undefined, 'data-id': 'a' }, 'Hi', el('span'));
    expect(node.tagName).toBe('BUTTON');
    expect(node.className).toBe('x');
    expect(node.hasAttribute('disabled')).toBe(true);
    expect(node.hasAttribute('hidden')).toBe(false);
    expect(node.hasAttribute('title')).toBe(false);
    expect(node.dataset.id).toBe('a');
    expect(node.textContent).toBe('Hi');
    expect(node.children).toHaveLength(1);
  });
});

describe('svgEl', () => {
  it('creates SVG-namespaced elements with attributes', () => {
    const c = svgEl('circle', { r: 5, class: 'dot' });
    expect(c.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(c.getAttribute('r')).toBe('5');
    expect(c.getAttribute('class')).toBe('dot');
  });
});
