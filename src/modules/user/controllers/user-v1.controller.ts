import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OPERATION, RESOURCE } from 'src/shared/constants/permission.constant';
import { IBasicResponse } from 'src/shared/interfaces/basic-response.interface';
import { IPaginationResponse } from 'src/shared/interfaces/paginate-response.interface';
import { Permission } from '../../iam/shared/decorators/permission.decorator';
import { JwtAuthTypeEnum } from '../../iam/shared/enums/token-type.enum';
import { UserCreateV1Request } from '../dtos/requests/user-create-v1.request';
import { UserPaginateV1Request } from '../dtos/requests/user-paginate-v1.request';
import { UserUpdatePasswordV1Request } from '../dtos/requests/user-update-password-v1.request';
import { UserUpdateV1Request } from '../dtos/requests/user-update-v1.request';
import { UserV1Response } from '../dtos/responses/user-v1.response';
import { UserV1Service } from '../services/user-v1.service';

@Controller({
    path: 'users',
    version: '1',
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class UserV1Controller {
    constructor(private readonly userV1Service: UserV1Service) {}

    @Permission(RESOURCE.USER, [OPERATION.VIEW])
    @Get()
    /**
     * Retrieves paginated user data based on provided pagination parameters
     *
     * @param {UserPaginateV1Request} paginationDto - The pagination parameters for user data
     * @returns {Promise<IPaginationResponse<UserV1Response>>} A promise that resolves to paginated user response data
     *
     * @example
     * const result = await pagination({
     *   page: 1,
     *   limit: 10
     * });
     *
     * @throws {Error} If pagination operation fails
     */
    async paginate(
        @Query() paginationDto: UserPaginateV1Request,
    ): Promise<IPaginationResponse<UserV1Response>> {
        const result = await this.userV1Service.paginate(paginationDto);

        return {
            data: {
                meta: result.meta,
                items: UserV1Response.MapEntities(result.items),
            },

            message: 'User pagination retrieved successfully',
        };
    }

    @Permission(RESOURCE.USER, [OPERATION.CREATE])
    @Post()
    /**
     * Creates a new user in the IAM system
     * @param dataCreateDto - The data transfer object containing user creation details
     * @returns A promise containing a basic response with the created user data and success message
     * @throws {UnauthorizedException} When the user doesn't have permission to create users
     * @throws {BadRequestException} When the provided data is invalid
     * @throws {ConflictException} When a user with the same unique identifiers already exists
     */
    async create(
        @Body() dataCreateDto: UserCreateV1Request,
    ): Promise<IBasicResponse<UserV1Response>> {
        const data = await this.userV1Service.create(dataCreateDto);

        return {
            data: UserV1Response.FromEntity(data),
            message: 'User created successfully',
        };
    }

    @Permission(RESOURCE.USER, [OPERATION.VIEW])
    @Get(':userId')
    /**
     * Retrieves user information by their ID.
     *
     * @param {string} userId - The unique identifier of the user to retrieve
     * @returns {Promise<IBasicResponse<UserV1Response>>} A promise that resolves to a basic response containing user data
     * @throws {NotFoundException} When user with given ID is not found
     */
    async getById(
        @Param('userId') userId: string,
    ): Promise<IBasicResponse<UserV1Response>> {
        const data = await this.userV1Service.findOneById(userId);

        return {
            data: UserV1Response.FromEntity(data),
            message: 'User retrieved successfully',
        };
    }

    @Permission(RESOURCE.USER, [OPERATION.UPDATE])
    @Patch(':userId')
    /**
     * Updates a user's information by their ID
     * @param userId - The unique identifier of the user to update
     * @param dataUser - The user data to be updated
     * @returns A promise containing the basic response with updated user information
     * @throws {NotFoundException} When user is not found
     * @throws {BadRequestException} When update data is invalid
     */
    async updateById(
        @Param('userId') userId: string,
        @Body() dataUser: UserUpdateV1Request,
    ): Promise<IBasicResponse<UserV1Response>> {
        const data = await this.userV1Service.updateById(userId, dataUser);
        return {
            data: UserV1Response.FromEntity(data),
            message: 'User updated successfully',
        };
    }

    @Permission(RESOURCE.USER, [OPERATION.UPDATE])
    @Patch(':userId/password')
    /**
     * Updates the password for a user by their ID.
     *
     * @param userId - The ID of the user whose password needs to be updated
     * @param dataUpdate - The request object containing password update data
     * @returns Promise resolving to a basic response containing the updated user data
     *
     * @throws {UnauthorizedException} If the user is not authorized to perform this action
     * @throws {NotFoundException} If the user with the given ID is not found
     */
    async updatePasswordById(
        @Param('userId') userId: string,
        @Body() dataUpdate: UserUpdatePasswordV1Request,
    ): Promise<IBasicResponse<UserV1Response>> {
        const updated = await this.userV1Service.updatePasswordById(
            userId,
            dataUpdate,
        );
        return {
            data: UserV1Response.FromEntity(updated),
            message: 'User update password Successfully',
        };
    }

    @Permission(RESOURCE.USER, [OPERATION.DELETE])
    @Delete(':userId')
    /**
     * Deletes a user by their ID (soft delete)
     * @param userId - The unique identifier of the user to delete
     * @returns A promise resolving to a basic response containing null data and success message
     * @throws {NotFoundException} When user with given ID is not found
     */
    async deleteByid(
        @Param('userId') userId: string,
    ): Promise<IBasicResponse<boolean | null>> {
        await this.userV1Service.softDeleteById(userId);
        return {
            data: null,
            message: 'User deleted successfully',
        };
    }
}
