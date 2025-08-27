import { ValidationPipe, INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exceptions/all-exceptions.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';


const initSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Guess the location')
    .setDescription('Guess the location API')
    .setVersion('1.0')
    .addTag('Guess Location')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
};

const initValidation = (app: INestApplication) =>
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
//CORS-mi omogucava da kontrolisem koje domene mogu da pristupaju mojoj API aplikaciji
    app.enableCors({
      origin: 'http://localhost:5000', //dozvoljeni domen
      credentials: true,
    });

    //helmet
    app.use(helmet());

    //rate limiting
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, //15min
        max: 100, // max 100 zahteva po UP u 15min
        message: 'Too many request from this IP, please try again later',
      }),
    );

  //Swagger i ValidationPipe
  initSwagger(app);
  initValidation(app);

  //Global error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = 3000;
  await app.listen(3000);

  console.log(`🚀 Server is running on http://localhost:${port}`);
}

bootstrap();
