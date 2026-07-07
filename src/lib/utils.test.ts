import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (smoke test)', () => {
    it('merges class names', () => {
        expect(cn('px-2', 'px-4')).toBe('px-4');
    });
    
    it('handles conditional classes', () => {
        expect(cn('base', false && 'hidden', 'extra')).toBe('base extra');
    });
});