import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { TdVendorMasterComponent } from './TdVendorMaster.component';
import { TdVendorMasterRoutingModule } from './TdVendorMaster-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        TdVendorMasterRoutingModule
    ],
    declarations: [
        TdVendorMasterComponent
    ],
    providers:[
        DatePipe
    ]
})
export class TdVendorMasterModule { }