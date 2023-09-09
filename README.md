# Projects and task lists app

This repository contains both the frontend and backend code for a multi-user task manager web application. The frontend is built using Vite and React, while the backend is built with Node.js and Express.


## Features

1. User Registration

2. User Authentication (login/logout)

3. Visualize, add, edit and remove user projects

4. Visualize, add, edit and remove tasks associated with the projects


## Limitations

1. One user may have several projects

2. One user can access his projects only

3. Each project may include multiple tasks

4. Each task have a description, creation date and finish date

5. The user needs to have a simple option to mark the tasks as completed when accessing the task list

6. Each task have its termination date visible as a tooltip, if available


## Directory Structure

```
projects-and-todo-lists/
|-- api-express/          # Backend source files
|-- client-react/         # Frontend source files
|-- README.md             # This file
```

## Quick setup with Docker

**Prerequisites**: [Docker Compose](https://docs.docker.com/compose/install/)

**Run once**:

```sh
git clone git@github.com:sergio-august/projects-and-todo-lists.git &&
cd projects-and-todo-lists &&
docker compose build &&
docker compose run backend sh setup.sh &&
docker compose up
```

To stop the containers, you can press: `CTRL+C`. After that, you can start the containers again with: `docker compose up --build`.


## Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository

```bash
git clone git@github.com:sergio-august/projects-and-todo-lists.git &&
cd projects-and-todo-lists
```

### 2. Setup Backend

1. Navigate to the backend directory

    ```bash
    cd api-express
    ```

1. Install dependencies:

    ```bash
    npm i
    ```

1. Copy `.env.example` to `.env` file and adjust environment variables if necessary:

    ```bash
    cp .env.example .env
    ```

1. Prepare SQLite database:

    ```bash
    npm run db:migrate
    ```

1. (Optionally) Run tests:

    ```bash
    npm run test
    ```

1. (Optionally) Populate DB with sample data:

    ```bash
    npm run db:populate
    ```

1. Launch API server:

    ```bash
    npm run dev
    ```


### 3. Setup Frontend

1. Open separate terminal window/tab in project root folder.

1. Navigate to the frontend directory:

    ```bash
    cd client-react
    ```

1. Install dependencies:

    ```bash
    npm i
    ```

1. Launch frontend development server:

    ```bash
    npm run dev
    ```

## Contributing

If you'd like to contribute, please fork the repository and make changes as you'd like. Pull requests are warmly welcome.

## License

MIT
