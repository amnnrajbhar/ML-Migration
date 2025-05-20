import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkAttendancecomponent } from './MarkAttendance.component';
import { MarkAttendanceRoutingModule } from './MarkAttendance-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        MarkAttendanceRoutingModule,
        HttpClientModule,RouterModule,
       
    ],
    declarations: [
         MarkAttendancecomponent,
        
    ]
})
export class MarkAttendanceModule { }