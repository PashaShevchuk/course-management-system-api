# Course Management System API

Course Management System API is an online management application. Its main purpose is to make efficient interaction
between students and instructors in college during the period of submission of assignments and for getting appropriate
feedback from instructors.

## Pre-requirements

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

## Deployment
Deployment of the application for this repository is performed automatically by pushing the next tag in the next format:

`deploy-DDMMYYY-X`. Where `DDMMYYYY` is the date and the `X` is the release number.
> Examples of the tags: `deploy-02082022-1`, `deploy-24082022-2`.
>
## Test

```bash
# unit tests
$ npm run test

# e2e tests (before running, check if a test DB exists)
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
