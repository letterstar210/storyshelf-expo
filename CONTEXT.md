# Comic Reading Tracker

This context describes the terms used for the reader's local comic and web-novel library. It keeps the Library browsing experience consistent as the collection grows.

## Product Identity

**Comic Reading Tracker**:
The product name for the reader's local library of comics and web novels.
_Avoid_: Renaming the product to Novel Tracking when describing the existing application.

**Entry**:
A saved comic or web-novel record in Comic Reading Tracker.
_Avoid_: Novel when referring to the domain model or existing UI copy.

## Language

**Library Results**:
The current ordered set of entries after the reader's search and sort choices are applied.
_Avoid_: List data, visible entries

**Editorial Index**:
The one-based position of an Entry in the current Library Results. It remains continuous across Results Pages and changes only when the current search, sort, or visibility filter changes.
_Avoid_: Page number, row number that restarts on each Results Page

**Entry Actions Popup**:
The compact popup opened from an Entry's Actions control on small screens. It contains Check Link, Edit, and Delete so the Library Result row stays scannable.
_Avoid_: Permanent action button groups in every mobile row

**Link Check Summary**:
Optional secondary metadata on an Entry that is shown only after a meaningful link-check result exists. An available update, checked latest chapter, broken link, or blocked source is useful; an unchecked placeholder is not shown.
_Avoid_: A default link-check badge on every Library Result

**Results Page**:
One bounded slice of Library Results shown at a time. Changing the search query, sort option, or page size starts again at page 1.
_Avoid_: Screen, batch

**Pagination Controls**:
The Library navigation for Results Pages: first page, previous page, directly selectable page numbers, next page, and last page.
_Avoid_: Scroll controls, list buttons

**Page Size Selector**:
The Library control above the entries that sets how many Library Results appear in each Results Page: 10, 20, 50, or 100.
_Avoid_: Result limit, load count

**Visible Page Window**:
The five directly selectable Results Pages around the current Results Page; omitted ranges appear as an ellipsis.
_Avoid_: All page numbers, page strip

**Library Result Change**:
An add, import, edit, or delete that changes Library Results. Adds, imports, and edits return the reader to Results Page 1; deletes retain the current page when it remains valid.
_Avoid_: Refresh, reload

**Default Page Size**:
The initial Page Size Selector value for the Library: 20 Library Results per Results Page.
_Avoid_: Default limit, standard count

**Saved Page Size**:
The Page Size Selector value last chosen on this device. It is reused when the app opens again.
_Avoid_: Session-only page size, temporary limit

## Example Dialogue

Developer: "The search changed, so should the reader remain on Results Page 4?"

Domain expert: "No. Library Results have changed, so start at Results Page 1."

Developer: "The reader is on Results Page 4 and wants to review the earliest entries again."

Domain expert: "Use Pagination Controls to return to the first Results Page."

Developer: "Where should the reader choose how many entries appear at once?"

Domain expert: "Use the Page Size Selector above Library Results; keep Pagination Controls at the end of the current Results Page."

Developer: "The Library has 30 Results Pages. Should every number be visible?"

Domain expert: "No. Keep a Visible Page Window of five numbers and use an ellipsis for the skipped range."

Developer: "An import creates new Library Results. Which page should the reader see?"

Domain expert: "Start at Results Page 1 so the new results are immediately visible."

Developer: "What should the Library show before the reader chooses a Page Size?"

Domain expert: "Use the Default Page Size of 20 Library Results per Results Page."

Developer: "The reader chose 50 results per page. What happens after reopening the app?"

Domain expert: "Reuse the Saved Page Size of 50 on this device."
