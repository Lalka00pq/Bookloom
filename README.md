<!-- PROJECT LOGO -->
<br />
<div align="center">
	<img src="images/logo_.svg" alt="Logo" width="100" height="100">
	<h1 align="center">Bookloom</h1>
	<p align="center">Full‑stack application for visualizing connections between books and providing intelligent recommendations</p>
</div>

## About the project

This is a monorepo containing the frontend and backend parts of the BookGraph application. This README provides a concise guide to quickly start the entire stack using Docker Compose.

## Quick start (Docker Compose)
> [!important]
> Make sure that you have docker and docker-compose installed on your system.
 - [Docker](https://www.docker.com/get-started/)
 - Docker-compose will be installed automatically with Docker Desktop

>[!important] 
>Before starting the services, make sure that you added your environment variables to the `.env` file in backend part. You need to rename the `.env.example` file to `.env` and fill in the values. 
### Renaming the `.env.example` file to `.env`
```bash
cd app/backend/app
mv .env.example .env
```
### Start the services
```bash
# from the repository root
docker-compose up --build
```

After successful startup, the default service URLs are:

- Frontend: http://localhost:3000
- Backend (API): http://localhost:8000

API documentation (when the backend is running): http://localhost:8000/docs

## Screenshots

![Screenshot 1](images/image_1.png)

© Bookloom Project

