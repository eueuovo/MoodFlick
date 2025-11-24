export function filterOption() {
    const sort = document.querySelector(":scope #filter-container .sort-select").value || "popular";
    const watchState = document.querySelector("input[name='watch-state']:checked").value;
    const dateFrom = document.querySelector(":scope #filter-container .date-range > label > .date-from").value || null;
    const dateTo = document.querySelector(":scope #filter-container .date-range > label > .date-to").value || null;
    const genre = [
        ...document.querySelectorAll(".genre li.selected")
    ].map(li => li.innerText);

    return {sort, watchState, dateFrom, dateTo, genre};
}

document.querySelectorAll(".genre li").forEach(li => {
    li.addEventListener("click", () => {
        li.classList.toggle("selected");
    });
});