import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OverTimeRequestComponent } from './OverTimeRequest.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: OverTimeRequestComponent, canActivate: [AuthGuard] },
    // { path: '', component: OverTimeRequestComponent},
    { path: 'OverTimeRequest/:id' , component:OverTimeRequestComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class OverTimeRequestRoutingModule { }
