# GUESS LOCATION

<img alt="image" src="https://brotherants.com/skillupmentor/images/02-project-header.png" width="600px" /> 

**Short description** :

Create a Full-stack application that allows users to upload an image and mark the exact location on the Google map where the image was taken. Registered users then try to guess where the image was taken by placing a pin on the Google map. As a result, the app returns how accurately he chose the location (error distance).

User can play Guess game only if he has game points. With registration user gets 10 points. For every location that user uploads – user gets 10 points. For every guess user loses points:
- First guess per same location: 1 point
- Second guess per same location: 2 points 
- Third and every other guess per same location: 3 points


**Technologies you will use** :
Html, Css, Bootstrap, MUI (ex. MaterialUI), Tailwind, Figma, JavaScript, Typescript, Node, NestJS, Express, React, Docker, Amazon AWS, Amazon S3, Git, GitHub, Jest, PostgreSQL, Prisma, JWT, Swagger, Trello, Redux Toolkit, RTK Query.

<img alt="image" src="https://brotherants.com/skillupmentor/images/image5.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image7.png" width="30px" /> <img alt="image" src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Bootstrap_logo.svg/800px-Bootstrap_logo.svg.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/mui-icon.png" width="30px" /> <img alt="image" src="https://d3mxt5v3yxgcsr.cloudfront.net/courses/7443/course_7443_image.jpg" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image12.png" width="25px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image17.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image4.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image3.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image19.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image1.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image11.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image18.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image16.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/aws-s3-icon.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image2.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image10.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/jest-icon.jpeg" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image8.png" width="30px" /> <img alt="image" src="https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/001/287/square_480/prismaHD.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image14.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image9.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/swagger.png" width="30px" /> <img alt="image" src="https://brotherants.com/skillupmentor/images/image13.png" width="30px" /> <img alt="image" src="https://miro.medium.com/v2/resize:fit:1200/1*AJpFZrofvxMn3MHh9p3i_Q.jpeg" width="30px" /> <img alt="image" src="https://res.cloudinary.com/practicaldev/image/fetch/s--zQbdpCQF--/c_imagga_scale,f_auto,fl_progressive,h_1080,q_auto,w_1080/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yxh98gmx3eydfi4kbw08.png" width="30px" />

***Alert:***

