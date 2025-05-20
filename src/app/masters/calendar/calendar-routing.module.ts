import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { AuthGuard } from './../../auth/auth-guard.service';

const appRoutes: Routes = [
    { path: '', component: CalendarComponent, canActivate: [AuthGuard] },
];
@NgModule({
    imports: [
        RouterModule.forChild(appRoutes)
    ],
    exports: [RouterModule]
})
export class CalendarRoutingModule { }
