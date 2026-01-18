const WCAG_DATA = /* WCAG_DATA_PLACEHOLDER */[];

class SuccessCriterion extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    number = "";
    mode = 'detailed';

    get criterion() {
        return WCAG_DATA.find(({ num }) => num === this.number);
    }

    static get observedAttributes() {
        return ["data-number", "data-mode"];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data-number" && oldValue !== newValue) {
            this.number = newValue;
        }
        if (name === "data-mode" && oldValue !== newValue) {
            this.mode = newValue;
        }
        if (oldValue !== newValue && this.isConnected) {
            this.render();
        }
    }

    renderPicker() {
        const options = WCAG_DATA.map(item => {
            const label = this.mode === 'tiny'
                ? item.num
                : `${item.num} ${item.handle}`;
            return `<option value="${item.num}">${label}</option>`;
        }).join('');

        const styles = `
        :host {
            --sc-select-padding: 0.25em 0.5em;
            --sc-select-radius: 3px;

            display: contents;
        }
        select {
            font: inherit;
            color: inherit;
            padding: var(--sc-select-padding);
            border: 1px solid currentColor;
            border-radius: var(--sc-select-radius);
            background: transparent;
            cursor: pointer;
        }
        `;

        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <select aria-label="Select WCAG success criterion">
                <option value="">Select criterion…</option>
                ${options}
            </select>`;

        this.shadowRoot.querySelector('select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.setAttribute('data-number', e.target.value);
            }
        });
    }

    render() {
        const c = this.criterion;
        if (!c) {
            this.renderPicker();
            return;
        }

        const understandingUrl = `https://www.w3.org/WAI/WCAG22/Understanding/${c.id}`;
        const quickrefUrl = `https://www.w3.org/WAI/WCAG22/quickref/#${c.id}`;

        const styles = `
        :host {
            --sc-title-size: 1.125em;
            --sc-level-size: 0.625em;
            --sc-level-padding: 1px 4px;
            --sc-level-radius: 3px;
            --sc-icon-size: 0.75em;
            --sc-spacing: 0.5em;
            --sc-indent: 1em;
            --sc-gap: 1em;

            display: contents;
            font: inherit;
            line-height: inherit;
            color: inherit;
        }
        dl {
            margin-block: var(--sc-spacing);
        }
        dt {
            font-weight: bold;
            margin-top: var(--sc-spacing);
        }
        dd {
            margin-inline-start: var(--sc-indent);
        }
        .sc-title {
            font-weight: bold;
            font-size: var(--sc-title-size);
        }
        .sc-level {
            font-size: var(--sc-level-size);
            font-weight: normal;
            padding: var(--sc-level-padding);
            border: 1px solid currentColor;
            border-radius: var(--sc-level-radius);
            vertical-align: middle;
        }
        .sc-description {
            margin-block: var(--sc-spacing);
        }
        .sc-link-icon {
            width: var(--sc-icon-size);
            height: var(--sc-icon-size);
            vertical-align: baseline;
        }
        .references {
            margin-top: var(--sc-gap);
            display: flex;
            gap: var(--sc-gap);
            flex-wrap: wrap;
        }
        .references a {
            display: inline-flex;
            align-items: center;
            gap: 0.25em;
        }
        `;

        const linkIcon = `<svg class="sc-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>`;

        if (this.mode === 'tiny') {
            this.shadowRoot.innerHTML = `
                <style>${styles}</style>
                <a href="${quickrefUrl}" title="${c.num} ${c.handle}" target="_blank" rel="noopener noreferrer">
                    ${c.num}${linkIcon}
                </a>`;
            return;
        }

        if (this.mode === 'simple') {
            this.shadowRoot.innerHTML = `
                <style>${styles}</style>
                <a href="${quickrefUrl}" title="${c.num} ${c.handle}" target="_blank" rel="noopener noreferrer">
                    ${c.num} ${c.handle}${linkIcon}
                </a>`;
            return;
        }

        // Detailed mode
        const details = c.details?.[0]?.items?.map(item =>
            `<dt>${item.handle}</dt><dd>${item.text}</dd>`
        ).join('') || '';

        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <div class="sc-detailed">
                <p class="sc-title">
                    ${c.num} ${c.handle}
                    <span class="sc-level">${c.level}</span>
                </p>
                <p class="sc-description">${c.title}</p>
                ${details ? `<dl>${details}</dl>` : ''}
                <div class="references">
                    <a href="${understandingUrl}" target="_blank" rel="noopener noreferrer">
                        Understanding ${c.num}${linkIcon}
                    </a>
                    <a href="${quickrefUrl}" target="_blank" rel="noopener noreferrer">
                        How to Meet ${c.num}${linkIcon}
                    </a>
                </div>
            </div>`;
    }
}

customElements.define("success-criterion", SuccessCriterion);