- Use Swagger instead of Postman (https://docs.nestjs.com/openapi/introduction)
- Use Prisma instead of TypeORM.
- Add OAuth for registration and login.
- Deploy to AWS is a must.
- EndToEnd test is a must.


**Pre-requirements** :

- all from 01-project
- Google account (for maps)


**Prepared** :

- Figma design and UX for frontend
- Tests for users are prepared
- API in NestJS for user prepared
- Credentials for PostgreSQL DBMS (use local database and before deploying ask for credentials to our database).
- Trello template for managing tasks

**Use** :
- The latest stable Node
- **Typescript**
- For DBMS use PostgreSQL
- Latest stable NestJS with Express.js framework (**Typescript**)
- Git &amp; GitHub (create separate Git for backend and frontend)
- Latest stable ReactJS for frontend (with **TypeScript** )
- MUI or Bootstrap or Tailwind (choose different technology that you used for 01-project)
- Jest for tests
- Trello (Breakdown task, Estimate time for task)
- Redux Toolkit for state management in ReactJS.
- RTK Query for data manipulation in ReactJS.


**Required functionality** :
- JWT token authentication
- Implement forgot password functionality (send reset token to user email)
- Add latest OAuth (google, facebook).
- File upload on Amazon S3
- JSON server responses
- Implement general error handling. On root component add ModalComponent that will display general server error, if something goes wrong with any request. Displaying of this modal component can be triggered from anywhere in the app (use state management).
- Docker
-  Docker: For local environment configuration (database, env vars, ...)
-  Docker: Dockerfile for building a docker image from the application code
- Deploy backend Docker Container on AWS
- Deploy frontend on AWS S3
- **Think about security issues that can emerge (https://owasp.org/www-project-top-ten).**
- Tests (backend only) - EndToEnd test
-  Tests: All your endpoints must have at least one test, multiple edge case tests are a bonus
-  Tests: All tests must pass
-  Tests: Separate environment for testing
- Implement Logging (logger)
- Implement Cors (Cross-origin resource sharing)
- Reactive form validation
- Migrations for database
- Figma pixel perfect design
- Swagger for API documentation
- Use .ENV for database credentials (security).
- **Write at least one custom react hook (example: https://www.w3schools.com/react/react_customhooks.asp).**

**Special part (required)**
You need to create a log of all the actions a user performs on the frontend and store them in the database. The actions you need to log are:
- clicks
- scrolls
- user inputs (textbox, dropdown, checkbox, radio changes)

**You need to store in the database:**
- user
- action (click, scroll, added value, changed value, removed value)
- component type (link, button, input type (null if the action was scroll))
- new value
- location of the action (URL)

Then allow the administrator to view the last 100 entities saved (but all action must be saved in database). Since there is a relatively large number of actions stored in the database, consider how to structure the database, what data types to use, and what improvements can be done in the database so that it will provide data quicker. Also, consider how to separate the administrator from the normal users.
There is no Figma design for this part, so you can customize the design for this part yourself so it makes sense. Do not spend too much time on the design of this part.

**Don&#39;t forget** :
- Prepare Readme.md to describe the application in GitHub.
- Maintain a consistent code style (Usage of linters/prettifiers is recommended).
- Divide the tasks in Trello according to the instructions. For each task estimated time (in hours) for completing the task.
- Branch each task in Github (GitFlow).

**Design and explanation** :
- [Link to Figma](https://www.figma.com/file/DmN8FJw8sB664weoiYY7na/Geotagger-2023?type=design&mode=design)
- For location save only latitude and longitude (location name is optional).

**Description** :
The REST API should provide adequate JSON responses to these endpoints. The **bolded** endpoints are authenticated calls. Select the appropriate REST calls (get, put, post, delete) by yourself.

Endpoints (add other endpoints that you need):
/auth/login
/auth/register

/location

```Return list of latest locations (you can add pagination)```

/location/random 

```Return random location```

/location 

```Create location```

/location/guess/:id 

```Guess the location lat/lon```

***Explanation***:
- For calculating distance, you can use Google Maps API or you can use PostgreSQL PostGIS ([https://postgis.net/](https://postgis.net/)).
- You will have to make pagination (on the backend) for displaying a list of locations.
- Upload user avatar images on AWS S3 is required.


**Material (tutorials …)**:
- <a href="https://ionian-pram-941.notion.site/SkillUp-Mentor-Pre-Boarding-SLO-6867a8fefbee4e6c8e073a72c0119aa2" target="_blank">Pre-boarding document</a>
- <a href="https://trello.com/b/zDGE8zl0/project-template" target="_blank">Trello template</a>
- <a href="https://ionian-pram-941.notion.site/SkillUp-Mentor-Project-Materials-ENG-951d7f30080a43cb8363c5daa32e08be" target="_blank">Project materials</a>
- Jest for test
- End to end testing 
- MaterialUI + Styled ([https://mui.com/system/styled/](https://mui.com/system/styled/))
- Swagger
- Logging
- Cors
- Form validation

**But first**:
- Share your GitHub repository with mentors@skillupmentor.com
- Share your Trello board with mentors@skillupmentor.com

**Use Functional Components in React!**

<img alt="Use Functional Components in React!" src="https://brotherants.com/skillupmentor/images/functional-class-compnent.png" width="600px" />

**CODE REVIEW**:
When you finish the project, apply for a code review: <a href="https://forms.gle/sxtxWrzJaom81Dxx8" target="_blank">Code review apply</a>

**Disclaimer :**

*This assignment is protected with SkillUp Mentor copyright. The Candidate may upload the assignment on his closed profile on GitHub (or other platform), but any other reproduction and distribution of the assignment itself or the assignment&#39;s solutions without written permission of SkillUp Mentor is prohibited.*
