import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { OnDutyRequestComponent } from './OnDutyRequest.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: OnDutyRequestComponent, canActivate: [AuthGuard] },
    // { path: '', component: OnDutyRequestComponent},
    { path: 'OnDutyRequest/:id' , component:OnDutyRequestComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class OnDutyRequestRoutingModule { }
