/**
 * @fileoverview
 * This file defines an enum for mail template file names used in the application.
 * You can add more templates as needed. The strings should match the actual file names on directory ./templates
 * @enum {string}
 */
export enum MailTemplateFileEnum {
    ForgotPassword = 'forgot-password',
    VerifyEmail = 'verify-email',
    VerifyEmailSuccess = 'verify-email-success',
    VerifyEmailFailed = 'verify-email-failed',
}
