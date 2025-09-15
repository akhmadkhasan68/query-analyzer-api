# Nest Inertia Boilerplate

Boilerplate using NestJS

# Table of Contents

- [Nest Inertia Boilerplate](#nest-inertia-boilerplate)
- [Table of Contents](#table-of-contents)
- [Tech Stack:](#tech-stack)
- [Project Installation](#project-installation)
    - [Quick Start:](#quick-start)
    - [ESLint Config](#eslint-config)
    - [Husky Config (If failed only)](#husky-config-if-failed-only)
    - [Setup Sentry](#setup-sentry)
    - [VSCode Extentions](#vscode-extentions)
- [Database](#database)
    - [Database Commands:](#database-commands)
    - [DB Schema ERD:](#db-schema-erd)
    - [Published Edited DBDOCS Commands:](#published-edited-dbdocs-commands)
- [Project Anatomy](#project-anatomy)

# Tech Stack:

- NestJS v11
- NodeJS LTS v22
- Yarn v1.22.22
- PostgreSQL 17.4
- Mongo 8.0

# Project Installation

- Install NodeJS LTS v22 (recommended to install [NVM](https://github.com/nvm-sh/nvm))
- Create Database
- Copy file `.env.example` ubah ke `.env` kemudian sesuaikan konfigurasinya `cp .env.example .env`
- Run `yarn install`
- **Install wkhtmltopdf (required for PDF export):**
    - Linux: `sudo apt-get install wkhtmltopdf`
    - MacOS: `brew install wkhtmltopdf`
    - Windows: Download from [wkhtmltopdf.org](https://wkhtmltopdf.org/downloads.html)
- Run `yarn migrate`
- Run `yarn seed:run`

## Quick Start:

- Run `yarn build`
- Run `yarn start:dev api` (local) or `yarn start:prod:api` (production)

## ESLint Config

- Jika ingin melakukan perubahan config, edit di `.eslintrc.json` lalu jalankan `npx @eslint/migrate-config .eslintrc.json`
- Jangan edit `eslint.config.mjs` secara manual

## Husky Config (If failed only)

- Run npx husky init
- Open/Create file `~/.config/husky/init.sh` (or` ~/.huskyrc` in Husky versions < v9) :

```sh
export NVM_DIR="$HOME/.nvm/nvm.sh"
. "$(dirname $NVM_DIR)/nvm.sh"

export NVM_DIR="$HOME/.nvm"
a=$(nvm ls | grep 'node')
b=${a#*(-> }
v=${b%%[)| ]*}

export PATH="$NVM_DIR/versions/node/$v/bin:$PATH"
```

## Setup Sentry

## VSCode Extentions

- [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

# Database

## Database Commands:

| Command                                  | Description                                              |
| ---------------------------------------- | -------------------------------------------------------- |
| `yarn migrate`                           | Create tables                                            |
| `yarn migrate:generate [migration_name]` | Generate migration add or changes the entities directory |
| `yarn seed:run [seeder_file_name.ts]`    | Run the specific seeder                                  |
| `yarn seed:run:all`                      | Run all seeder                                           |
| `yarn migrate:revert`                    | Revert migration tables                                  |

## DB Schema ERD:

We use DBML to create and publish the ERD documentation. Visit [here](https://www.dbml.org/home/#dbdiagram) to show you how to (official documentation)

## Published Edited DBDOCS Commands:

- Run `yarn dbdocs:publish`

# Project Anatomy
