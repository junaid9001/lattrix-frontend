
import axios from "./axios";

export const getRoles = () => {
    return axios.get("/rbac/roles");
};

export const createRole = ({ name, permissionIds }) => {
    return axios.post("/rbac/roles", {
        name,
        permission_ids: permissionIds,
    });
};


export const getPermissions = () => {
    return axios.get("/rbac/permissions");
};

export const sendInvite = ({ email, roleId }) => {
    return axios.post("api/invitations/send", {
        email,
        role_id: roleId,
    });
};

export const updateRole = ({ userId, roleId }) => {
  return axios.put(`/rbac/users/${userId}/role`, {
    role_id: roleId,
  });
};


export const allUsers=()=>{
    return axios.get("/users")
}
