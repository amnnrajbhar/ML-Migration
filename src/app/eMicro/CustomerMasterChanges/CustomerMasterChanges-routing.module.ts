import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { CustomerMasterChangesComponent } from './CustomerMasterChanges.component';

const appRoutes: Routes = [
    { path: '', component: CustomerMasterChangesComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class CustomerMasterChangesRoutingModule { }