import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { ServiceMasterCreationComponent } from './ServiceMasterCreation.component';
import { ServiceMasterCreationRoutingModule } from './ServiceMasterCreation-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedmoduleModule,
        ServiceMasterCreationRoutingModule
    ],
    declarations: [
        ServiceMasterCreationComponent
    ],
    providers:[
        DatePipe
    ]
})
export class ServiceMasterModule { }
