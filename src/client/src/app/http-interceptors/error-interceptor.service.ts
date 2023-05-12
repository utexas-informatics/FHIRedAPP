import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpEventType,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ToastService } from '../utils/toast.service';
import { Router } from '@angular/router';
import { UserService } from '../profile/user.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorInterceptorService implements HttpInterceptor {
  constructor(
    private toastService: ToastService,
    private router: Router,
    private userService: UserService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let lastResponse: HttpEvent<any>;
    let lastError: HttpErrorResponse;
    // show loading if any here..
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          lastResponse = event;
          if (event instanceof HttpResponse) {
            // add any actions to be performed before returning response here..
            // stop loading here..
          }
        },
        (error: any) => {
          // stop loading here..
        }
      ),
      catchError((error: HttpErrorResponse) => {
        lastError = error;
        // stop loading here..
        return this.handleError(error);
      }),
      finalize(() => {
        if (lastResponse.type === HttpEventType.Sent && !lastError) {
          // last response type was 0, and we haven't received an error.
          // Hide progress bar if request is cancelled.
          // stop loading here..
        }
      })
    );
  }

  private handleError(error) {
    if (error.error instanceof ErrorEvent || error.message) {
      if (this.userService.getloadingStatus())
        this.userService.dismissLoading();
      if (error.status === 400) {
        const message =
          error.error.error && error.error.error.details
            ? this.getMessageFromValidationError(error.error.error.details)
            : error.message;
        this.toastService.presentToast({
          type: 'error',
          message: `${error.error.message} - ${message}`,
        });
      } else if (
        error.error &&
        error.error.status === 500 &&
        (error.error.message.includes('User not found') ||
          error.error.message.includes('User not invited') ||
          error.error.message.includes('User not verified') ||
          error.error.message.includes('User not accepted consent'))
      ) {
        // don't show message here..
      } else if (error.status === 403) {
        this.toastService.presentToastWithClose({
          type: 'error',
          message:
            'Your session has expired because of inactivity. Please log in again',
        });
        this.userService.unAuthorizeUser();
        this.router.navigate(['/loginPassword']);
      } else if (error.error && error.error.message) {
        this.toastService.presentToast({
          type: 'error',
          message: error.error.message,
        });
      } else if (error.message) {
        this.toastService.presentToast({
          type: 'error',
          message: error.message,
        });
      }
    } else {
      this.toastService.presentToastWithClose({
        type: 'error',
        message:
          'There is a problem with the application. Please try again shortly',
      });
      // further error handling if any goes here..
    }
    return throwError(error);
  }

  getMessageFromValidationError({ headers, params, body, query }) {
    return [
      headers && headers.length && `${headers[0].message} in headers`,
      params && params.length && `${params[0].message} in params`,
      body && body.length && `${body[0].message} in body`,
      query && query.length && `${query[0].message} in query`,
    ]
      .filter(Boolean)
      .join();
  }
}
