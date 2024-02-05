class TableSorter extends HTMLElement {
    // This web component is heavily based on Raymond Cambden's web component
    // The main difference is to sort based on DOM values rather than creating a data model first.
    // This could be slower as it involves more DOM searching and manipulation.
    // An advantage is that it keeps all row attributes and styling intact.
    // It also adds icons to the header to indicate current sort order
    // https://www.raymondcamden.com/2023/03/14/progressively-enhancing-a-table-with-a-web-component

    // TODO: Sort on numbers
    //  TH icons - these should be added only by own CSS!
    // Add buttons to TH? Yes, see link below.
    // Add aria-sort and live region: https://adrianroselli.com/2021/04/sortable-table-columns.html
    // Replace trend with spark line (difference component)
    // Highlight sorted column
    // Tidy comments
    // Interesting note for filtering component. Adrian always keeps filter options outside of the table
    // table is only for data and keeps from getting verbose. 
    // I wonder if I can put controls outside (size them with JS anyway) and anchor them to underneath
    // TH buttons so they look integrated?
    constructor() {
        super();

        this.tbody = null;
        this.headers = [];
        this.UP = "up";
        this.DOWN = "down";
    }

    connectedCallback() {


        let table = this.querySelector('table');

        // no table? end!
        if (!table) {
            console.warn('table-sort: No table found. Exiting.');
            return;
        }

        // require tbody and thead
        let tbody = table.querySelector('tbody');
        let thead = table.querySelector('thead');
        if (!tbody || !thead) {
            console.warn('table-sort: No tbody or thead found. Exiting.');
            return;
        }

        // copy body to this scope so we can use it again later
        this.tbody = tbody;

        // Get column indexes that contain numbers based on component attribute
        let numericColumns = [];
        if (this.hasAttribute('numeric')) {
            numericColumns = this.getAttribute('numeric').split(',').map(x => parseInt(x - 1, 10));
        }

        // Init our headers
        thead.querySelectorAll('th').forEach((h, i) => {
            this.headers.push(h);
            h.style.cursor = 'pointer';
            if (numericColumns.indexOf(i) >= 0) h.setAttribute("data-numeric", "");
            h.setAttribute("data-sort-order", "")
            h.addEventListener('click', e => {
                this.sortCol(e, i);
            });
        });

        // Add default component - keep limited to make customising easier
        // const styleEl = document.createElement("style");
        // styleEl.appendChild(document.createTextNode(""));
        // // Prepend to make it easier to override styles.
        // document.head.prepend(styleEl);
        // const styleSheet = styleEl.sheet;
        // styleSheet.insertRule(`th[data-sort-order]{user-select: none;}`);
    }

    sortRows(sortOrder, currentColumn, isNumberic) {
        return function (a, b) {
            let cellTextA = null;
            let cellTextB = null;

            const cellTextContentA = a.querySelector(`td:nth-child(${currentColumn})`).textContent;
            const cellTextContentB = b.querySelector(`td:nth-child(${currentColumn})`).textContent;

            if (isNumberic) {
                cellTextA = parseInt(cellTextContentA, 10);
                cellTextB = parseInt(cellTextContentB, 10);

                if (isNaN(cellTextA)) {
                    return -1;
                }
                if (isNaN(cellTextB)) {
                    return 1;
                }

                if (sortOrder === this.UP) {
                    return cellTextA - cellTextB;
                }
                else {
                    return cellTextB - cellTextA;
                }
            } else {
                cellTextA = cellTextContentA.toLowerCase();
                cellTextB = cellTextContentB.toLowerCase();
                if (sortOrder === this.UP) {
                    return cellTextA.localeCompare(cellTextB);
                }
                else {
                    return cellTextB.localeCompare(cellTextA);
                }
            }


        }
    }

    sortCol(e, i) {
        const th = this.headers[i];
        let currentColumn = null;
        // Reset other columns and set current column index
        this.headers.forEach((thCurrent, index) => {
            (thCurrent != th) ? thCurrent.dataset.sortOrder = "" : currentColumn = index + 1;
        })

        const currentOrder = th.dataset.sortOrder;
        let newOrder = null;
        // toggle the sort order
        if (currentOrder === "") {
            th.dataset.sortOrder = newOrder = this.UP;
        }
        else {
            th.dataset.sortOrder = newOrder = currentOrder === this.DOWN ? this.UP : this.DOWN;
        }


        let tableRows = Array.from(this.tbody.querySelectorAll(`tr`));
        // Bind to this or this isn't found in sortRows
        tableRows.sort(this.sortRows(newOrder, currentColumn, th.hasAttribute("data-numeric")).bind(this));
        this.tbody.append(...tableRows);
    }
}

if (!customElements.get('table-sort')) customElements.define('table-sort', TableSorter);

