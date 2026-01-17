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
        :host { display: contents; }
        select {
            font: inherit;
            padding: 0.25em 0.5em;
            border: 1px solid currentColor;
            border-radius: 3px;
            background: transparent;
            cursor: pointer;
        }
        `;

        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <select>
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
            --sc-font-size: 16px;
            --sc-font-family: sans-serif;
            --sc-bg-dark: #333;
            --sc-bg-light: #efefef;

            display: contents;
            font-family: var(--sc-font-family);
            font-size: var(--sc-font-size);
            line-height: 1.5;
        }
        * {
            margin: 0;
            padding: 0;
        }
        dl {
            margin-block: 0.5em;
        }
        dt {
            font-weight: bold;
            margin-top: 0.5em;
        }
        dd {
            margin-inline-start: 1em;
        }
        .sc-title {
            font-weight: bold;
            font-size: 1.125em;
        }
        .sc-level {
            font-size: .625em;
            font-weight: normal;
            padding: 1px 4px;
            border: 1px solid currentColor;
            border-radius: 3px;
            vertical-align: middle;
        }
        .sc-description {
            margin-block: 0.5em;
        }
        .sc-link-icon {
            width: 0.75em;
            height: 0.75em;
            vertical-align: baseline;
        }
        .references {
            margin-top: 1em;
            display: flex;
            gap: 1em;
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
