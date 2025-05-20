import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CompOffRequestComponent } from './CompOffRequest.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: CompOffRequestComponent, canActivate: [AuthGuard] },
    // { path: '', component: CompOffRequestComponent},
    { path: 'CompOffRequest/:id' , component:CompOffRequestComponent, canActivate: [AuthGuard]},
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class CompOffRequestRoutingModule { }
