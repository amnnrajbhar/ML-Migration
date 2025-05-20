import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveStructurecomponent } from './LeaveStructure.component';
import { LeaveStructureRoutingModule } from './LeaveStructure-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        LeaveStructureRoutingModule,
        HttpClientModule,RouterModule,
       
    ],
    declarations: [
         LeaveStructurecomponent,
        
    ]
})
export class LeaveStructureModule { }