import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { CustomerMasterChangesComponent } from './CustomerMasterChanges.component';
import { CustomerMasterChangesRoutingModule } from './CustomerMasterChanges-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        CustomerMasterChangesRoutingModule
    ],
    declarations: [
        CustomerMasterChangesComponent
    ],
    providers:[
        DatePipe
    ]
})
export class CustomerMasterChangesModule { }