import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (smoke test)', () => {
    it('merges class names', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
    });
    
    it('handles conditional classes', () => {
        const includeHidden = false;
        expect(cn('base', includeHidden && 'hidden', 'extra')).toBe('base extra');
    });
});