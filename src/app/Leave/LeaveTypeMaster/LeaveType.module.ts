import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveTypecomponent } from './LeaveType.component';
import { LeaveTypeRoutingModule } from './LeaveType-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        LeaveTypeRoutingModule,
        HttpClientModule, RouterModule,

    ],
    declarations: [
        LeaveTypecomponent,
    ]
})
export class LeaveTypeModule { }