import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveReasoncomponent } from './LeaveReason.component';
import { LeaveReasonRoutingModule } from './LeaveReason-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        LeaveReasonRoutingModule,
        HttpClientModule,RouterModule,
       
    ],
    declarations: [
         LeaveReasoncomponent,
        
    ]
})
export class LeaveReasonModule { }