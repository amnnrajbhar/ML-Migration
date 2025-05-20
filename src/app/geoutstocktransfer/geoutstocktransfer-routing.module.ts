import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { GEOutStockTransferComponent } from './geoutstocktransfer.component';


const appRoute: Routes = [
  { path: '', component: GEOutStockTransferComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class GEOutStockTransferRoutingModule { }
 