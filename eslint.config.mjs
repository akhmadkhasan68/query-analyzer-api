/* eslint-disable @typescript-eslint/naming-convention */
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
    '**/.eslintrc.js',
    '**/node_modules',
    '**/webpack.config.js',
    '**/.git',
    '**/dist',
    '**/public',
]), {
    extends: compat.extends('plugin:@typescript-eslint/recommended', 'prettier'),

    plugins: {
        '@typescript-eslint': typescriptEslintEslintPlugin,
        'unused-imports': unusedImports,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.jest,
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: 'module',

        parserOptions: {
            project: 'tsconfig.json',
        },
    },

    rules: {
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-unused-vars': 'off',
        'quotes': ['error', 'single'],

        '@typescript-eslint/no-unused-vars': ['warn', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
        }],

        'unused-imports/no-unused-imports': 'error',

        'unused-imports/no-unused-vars': ['warn', {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
        }],

        '@typescript-eslint/naming-convention': ['error', {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
        }, {
                selector: 'memberLike',
                format: ['camelCase', 'PascalCase', 'snake_case'],
                leadingUnderscore: 'allow',
            }, {
                selector: 'typeLike',
                format: ['PascalCase'],
            }, {
                selector: 'enum',
                format: ['PascalCase'],
                modifiers: [],
            }, {
                selector: 'enumMember',
                format: ['PascalCase'],
            }, {
                selector: 'class',
                format: ['PascalCase'],
            }, {
                selector: 'variable',
                format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
                modifiers: [],
            }, {
                selector: 'interface',
                format: ['PascalCase'],
                prefix: ['I'],
            }, {
                selector: 'property',
                format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
            }],

        'no-console': 'warn'
    },
}]);