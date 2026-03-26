export type User = {
    id: string;
    displayName: string;
    email: string;
    token: string;
    imaginerUrl?: string;
}

export type LoginCreds = {
    email: string;
    password: string;
}

export type RegisterCreds = {
    email: string;
    displayName: string;
    password: string;
}

export type ChangePasswordForm = {
    oldPassword?: string;
    newPassword?: string;
}

export type UpdateEmailForm = {
    newEmail?: string;
    currentPassword?: string;
}

export type UserUpdateForm = {
    displayName?: string;
}
