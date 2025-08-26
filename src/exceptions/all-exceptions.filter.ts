import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() //hvata sve greske
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    //dohvatanje request i response
    const ctx = host.switchToHttp(); //konvertujemo ArgumentsHostu u HTTP kontekst
    const response = ctx.getResponse<Response>(); //dobijamo Express resposne objekat da mozemo vratiti JSON
    const request = ctx.getRequest<Request>(); //dobijamo Express request objekat da mozemo dobiti npt URL poziva

    let status =
      exception instanceof HttpException //proverava da li je greska tipa HttpException
        ? exception.getStatus() //ako jeste tipa Http koristimo getstatus
        : HttpStatus.INTERNAL_SERVER_ERROR; //ako nije, znaci da je neka neocekivana(TypeError, Prisma Error..)vraca tip 500 Internal server error

    let message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Ako je HttpException vraća objekat, možeš izvući message polje
    if (typeof message === 'object' && message.hasOwnProperty('message')) {
      message = (message as any).message;
    }

    //vracanje uniformnog JSON odgovora
    response.status(status).json({ 
      statusCode: status, //400,500 itd
      timestamp: new Date().toISOString(), //kad se greska desila
      path: request.url, //url koji je izazvao gresku
      message, //poruka greske
    });
  }
}
