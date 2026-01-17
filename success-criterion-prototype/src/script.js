class SuccessCriterion extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    // Define the criteria data (unchanged)
    criteria = [];
    wcagData = [];
    number = "";
    mode = 'detailed';
    get criterion() {
        return this.criteria.find(({ ref_id }) => ref_id === this.number);
    }

    static get observedAttributes() {
        return ["data-number", "data-mode"];
    }

    connectedCallback() {
        this.fetchCriteria().then(() => {
            this.getSuccessCriteria();
            this.render();
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "data-number" && oldValue !== newValue) {
            this.number = newValue;
        }
        if (name === "data-mode" && oldValue !== newValue) {
            this.mode = newValue;
        }
        
        
    }
    async fetchCriteria() {
        const response = await fetch(
            "https://raw.githubusercontent.com/tenon-io/wcag-as-json/refs/heads/master/wcag.json?raw",
            { cache: "force-cache" }
        );
        this.wcagData = await response.json();
    }
    getSuccessCriteria() {
        const criteria = [];
        this.wcagData.forEach((principle) => {
            principle.guidelines.forEach((guideline) => {
                guideline.success_criteria.forEach((criterion) => {
                    criteria.push(criterion);
                });
            });
        });
        this.criteria = criteria;
    }
    render() {
        const styles = `
        [hidden] { display: none !important; }
         :host {
             --sc-font-size: 16px;
             --sc-font-family: sans-serif;
             --sc-bg-dark: #333;
             --sc-bg-light: #efefef;
             
             display: contents;
             font-family: var(--sc-font-family);
             font-size: var(--sc-font-size);
             line-height: 1.5;
             border: 1px solid light-dark(var(--sc-bg-dark), var(--sc-bg-light));
             border-radius: 3px;
             
             * {
                margin: 0;
                padding: 0;
             }
             code {
                font-size: .875em;
                background-color: light-dark(var(--sc-bg-dark), var(--sc-bg-light));
                color: light-dark(var(--sc-bg-light), var(--sc-bg-dark));
                padding-inline: 4px;
                border-radius: 3px;
             }
             ul {
                margin-inline-start: 1em;
             }
             dt {
                font-weight: bold;
             }
             dd {
                text-indent: 1em;
             }
             .sc-title {
                font-weight: bold;
                font-size: 1.125em;
                display: inline-flex;
                align-items: center;
                gap: 4px;
             }
             .sc-level {
                font-size: .625em;
                font-weight: normal;
                line-height: 1.2;
                padding-inline: 2px;
                border: 1px solid light-dark(var(--sc-bg-dark), var(--sc-bg-light));
                border-radius: 3px;
             }
             .sc-link-icon {
                aspect-ratio: 1;
                height: .825em;
             }
         }`;
        const base = `<style>${styles}</style>
        <svg xmlns="http://www.w3.org/2000/svg" hidden>
             <defs>
                <g id="external-link-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
                     <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                     <polyline points="15 3 21 3 21 9"></polyline>
                     <line x1="10" y1="14" x2="21" y2="3"></line>
                </g>
             </defs>
         </svg>`
        const select = (criteria, selected_id = '') => 
        `<select aria-label="Select a success criterion">
            <option value="">Select a success criterion</option>
            ${criteria.map((criterion) => 
            `<option 
                value="${criterion.ref_id}" 
                ${criterion.ref_id === selected_id ? "selected" : ""}>
                ${criterion.ref_id} - ${criterion.title}
             </option>`).join("")}
        </select>`
        const html = (strings, ...values) => {
            return strings.join(' ');
        }
        
        const tiny = c => 
        `<a 
            class="sc-info sc--tiny"
            href="${c.references[1].url}"
            title="${c.ref_id} - ${c.title}"
            target="_blank" rel="noopener noreferrer">
            <span>${c.ref_id}</span><svg 
                xmlns="http://www.w3.org/2000/svg"
                class="sc-link-icon sc--tiny sc--simple"
                viewBox="0 0 24 24">
                <use href="#external-link-icon"></use>
            </svg></a>`
        
        const simple = c => 
        `<a 
            class="sc-info sc--simple"
            href="${c.references[1].url}"
            title="${c.ref_id} - ${c.title}"
            target="_blank" rel="noopener noreferrer">
            <span>${c.ref_id} - ${c.title}</span>
            <svg 
                xmlns="http://www.w3.org/2000/svg"
                class="sc-link-icon"
                viewBox="0 0 24 24">
                <use href="#external-link-icon"></use>
            </svg></a>`;
        
        const detailed = c => 
        `<div class="sc-detailed">
            <span class="sc-title">
                ${this.criterion.ref_id} - ${this.criterion.title}
                <span class="sc-level">${this.criterion.level}</span>
            </span>
            <p class="sc-description">${this.criterion.description}</p>
                ${
                    this.criterion.special_cases
                        ? `<dl>${this.criterion.special_cases
                              .map(
                                  ({ title, description }) =>
                                      `<dt>${title}</dt><dd>${description}</dd>`
                              )
                              .join("")}</dl>`
                        : ""
                }
        <div class="references">
          <a class="sc-how-to-meet" href="${
              this.criterion.references[1].url
          }" target="_blank" rel="noopener noreferrer">${
            this.criterion.references[1].title
        }
            <svg class="sc-link-icon" width="16" height="16" viewBox="0 0 24 24"><use href="#external-link-icon"></use></svg>
          </a>
          <a class="sc-understanding-link" href="${
              this.criterion.references[0].url
          }" target="_blank" rel="noopener noreferrer">${
            this.criterion.references[0].title
        }
            <svg class="sc-link-icon" width="16" height="16" viewBox="0 0 24 24"><use href="#external-link-icon"></use></svg>
          </a></div>
          `
        const instructions = `
        <details id="sc-selection-instructions" class="sc-selection-instructions">
          <summary>How to use this web component</summary>
          <ul>
            <li>To display as single success criterion (without the select), add the <code>data-number="[wcagNumber]"</code>.</li>
            <li>To control how much information is shown, use <code>data-mode</code> with values of <code>detailed</code>, <code>simple</code>, or <code>tiny</code>.</li>
            <li>To hide these instructions add keep the select add <code>data-mode="select"</code>.</p></li>
          </ul>
          </details>`
        const template = () => {
            console.log(this.attributes)
            if (!this.criterion) {
                return select(this.criteria) + instructions;
            }
            if (this.mode === 'selector' || !this.hasAttribute('data-number')) {
                return select(this.criteria, this.criterion.ref_id) + detailed(this.criterion);
            }
            if (this.mode === 'detailed') {
                return detailed(this.criterion);
            }
            if (this.mode === 'simple') {
                return simple(this.criterion);
            }
            if (this.mode === 'tiny') {
                return tiny(this.criterion);
            }
        }

        this.shadowRoot.innerHTML =`${base}${template()}`;
        
        if (this.mode === 'selector' || !this.hasAttribute('data-number')) {
            console.log(this.shadowRoot)
            const select = this.shadowRoot.querySelector("select");
            select.addEventListener("change", (e) => {
                this.number = e.target.value;
                this.render();
            });
        }
    }
}

customElements.define("success-criterion", SuccessCriterion);
