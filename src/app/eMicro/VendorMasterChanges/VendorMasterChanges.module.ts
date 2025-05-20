import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { VendorMasterChangesComponent } from './VendorMasterChanges.component';
import { VendorMasterChangesRoutingModule } from './VendorMasterChanges-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        VendorMasterChangesRoutingModule
    ],
    declarations: [
        VendorMasterChangesComponent
    ],
    providers:[
        DatePipe
    ]
})
export class VendorMasterChangesModule { }
