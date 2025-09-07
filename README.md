# Knowledge Graph Curation

This application allows you to calculate, detect and modify redundant information in the subject, predicate and object axes of a SPARQL endpoint.

## 💿 Install

Use the corresponding command to install the dependencies:

| [npm](https://docs.npmjs.com/cli/v7/commands/npm-install)     | `npm install`  |

After completing the installation, the frontend is ready to be used.

## ✨ Features

- ⚡  **Optimized Similarity computation**: The similarity computation process is based on LSH algorithm .
- 🧩  **Massive string similarity computation**: can reduce 100M of comparison to less than 1% of true similar strings.
- ⚡  **Unblocking processing**: Background processing with real-time progression diffusion.
- ⚡ **Fetch computed similarities**: You can directly search available similarities few moment after the starting of the massive computation.

These features are implemented in the backend side : [https://github.com/BillGates98/knowledge-graph-curation-api](https://github.com/BillGates98/knowledge-graph-curation-api) .

## 💡 Usage

This section covers how to start the server.

### Starting the Frontend Server (Recommended)

To start the development server with hot-reload, run the following command. The server will be accessible at [http://localhost:3000](http://localhost:3000):

```bash
npm run dev
```

### Start the Backend Server

[https://github.com/BillGates98/knowledge-graph-curation-api](https://github.com/BillGates98/knowledge-graph-curation-api)

## Run both Frontend and Backend with docker-compose command (It can be slow to use the app inside a docker container)

Just run the below command :

```bash
./start-app.sh
```

## 📑 License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-present Vuetify, LLC
