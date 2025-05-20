import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { VendorMasterComponent } from './VendorMaster.component';
import { VendorMasterRoutingModule } from './VendorMaster-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        VendorMasterRoutingModule
    ],
    declarations: [
        VendorMasterComponent
    ],
    providers:[
        DatePipe
    ]
})
export class VendorMasterModule { }
