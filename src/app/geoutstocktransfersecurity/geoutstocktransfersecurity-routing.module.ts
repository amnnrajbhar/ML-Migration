import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GeOutStockTransferSecurityComponent } from './geoutstocktransfersecurity.component';
const appRoute: Routes = [
  { path: '', component: GeOutStockTransferSecurityComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(appRoute)],
  exports: [RouterModule]
})
export class GeoutstocktransfersecurityRoutingModule { }
