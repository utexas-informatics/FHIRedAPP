# leap-dms-backend

Created 2020/12/09

This repository is for LEAP DMS - Backend


### LEAP DMS Backend Code Setup:
```
  Clone the code from the branch - https://github.com/utexas-msdf/LEAP-DMS
      Branch Name - dev
  cd server
  npm install
  npm run start:<env name>
  ```
Please find below the detailed steps:

### Environment variables:
> The environment variables can be set in `.env.<environment>` file which will be loaded when server is started. The file should be placed at project root directory.
>
> Environment specific file is used for starting the server as follows:
> * ***development*** - `.env.development`
> * ***test*** - `.env.test`
> * ***production*** - `.env.production`
>
> Syntax to include environment variables in `.env` file:\
> `<ENV_VARIABLE_NAME>=<ENV_VARIABLE_VALUE>`
>
> Following environment variables are used currently in the project:\
> Mandatory: `DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST`\
> Optional: `PORT, NODE_ENV`
>
> Sample environment file data:
>```
> PORT=<port>
> DB_USERNAME=<username>
> DB_PASSWORD=<password>
> DB_NAME=<db-name>
> DB_HOST=<db_host>
> DB_PORT=<db port>
> DB_SSL_URI=<SSL pem file uri>
> CORE_SERVICES_API_BASE_URL=<API base URL of core-services>
> SMTP_FROM=<verified aws SES sender email account for LEAP>
> KC_URL=<keycloak auth url>
> KC_SECRET=<keycloak client secret>
>```
>
> Note:
> 1. The environment variables set at the system level will override the variables in `.env` files.
> 2. If no environment variables are found, application defaults will be used to start the server.
### Running the server:
> ##### Install required packages:
> `npm install`
>
> ##### Execution scripts:
> * `npm start` - start the server in default environment
> * `npm run start:dev` - start the server in development environment
> * `npm run start:test` - start the server in test environment
> * `npm run start:prod` - start the server in production environment
> * `npm run debug:dev` - start the server in development environment with the debug mode ON
> * `npm run test` - run all the unit test cases
> * `npm run lint` - linter check
