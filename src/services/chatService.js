import { get, post, getPage } from "../utils/request";

const API_PATH = "conversations";

export const getConversations = async (params = {}) => {
    return await getPage(API_PATH, params);
};

export const getConversationMessages = async ( params = {}) => {
    return await getPage(`chat/messages`, params);
};

export const sendMessage = async (receiverId, content) => {
    return await post(`chat/messages`, { receiverId, content });
};