import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormMasterComponent } from './form-master.component';
import { FormMasterRoutingModule } from './form-master-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        FormMasterRoutingModule
    ],
    declarations: [
        FormMasterComponent
    ]
})
export class FormMasterModule { }
