import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return super.getRequestResponse(context);
    }

    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext<{ req: Request; res: Response }>();
    const res = ctx.res || { header: () => {}, send: () => {} };

    const req = ctx.req;

    return { req, res };
  }
}
