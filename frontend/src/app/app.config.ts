/* Developer note: Application bootstrap configuration.
  Purpose: provide router, http client, and zone change detection providers.
  Layers: provider list used by Angular's `bootstrapApplication` call.
  This header is for developer orientation only. */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient()]
};

