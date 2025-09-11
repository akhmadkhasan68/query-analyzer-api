import { ZodValidationException } from 'nestjs-zod';
import { Query } from 'mongoose';
import { ZodError, ZodIssueCode } from 'zod';

export interface ISearchOption {
    term: string;
    fields: {
        name: string;
        type: 'string' | 'number' | 'date';
    }[];
}

export interface IFilterOption {
    field: string;
    value: any;
    operator?: 'eq' | 'in' | 'like' | 'gt' | 'lt' | 'gte' | 'lte' | 'eqLower';
}

export class MongooseQueryFilterUtil {
    static applyFilters<T>(
        query: Query<T[], T>,
        options: {
            search?: ISearchOption | null;
            filters?: IFilterOption[];
        },
    ): void {
        const filterQuery: Record<string, any> = {};

        // Apply search
        const search = options.search;
        if (search?.term && search.fields?.length) {
            const keyword = search.term.toLowerCase();
            const searchConditions = search.fields.map((field) => {
                if (field.type === 'string') {
                    return {
                        [field.name]: {
                            $regex: keyword,
                            $options: 'i',
                        },
                    };
                } else {
                    return {
                        $expr: {
                            $regexMatch: {
                                input: { $toString: `$${field.name}` },
                                regex: keyword,
                                options: 'i',
                            },
                        },
                    };
                }
            });

            filterQuery.$or = searchConditions;
        }

        // Apply filters
        if (options.filters) {
            for (const filter of options.filters) {
                if (typeof filter.value === 'undefined') continue;

                const operator =
                    filter.operator ||
                    (Array.isArray(filter.value) ? 'in' : 'eq');

                switch (operator) {
                    case 'in':
                        const values = Array.isArray(filter.value)
                            ? filter.value
                            : [filter.value];
                        if (values.length > 0) {
                            filterQuery[filter.field] = { $in: values };
                        }
                        break;
                    case 'like':
                        filterQuery[filter.field] = {
                            $regex: filter.value,
                            $options: 'i',
                        };
                        break;
                    case 'gt':
                        filterQuery[filter.field] = { $gt: filter.value };
                        break;
                    case 'lt':
                        filterQuery[filter.field] = { $lt: filter.value };
                        break;
                    case 'gte':
                        filterQuery[filter.field] = { $gte: filter.value };
                        break;
                    case 'lte':
                        filterQuery[filter.field] = { $lte: filter.value };
                        break;
                    case 'eqLower':
                        filterQuery[filter.field] = {
                            $regex: new RegExp(`^${filter.value}$`, 'i'),
                        };
                        break;
                    case 'eq':
                    default:
                        filterQuery[filter.field] = filter.value;
                        break;
                }
            }
        }

        query.where(filterQuery);
    }

    static validateSortValueDto(
        dto: any,
        allowedSorts: Map<string, string>,
    ): void {
        if (dto.sort) {
            if (!allowedSorts.has(dto.sort)) {
                throw new ZodValidationException(
                    new ZodError([
                        {
                            code: ZodIssueCode.invalid_enum_value,
                            message: `Invalid enum value. Expected ${Array.from(
                                allowedSorts.keys(),
                            )
                                .map((key) => `'${key}'`)
                                .join(' | ')}, received '${dto.sort}'`,
                            path: ['sort'],
                            received: dto.sort,
                            options: Array.from(allowedSorts.keys()),
                        },
                    ]),
                );
            }
        }
    }
}