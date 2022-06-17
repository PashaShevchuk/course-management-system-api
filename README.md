# Course Management System API

Course Management System API is an online management application. Its main purpose is to make efficient interaction
between students and instructors in college during the period of submission of assignments and for getting appropriate
feedback from instructors.

## Pre-reqs

- Docker installed locally. [Debian](https://docs.docker.com/engine/install/debian/)
  or [Ubuntu](https://docs.docker.com/engine/install/ubuntu/) or other distributive
- Docker Compose installed locally [installation link](https://docs.docker.com/compose/install/).

## Installation

- Setup environment variables

```sh
cp .env.sample .env
```

- Install global dependencies

```sh
npm install -g @nestjs/cli && \
    npm i -g typescript
```

- Install dependencies

```bash
$ npm install
```

## Running the app

```bash
# development first run
$ docker-compose up
$ npm run start
$ npm run migration:run 

# next runs
$ npm run start:dev

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# create, generate migration
$ npm run migration:create --name=foo
$ npm run migration:generate --name=bar
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
