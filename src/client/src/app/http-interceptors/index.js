/* "Barrel" of Http Interceptors */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ErrorInterceptorService } from './error-interceptor.service';
import { AuthInterceptorService } from './auth-interceptor.service';

/** Http interceptor providers in outside-in order */
const httpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptorService,
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true,
  },
];
export default httpInterceptorProviders;
