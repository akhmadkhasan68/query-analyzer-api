import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/config';
import { IUser } from 'src/infrastructures/databases/entities/interfaces/user.interface';
import { MailTemplateFileEnum } from 'src/infrastructures/modules/mail/enums/mail-template-file.enum';
import { QUEUE_NAME } from 'src/infrastructures/modules/queue/constants/queue-name.constant';
import { IQueueService } from 'src/infrastructures/modules/queue/interfaces/queue-service.interface';
import { QueueFactoryService } from 'src/infrastructures/modules/queue/services/queue-factory.service';
import { UserTokenTypeEnum } from 'src/shared/enums/user-token.enum';
import { DateTimeUtil } from 'src/shared/utils/datetime.util';
import { UserTokenV1Repository } from '../../user/repositories/user-token-v1.repository';
import { UserV1Repository } from '../../user/repositories/user-v1.repository';
import { IJwtPayload } from '../shared/interfaces/jwt-payload.interface';

@Injectable()
export class IamForgotPasswordV1Service {
    /**
     * Queue service for handling email sending.
     */
    private queueMailService: IQueueService;

    constructor(
        private readonly userV1Repository: UserV1Repository,
        private readonly jwtService: JwtService,
        private readonly userTokenV1Repository: UserTokenV1Repository,
        private readonly queueFactoryService: QueueFactoryService,
    ) {
        this.queueMailService = this.queueFactoryService.createQueueService(
            QUEUE_NAME.Mail,
        );
    }

    /**
     * Handles the request for a password reset.
     * @param email The email or phone number of the user requesting the reset.
     * @param redirectUrl Optional URL to redirect the user after password reset.
     */
    async requestForgotPassword(
        email: string,
        redirectUrl?: string,
    ): Promise<void> {
        // Validate the user's email
        const user = await this.userV1Repository.findOneByEmail(email);
        if (!user) {
            throw new UnauthorizedException(
                'User with this email or phone number does not exist',
            );
        }

        // Generate a secure token for password reset
        const resetToken = await this.generateResetToken(user);
        const resetLink = `${redirectUrl}?token=${resetToken}`;

        // Save the reset token to the database or cache for later verification
        await this.saveForgotPasswordToken(user, resetToken);

        // Send the reset link to the user's email
        await this.sendToMailResetPassword(user, resetLink);
    }

    /**
     * Verifies the password reset token.
     * @param token The password reset token to verify.
     * @returns A promise that resolves to true if the token is valid, false otherwise.
     * @throws UnauthorizedException if the token is invalid or expired.
     */
    async verifyForgotPasswordToken(token: string): Promise<boolean> {
        // Verify the token and extract user information
        const payload = await this.jwtService.verifyAsync(token, {
            secret: config.jwt.forgotPasswordSecret,
        });

        if (!payload) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Check if the token exists in the database
        const userToken =
            await this.userTokenV1Repository.findOneByTokenAndTypeWithRelations(
                token,
                UserTokenTypeEnum.ForgotPasswordToken,
            );

        if (!userToken) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        if (!userToken.user) {
            throw new UnauthorizedException('User not found');
        }

        // Check if the token is expired
        const isExpired = userToken.expiresAt < new Date();
        if (isExpired) {
            throw new UnauthorizedException('Token expired');
        }

        return true;
    }

    /**
     * Resets the user's password using the provided token and new password.
     * @param token The password reset token.
     * @param password The new password to set for the user.
     * @throws UnauthorizedException if the token is invalid or expired.
     */
    async resetPassword(token: string, password: string): Promise<void> {
        // Verify the token
        const payload = await this.jwtService.verifyAsync(token, {
            secret: config.jwt.forgotPasswordSecret,
        });

        if (!payload) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Find the user associated with the token
        const userToken =
            await this.userTokenV1Repository.findOneByTokenAndTypeWithRelations(
                token,
                UserTokenTypeEnum.ForgotPasswordToken,
            );

        if (!userToken || !userToken.user) {
            throw new UnauthorizedException('User not found');
        }

        // Update the user's password
        await this.userV1Repository.updatePassword(userToken.user.id, password);

        // Delete the token after successful password reset
        await this.userTokenV1Repository.delete(userToken.id);
    }

    /**
     * Generates a secure token for password reset.
     * @param user The user for whom the token is generated.
     * @returns A promise that resolves to the generated token.
     */
    private async generateResetToken(user: IUser): Promise<string> {
        const payload: IJwtPayload = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
        };

        return await this.jwtService.signAsync(payload, {
            expiresIn: config.jwt.forgotPasswordExpiresInSeconds,
            secret: config.jwt.forgotPasswordSecret,
        });
    }

    /**
     * Verifies the password reset token.
     * @param token The password reset token to verify.
     * @returns The user associated with the token if valid.
     * @throws UnauthorizedException if the token is invalid or expired.
     */
    private async saveForgotPasswordToken(
        user: IUser,
        token: string,
    ): Promise<void> {
        const forgotPasswordToken = this.userTokenV1Repository.create({
            user,
            token,
            expiresAt: DateTimeUtil.addSeconds(
                new Date(),
                config.jwt.forgotPasswordExpiresInSeconds,
            ),
            type: UserTokenTypeEnum.ForgotPasswordToken,
        });
        await this.userTokenV1Repository.save(forgotPasswordToken);
    }

    /**
     * Sends the password reset link to the user's email.
     * @param user The user to send the email to.
     * @param resetLink The password reset link to include in the email.
     */
    private async sendToMailResetPassword(
        user: IUser,
        resetLink: string,
    ): Promise<void> {
        await this.queueMailService.sendToQueue({
            to: user.email,
            subject: 'Password Reset Request',
            template: MailTemplateFileEnum.ForgotPassword,
            context: {
                name: user.fullname,
                resetLink,
            },
        });
    }
}
