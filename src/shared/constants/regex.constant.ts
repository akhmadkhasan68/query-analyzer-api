export const REGEX = {
    PASSWORD: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
    PHONE_NUMBER_ID: /^62[0-9]{9,13}$/,
} as const;
