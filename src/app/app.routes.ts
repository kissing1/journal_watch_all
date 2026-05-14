import { Routes } from '@angular/router';
import { Login } from './Login/login/login';
import { authGuard } from './auth.guard';

import { MsuUnwanted } from './Page/Student/msu-unwanted/msu-unwanted';
import { Search } from './Page/Student/search/search';
import { PreT3 } from './Page/Student/pre-t3/pre-t3';
import { T3 } from './Page/Student/t3/t3';
import { RequestAdvisor } from './Page/Student/request-advisor/request-advisor';
import { History } from './Page/Student/history/history';
import { Profile } from './Page/Student/profile/profile';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./Page/Student/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
  },
  { path: 'search', component: Search, canActivate: [authGuard] },
  { path: 'msu-unwanted', component: MsuUnwanted, canActivate: [authGuard] },
  { path: 'pre-t3', component: PreT3, canActivate: [authGuard] },
  { path: 't3', component: T3, canActivate: [authGuard] },
  { path: 'request-advisor', component: RequestAdvisor, canActivate: [authGuard] },
  { path: 'history', component: History, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' },
];