import http from 'http';
import path from 'path';

import { ioc } from '@adonisjs/fold';
import { setupResolver, Config, Logger } from '@adonisjs/sink';

import Server from '@adonisjs/framework/src/Server';
import Route from '@adonisjs/framework/src/Route/Manager';
import RouteStore from '@adonisjs/framework/src/Route/Store';
import Request from '@adonisjs/framework/src/Request';
import Response from '@adonisjs/framework/src/Response';
import Context from '@adonisjs/framework/src/Context';
import Exception from '@adonisjs/framework/src/Exception';
import BaseExceptionHandler from '@adonisjs/framework/src/Exception/BaseHandler';
import BodyParser from '@adonisjs/bodyparser/src/BodyParser';

function createAdonisServer({ dontClearRouteStore } = {}) {
  if (dontClearRouteStore !== false) {
    RouteStore.clear();
  }
  ioc.restore();
  Exception.clear();

  Context.getter(
    'request',
    function() {
      return new Request(this.req, this.res, new Config());
    },
    true,
  );

  Context.getter(
    'response',
    function() {
      return new Response(this.request, new Config());
    },
    true,
  );

  setupResolver();
  ioc.autoload(path.join(__dirname, 'app'), 'App');

  const server = new Server(Context, Route, new Logger(), Exception);
  server.bindExceptionHandler();
  server.registerGlobal(['Adonis/Middleware/BodyParser']);

  ioc.fake('Adonis/Exceptions/BaseExceptionHandler', () => {
    return new BaseExceptionHandler();
  });
  ioc.fake('Adonis/Middleware/BodyParser', () => {
    return new BodyParser(new Config());
  });

  return http.createServer(server.handle.bind(server));
}

export default createAdonisServer;
