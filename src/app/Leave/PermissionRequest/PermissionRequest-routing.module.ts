import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PermissionRequestComponent } from './PermissionRequest.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: PermissionRequestComponent, canActivate: [AuthGuard] },
    // { path: '', component: PermissionRequestComponent},
    { path: 'PermissionRequest/:id' , component:PermissionRequestComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class PermissionRequestRoutingModule { }
