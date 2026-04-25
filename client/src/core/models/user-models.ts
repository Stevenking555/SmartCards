/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
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
    currentPassword?: string;
}

export interface UserStats {
    flippedCardsTotal: number;
    flippedCardsToday: number;
    learningStreak: number;
    totalDecks: number;
    totalCards: number;
    totalMasteredCards: number;
    weeklyActivityJson: string;
}

