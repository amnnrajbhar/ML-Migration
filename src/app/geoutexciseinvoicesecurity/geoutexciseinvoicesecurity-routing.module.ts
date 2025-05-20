import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GeOutExciseInvoiceSecurityComponent } from './geoutexciseinvoicesecurity.component';

const appRoute: Routes = [
  { path: '', component: GeOutExciseInvoiceSecurityComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(appRoute)],
  exports: [RouterModule]
})
export class GeOutExciseInvoiceSecurityRoutingModule { }
