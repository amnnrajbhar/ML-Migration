import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PayrollProcessingComponent } from './PayrollProcessing.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: PayrollProcessingComponent, canActivate: [AuthGuard] },
    // { path: '', component: PayrollProcessingComponent},
    { path: 'PayrollProcessing/:id' , component:PayrollProcessingComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class PayrollProcessingRoutingModule { }
