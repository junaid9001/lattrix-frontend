import { apiFetch } from "./http"

export function getMyNotifications() {
    return apiFetch("/api/notifications");
}
