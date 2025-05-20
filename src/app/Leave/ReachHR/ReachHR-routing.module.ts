import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReachHRComponent } from './ReachHR.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: ReachHRComponent, canActivate: [AuthGuard] },
    // { path: '', component: ReachHRComponent},
    { path: 'ReachHR/:id' , component:ReachHRComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class ReachHRRoutingModule { }
