# Notes
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/kazimanzurrashid/file-server/CI)](https://github.com/kazimanzurrashid/file-server/actions)
[![CodeFactor](https://www.codefactor.io/repository/github/kazimanzurrashid/file-server/badge)](https://www.codefactor.io/repository/github/kazimanzurrashid/file-server)
[![codecov](https://codecov.io/gh/kazimanzurrashid/file-server/branch/main/graph/badge.svg?token=D96CP60SL3)](https://codecov.io/gh/kazimanzurrashid/file-server)

- Typescript is used.
- The solution uses in-memory storage for files and rate limit information (but it has the proper abstraction, so adding persistent storage should be trivial), as a consequence restarting the app will lose the data.
- It does not handle any error, it might become an issue if any of the add/delete operation fails in actual storage and file records.
- It does not restrict concurrent request from the same ip address that exceeds the daily limit for uploads and downloads.
- The garbage collector process is suboptimal, in real life it is supposed to be a separate process.
- There are few more configuration values apart from requirements which reads from environment variables or fallbacks to default value which can be changed in `./src/config.ts` file. It is important to change the bucket name when using the GCP as storage provider.
- A postman collection `./file-server-api.postman_collection.json` has been also added which needs to be imported in postman, Only the file needs to be selected in upload, rest of the requests are automated.
- AWS S3 and Azure Blob support has been also added.
- Open-API added the ui is can be found in `/`.
