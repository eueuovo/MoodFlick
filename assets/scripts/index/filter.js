export function filterOption() {
    const sort = document.getElementById("sort-select").value || "popular";
    const watchState = document.querySelector("input[name='watch-state']:checked").value;
    const dateFrom = document.getElementById("date-from").value || null;
    const dateTo = document.getElementById("date-to").value || null;
    const genre = [
        ...document.querySelectorAll(".genre li.selected")
    ].map(li => li.innerText);

    return {sort, watchState, dateFrom, dateTo, genre};
}