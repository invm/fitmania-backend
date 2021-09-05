# FitMania Backend Server

**Find a training partner, open running groups, plan football games and train together with friends!**

## Overview

This repo is the backend for my FitMania full-stack project. FitMania is a social platform to interact with people with common sport preferences and hobbies. It consists from 3 different repositories, a Nodejs backend, a React web app and a React Native app. 

This is an Express and MongoDb backend written in Typescript.

The app allows user authentication, post and comment publication. The user may create sport workout session, where other users may join and participate. Users may create groups based on their preferred sport and join other groups. All of the events surrounding workout session and comments on posts trigger app notifications. Users may create and update their profile and show other users their preferable and undesirable sports.

## Project folder structure

> Entrypoint -> index.ts

- Config

  - Some app level configurations, notification configs, errors mapping and auth strategy config

- Controllers
  - Each use case has its own controller
    - Auth
    - Posts
    - Comments
    - So on..

- Middleware
  - Authentication middleware to block unauthorized access
  - Upload middleware for image upload
 
- Models
  - Entities of the system

- Routes
  - Each use case has its own route
  
- Services
  - Third-party services
    - Email by sendgrid
    - Cloud notifications by Firebase
  - System DB services for each entity

- Utils 
  - App level responder
  - Compression utility
  - Auth session creation utility

- Validators
  - Each route and each params, query and body items are being validated to ensure that only the expected fields are being passed on to the servers


### How to run

#### Environment setup

> Node version 14+ is mandatory

Replace all in angle brackets to run locally

- NODE_ENV=development
- APP_SECRET=\<SessionSecretKey\>
- PORT=8080
- CHEAPSKATE_MODE=\<on|off\> **Allows to print otp in console**
- SENDGRID_API_KEY= **Get it from sendgrid**
- MEDIA=http://localhost:8080/media/ **To serve media files**
- MONGO_STR=mongodb
- MONGO_HOST=127.0.0.1
- MONGO_DB=fitmania
- MONGO_PORT=:27017
- MONGO_USER=
- MONGO_PASS=
- MONGO_QUERY=?authSource=admin
- ALLOWED_ORIGIN=http://localhost:3000 **Direct to React webapp**
- API_KEY=asd123 **Meant to filter out unwanted traffic**


Run locally
```
npm i
npm start
```

Run JS build
```
npm run build
node dist/index.js
```
