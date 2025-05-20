import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { ServiceMasterChangesComponent } from './ServiceMasterChanges.component';
import { ServiceMasterChangesRoutingModule } from './ServiceMasterChanges-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ServiceMasterChangesRoutingModule
    ],
    declarations: [
        ServiceMasterChangesComponent
    ],
    providers:[
        DatePipe
    ]
})
export class ServiceMasterChangesModule { }
