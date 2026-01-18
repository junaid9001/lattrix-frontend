
import axios from "./axios";

export function getMyNotifications() {
    return axios.get("/api/notifications");
}

export function markAsRead(id) {
    return axios.put(`/api/notifications/${id}/read`);
}

export function acceptInvitation(token) {
    return axios.post("/api/invitations/accept", { token });
}

