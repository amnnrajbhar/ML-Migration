import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { DocBorrowComponent } from './DocBorrow.component';
const routes: Routes = [
  { path: '', component: DocBorrowComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocBorrowRoutingModule { }
