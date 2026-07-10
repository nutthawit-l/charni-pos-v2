import { describe, expect, it } from 'vitest';
import { normalizeImageUrl } from './image-url';

describe('normalizeImageUrl', () => {
    it('prepends https to bare hostnames', () => {
        expect(normalizeImageUrl('charni-pos-r2.ntwtech.com/products/foo.png'))
            .toBe('https://charni-pos-r2.ntwtech.com/products/foo.png');
    });

    it('leaves absolute URLs unchanged', () => {
        expect(normalizeImageUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
        expect(normalizeImageUrl('http://example.com/a.png')).toBe('http://example.com/a.png');
    });

    it('leaves app-relative URLs unchanged', () => {
        expect(normalizeImageUrl('/api/images/products/foo.png'))
            .toBe('/api/images/products/foo.png');
    });
});
