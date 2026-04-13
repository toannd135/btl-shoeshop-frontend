import { post } from "../utils/request"

export const estimateShipping = async (data) => {
    return await post("shipping/estimate", data);
}