import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { BoxBarcodeComponent } from './BoxBarcode.component';
const routes: Routes = [
  { path: '', component: BoxBarcodeComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoxBarcodeRoutingModule { }
