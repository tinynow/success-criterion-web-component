import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { createDOM, createElement } from './setup.js';

describe('SuccessCriterion Web Component', () => {
    let window, document, cleanup;

    beforeEach(() => {
        const dom = createDOM();
        window = dom.window;
        document = dom.document;
        cleanup = dom.cleanup;
    });

    afterEach(() => {
        cleanup();
    });

    describe('Component Registration', () => {
        it('should be defined in customElements registry', () => {
            const ComponentClass = window.customElements.get('success-criterion');
            assert.ok(ComponentClass, 'Component should be registered');
        });

        it('should create an instance via document.createElement', () => {
            const el = document.createElement('success-criterion');
            assert.ok(el instanceof window.HTMLElement);
        });

        it('should have a shadow root after construction', () => {
            const el = document.createElement('success-criterion');
            assert.ok(el.shadowRoot, 'Should have shadow root');
            assert.strictEqual(el.shadowRoot.mode, 'open');
        });
    });

    describe('Attribute Handling', () => {
        describe('data-number attribute', () => {
            it('should set number property when data-number is set', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);
                assert.strictEqual(el.number, '1.4.3');
            });

            it('should update number property when data-number changes', () => {
                const el = createElement(document, { 'data-number': '1.1.1' });
                document.body.appendChild(el);
                el.setAttribute('data-number', '1.4.3');
                assert.strictEqual(el.number, '1.4.3');
            });

            it('should handle data-number set before connection', () => {
                const el = document.createElement('success-criterion');
                el.setAttribute('data-number', '1.4.3');
                assert.strictEqual(el.number, '1.4.3');
            });
        });

        describe('data-mode attribute', () => {
            it('should default mode to "detailed"', () => {
                const el = document.createElement('success-criterion');
                assert.strictEqual(el.mode, 'detailed');
            });

            it('should set mode to "simple" when data-mode="simple"', () => {
                const el = createElement(document, {
                    'data-number': '1.4.3',
                    'data-mode': 'simple'
                });
                document.body.appendChild(el);
                assert.strictEqual(el.mode, 'simple');
            });

            it('should set mode to "tiny" when data-mode="tiny"', () => {
                const el = createElement(document, {
                    'data-number': '1.4.3',
                    'data-mode': 'tiny'
                });
                document.body.appendChild(el);
                assert.strictEqual(el.mode, 'tiny');
            });

            it('should update mode when data-mode changes', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);
                el.setAttribute('data-mode', 'tiny');
                assert.strictEqual(el.mode, 'tiny');
            });
        });

        describe('observedAttributes', () => {
            it('should observe data-number and data-mode', () => {
                const ComponentClass = window.customElements.get('success-criterion');
                const observed = ComponentClass.observedAttributes;
                assert.strictEqual(observed.length, 2);
                assert.strictEqual(observed[0], 'data-number');
                assert.strictEqual(observed[1], 'data-mode');
            });
        });
    });

    describe('Data Lookup', () => {
        it('should return criterion object for valid number', () => {
            const el = createElement(document, { 'data-number': '1.4.3' });
            document.body.appendChild(el);

            const criterion = el.criterion;
            assert.ok(criterion, 'Should find criterion');
            assert.strictEqual(criterion.num, '1.4.3');
            assert.strictEqual(criterion.handle, 'Contrast (Minimum)');
            assert.strictEqual(criterion.level, 'AA');
        });

        it('should return undefined for invalid number', () => {
            const el = createElement(document, { 'data-number': '9.9.9' });
            document.body.appendChild(el);

            assert.strictEqual(el.criterion, undefined);
        });

        it('should return undefined when number is empty', () => {
            const el = document.createElement('success-criterion');
            document.body.appendChild(el);

            assert.strictEqual(el.criterion, undefined);
        });

        it('should find criteria with different levels', () => {
            // Level A
            let el = createElement(document, { 'data-number': '1.1.1' });
            document.body.appendChild(el);
            assert.strictEqual(el.criterion.level, 'A');

            // Level AA
            el = createElement(document, { 'data-number': '1.4.3' });
            document.body.appendChild(el);
            assert.strictEqual(el.criterion.level, 'AA');

            // Level AAA
            el = createElement(document, { 'data-number': '1.4.6' });
            document.body.appendChild(el);
            assert.strictEqual(el.criterion.level, 'AAA');
        });
    });

    describe('Render Modes', () => {
        describe('Detailed Mode (default)', () => {
            it('should render detailed view by default', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const shadow = el.shadowRoot;
                assert.ok(shadow.querySelector('.sc-detailed'));
                assert.ok(shadow.querySelector('.sc-title'));
                assert.ok(shadow.querySelector('.sc-description'));
                assert.ok(shadow.querySelector('.sc-level'));
            });

            it('should include criterion number and handle in title', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const title = el.shadowRoot.querySelector('.sc-title');
                assert.ok(title.textContent.includes('1.4.3'));
                assert.ok(title.textContent.includes('Contrast (Minimum)'));
            });

            it('should display the level badge', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const level = el.shadowRoot.querySelector('.sc-level');
                assert.strictEqual(level.textContent, 'AA');
            });

            it('should render details list when present', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const dl = el.shadowRoot.querySelector('dl');
                assert.ok(dl, 'Should have definition list');

                const dts = dl.querySelectorAll('dt');
                assert.ok(dts.length > 0, 'Should have definition terms');
            });

            it('should not render details list when details are empty', () => {
                const el = createElement(document, { 'data-number': '2.4.7' });
                document.body.appendChild(el);

                const dl = el.shadowRoot.querySelector('dl');
                assert.strictEqual(dl, null, 'Should not have definition list');
            });

            it('should include Understanding and How to Meet links', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const links = el.shadowRoot.querySelectorAll('.references a');
                assert.strictEqual(links.length, 2);

                const understandingLink = links[0];
                assert.ok(understandingLink.href.includes('Understanding'));
                assert.ok(understandingLink.href.includes('contrast-minimum'));

                const howToMeetLink = links[1];
                assert.ok(howToMeetLink.href.includes('quickref'));
            });
        });

        describe('Simple Mode', () => {
            it('should render only number and handle as link', () => {
                const el = createElement(document, {
                    'data-number': '1.4.3',
                    'data-mode': 'simple'
                });
                document.body.appendChild(el);

                const shadow = el.shadowRoot;
                assert.strictEqual(shadow.querySelector('.sc-detailed'), null);

                const link = shadow.querySelector('a');
                assert.ok(link);
                assert.ok(link.textContent.includes('1.4.3'));
                assert.ok(link.textContent.includes('Contrast (Minimum)'));
            });

            it('should link to quickref URL', () => {
                const el = createElement(document, {
                    'data-number': '1.4.3',
                    'data-mode': 'simple'
                });
                document.body.appendChild(el);

                const link = el.shadowRoot.querySelector('a');
                assert.ok(link.href.includes('quickref'));
                assert.ok(link.href.includes('contrast-minimum'));
            });

            it('should have title attribute with number and handle', () => {
                const el = createElement(document, {
                    'data-number': '1.4.3',
                    'data-mode': 'simple'
                });
                document.body.appendChild(el);

                const link = el.shadowRoot.querySelector('a');
                assert.strictEqual(link.title, '1.4.3 Contrast (Minimum)');
            });
        });

        describe('Tiny Mode', () => {
            it('should render only number as link', () => {
                const el = createElement(document, {
                    'data-number': '1.4.3',
                    'data-mode': 'tiny'
                });
                document.body.appendChild(el);

                const link = el.shadowRoot.querySelector('a');
                assert.ok(link);
                assert.ok(link.textContent.includes('1.4.3'));
                assert.ok(!link.textContent.includes('Contrast'));
            });

            it('should have title attribute with full info', () => {
                const el = createElement(document, {
                    'data-number': '1.4.3',
                    'data-mode': 'tiny'
                });
                document.body.appendChild(el);

                const link = el.shadowRoot.querySelector('a');
                assert.strictEqual(link.title, '1.4.3 Contrast (Minimum)');
            });
        });
    });

    describe('Edge Cases', () => {
        describe('Missing or Invalid Data', () => {
            it('should render empty shadow root when no data-number', () => {
                const el = document.createElement('success-criterion');
                document.body.appendChild(el);

                assert.strictEqual(el.shadowRoot.innerHTML.trim(), '');
            });

            it('should render empty shadow root for invalid criterion number', () => {
                const el = createElement(document, { 'data-number': 'invalid' });
                document.body.appendChild(el);

                assert.strictEqual(el.shadowRoot.innerHTML.trim(), '');
            });

            it('should render empty for number that does not exist', () => {
                const el = createElement(document, { 'data-number': '99.99.99' });
                document.body.appendChild(el);

                assert.strictEqual(el.shadowRoot.innerHTML.trim(), '');
            });
        });

        describe('Attribute Changes', () => {
            it('should re-render when data-number changes', () => {
                const el = createElement(document, { 'data-number': '1.1.1' });
                document.body.appendChild(el);

                let title = el.shadowRoot.querySelector('.sc-title');
                assert.ok(title.textContent.includes('Non-text Content'));

                el.setAttribute('data-number', '1.4.3');
                title = el.shadowRoot.querySelector('.sc-title');
                assert.ok(title.textContent.includes('Contrast (Minimum)'));
            });

            it('should re-render when data-mode changes', () => {
                const el = createElement(document, {
                    'data-number': '1.4.3',
                    'data-mode': 'detailed'
                });
                document.body.appendChild(el);

                assert.ok(el.shadowRoot.querySelector('.sc-detailed'));

                el.setAttribute('data-mode', 'tiny');
                assert.strictEqual(el.shadowRoot.querySelector('.sc-detailed'), null);
                assert.ok(el.shadowRoot.querySelector('a'));
            });

            it('should not re-render when setting same value', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const originalHTML = el.shadowRoot.innerHTML;
                el.setAttribute('data-number', '1.4.3');
                assert.strictEqual(el.shadowRoot.innerHTML, originalHTML);
            });
        });

        describe('Link Attributes', () => {
            it('should have target="_blank" on all external links', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const links = el.shadowRoot.querySelectorAll('a');
                links.forEach(link => {
                    assert.strictEqual(link.target, '_blank');
                });
            });

            it('should have rel="noopener noreferrer" on all links', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const links = el.shadowRoot.querySelectorAll('a');
                links.forEach(link => {
                    assert.ok(link.rel.includes('noopener'));
                    assert.ok(link.rel.includes('noreferrer'));
                });
            });
        });

        describe('Style Encapsulation', () => {
            it('should include styles in shadow DOM', () => {
                const el = createElement(document, { 'data-number': '1.4.3' });
                document.body.appendChild(el);

                const style = el.shadowRoot.querySelector('style');
                assert.ok(style, 'Should have style element in shadow root');
            });
        });
    });

    describe('URL Generation', () => {
        it('should generate correct Understanding URL', () => {
            const el = createElement(document, { 'data-number': '1.4.3' });
            document.body.appendChild(el);

            const link = el.shadowRoot.querySelector('a[href*="Understanding"]');
            assert.strictEqual(
                link.href,
                'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum'
            );
        });

        it('should generate correct quickref URL', () => {
            const el = createElement(document, { 'data-number': '1.4.3' });
            document.body.appendChild(el);

            const link = el.shadowRoot.querySelector('a[href*="quickref"]');
            assert.strictEqual(
                link.href,
                'https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum'
            );
        });
    });
});
