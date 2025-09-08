import { ZodValidationException } from 'nestjs-zod';
import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
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

export class QueryFilterUtil {
    static applyFilters<T extends ObjectLiteral>(
        query: SelectQueryBuilder<T>,
        options: {
            search?: ISearchOption | null;
            filters?: IFilterOption[];
        },
    ): void {
        // Apply search
        const search = options.search;
        if (search?.term && search.fields?.length) {
            const keyword = search.term.toLowerCase();
            query.andWhere(
                new Brackets((qb) => {
                    for (const field of search.fields) {
                        if (field.type === 'string') {
                            qb.orWhere(`LOWER(${field.name}) LIKE :search`, {
                                search: `%${keyword}%`,
                            });
                        } else {
                            qb.orWhere(
                                `CAST(${field.name} AS TEXT) LIKE :search`,
                                {
                                    search: `%${keyword}%`,
                                },
                            );
                        }
                    }
                }),
            );
        }

        // Apply filters
        if (options.filters) {
            for (const filter of options.filters) {
                if (typeof filter.value === 'undefined') continue;

                const operator =
                    filter.operator ||
                    (Array.isArray(filter.value) ? 'in' : 'eq');
                const paramName = `${filter.field.replace(/\./g, '_')}`;

                switch (operator) {
                    case 'in':
                        const values = Array.isArray(filter.value)
                            ? filter.value
                            : [filter.value];
                        if (values.length > 0) {
                            query.andWhere(
                                `${filter.field} IN (:...${paramName})`,
                                {
                                    [paramName]: values,
                                },
                            );
                        }
                        break;
                    case 'like':
                        query.andWhere(`${filter.field} LIKE :${paramName}`, {
                            [paramName]: `%${filter.value}%`,
                        });
                        break;
                    case 'gt':
                        query.andWhere(`${filter.field} > :${paramName}`, {
                            [paramName]: filter.value,
                        });
                        break;
                    case 'lt':
                        query.andWhere(`${filter.field} < :${paramName}`, {
                            [paramName]: filter.value,
                        });
                        break;
                    case 'gte':
                        query.andWhere(`${filter.field} >= :${paramName}`, {
                            [paramName]: filter.value,
                        });
                        break;
                    case 'lte':
                        query.andWhere(`${filter.field} <= :${paramName}`, {
                            [paramName]: filter.value,
                        });
                        break;
                    case 'eqLower':
                        query.andWhere(
                            `LOWER(${filter.field}) = LOWER(:${paramName})`,
                            {
                                [paramName]: filter.value,
                            },
                        );
                        break;
                    case 'eq':
                    default:
                        query.andWhere(`${filter.field} = :${paramName}`, {
                            [paramName]: filter.value,
                        });
                        break;
                }
            }
        }
    }

    static validateSortValueDto(
        dto: ObjectLiteral,
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
