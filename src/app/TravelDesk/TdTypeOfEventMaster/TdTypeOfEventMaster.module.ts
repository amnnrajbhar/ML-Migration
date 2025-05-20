import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { TdTypeOfEventMasterComponent } from './TdTypeOfEventMaster.component';
import { TdTypeOfEventMasterRoutingModule } from './TdTypeOfEventMaster-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        TdTypeOfEventMasterRoutingModule
    ],
    declarations: [
        TdTypeOfEventMasterComponent
    ],
    providers:[
        DatePipe
    ]
})
export class TdTypeOfEventMasterModule { }