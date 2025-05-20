import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CustomerMasterComponent } from './CustomerMaster.component';
import { CustomerMasterRoutingModule } from './CustomerMaster-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        CustomerMasterRoutingModule
    ],
    declarations: [
        CustomerMasterComponent
    ],
    providers:[
        DatePipe
    ]
})
export class CustomerMasterModule { }
