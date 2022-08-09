# Course Management System API

Course Management System API is an online management application. Its main purpose is to make efficient interaction
between students and instructors in college during the period of submission of assignments and for getting appropriate
feedback from instructors.

## Contents

- [Features](#features)
- [Installing](#installing)
- [API documentation](#api-documentation)
- [Running tests](#running-tests)
- [Deployment](#deployment)
- [Technology stack](#technology-stack)

## Features

* registration, authentication, and authorization in the system;
* creation and management of users with different roles (admin, instructor, student);
* creation and management of courses;
* creation and management of lessons;
* grading students;
* upload/download files with homework;
* creation and management of feedback;

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing
purposes.

### Pre-requirements

- Docker installed locally. [Debian](https://docs.docker.com/engine/install/debian/)
  or [Ubuntu](https://docs.docker.com/engine/install/ubuntu/) or other distributive.
- Docker Compose installed locally [installation link](https://docs.docker.com/compose/install/).

### Installing

A step-by-step series of examples that tell you how to get a development env running.

- Copy the .env file and set up environment variables. Replace all 'xxx' with real credentials:

```bash
$ cp .env.sample .env
```

- Install global dependencies:

```bash
$ npm install -g @nestjs/cli typescript
```

- Install dependencies:

```bash
$ npm install
```

- Start the required containers:

```bash
$ docker-compose up
```

- Run the application:

```bash
$ npm run start
```

### Other commands

```bash
# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# create, generate, and run migration
$ npm run migration:create --name=foo
$ npm run migration:generate --name=bar
$ npm run migration:run 
```

## API documentation

The API documentation was created using [Swagger](https://swagger.io/). To generate the latest API documentation from
source code yourself, you need to run the application and follow the
link: \
http://api-host/api/docs \
You can also view the database structure in the `db-structure.png` file located in the project's root directory.

## Running tests

### Unit tests

```bash
$ npm run test
$ npm run test:cov
```

### E2E tests

Make sure the test database exists before running e2e tests.

```bash
# start the test database
$ docker-compose up

$ npm run test:e2e
```

## Deployment

Deployment of the application for this repository is performed automatically by pushing the next tag in the next format:

`deploy-DDMMYYYY-X`. Where `DDMMYYYY` is the date and the `X` is the release number.
> Examples of the tags: `deploy-02082022-1`, `deploy-24082022-2`

## Technology stack

* `NestJS`
* `TypeORM`
* `PostgreSQL`
* `Redis`
* `Docker`
* `Docker Compose`
* `GCP Cloud Build`
* `GCP Container Registry`
* `Google Kubernetes Engine`
* `GCP Cloud Storage`
* `Jest`
* `Swagger`
