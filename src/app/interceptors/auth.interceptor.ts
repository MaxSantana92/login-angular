import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'POST') {
    const newReq = req.clone({
      headers: req.headers.set('Content-Type', 'application/json'),
    });
    return next(newReq);
  }
  return next(req);
};
