import { edit, getPage, post } from "../utils/request";

export const searchInventoryTransactions = async (params = {}) => {
    const response = await getPage("inventory-transactions/search", params);
    return response;
};

export const createInventoryTransaction = async (data) => {
    const response = await post("inventory-transactions", data);
    return response;
};

export const updateInventoryTransactionStatus = async (itId, status) => {
    const response = await edit(
        `inventory-transactions/${itId}/status?status=${status}`,
        {}
    );
    return response;
};