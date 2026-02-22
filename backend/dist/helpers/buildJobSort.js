"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJobSort = buildJobSort;
// reusable sort function in every job listing
function buildJobSort(sort) {
    switch (sort) {
        case "budget_asc":
            return { "payment.budget": 1, _id: -1 };
        case "budget_desc":
            return { "payment.budget": -1, _id: -1 };
        case "newest":
        default:
            return { _id: -1 };
    }
}
